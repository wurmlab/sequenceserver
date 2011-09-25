require 'sequenceserver/database'

module SequenceServer
  module Helpers
    module SystemHelpers
      # Scan the given directory for blast executables. Passing `nil` scans the
      # system `PATH`.
      # ---
      # Arguments:
      # * bin(String) - absolute path to the directory containing blast binaries
      # * min_version(String) - version of BLAST to be enforced
      # ---
      # Returns:
      # * a hash of blast methods, and their corresponding absolute path
      # ---
      # Raises:
      # * IOError - if the executables can't be found
      #
      #   > scan_blast_executables('/home/yeban/bin')
      #   =>  { "blastx"=>"/home/yeban/bin/blastx",
      #         "blastn"=>"/home/yeban/bin/blastn",
      #         ...
      #       }
      def scan_blast_executables(bin, min_version)
        if bin and not File.directory?(bin)
          raise IOError, "Could not find '#{bin}' defined in config.yml."
        end
        
        blasturl = 'http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download'
        binaries = {}
        %w|blastn blastp blastx tblastn tblastx blastdbcmd makeblastdb blast_formatter|.each do |method|
          path = File.join(bin, method) rescue method
          if command?(path)
            binaries[method] = path
            version_agreement = blast_program_version_number_agrees?(method, min_version)
            unless version_agreement==true
              #error message is written complicatedly because of IDE issues
              raise ArgumentError, ["SequenceServer requires BLAST+ version",
                 "#{min_version} or above, but version #{version_agreement} was found",
                 "when using #{method}.",
                 "You may need to install BLAST+ from #{blasturl}. And/or point", 
                 "config.yml to blast's bin directory."].join(' ')
            end
          else
            raise IOError, "Could not find blast binaries." +
            "\n\nYou may need to download BLAST+ from #{blasturl}." +
            " And/or edit #{settings.config_file} to indicate the location of BLAST+ binaries."
          end
        end

        #LOG.info("Config bin dir:          #{bin}")
        binaries
      end
      
      # Test whether a particular version number is passable
      # ---
      # Arguments:
      # * min_version(String) - version of BLAST to be enforced
      # * min_version(String) - version of BLAST being passed or failed
      # ---
      # Returns:
      # * true if versions are compatible, else false
      # ---
      # Raises:
      # * IOError - if the version numbers are crazy
      def version_agrees?(min_version, test_version)
        reg = /^(\d+).(\d+).(\d+)\+$/ #all versions should match this pattern
        # Check we aren't totally crazy with the version numbers
        min_version_matches = min_version.match(reg)
        test_version_matches = test_version.match(reg)
        raise IOError, "Unexpected minimum version number when testing BLAST versions: `#{min_version}'" unless min_version_matches
        raise IOError, "Unexpected minimum version number when testing BLAST versions: `#{test_version}'" unless test_version_matches
        
        # Make sure each of the three version numbers are OK
        (1..3).each do |n|
          return false if min_version_matches[n].to_i > test_version_matches[n].to_i
          break if min_version_matches[n].to_i < test_version_matches[n].to_i #e.g. comparing 3.0.1 to 2.0.2
        end
        return true #gauntlet passed
      end
      
      # Test whether a particular blast program is at an OK version.
      # Assumes the program can be correctly run
      # ---
      # Arguments:
      # * program(String) - path to program being run
      # * min_version(String) - version of BLAST to be enforced
      # ---
      # Returns:
      # * true if versions are compatible, else false
      # ---
      # Raises:
      # * IOError - if the version numbers parsed out are crazy
      def blast_program_version_number_agrees?(program, min_version)
        program_output = %x|#{program} -version|
        # E.g.  output:
        #blastp: 2.2.25+
        #Package: blast 2.2.25, build Mar 21 2011 12:13:17
        if matches=program_output.split("\n")[0].match(/^#{program}: (.+)$/)
          if version_agrees?(min_version, matches[1])
            return true
          else
            return matches[1]
          end
        else
          raise IOError, "Unable to parse version number from program `#{program}'\n\nOutput was #{program_output.inspect}"
        end
      end

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
      def scan_blast_db(db_root, blastdbcmd = 'blastdbcmd')
        raise IOError, "Database directory doesn't exist: #{db_root}" unless File.directory?( db_root )

        find_dbs_command = %|#{blastdbcmd} -recursive -list #{db_root} -list_outfmt "%p %f %t" 2>&1|

        begin
          db_list = %x|#{find_dbs_command}|
          if db_list.empty?
            raise IOError, "No formatted blast databases found in '#{ db_root }'."
          end
        rescue => e
          puts '', e.to_s

          print "Do you want to format your blast databases now? [Y/n]: "
          choice = gets.chomp[0,1].downcase

          unless choice == 'n'
            database_formatter = File.join(settings.root, 'database_formatter.rb')
            system("#{database_formatter} #{db_root}")
            retry
          else
            raise # let the caller decide what to do if database discovery fails
          end
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
          type = type.downcase
          name = name.freeze
          title = title.join(' ').freeze

          # skip past all but alias file of a NCBI multi-part BLAST database
          if name.match(/\/\w*[.]\d{2,}[.\w]*/)
            log.info(%|Found a multi-part database volume at #{name} - ignoring it.|)
            next
          end

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
