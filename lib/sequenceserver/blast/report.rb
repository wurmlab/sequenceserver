module SequenceServer
  module BLAST
    # Captures BLAST results from BLAST+'s XML output.
    class Report
      include Links

      # Expects a File object and Database objects used to BLAST against.
      #
      # Parses the XML file into an intermediate representation (ir) and
      # constructs an object model from that.
      #
      # NOTE:
      #   Databases param is optional for test suite.
      #
      # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
      def initialize(rfile, databases = nil)
        ir = node_to_array Ox.parse(rfile.read).root

        @program = ir[0]
        @program_version = ir[1]
        @querydb = Array databases
        @parameters = {
          :matrix    => ir[7][0],
          :evalue    => ir[7][1],
          :gapopen   => ir[7][2],
          :gapextend => ir[7][3],
          :filters   => ir[7][4]
        }

        ir[8].each_with_index do |n, i|
          @stats ||= n[5][0]
          @queries ||= []
          @queries.push(Query.new(n[0], n[2], n[3], []))

          # Ensure a hit object is received. No hits, returns a newline. Note
          # that checking to "\n" doesn't work since n[4] = ["\n"]
          if n[4] == ["\n"]
            @queries[i][:hits] = []
          else
            n[4].each_with_index do |hits, j|
              @queries[i][:hits].push(Hit.new(hits[0], hits[1], hits[2],
                                              hits[3], hits[4], []))
              hits[5].each do |hsp|
                hsp_klass = HSP.const_get program.upcase
                @queries[i][:hits][j][:hsps].push(hsp_klass.new(*hsp))
              end
            end
            @queries[i].sort_hits_by_evalue!
          end
        end
      end
      # rubocop:enable Metrics/AbcSize, Metrics/MethodLength

      attr_reader :program, :program_version

      # :nodoc:
      # params are defaults provided by BLAST or user input to tweak the
      # result. stats are computed metrics provided by BLAST.
      #
      # BLAST+ doesn't list all input params (like word_size) in the XML
      # output. Only matrix, evalue, gapopen, gapextend, and filters.
      attr_reader :params, :stats

      attr_reader :querydb

      attr_reader :queries

      # Helper methods for pretty printing results

      def link_per_hit(sequence_id)
        links = Links.instance_methods.map { |m| send(m, sequence_id) }

        # Sort links based on :order key (ascending)
        links.compact!.sort_by! { |link| link[:order] }
      end

      # Returns an array of database objects which contain the queried
      # sequence id.
      # NOTE: This function may return more than one database object for
      # a single sequence id.
      #
      # e.g., which_blastdb('SI_2.2.23') => [<Database: ...>, ...]
      def which_blastdb(sequence_id)
        querydb.select { |db| db.include? sequence_id }
      end

      private

      PARSEABLE_AS_ARRAY = %w(Parameters BlastOutput_param Iteration_stat
                              Statistics Iteration_hits BlastOutput_iterations
                              Iteration Hit Hit_hsps Hsp)

      def node_to_array(element)
        element.nodes.map { |n| node_to_value n }
      end

      def node_to_value(node)
        # Ensure that the recursion doesn't fails when String value is received.
        return node if node.is_a?(String)

        if PARSEABLE_AS_ARRAY.include? node.name
          value = node_to_array(node)
        else
          value = first_text(node)
        end
        value
      end

      def first_text(node)
        node.nodes.find { |n| n.is_a? String }
      end
    end
  end
end
