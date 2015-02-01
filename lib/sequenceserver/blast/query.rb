module SequenceServer
  # Define BLAST::Query.
  module BLAST
    # Capture results per query of a BLAST search.
    # @member [String]     number
    # @member [String]     def
    # @member [Fixnum]     len
    # @member [Array(Hit)] hits
    Query = Struct.new(:number, :def, :len, :hits) do
      def initialize(*args)
        args[0] = args[0].to_i
        args[1] = "Query_#{args[0]}" if args[1] == 'No definition line'
        args[2] = args[2].to_i
        @id, *rest = args[1].split
        @title = rest.join(' ')
        super
      end

      def sort_hits_by_evalue!
        @hits = hits.sort_by(&:evalue)
      end

      attr_reader :id, :title

      alias_method :length, :len
    end
  end
end
