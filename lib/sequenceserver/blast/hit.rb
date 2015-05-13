module SequenceServer
  # Define BLAST::Hit.
  module BLAST
    # Hit Object to store all the hits per Query.
    Hit = Struct.new(:query, :number, :id, :accession, :title,
                     :length, :hsps) do
      include Links

      def initialize(*args)
        args[1] = args[1].to_i
        args[4] = '' if args[4] == 'No definition line'
        args[5] = args[5].to_i
        super
      end

      # Hit evalue is the minimum evalue of all HSP(s).
      def evalue
        hsps.map(&:evalue).min
      end

      # Hit score is the sum of bit scores of all HSP(s).
      def score
        hsps.map(&:bit_score).reduce(:+)
      end

      def links
        links = Links.instance_methods.map { |m| send m }
        links.compact!
        links.sort_by { |link| [link[:order], link[:title]] }
      end

      # Returns an array of database objects which contain the queried sequence
      # id.
      #
      # NOTE:
      #   This function may return more than one database object for a single
      #   sequence id.
      #
      # e.g., which_blastdb('SI_2.2.23') => [<Database: ...>, ...]
      def whichdb
        querydb.select { |db| db.include? id }
      end

      def report
        query.report
      end

      def querydb
        report.querydb
      end
    end
  end
end
