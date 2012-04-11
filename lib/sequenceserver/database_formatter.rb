# copyright yannick . wurm at unil . ch
# Finds files, reads first char. if its '>', read 500 lines. Guess sequence type, ask user for title to format as blast database.

# TODO: bring it under SequenceServer namespace
# TODO: move the file to a 'command/' sub-directory (probably makes more sense if we have several subcommands)
# TODO: needs more love (read refactoring) overall

require 'ptools' # for File.binary?(file)
require 'find'
require 'logger'
require 'optparse'
require 'sequenceserver'
require 'sequenceserver/helpers.rb'
require 'sequenceserver/sequencehelpers.rb'

LOG = Logger.new(STDOUT)
LOG.level = Logger::INFO

class DatabaseFormatter
    include SequenceServer
	include Helpers
    include SystemHelpers
    include SequenceHelpers
    
    attr_accessor :db_path

    def initialize(db_path = nil)
      @app = SequenceServer::App
      @app.config = @app.parse_config
      @app.binaries = @app.scan_blast_executables(@app.bin).freeze

      @db_path = (db_path or @app.database)
    end

    def format_databases
      unless File.directory?(db_path)
        # This block is unlikely to ever be run since it is already checked before calling this method
	LOG.fatal("Database directory #{db_path} not found")
        exit
      end

        formatted_dbs = %x|#{@app.binaries['blastdbcmd']} -recursive -list #{db_path} -list_outfmt "%f" 2>&1|.split("\n")
        commands = []
        Find.find(db_path) do |file|
            LOG.debug("Assessing file #{file}..")
            if File.directory?(file)
              LOG.debug("Ignoring file #{file} since it is a directory")
              next
            end
            if formatted_dbs.include?(file)
              LOG.debug("Ignoring file #{file} since it is already a blast database")
              next
            end
            if File.binary?(file)
              LOG.debug("Ignoring file #{file} since it is a binary file, not plaintext as FASTA files are")
              next
            end

                if probably_fasta?(file)
                    LOG.info("Found #{file}")
                    ## guess whether protein or nucleotide based on first 500 lines
                    first_lines = ''
                    File.open(file, 'r') do |file_stream|
                        file_stream.each do |line|
                            first_lines += line
                            break if file_stream.lineno == 500
                        end
                    end
                    begin
                        sequence_type = type_of_sequences(first_lines) # returns :protein or :nucleotide
                    rescue
                        LOG.warn("Unable to guess sequence type for #{file}. Skipping") 
                    end
                    if [ :protein, :nucleotide ].include?(sequence_type)
                        command = ask_make_db_command(file, sequence_type)
                        unless command.nil?
                            commands.push(command)
                        end
                    else 
                        LOG.warn("Unable to guess sequence type for #{file}. Skipping") 
                    end
                else
                  LOG.debug("Ignoring file #{file} since it was not judged to be a FASTA file.")
                end
        end
        LOG.info("Will now create DBs")
        if commands.empty?
          puts "", "#{db_path} does not contain any unformatted database."
          exit
        end
        commands.each do |command|
			LOG.info("Will run: " + command.to_s)
            system(command)
        end
        LOG.info("Done formatting databases. ")
        db_table(db_path)
    end

    def db_table(db_path)
        LOG.info("Summary of formatted blast databases:\n")
        output = %x|#{@app.binaries['blastdbcmd']} -recursive -list #{db_path} -list_outfmt "%p %f %t" &2>1 |
        LOG.info(output)
    end

    def probably_fasta?(file)
		return FALSE if File.zero?(file)
        File.open(file, 'r') do |file_stream|
            first_line = file_stream.readline
            if first_line.slice(0,1) == '>'
                return TRUE
            else 
                return FALSE
            end
        end
    end


    # returns command than needs to be run to make db
    def ask_make_db_command(file, type)
        LOG.info("FASTA file: #{file}")
        LOG.info("Fasta type: " + type.to_s)
        
        response = ''
        until response.match(/^[yn]$/i) do
            LOG.info("Proceed? [y/n]: ")
            response = STDIN.gets.chomp
        end

        if response.match(/y/i)
            LOG.info("Enter a database title (or will use '#{File.basename(file)}'")
            title = STDIN.gets.chomp
			title.gsub!('"', "'")
            title = File.basename(file)  if title.empty?
            
            return make_db_command(file,type,title)
        end
    end

    def make_db_command(file,type, title)
        LOG.info("Will make #{type.to_s} database from #{file} with #{title}")
        command = %|#{@app.binaries['makeblastdb']} -in #{file} -dbtype #{ type.to_s.slice(0,4)} -title "#{title}" -parse_seqids|
        LOG.info("Returning: #{command}")
        return(command)
    end
end

OptionParser.new do |opts|
  opts.banner =<<BANNER

SUMMARY

  prepare BLAST databases for SequenceServer

USAGE

  sequenceserver format-databases [--verbose] [blast_database_directory]

  Example:

    $ sequenceserver format-databases ~/db  # explicitly specify a database directory
    $ sequenceserver format-databases      # use the database directory in config.yml

DESCRIPTION

  Recursively scan the given 'blast_database_directory' for BLAST databases and
  formats them for use with SequenceServer.

  It automagically detects the database type, and ignores non-db files and
  pre-formatted databases. The 'parse_seqids' makeblastdb options is used.

  'blast_database_directory' can be passed as a command line parameter or
  through a configuration file by setting the 'database' key (the same option
  used by SequenceServer). Configuration file will be checked only if the
  command line parameter is missing.

OPTIONS

BANNER

  opts.on_tail('-h', '--help', 'Show this message') do
    puts opts
    exit
  end

  opts.on('-v', '--verbose', 'Print lots of output') do
    LOG.level = Logger::DEBUG
  end
end.parse!

app = DatabaseFormatter.new(ARGV[0])
app.format_databases
