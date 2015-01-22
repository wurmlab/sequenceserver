require 'yaml'
require 'English'
require 'fileutils'
require 'sinatra/base'
require 'thin'
require 'json'

require 'sequenceserver/exceptions'
require 'sequenceserver/logger'
require 'sequenceserver/sequence'
require 'sequenceserver/database'
require 'sequenceserver/blast'

# Top level module / namespace.
module SequenceServer
  # Use a fixed minimum version of BLAST+
  MINIMUM_BLAST_VERSION           = '2.2.30+'

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
      @config = config

      init_config
      init_binaries
      init_database
      load_extension
      check_num_threads
      self

      # We don't validate port and host settings. If SequenceServer is run
      # self-hosted, bind will fail on incorrect values. If SequenceServer
      # is run via Apache+Passenger, we don't need to worry.
    end

    attr_reader :config_file, :config

    def [](key)
      config[key]
    end

    # Run SequenceServer as a self-hosted server using Thin webserver.
    def run
      url = "http://#{config[:host]}:#{config[:port]}"
      server = Thin::Server.new(config[:host],
                                config[:port],
                                :signals => false) do
        use Rack::CommonLogger
        run SequenceServer
      end
      server.silent = true
      server.backend.start do
        puts '** SequenceServer is ready.'
        puts "   Go to #{url} in your browser and start BLASTing!"
        puts '   Press CTRL+C to quit.'
        [:INT, :TERM].each do |sig|
          trap sig do
            server.stop!
            puts
            puts '** Thank you for using SequenceServer :).'
            puts '   Please cite: '
            puts '             Priyam, Woodcroft, Rai & Wurm,'
            puts '             SequenceServer (in prep).'
          end
        end
      end
    rescue
      puts '** Oops! There was an error.'
      puts "   Is SequenceServer already accessible at #{url}?"
      puts '   Try running SequenceServer on another port, like so:'
      puts
      puts '       sequenceserver -p 4570.'
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

    # Parse config file if present. Returns a Hash.
    def parse_config_file
      return {} unless @config_file && File.exist?(@config_file)

      logger.debug("Reading configuration file: #{config_file}.")
      config = YAML.load_file(config_file) || {}

      # Symbolize hash keys
      config = config.inject({}) do |a, e|
        a[e.first.to_sym] = e.last
        a
      end

      # The newer config file version replaces the older database key with
      # database_dir. If an older version is found, we auto-migrate it to
      # newer one.
      config[:database_dir] ||= config.delete(:database)
      config
    rescue ArgumentError => error
      puts "Error in config file: #{error}."
      puts 'YAML is white space sensitive. Is your config file properly'\
           'indented?'
      exit 1
    end

    def write_config_file
      File.open(SequenceServer.config_file, 'w') do |f|
        f.puts(config.delete_if { |_, v| v.nil? }.to_yaml)
      end
    end

    def init_config
      @config_file = @config.delete(:config_file) || '~/.sequenceserver.conf'
      @config_file = File.expand_path(config_file)

      @config = {
        :num_threads  => 1,
        :port         => 4567,
        :host         => 'localhost'
      }.update(parse_config_file.update(@config))
    end

    def init_binaries
      if config[:bin]
        config[:bin] = File.expand_path config[:bin]
        unless File.exist?(config[:bin]) && File.directory?(config[:bin])
          fail BIN_DIR_NOT_FOUND, config[:bin]
        end
        logger.debug("Will use NCBI BLAST+ at: #{config[:bin]}")
        export_bin_dir
      else
        logger.debug('Will use NCBI BLAST+ at: $PATH')
      end

      assert_blast_installed_and_compatible
    end

    def init_database
      fail DATABASE_DIR_NOT_SET unless config[:database_dir]

      config[:database_dir] = File.expand_path(config[:database_dir])
      unless File.exist?(config[:database_dir]) &&
             File.directory?(config[:database_dir])
        fail DATABASE_DIR_NOT_FOUND, config[:database_dir]
      end

      assert_blast_databases_present_in_database_dir
      logger.debug("Will use BLAST+ databases at: #{config[:database_dir]}")

      Database.scan_databases_dir
      Database.each do |database|
        logger.debug("Found #{database.type} database '#{database.title}'" \
                     " at '#{database.name}'")
      end
    end

    def check_num_threads
      num_threads = Integer(config[:num_threads])
      fail NUM_THREADS_INCORRECT unless num_threads > 0

      logger.debug "Will use #{num_threads} threads to run BLAST."
      if num_threads > 256
        logger.warn "Number of threads set at #{num_threads} is unusually high."
      end
    rescue
      raise NUM_THREADS_INCORRECT
    end

    def load_extension
      return unless config[:require]

      config[:require] = File.expand_path config[:require]
      unless File.exist?(config[:require]) && File.file?(config[:require])
        fail EXTENSION_FILE_NOT_FOUND, config[:require]
      end

      logger.debug("Loading extension: #{config[:require]}")
      require config[:require]
    end

    # Export NCBI BLAST+ bin dir to PATH environment variable.
    def export_bin_dir
      bin_dir = config[:bin]
      return unless bin_dir
      return if ENV['PATH'].split(':').include? bin_dir
      ENV['PATH'] = "#{bin_dir}:#{ENV['PATH']}"
    end

    def assert_blast_installed_and_compatible
      fail BLAST_NOT_INSTALLED unless command? 'blastdbcmd'
      version = `blastdbcmd -version`.split[1]
      fail BLAST_NOT_COMPATIBLE, version unless version >= MINIMUM_BLAST_VERSION
    end

    def assert_blast_databases_present_in_database_dir
      cmd = "blastdbcmd -recursive -list #{config[:database_dir]}"
      out = `#{cmd}`
      errpat = /BLAST Database error/
      fail NO_BLAST_DATABASE_FOUND, config[:database_dir] if out.empty?
      fail BLAST_DATABASE_ERROR, cmd, out if out.match(errpat) ||
                                             !$CHILD_STATUS.success?
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
      enable :dump_errors

      # We don't want Sinatra do setup any loggers for us. We will use our own.
      set :logging, nil

      # Public, and views directory will be found here.
      set :root,    lambda { SequenceServer.root }
    end

    # See
    # http://www.sinatrarb.com/intro.html#Mime%20Types
    configure do
      mime_type :fasta, 'text/fasta'
      mime_type :xml,   'text/xml'
      mime_type :tsv,   'text/tsv'
    end

    helpers do
      # Render an anchor element from the given Hash.
      #
      # See links.rb for example of a Hash object that will be rendered.
      def a(link)
        return unless link[:title] && link[:url]
        a = ['<a']
        a <<   "href=#{link[:url]}"
        a <<   "class=\"#{link[:class]}\"" if link[:class]
        a <<   "target=\"_blank\""         if absolute? link[:url]
        a << '>'
        a <<   "<i class=\"fa #{link[:icon]}\"></i>" if link[:icon]
        a <<   link[:title]
        a << '</a>'
        a.join("\n")
      end

      # Is the given URI absolute? (or relative?)
      def absolute?(uri)
        URI.parse(uri).absolute?
      end

      # Prettify given data.
      def prettify(data)
        return prettify_tuple(data) if tuple? data
        return prettify_float(data) if data.is_a? Float
        data
      end

      # Formats float as "a.bcd" or "a x b^c". The latter if float is
      # scientific notation. Former otherwise.
      def prettify_float(float)
        float.to_s.sub(/(\d*\.\d*)e?([+-]\d*)?/) do
          base  = Regexp.last_match[1]
          power = Regexp.last_match[2]
          s = format '%.2f', base
          s << " &times; 10<sup>#{power}</sup>" if power
          s
        end
      end

      # Formats an array of two elements as "first (last)".
      def prettify_tuple(tuple)
        "#{tuple.first} (#{tuple.last})"
      end

      # Is the given value a tuple? (array of length two).
      def tuple?(data)
        return true if data.is_a?(Array) && data.length == 2
      end
    end

    # For any request that hits the app in development mode, log incoming
    # params.
    before do
      logger.debug params
    end

    # Render the search form.
    get '/' do
      erb :search, :locals => { :databases => Database.group_by(&:type) }
    end

    # BLAST search!
    post '/' do
      erb :result, :locals => { :report => BLAST.run(params) }
    end

    # @params sequence_ids: whitespace separated list of sequence ids to
    # retrieve
    # @params database_ids: whitespace separated list of database ids to
    # retrieve the sequence from.
    # @params download: whether to return raw response or initiate file
    # download
    #
    # Use whitespace to separate entries in sequence_ids (all other chars exist
    # in identifiers) and retreival_databases (we don't allow whitespace in a
    # database's name, so it's safe).
    get '/get_sequence/' do
      sequence_ids = params[:sequence_ids].split(/\s/)
      database_ids = params[:database_ids].split(/\s/)

      sequences = Sequence.from_blastdb(sequence_ids, database_ids)

      if params[:download]
        file_name = "sequenceserver_#{sequence_ids.first}.fasta"
        file = Tempfile.new file_name
        sequences.each do |sequence|
          file.puts sequence.fasta
        end
        file.close
        send_file file.path, :type => :fasta, :filename => file_name
      else
        {
          :sequence_ids => sequence_ids,
          :databases    => Database[database_ids].map(&:title),
          :sequences    => sequences.map(&:info)
        }.to_json
      end
    end

    get '/get_report/' do
      ofile = BLAST.format(params)

      send_file ofile[:filepath],
                :filename => ofile[:filename],
                :type => ofile[:type].to_sym
    end

    # This error block will only ever be hit if the user gives us a funny
    # sequence or incorrect advanced parameter. Well, we could hit this block
    # if someone is playing around with our HTTP API too.
    error BLAST::ArgumentError do
      status 400
      error = env['sinatra.error']
      erb :'400', :locals => { :error => error }
    end

    # This will catch any unhandled error and some very special errors. Ideally
    # we will never hit this block. If we do, there's a bug in SequenceServer
    # or something really weird going on. If we hit this error block we show
    # the stacktrace to the user requesting them to post the same to our Google
    # Group.
    error Exception, BLAST::RuntimeError do
      status 500
      error = env['sinatra.error']
      erb :'500', :locals => { :error => error }
    end
  end
end
