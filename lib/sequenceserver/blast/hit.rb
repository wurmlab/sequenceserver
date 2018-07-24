module SequenceServer
  # Define BLAST::Hit.
  module BLAST
    # Hit Object to store all the hits per Query. HSPs per hit should be sorted
    # in ascending order of evalue.
    Hit = Struct.new(:query, :number, :id, :accession, :title,
                     :length, :sciname, :qcovs, :hsps) do
      include Links

      def initialize(*args)
        args[1] = args[1].to_i
        args[4] = '' if args[4] == 'No definition line'
        args[5] = args[5].to_i
        args[6] = '' if args[6] == 'N/A'
        args[7] = args[7].to_i
        super
      end

      # Hit's score is the sum of score of all HSPs.
      def score
        hsps.map(&:score).reduce(:+)
      end

      # Hit's identity is the sum of identity of all
      # HSPs divided by sum of length of all HSPs
      # (expressed as percentagge).
      def identity
        hsps.map(&:identity).reduce(:+) * 100 / hsps.map(&:length).reduce(:+)
      end

      def links
        links = Links.instance_methods.map { |m| send m }
        links.compact!
        links.sort_by { |link| [link[:order], link[:title]] }
      end

      # Returns a list of databases that contain this hit.
      #
      # e.g., whichdb('SI_2.2.23') => [<Database: ...>, ...]
      def whichdb
        querydb.select { |db| db.include? id }
      end

      # Returns tuple of tuple indicating start and end coordinates of matched
      # regions of query and hit sequences.
      def coordinates
        qstart_min = hsps.map(&:qstart).min
        qend_max = hsps.map(&:qend).max
        sstart_min = hsps.map(&:sstart).min
        send_max = hsps.map(&:send).max

        [[qstart_min, qend_max], [sstart_min, send_max]]
      end

      # NOTE: Evalue of a hit is meaningless. This is here for code that needs
      # minimum evalue of all HSPs.
      def evalue
        hsps.first.evalue
      end

      def to_json(*args)
        %i[number id accession title length score identity qcovs
         sciname evalue hsps links].inject({}) { |h, k|
          h[k] = send(k)
          h
        }.to_json(*args)
      end

      private

      def querydb
        report.querydb
      end

      def report
        query.report
      end
    end
  end
end
