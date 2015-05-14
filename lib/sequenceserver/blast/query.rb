module SequenceServer
  # Define BLAST::Query.
  module BLAST
    # Capture results per query of a BLAST search.
    # @member [String]     number
    # @member [String]     def
    # @member [Fixnum]     length
    # @member [Array(Hit)] hits
    Query = Struct.new(:report, :number, :def, :length, :hits) do
      def initialize(*args)
        args[1] = args[1].to_i
        args[2] = "Query_#{args[1]}" if args[2] == 'No definition line'
        args[3] = args[3].to_i
        @id, *rest = args[2].split
        @title = rest.join(' ')
        super
      end

      def sort_hits_by_evalue!
        # change made here
        @hits = hits.sort_by { |h| [h.evalue, h.score] }
      end

      attr_reader :id, :title
    end
  end
end
