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
        if args[2] == 'No definition line' ||
           args[2] == 'unnamed protein product'
          args[2] = "Query_#{args[1]}"
        end
        args[3] = args[3].to_i
        @id, *rest = args[2].split
        @title = rest.join(' ')
        super
      end

      attr_reader :id, :title

      def to_json(*args)
        %i[number id title length hits].inject({}) do |h, k|
          h[k] = send(k)
          h
        end.to_json(*args)
      end
    end
  end
end
