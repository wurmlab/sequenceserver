require 'yaml'
require 'fileutils'
require 'sinatra/base'
require 'thin'

require 'sequenceserver/logger'
require 'sequenceserver/sequence'
require 'sequenceserver/database'
require 'sequenceserver/blast'

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

      Database.scan_databases_dir

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
      erb :search, :locals => {:databases => Database.group_by(&:type)}
    end

    # BLAST search!
    post '/' do
      erb :result, :locals => {:report => BLAST.run(params),
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

      sequences = Sequence.from_blastdb(sequence_ids, database_ids)

      if params[:download]
        file_name = "sequenceserver_#{sequence_ids.first}.fa"
        file = Tempfile.new file_name
        sequences.each do |sequence|
          file.puts sequence.fasta
        end
        file.close
        send_file file.path, :type => :text, :filename => file_name
      else
        erb :fasta, :locals => {:sequences => sequences,
                                :sequence_ids => sequence_ids,
                                :database_ids => database_ids}
      end
    end

    # This error block will only ever be hit if the user gives us a funny
    # sequence or incorrect advanced parameter. Well, we could hit this block
    # if someone is playing around with our HTTP API too.
    error BLAST::ArgumentError do
      status 400
      error = env['sinatra.error']
      erb :'400', :locals => {:error => error}
    end

    # This will catch any unhandled error and some very special errors. Ideally
    # we will never hit this block. If we do, there's a bug in SequenceServer
    # or something really weird going on. If we hit this error block we show
    # the stacktrace to the user requesting them to post the same to our Google
    # Group.
    error Exception, BLAST::RuntimeError do
      status 500
      error = env['sinatra.error']
      erb :'500', :locals => {:error => error}
    end
  end
end
