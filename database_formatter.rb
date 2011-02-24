# copyright yannick . wurm at unil . ch
# Finds files, reads first char. if its '>', read 500 lines. Guess sequence type, ask user for title to format as blast database.

require 'rubygems'
require 'ptools' # for File.binary?(file)
require 'find'
require 'logger'
require 'lib/helpers.rb'
require 'lib/sequencehelpers.rb'

LOG = Logger.new(STDOUT)

class DatabaseFormatter
    include SequenceServer
	include Helpers
    include SystemHelpers
    include SequenceHelpers
    
    def init
        LOG.info("initializing")
        ['blastdbcmd', 'makeblastdb'].each do |command|
            LOG.warn("Cannot execute: '#{command}") unless command?(command)
        end
    end

    def format_databases(db_path)
        commands = []
        Find.find(db_path) do |file|
            next if File.directory?(file)
            unless File.binary?(file)

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

                end
            end
        end
        LOG.info("Will now create DBs")
        commands.each do |command|
			LOG.info("Will run: " + command.to_s)
            system(command)
        end
        LOG.info("Done formatting databases. ")
        db_table(db_path)
    end

    def db_table(db_path)
        LOG.info("Summary of formatted blast databases:\n")
        output = %x| blastdbcmd -recursive -list #{db_path} -list_outfmt "%p %f %t" &2>1 |
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
            title = File.basename(file)  if title.empty?
            
            return make_db_command(file,type,title)
        end
    end

    def make_db_command(file,type, title)
        LOG.info("Will make #{type.to_s} database from #{file} with #{title}")
        command = %|makeblastdb -in #{file} -dbtype #{ type.to_s.slice(0,4)} -title "#{title}" -parse_seqids|
        LOG.info("Returning: #{command}")
        return(command)
    end
end



if ARGV.length == 1
    db_path = ARGV[0]
    LOG.info("running with #{db_path}")
    if File.directory?(db_path) 
        app = DatabaseFormatter.new()
        app.init()
        app.format_databases(db_path)
    else
        LOG.warn("Not running becuase #{db_path} is not a directory")
    end
else 
    LOG.warn('Not running: give only one argument (directory)')
end
