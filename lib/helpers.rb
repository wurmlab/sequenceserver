require 'lib/database'

module SequenceServer
  module Helpers
    module SystemHelpers
      # Checks for the presence of blast executables. Assumes the executables
      # to be present in the bin directory passed to it, or in the sytem path.
      # ---
      # Arguments:
      # * bin(String) - path (relative/absolute) to the binaries
      # ---
      # Returns:
      # * absolute path to the blast executables directory, or empty
      # string (implies executables in the system path)
      # ---
      # Raises:
      # * IOError - if the executables can't be found
      def scan_blast_executables(bin_dir)
        bin = File.expand_path(bin_dir) rescue nil

        if bin and not File.directory?(bin)
          raise IOError, "Could not find '#{bin}' defined in config.yml."
        end

        binaries = {}
        %w|blastn blastp blastx tblastn tblastx blastdbcmd|.each do |method|
          path = File.join(bin, method) rescue method
          if command?(path)
            binaries[method] = path
          else
            blasturl = 'http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download'
            raise IOError, "Could not find blast binaries. You may need to
            install BLAST+ from #{blasturl}. And/or point config.yml to blast's
            bin directory."
          end
        end

        #LOG.info("Config bin dir:          #{bin}")
        binaries
      end

      # Scan the given directory for blast databases.
      # ---
      # Arguments:
      # * db_root(String) - path (relative/absolute) to the databases
      # ---
      # Returns:
      # * a hash of sorted blast databases grouped by database type:
      # protein, or nucleotide
      # ---
      # Raises:
      # * IOError - if no database can be found
      def scan_blast_db(db_root)
        db_root = File.expand_path(db_root)
        raise IOError, "Database directory doesn't exist: #{db_root}" unless File.directory?( db_root )
        #LOG.info("Config database dir:     #{db_root}")

        blastdbcmd = bin['blastdbcmd']
        find_dbs_command = %|#{blastdbcmd} -recursive -list #{db_root} -list_outfmt "%p %f %t" 2>&1 |
          db_list = %x|#{find_dbs_command}|
          raise IOError, "No formatted blast databases found in '#{ db_root }' . \n"\
          "You may need to run 'makeblastdb' on some fasta files." if db_list.empty?

        if db_list.match(/BLAST Database error/)
          raise IOError, "Error parsing blast databases.\n" + "Tried: '#{find_dbs_command}'\n"+
            "It crashed with the following error: '#{db_list}'\n" +
            "Try reformatting databases using makeblastdb.\n"
        end


        db = {}

        db_list.each_line do |line|
          type, name, *title =  line.split(' ') 
          type = type.downcase
          name = name.freeze
          title = title.join(' ').freeze
          #LOG.info("Found #{type} database: #{title} at #{name}")
          (db[type] ||= []) << Database.new(name, title)
        end


        # the erb would fail as calling nil.each_with_index if a dbtype was undefined. 
        db['protein']    = [] unless db.keys.include?('protein')
        db['nucleotide'] = [] unless db.keys.include?('nucleotide')

        # sort the list of dbs
        db['protein'].sort!
        db['nucleotide'].sort!

        db 
      end

      private

      # check if the given command exists and is executable
      # returns True if all is good.
      def command?(command)
        system("which #{command} > /dev/null 2>&1")
      end
    end

    def self.included(klass)
      klass.extend SystemHelpers
    end
  end
end
