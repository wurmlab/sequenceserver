require 'yaml'
require 'fileutils'
require 'sinatra/base'
require 'thin'

require 'sequenceserver/logger'
require 'sequenceserver/sequence'
require 'sequenceserver/database'
require 'sequenceserver/blast'

# It is important that formatted BLAST database files have the same dirname and
# basename as the source FASTA for SequenceServer to be able to tell formatted
# FASTA from unformatted. And that FASTA files be formatted with `parse_seqids`
# option of `makeblastdb` for sequence retrieval to work.
#
# SequenceServer will always place BLAST database files alongside input FASTA,
# and use `parse_seqids` option of `makeblastdb` to format databases.
module SequenceServer

  # Use a fixed minimum version of BLAST+
  MINIMUM_BLAST_VERSION           = '2.2.27+'
  # Use the following exit codes, or 1.
  EXIT_BLAST_NOT_INSTALLED        = 2
  EXIT_BLAST_NOT_COMPATIBLE       = 3
  EXIT_NO_BLAST_DATABASE          = 4
  EXIT_BLAST_INSTALLATION_FAILED  = 5
  EXIT_CONFIG_FILE_NOT_FOUND      = 6
  EXIT_NO_SEQUENCE_DIR            = 7

  extend Blast

  class << self
    def environment
      ENV['RACK_ENV']
    end

    def verbose?
      @verbose ||= (environment == 'development')
    end

    def root
      File.dirname(File.dirname(__FILE__))
    end

    def logger
      @logger ||= Logger.new(STDERR, verbose?)
    end

    def init(config = {})
      @config_file = config.delete(:config_file) || '~/.sequenceserver.conf'
      @config_file = File.expand_path(config_file)
      assert_file_present('config file', config_file, EXIT_CONFIG_FILE_NOT_FOUND)

      @config = {
        :num_threads  => 1,
        :port         => 4567,
        :host         => 'localhost'
      }.update(parse_config_file.merge(config))

      if @config[:bin]
        @config[:bin] = File.expand_path @config[:bin]
        assert_dir_present 'bin dir', @config[:bin]
        export_bin_dir
      end

      assert_blast_installed_and_compatible

      assert_dir_present 'database dir', @config[:database_dir], EXIT_NO_SEQUENCE_DIR
      @config[:database_dir] = File.expand_path(@config[:database_dir])
      assert_blast_databases_present_in_database_dir

      scan_databases_dir

      @config[:num_threads] = Integer(@config[:num_threads])
      assert_num_threads_valid @config[:num_threads]
      logger.debug("Will use #{@config[:num_threads]} threads to run BLAST.")

      if @config[:require]
        @config[:require] = File.expand_path @config[:require]
        assert_file_present 'extension file', @config[:require]
        require @config[:require]
      end

      # We don't validate port and host settings. If SequenceServer is run
      # self-hosted, bind will fail on incorrect values. If SequenceServer
      # is run via Apache+Passenger, we don't need to worry.

      self
    end

    attr_reader :config_file, :config

    def [](key)
      config[key]
    end

    def databases
      @databases ||= Set.new
    end


    # Recursively scan `database_dir` for un-formatted FASTA and format them
    # for use with BLAST+.
    def make_blast_databases
      unformatted_fastas.each do |file, sequence_type|
        make_blast_database(file, sequence_type)
      end
    end

    # Returns an Array of FASTA files that may require formatting, and the type
    # of sequence contained in each FASTA.
    #
    #   > unformatted_fastas
    #   => [['/foo/bar.fasta', :nulceotide], ...]
    def unformatted_fastas
      list = []
      database_dir = config[:database_dir]
      formatted_fastas = databases.map{|d| d.name}
      Find.find database_dir do |file|
        next if File.directory?(file)
        next if formatted_fastas.include? file
        if probably_fasta? file
          sequence_type = guess_sequence_type_in_fasta file
          if [:protein, :nucleotide].include?(sequence_type)
            list << [file, sequence_type]
          end
        end
      end
      list
    end

    # Create BLAST database, given FASTA file and sequence type in FASTA file.
    def make_blast_database(file, type)
      puts "FASTA file: #{file}"
      puts "FASTA type: #{type}"

      response = ''
      until response.match(/^[yn]$/i) do
        print "Proceed? [y/n]: "
        response = STDIN.gets.chomp
      end

      if response.match(/y/i)
        print "Enter a database title or will use '#{File.basename(file)}': "
        title = STDIN.gets.chomp
        title.gsub!('"', "'")
        title = File.basename(file) if title.empty?

        `makeblastdb -in #{file} -dbtype #{type.to_s.slice(0,4)} -title "#{title}" -parse_seqids`
      end
    end


    # Run SequenceServer as a self-hosted server using Thin webserver.
    def run
      url = "http://#{config[:host]}:#{config[:port]}"
      server = Thin::Server.new(config[:host], config[:port], :signals => false) do
        use Rack::CommonLogger
        run SequenceServer
      end
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
    rescue
      puts "** Oops! There was an error."
      puts "   Is SequenceServer already accessible at #{url}?"
      puts "   Try running SequenceServer on another port, like so: sequenceserver -p 4570."
    end

    # Rack-interface.
    #
    # Inject our logger in the env and dispatch request to our
    # controller.
    def call(env)
      env['rack.logger'] = logger
      App.call(env)
    end


    # Run SequenceServer interactively.
    def irb
      ARGV.clear
      require 'irb'
      IRB.setup nil
      IRB.conf[:MAIN_CONTEXT] = IRB::Irb.new.context
      require 'irb/ext/multi-irb'
      IRB.irb nil, self
    end

    private

    def parse_config_file
      logger.debug("Reading configuration file: #{config_file}.")
      config = YAML.load_file(config_file) || {}
      config.inject({}){|c, e| c[e.first.to_sym] = e.last; c}
    rescue ArgumentError => error
      puts "*** Error in config file: #{error}."
      puts "YAML is white space sensitive. Is your config file properly indented?"
      exit 1
    end

    def write_config_file
      File.open(SequenceServer.config_file, 'w') do |f|
        f.puts(config.delete_if{|k, v| v.nil?}.to_yaml)
      end
    end

    # Export NCBI BLAST+ bin dir to PATH environment variable.
    def export_bin_dir
      bin_dir = config[:bin]
      if bin_dir
        unless ENV['PATH'].split(':').include? bin_dir
          ENV['PATH'] = "#{bin_dir}:#{ENV['PATH']}"
        end
      end
    end

    # Recurisvely scan `database_dir` for blast databases.
    def scan_databases_dir
      database_dir = config[:database_dir]
      list = %x|blastdbcmd -recursive -list #{database_dir} -list_outfmt "%p	%f	%t" 2>&1|
      list.each_line do |line|
        type, name, title =  line.split('	')
        type.downcase!
        [type, name, title].each(&:freeze)

        # skip past all but alias file of a NCBI multi-part BLAST database
        if multipart_database_name?(name)
          logger.debug(%|Ignoring multi-part database volume at #{name}.|)
          next
        end

        logger.debug("Found #{type} database: #{title} at #{name}")
        database = Database.new(name, title, type)
        databases << database
      end
    end


    def assert_file_present desc, file, exit_code = 1
      unless file and File.exists? File.expand_path file
        puts "*** Couldn't find #{desc}: #{file}."
        exit exit_code
      end
    end

    alias assert_dir_present assert_file_present

    def assert_blast_installed_and_compatible
      unless command? 'blastdbcmd'
        puts "*** Could not find BLAST+ binaries."
        exit EXIT_BLAST_NOT_INSTALLED
      end
      version = %x|blastdbcmd -version|.split[1]
      unless version >= MINIMUM_BLAST_VERSION
        puts "*** Your BLAST+ version #{version} is outdated."
        puts "    SequenceServer needs NCBI BLAST+ version #{MINIMUM_BLAST_VERSION} or higher."
        exit EXIT_BLAST_NOT_COMPATIBLE
      end
    end

    def assert_blast_databases_present_in_database_dir
      database_dir = config[:database_dir]
      out = %x|blastdbcmd -recursive -list #{database_dir}|
      if out.empty?
        puts "*** Could not find BLAST databases in '#{database_dir}'."
        exit EXIT_NO_BLAST_DATABASE
      elsif out.match(/BLAST Database error/) or not $?.success?
        puts "*** Error obtaining BLAST databases."
        puts "    Tried: #{find_dbs_command}"
        puts "    Error:"
        out.strip.split("\n").each do |l|
          puts "      #{l}"
        end
        puts "    Please could you report this to 'https://groups.google.com/forum/#!forum/sequenceserver'?"
        exit EXIT_BLAST_DATABASE_ERROR
      end
    end

    def assert_num_threads_valid num_threads
      unless num_threads > 0
        puts "*** Can't use #{num_threads} number of threads."
        puts "    Number of threads should be greater than or equal to 1."
        exit 1
      end
      if num_threads > 256
        logger.warn "*** Number of threads set at #{num_threads} is unusually high."
      end
    rescue
      puts "*** Number of threads should be a number."
      exit 1
    end


    # Return `true` if the given command exists and is executable.
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

    # Returns true if first character of the file is '>'.
    def probably_fasta?(file)
      File.read(file, 1) == '>'
    end

    # Guess whether FASTA file contains protein or nucleotide sequences based
    # on first 32768 characters.
    #
    # NOTE: 2^15 == 32786. Approximately 546 lines, assuming 60 characters on
    # each line.
    def guess_sequence_type_in_fasta(file)
      sample = File.read(file, 32768)
      sequences = sample.split(/^>.+$/).delete_if { |seq| seq.empty? }
      sequence_types = sequences.map {|seq| Sequence.guess_type(seq)}.uniq.compact
      (sequence_types.length == 1) && sequence_types.first
    end
  end

  # Controller.
  class App < Sinatra::Base

    # See
    # http://www.sinatrarb.com/configuration.html
    configure do
      # We don't need Rack::MethodOverride. Let's avoid the overhead.
      disable :method_override

      # Ensure exceptions never leak out of the app. Exceptions raised within
      # the app must be handled by the app. We do this by attaching error
      # blocks to exceptions we know how to handle and attaching to Exception
      # as fallback.
      disable :show_exceptions, :raise_errors

      # Make it a policy to dump to 'rack.errors' any exception raised by the
      # app so that error handlers don't have to do it themselves. But for it
      # to always work, Exceptions defined by us should not respond to `code`
      # or http_status` methods. Error blocks errors must explicitly set http
      # status, if needed, by calling `status` method.
      # method.
      enable  :dump_errors

      # We don't want Sinatra do setup any loggers for us. We will use our own.
      set :logging, nil

      # Public, and views directory will be found here.
      set :root,    lambda { SequenceServer.root }
    end

    # For any request that hits the app in development mode, log incoming
    # params.
    before do
      logger.debug params
    end

    # Render the search form.
    get '/' do
      erb :search, :locals => {:databases => SequenceServer.databases.group_by(&:type)}
    end

    # BLAST search!
    post '/' do
      erb :result, :locals => {:report => SequenceServer.blast(params), :method => params[:method],
                               :database_ids => params[:databases]}
    end

    # get '/get_sequence/?sequence_ids=sequence_ids&database_ids=retreival_databases[&download=fasta]'
    #
    # Use whitespace to separate entries in sequence_ids (all other chars exist
    # in identifiers) and retreival_databases (we don't allow whitespace in a
    # database's name, so it's safe).
    get '/get_sequence/' do
      sequence_ids = params[:sequence_ids].split(/\s/)
      database_ids = params[:database_ids].split(/\s/)

      sequences, database_names = SequenceServer.sequences_from_blastdb(sequence_ids, database_ids)

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

    # This error block will only ever be hit if the user gives us a funny
    # sequence or incorrect advanced parameter. Well, we could hit this block
    # if someone is playing around with our HTTP API too.
    error Blast::ArgumentError do
      status 400
      error = env['sinatra.error']
      erb :'400', :locals => {:error => error}
    end

    # This will catch any unhandled error and some very special errors. Ideally
    # we will never hit this block. If we do, there's a bug in SequenceServer
    # or something really weird going on. If we hit this error block we show
    # the stacktrace to the user requesting them to post the same to our Google
    # Group.
    error Exception, Blast::RuntimeError do
      status 500
      error = env['sinatra.error']
      erb :'500', :locals => {:error => error}
    end
  end
end
