require 'sequenceserver/database'

module SequenceServer
  module Helpers
    module SystemHelpers
      # Scan the given directory (including subdirectory) for blast databases.
      # ---
      # Arguments:
      # * db_root(String) - absolute path to the blast databases
      # ---
      # Returns:
      # * a hash of sorted blast databases grouped by database type:
      # protein, or nucleotide
      # ---
      # Raises:
      # * IOError - if no database can be found
      #
      #   > scan_blast_db('/home/yeban/blast_db')
      #   => { "protein" => [], "nucleotide" => [] }
      def scan_blast_db(db_root)
        unless command? 'blastdbcmd'
          blasturl = 'http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download'
          raise IOError, "Could not find blast binaries." +
            "\n\nYou may need to download BLAST+ from #{blasturl}." +
            " And/or edit #{settings.config_file} to indicate the location of BLAST+ binaries."
        end

        raise IOError, "Database directory doesn't exist: #{db_root}" unless File.directory?( db_root )

        find_dbs_command = %|blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t" 2>&1|

        db_list = %x|#{find_dbs_command}|
        if db_list.empty?
          raise IOError, "No formatted blast databases found in '#{ db_root }'."
        end

        if db_list.match(/BLAST Database error/)
          raise IOError, "Error parsing blast databases.\n" + "Tried: '#{find_dbs_command}'\n"+
            "It crashed with the following error: '#{db_list}'\n" +
            "Try reformatting databases using makeblastdb.\n"
        end

        db = {}

        db_list.each_line do |line|
          next if line.empty?  # required for BLAST+ 2.2.22
          type, name, *title =  line.split(' ') 
          type = type.downcase.intern
          name = name.freeze
          title = title.join(' ').freeze

          # skip past all but alias file of a NCBI multi-part BLAST database
          if multipart_database_name?(name)
            settings.log.info(%|Found a multi-part database volume at #{name} - ignoring it.|)
            next
          end

          #LOG.info("Found #{type} database: #{title} at #{name}")
          database = Database.new(name, title, type)
          db[database.hash] = database
        end

        db 
      end

      private

      # check if the given command exists and is executable
      # returns True if all is good.
      def command?(command)
        system("which #{command} > /dev/null 2>&1")
      end

      # Returns true if the database name appears to be a multi-part database name.
      #
      # e.g.
      # /home/ben/pd.ben/sequenceserver/db/nr.00 => yes
      # /home/ben/pd.ben/sequenceserver/db/nr => no
      # /home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01 => yes
      def multipart_database_name?(db_name)
        !(db_name.match(/.+\/\S+\d{2}$/).nil?)
      end
    end

    def self.included(klass)
      klass.extend SystemHelpers
    end
  end
end
