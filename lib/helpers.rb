require 'lib/database'

module SequenceServer
  module Helpers
    extend self

    # Returns a shell executable string corresponding to the given blast command.
    # Expects the path to blast binaries be set to 'nil' if the blast commands
    # are to be found in the sytem PATH.
    def executable(command)
      File.join(settings.bin, command) rescue command
    end

    module SystemHelpers
      # check if the given command exists and is executable
      # returns True if all is good.
      def command?(command)
        system("which #{command} > /dev/null 2>&1")
      end
      private :command?

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
      def scan_blast_executables(bin)
        bin = File.expand_path(bin) rescue nil
        #LOG.info("Config bin dir:          #{bin}")
        unless bin
          # search system path
          %w|blastn blastp blastx tblastn tblastx blastdbcmd|.each do |method|
            raise IOError, "You may need to install BLAST+ from: #{settings.blasturl}.
          And/or create a config.yml file that points to blast's 'bin' directory." unless command?( method )
          end
        else
          # assume executables in bin
          raise IOError, "The directory '#{bin}' defined in config.yml doesn't exist." unless File.directory?( bin )
        end

        bin
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

        blastdbcmd = Helpers.executable('blastdbcmd')
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
    end

    def self.included(klass)
      klass.extend SystemHelpers
    end
  end
end
