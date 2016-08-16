require 'ox'

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
         :queries].inject({}) { |h, k| h[k] = send(k); h }.update(search_id: job.id).to_json
      end

      private

      # Generate report.
      def generate
        xml = Formatter.run(job.rfile, 'xml').file
        tsv = parse_tsv File.read(Formatter.run(job.rfile, '__ssparse').file)
        ir = node_to_array(Ox.parse(File.read(xml)).root)
        extract_program_info ir
        extract_params ir
        extract_stats ir
        extract_query ir, tsv
      end

      def parse_tsv(tsv)
        # HASH => qseqids => sseqids => [qcovs, [qcovhsp]]
        info = {}

        tsv.each_line do |line|
          unless line.start_with? '#'
            row = line.chomp.split("\t")
            if !info.has_key? row[0]
              info[row[0]] = {row[1] => [row[2], row[3], [row[4]]] }
            elsif !info[row[0]].has_key? row[1]
              info[row[0]][row[1]] = [row[2], row[3], [row[4]]]
            else
              info[row[0]][row[1]][2].push(row[4])
            end
          end
        end
        info
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
          :nsequences   => stats[0],
          :ncharacters  => stats[1],
          :hsp_length   => stats[2],
          :search_space => stats[3],
          :kappa        => stats[4],
          :labmda       => stats[5],
          :entropy      => stats[6]
        }
      end

      # Make results for each input query available via `queries` atribute.
      def extract_query(ir, cov_info)
        ir[8].each do |n|
          query = Query.new(self, n[0], n[2], n[3], [])
          extract_hits(n[4], query, cov_info)
          query.sort_hits_by_evalue!
          queries << query
        end
      end

      # Create Hit objects from given ir and associate them to query i.
      def extract_hits(hits_ir, query, cov_info)
        return if hits_ir == ["\n"] # => No hits.
        hits_ir.each do |n|
          hit_info = cov_info[query.id][n[1]]
          hit = Hit.new(query, n[0], n[1], n[3], n[2], n[4],
                        hit_info[1], hit_info[0], [])
          extract_hsps(n[5], hit, hit_info[2])
          query.hits << hit
        end
      end

      # Create HSP objects from the given ir and associate them with hit j of
      # query i.
      def extract_hsps(hsp_ir, hit, hsp_covs)
        hsp_ir.each_with_index do |n, i|
          hsp_klass = HSP.const_get program.upcase
          n.insert(14, hsp_covs[i])
          hsp = hsp_klass.new(*[hit, *n])
          hit.hsps << hsp
        end
      end

      PARSEABLE_AS_HASH  = %w(Parameters)
      PARSEABLE_AS_ARRAY = %w(BlastOutput_param Iteration_stat Statistics
                              Iteration_hits BlastOutput_iterations
                              Iteration Hit Hit_hsps Hsp)

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
    end
  end
end
