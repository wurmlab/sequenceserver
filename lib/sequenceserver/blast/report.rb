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
          @queries = []
        end
      end

      # :nodoc:
      # Attributes parsed out from XML output.
      attr_reader :program, :program_version
      attr_reader :queries, :querydb
      attr_reader :params, :stats

      def to_json
        [:querydb, :program, :program_version, :params, :stats,
         :queries].inject({}) { |h, k|
          h[k] = send(k)
          h
        }.update(search_id: job.id, submitted_at: job.submitted_at.utc).to_json
      end

      private

      # Generate report.
      def generate
        job.raise!
        xml_ir = parse_xml File.read(Formatter.run(job, 'xml').file)
        tsv_ir = parse_tsv File.read(Formatter.run(job, 'custom_tsv').file)
        extract_program_info xml_ir
        extract_params xml_ir
        extract_stats xml_ir
        extract_queries xml_ir, tsv_ir
      end

      # Make program name and program name + version available via `program`
      # and `program_version` attributes.
      def extract_program_info(ir)
        @program         = ir[0]
        @program_version = ir[1]
      end

      # Make search params available via `params` attribute.
      #
      # Search params tweak the results. Like evalue cutoff or penalty to open
      # a gap. BLAST+ doesn't list all input params in the XML output. Only
      # matrix, evalue, gapopen, gapextend, and filters are available from XML
      # output.
      def extract_params(ir)
        @params = Hash[
          *ir[7].first.map { |k, v| [k.gsub('Parameters_', ''), v] }.flatten
        ]
        @params['evalue'] = @params.delete('expect')
        @params = job.advanced_params.merge(@params)
      end

      # Make search stats available via `stats` attribute.
      #
      # Search stats are computed metrics. Like total number of sequences or
      # effective search space.
      def extract_stats(ir)
        stats  = ir[8].first[5][0]
        @stats = {
          nsequences:   stats[0],
          ncharacters:  stats[1],
          hsp_length:   stats[2],
          search_space: stats[3],
          kappa:        stats[4],
          labmda:       stats[5],
          entropy:      stats[6]
        }
      end

      # Create query objects for the given report from the given ir.
      def extract_queries(xml_ir, tsv_ir)
        xml_ir[8].each do |n|
          query = Query.new(self, n[0], n[2], n[3], [])
          extract_hits(n[4], tsv_ir[query.id], query)
          queries << query
        end
      end

      # Create Hit objects for the given query from the given ir.
      def extract_hits(xml_ir, tsv_ir, query)
        return if xml_ir == ["\n"] # => No hits.
        xml_ir.each do |n|
          # If hit comes from a non -parse_seqids database, then
          # we assign id to accession and process hit defline to
          # obtain id and title.
          if n[1] =~ /^gnl\|/
            n[3] = n[1]
            defline = n[2].split
            n[1] = defline.shift
            n[2] = defline.join(' ')
          end
          hit = Hit.new(query, n[0], n[1], n[3], n[2], n[4],
                        tsv_ir[n[1]][0], tsv_ir[n[1]][1], [])
          extract_hsps(n[5], tsv_ir[n[1]][2], hit)
          query.hits << hit
        end
      end

      # Create HSP objects for the given hit from the given ir.
      def extract_hsps(xml_ir, tsv_ir, hit)
        xml_ir.each_with_index do |n, i|
          n.insert(14, tsv_ir[i])
          hsp = HSP.new(*[hit, *n])
          hit.hsps << hsp
        end
      end

      def parse_xml(xml)
        node_to_array Ox.parse(xml).root
      rescue Ox::ParseError
        fail InputError, <<~MSG
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
        ir = Hash.new {|h, k| h[k] = {} }
        tsv.each_line do |line|
          next if line.start_with? '#'; row = line.chomp.split("\t")
          (ir[row[0]][row[1]] ||= [row[2], row[3], []])[2] << row[4]
        end
        ir
      end
    end
  end
end
