module SequenceServer
  # Define BLAST::Hit.
  module BLAST
    # Hit Object to store all the hits per Query.
    # @member [Fixnum]     number
    # @member [String]     id
    # @member [String]     def
    # @member [String]     accession
    # @member [Fixnum]     len
    # @member [HSP]        hsp
    Hit = Struct.new(:number, :id, :title, :accession, :len, :hsps) do
      def initialize(*args)
        args[0] = args[0].to_i
        args[2] = '' if args[2] == 'No definition line'
        args[4] = args[4].to_i
        super
      end

      alias_method :length, :len

      # Hit evalue is the minimum evalue of all HSP(s).
      def evalue
        hsps.map(&:evalue).min
      end

      # Hit score is the sum of bit scores of all HSP(s).
      def score
        hsps.map(&:bit_score).reduce(:+)
      end
    end
  end
end
