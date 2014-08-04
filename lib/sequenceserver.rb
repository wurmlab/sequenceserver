require 'thin'
require 'sinatra/base'
require 'yaml'
require 'logger'
require 'fileutils'
require 'sequenceserver/sequence'
require 'sequenceserver/database'
require 'sequenceserver/blast'
require 'sequenceserver/sinatralikeloggerformatter'

# Helper module - initialize the blast server.
module SequenceServer

  extend self

  # Path to SequenceServer installation.
  def root
    File.dirname(File.dirname(__FILE__))
  end

  # Path to example configuration file.
  #
  # SequenceServer ships with a dummy configuration file. Users can simply
  # copy it and make necessary changes to get started.
  def example_config_file
    File.join(root, 'example.config.yml')
  end

  # Path to sample database.
  #
  # SequenceServer ships with test database (fire ant genome) so users can
  # launch and preview SequenceServer without any configuration, and/or run
  # test suite.
  def sample_database
    File.join(root, 'spec', 'database')
  end

  # Path to SequenceServer's configuration file.
  #
  # The configuration file is a simple, YAML data store.
  def config_file(config_file = nil)
    config_file  ||= '~/.sequenceserver.conf'
    @config_file ||= File.expand_path(config_file)
  end

  def environment
    ENV['RACK_ENV']
  end

  def host
    'localhost'
  end

  def port(port = nil)
    @port ||= Integer(port || 4567)
  rescue ArgumentError
    puts "*** Port must be number."
    puts "    Typo?"
  end

  def logger
    return @logger if @logger
    @logger = Logger.new(STDERR)
    @logger.formatter = SinatraLikeLogFormatter.new()
    case environment
    when 'production'
      logger.level = Logger::INFO
    when 'development'
      logger.level = Logger::DEBUG
    end
    @logger
  end

  def init(config = {})
    config_file config.delete 'config_file'
    assert_config_file_present

    puts "** Starting SequenceServer."
    config = parse_config_file.merge(config)

    bin_dir = File.expand_path(config.delete 'bin') rescue nil
    assert_bin_dir_present bin_dir
    export_bin_dir bin_dir

    assert_blast_installed_and_compatible

    @database_dir = File.expand_path(config.delete 'database') rescue sample_database
    assert_blast_database_directory_present database_dir
    @databases = scan_blast_database_directory(database_dir).freeze

    @app = App.new(databases)

    @num_threads = Integer(config.delete 'num_threads') rescue 1
    logger.info("Will use #@num_threads threads to run BLAST.")

    port config.delete 'port'

    @app
  end

  # For databaseformatter.
  def init2(config = {})
    config_file config.delete 'config_file'
    assert_config_file_present

    puts "** Starting SequenceServer."
    config = parse_config_file

    bin_dir = File.expand_path(config.delete 'bin') rescue nil
    assert_bin_dir_present bin_dir
    export_bin_dir bin_dir

    assert_blast_installed_and_compatible

    @database_dir = File.expand_path(config.delete 'database') rescue sample_database
    assert_blast_database_directory_present database_dir
  end

  attr_reader :app, :database_dir, :databases, :num_threads

  # Run SequenceServer as a self-hosted server using Thin webserver.
  def run
    url = "http://#{host}:#{port}"
    server = Thin::Server.new(app, host, port, :signals => false)
    server.silent = true
    server.backend.start do
      puts "** SequenceServer is ready."
      puts "   Go to #{url} in your browser and start BLASTing!"
      puts "   Press CTRL+C to quit."
      [:INT, :TERM].each do |sig|
        trap sig do
          server.stop!
          puts
          puts "** Thank you for using SequenceServer :)."
          puts "   Please cite: "
          puts "             Priyam A., Woodcroft B.J., Wurm Y (in prep)."
          puts "             Sequenceserver: BLAST searching made easy."
        end
      end
    end
  rescue RuntimeError
    puts "** Oops! There was an error."
    puts "   Is SequenceServer already accessible at #{url}?"
    puts "   Try running SequenceServer on another port, like so: sequenceserver -p 4570."
  end

  private

  def parse_config_file
    logger.info("Reading configuration file: #{config_file}.")
    config = YAML.load_file config_file
    unless config
      logger.warn("Empty configuration file: #{config_file} - will assume default settings.")
      config = {}
    end
    config
  rescue ArgumentError => error
    puts "*** Error in config file: #{error}."
    puts "YAML is white space sensitive. Is your config file properly indented?"
    exit
  end

  def assert_config_file_present
    unless File.exists? config_file
      puts '*** Configuration file not found.'
      FileUtils.cp(example_config_file, config_file)
      puts "*** Generated sample configuration file at #{config_file}."
      puts "    Please edit #{config_file} to indicate the location of your BLAST databases and run SequenceServer again."
      exit
    end
  end

  def assert_bin_dir_present bin_dir
    return unless bin_dir
    unless File.exists? bin_dir
      puts "*** Couldn't find #{bin_dir}."
      puts "    Typo in #{config_file}?"
      exit
    end
  end

  def assert_blast_installed_and_compatible
    unless command? 'blastdbcmd'
      puts "*** Could not find blast binaries."
      puts "    You may need to download BLAST+ from - "
      puts "      http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download"
      puts "    And/or edit #{SequenceServer.config_file} to indicate the location of BLAST+ binaries."
      exit
    end
    version = %x|blastdbcmd -version|.split[1]
    unless version >= '2.2.25+'
      puts "*** Your BLAST version #{version} is outdated."
      puts "    SequenceServer needs NCBI BLAST+ version 2.2.25+ or higher."
      exit
    end
  end

  def assert_blast_database_directory_present blast_database_directory
    unless File.exists? blast_database_directory
      puts "*** Couldn't find #{blast_database_directory}."
      puts "    Typo in #{config_file}?"
      exit
    end
  end

  # Export NCBI BLAST+ bin dir to PATH environment variable.
  def export_bin_dir(bin_dir)
    if bin_dir
      bin_dir = File.expand_path(bin_dir)
      unless ENV['PATH'].split(':').include? bin_dir
        ENV['PATH'] = "#{bin_dir}:#{ENV['PATH']}"
      end
    end
  end

  # Scan the given directory (including subdirectory) for blast databases.
  # ---
  # Arguments:
  # * db_root(String) - absolute path to the blast databases
  # ---
  # Returns:
  # * a hash of sorted blast databases indexed by their id.
  def scan_blast_database_directory(db_root)
    find_dbs_command = %|blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t" 2>&1|

    db_list = %x|#{find_dbs_command}|
    if db_list.empty?
      puts "*** No formatted blast databases found in '#{db_root}'."
      puts "    Run 'sequenceserver format-databases' to create BLAST database from your FASTA files in #{database_dir}."
      exit
    elsif db_list.match(/BLAST Database error/)
      puts "*** Error parsing one of the blast databases."
      # FIXME: sequenceserver format-databases should take care of this.
      puts "    Mostly likely some of your BLAST databases were created by an old version of 'makeblastdb'."
      puts "    You will have to manually delete problematic BLAST databases and subsequently run 'sequenceserver format-databases' to create new ones."
      exit
    elsif not $?.success?
      puts "*** Error obtaining BLAST databases."
      puts "    Tried: #{find_dbs_command}"
      puts "    Error:"
      db_list.strip.split("\n").each do |l|
        puts "      #{l}"
      end
      puts "    Please could you report this to 'https://groups.google.com/forum/#!forum/sequenceserver'?"
      exit
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
        logger.info(%|Found a multi-part database volume at #{name} - ignoring it.|)
        next
      end

      database = Database.new(name, title, type)
      db[database.hash] = database
      logger.info("Found #{database.type} database: #{database.title} at #{database.name}")
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

  class App < Sinatra::Base

    include Blast

    enable :logging

    # enable trapping internal server error in controller
    disable :show_exceptions

    set :root, SequenceServer.root

    # A Hash of BLAST databases indexed by their id (or hash).
    attr_reader :databases

    def initialize(database)
      @databases = database
      super()
    end

    def log
      SequenceServer.logger
    end

    def num_threads
      SequenceServer.num_threads
    end

    get '/' do
      erb :search, :locals => {:databases => databases.values.group_by(&:type)}
    end

    post '/' do
      log.debug params
      erb :result, :locals => {:report => blast(params), :database_ids => params[:databases]}
    end

    # get '/get_sequence/?sequence_ids=sequence_ids&database_ids=retreival_databases[&download=fasta]'
    #
    # Use whitespace to separate entries in sequence_ids (all other chars exist
    # in identifiers) and retreival_databases (we don't allow whitespace in a
    # database's name, so it's safe).
    get '/get_sequence/' do
      log.debug params

      sequence_ids = params[:sequence_ids].split(/\s/)
      database_ids = params[:database_ids].split(/\s/)

      sequences, database_names = sequences_from_blastdb(sequence_ids, database_ids)

      if format = params[:download]
        download_name = "sequenceserver_#{sequence_ids.first}.fa.txt"
        file = Tempfile.open(download_name) do |f|
          sequences.each do |sequence|
            f.puts sequence.send(format)
          end
          f
        end
        send_file file.path, :filename => download_name
      else
        erb :fasta, :locals => {:sequences => sequences,
                                :sequence_ids => sequence_ids,
                                :database_names => database_names,
                                :database_ids => database_ids}
      end
    end

    error 400 do
      error = env['sinatra.error']
      erb :'400', :locals => {:error => error}
    end

    error 500 do
      error = env['sinatra.error']
      erb :'500', :locals => {:error => error}
    end
  end
end
