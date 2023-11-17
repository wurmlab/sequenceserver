module SequenceServer
  # Define BLAST::Hit.
  module BLAST
    # Hit object to store all the hits per Query.
    Hit = Struct.new(:query, :number, :id, :accession, :title,
                     :length, :sciname, :qcovs, :hsps) do
      def initialize(*args)
        args[1] = args[1].to_i
        args[4] = '' if args[4] == 'No definition line'
        args[5] = args[5].to_i
        args[6] = '' if args[6] == 'N/A'
        args[7] = args[7].to_i
        super
      end

      # This gets called when #to_json is called on report object in routes. We
      # cannot use the to_json method provided by Struct class because what we
      # want to send to the browser differs from the attributes declared with
      # Struct class. Some of these are derived data such as score, identity,
      # custom links. While some attributes are necessary for internal
      # representation.
      def to_json(*args)
        # List all attributes that we want to send to the browser.
        properties = %i[number id accession title length total_score
                        qcovs sciname hsps links]
        properties.inject({}) { |h, k| h[k] = send(k); h }.to_json(*args)
      end

      ###
      # Link generator functionality.
      ###

      # Include the Links module.
      include Links

      # Links returns a list of Hashes that can be easily turned into an href
      # in the client. These are derived by calling link generators, that is,
      # instance methods of the Links module.
      def links
        links = Links.instance_methods.map { |m| send m }
        puts "links"
        puts links
        links.compact!
        links.sort_by { |link| [link[:order], link[:title]] }
      end

      # Returns the database type (nucleotide or protein).
      def dbtype
        report.dbtype
      end

      # Returns a list of databases that contain this hit.
      #
      # e.g., whichdb('SI_2.2.23') => [<Database: ...>, ...]
      def whichdb
        report.querydb.select { |db| db.include? id }
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

      ###
      # Score, identity, and evalue attributes below are used in tabular summary
      # of hits in the HTML report. At some point we should move these to the
      # client.
      ###

      # Returns the sum of scores of all HSPs. Displayed in the tabular summary
      # of hits in the HTML report. Should probably be calculated in browser?
      def total_score
        hsps.map(&:score).reduce(:+)
      end

      private

      # Returns the report object that this hit is a part of. This is used to
      # access list of databases etc.
      def report
        query.report
      end
    end
  end
end
