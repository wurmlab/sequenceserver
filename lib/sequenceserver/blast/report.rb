require 'ox'
Ox.default_options = { skip: :skip_none }

require 'sequenceserver/report'
require 'sequenceserver/links'

require_relative 'formatter'
require_relative 'query'
require_relative 'hit'
require_relative 'hsp'

module SequenceServer
  module BLAST
    # Captures results of a BLAST search.
    #
    # A report is constructed from a search id. Search id is simply the
    # basename of the temporary file that holds BLAST results in binary
    # BLAST archive format.
    #
    # For a given search id, result is obtained in XML format using the
    # Formatter class, parsed into a simple intermediate representation
    # (Array of values and Arrays) and information extracted from the
    # intermediate representation (ir).
    class Report < Report
      def initialize(job)
        super do
          @querydb = job.databases
        end
      end

      def to_json(*_args)
        %i[querydb program program_version params stats
           queries].inject({}) do |h, k|
          h[k] = send(k)
          h
        end.update(search_id: job.id,
                   submitted_at: job.submitted_at.utc,
                   imported_xml: !job.imported_xml_file.nil?,
                   seqserv_version: SequenceServer::VERSION,
                   cloud_sharing_enabled: SequenceServer.config[:cloud_share_url].start_with?('http'),
                   non_parse_seqids: !!job.databases&.any?(&:non_parse_seqids?)).to_json
      end

      def xml_file_size
        return File.size(job.imported_xml_file) if job.imported_xml_file

        xml_formatter.size
      end

      def done?
        return true if job.imported_xml_file

        File.exist?(xml_formatter.filepath) && File.exist?(tsv_formatter.filepath)
      end

      def program
        @program ||= xml_ir[0]
      end

      def program_version
        @program_version ||= xml_ir[1]
      end

      def querydb
        @querydb ||= xml_ir[3].split.map do |path|
          { title: File.basename(path) }
        end
      end

      def dbtype
        @dbtype ||= querydb&.first&.type || dbtype_from_program
      end

      def params
        @params ||= extract_params
      end

      def stats
        @stats ||= extract_stats
      end

      def queries
        @queries ||= xml_ir[8].map do |n|
          query = Query.new(self, n[0], n[2], n[3], [])

          tsv_ir_line = tsv_ir[query.id]
          tsv_ir_line = tsv_ir[n[1]] if tsv_ir_line.empty?

          query.hits = query_hits(n[4], tsv_ir_line, query)

          query
        end
      end

      private

      def xml_ir
        @xml_ir ||=
          if job.imported_xml_file
            parse_xml File.read(job.imported_xml_file)
          else
            job.raise!
            parse_xml(xml_formatter.read_file)
          end
      end

      def tsv_ir
        @tsv_ir ||=
          if job.imported_xml_file
            Hash.new do |h1, k1|
              h1[k1] = Hash.new do |h2, k2|
                h2[k2] = ['', '', []]
              end
            end
          else
            job.raise!
            parse_tsv(tsv_formatter.read_file)
          end
      end

      def xml_formatter
        @xml_formatter ||= Formatter.run(job, 'xml')
      end

      def tsv_formatter
        @tsv_formatter ||= Formatter.run(job, 'custom_tsv')
      end

      # Search params tweak the results. Like evalue cutoff or penalty to open
      # a gap. BLAST+ doesn't list all input params in the XML output. Only
      # matrix, evalue, gapopen, gapextend, and filters are available from XML
      # output.
      def extract_params
        # Parse/get params from the job first.
        job_params = parse_advanced(job.advanced)
        # Old jobs from beta releases may not have the advanced key but they
        # will have the deprecated advanced_params key.
        job_params.update(job.advanced_params) if job.advanced_params

        # Parse params from BLAST XML.
        @params = Hash[
          *xml_ir[7].first.map { |k, v| [k.gsub('Parameters_', ''), v] }.flatten
        ]
        @params['evalue'] = @params.delete('expect')

        # Merge into job_params.
        @params = job_params.merge(@params)
      end

      # Search stats are computed metrics. Like total number of sequences or
      # effective search space.
      def extract_stats
        stats = xml_ir[8].first[5][0]
        {
          nsequences: stats[0],
          ncharacters: stats[1],
          hsp_length: stats[2],
          search_space: stats[3],
          kappa: stats[4],
          labmda: stats[5],
          entropy: stats[6]
        }
      end

      # Create Hit objects for the given query from the given ir.
      def query_hits(xml_ir, tsv_ir, query)
        return [] if xml_ir == ["\n"] # => No hits.

        xml_ir.map do |n|
          # If hit comes from a non -parse_seqids database, then id (n[1]) is a
          # BLAST assigned internal id of the format 'gnl|BL_ORD_ID|serial'. We
          # assign the id to accession (because we use accession for sequence
          # retrieval and this id is what blastdbcmd expects for non
          # -parse_seqids databases) and parse the hit defline to
          # obtain id and title ourselves (we use id and title
          # for display purposes).
          if n[1] =~ /^gnl\|BL_ORD_ID\|\d+/
            n[3] = n[1]
            defline = n[2].split
            n[1] = defline.shift
            n[2] = defline.join(' ')
          end

          hit = Hit.new(query, n[0], n[1], n[3], n[2], n[4],
                        tsv_ir[n[1]][0], tsv_ir[n[1]][1], [])

          hit.hsps = hsps(n[5], tsv_ir[n[1]][2], hit)

          hit
        end
      end

      def hsps(xml_ir, tsv_ir, hit)
        xml_ir.map.with_index do |n, i|
          n.insert(14, tsv_ir[i])

          HSP.new(hit, *n)
        end
      end

      def parse_xml(xml)
        node_to_array Ox.parse(xml).root
      rescue Ox::ParseError
        raise 'Error parsing XML file' if job.imported_xml_file

        raise InputError, <<~MSG
          BLAST generated incorrect XML output. This can happen if sequence ids in your
          databases are not unique across all files. As a temporary workaround, you can
          repeat the search with one database at a time. Proper fix is to recreate the
          following databases with unique sequence ids:

              #{querydb.map(&:title).join(', ')}

          If you are not the one managing this server, try to let the manager know
          about this.
        MSG
      end

      PARSEABLE_AS_HASH  = %w[Parameters].freeze
      PARSEABLE_AS_ARRAY = %w[BlastOutput_param Iteration_stat Statistics
                              Iteration_hits BlastOutput_iterations
                              Iteration Hit Hit_hsps Hsp].freeze

      def node_to_hash(element)
        Hash[*element.nodes.map { |n| [n.name, node_to_value(n)] }.flatten]
      end

      def node_to_array(element)
        element.nodes.map { |n| node_to_value n }
      end

      def node_to_value(node)
        # Ensure that the recursion doesn't fails when String value is received.
        return node if node.is_a?(String)

        if PARSEABLE_AS_HASH.include? node.name
          node_to_hash(node)
        elsif PARSEABLE_AS_ARRAY.include? node.name
          node_to_array(node)
        else
          first_text(node)
        end
      end

      def first_text(node)
        node.nodes.find { |n| n.is_a? String }
      end

      # Parses the given TSV string as:
      #
      # {
      #    qseqid: {
      #      sseqid: [sciname, qcovs, [qcovhsp]],
      #      ...
      #    },
      #    ...
      # }
      def parse_tsv(tsv)
        ir = Hash.new { |h, k| h[k] = {} }
        tsv.each_line do |line|
          next if line.start_with? '#'

          row = line.chomp.split("\t")

          (ir[row[0]][row[1]] ||= [row[2], row[3], []])[2] << row[4]
        end
        ir
      end

      # Parse BLAST CLI string from job.advanced.
      def parse_advanced(param_line)
        param_list = (param_line || '').split(' ')
        res = {}

        param_list.each_with_index do |word, i|
          nxt = param_list[i + 1]
          next unless word.start_with? '-'

          word.sub!('-', '')
          res[word] = unless nxt.nil? || nxt.start_with?('-')
                        nxt
                      else
                        'True'
                      end
        end
        res
      end

      # Returns database type (nucleotide or protein) inferred from
      # Report#program (i.e., the BLAST algorithm)
      def dbtype_from_program
        case program
        when /blastn|tblastn|tblastx/
          'nucleotide'
        when /blastp|blastx/
          'protein'
        end
      end
    end
  end
end
