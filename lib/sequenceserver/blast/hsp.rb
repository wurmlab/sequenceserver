module SequenceServer
  # Define BLAST::HSP and BLAST::HSP::*.
  module BLAST
    # Structure to hold data for each HSP.
    HSP = Struct.new(:hit, :number, :bit_score, :score, :evalue, :qstart, :qend,
                     :sstart, :send, :qframe, :sframe, :identity, :positives,
                     :gaps, :length, :qcovhsp, :qseq, :sseq, :midline) do
      INTEGER_ARGS = [1, 3].concat((5..15).to_a).freeze
      FLOAT_ARGS   = [2, 4].freeze

      def initialize(*args)
        INTEGER_ARGS.each do |i|
          args[i] = args[i].to_i
        end

        FLOAT_ARGS.each do |i|
          args[i] = args[i].to_f
        end

        super
      end

      def to_json(*args)
        %i[number bit_score score evalue qstart qend
           sstart send qframe sframe identity positives
           gaps length qcovhsp qseq sseq midline].inject({}) { |h, k|
          h[k] = self[k]
          h
        }.to_json(*args)
      end
    end
  end
end
