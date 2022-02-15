require 'English'
require 'socket'
require 'resolv'

# Top level module / namespace.
module SequenceServer
  # The default version of BLAST that will be downloaded and configured for use.
  BLAST_VERSION = '2.12.0+'.freeze

  # Default location of configuration file.
  DEFAULT_CONFIG_FILE = '~/.sequenceserver.conf'.freeze

  # Constant for denoting the path ~/.sequenceserver
  DOTDIR = File.expand_path('~/.sequenceserver').freeze

  # Load nested class, modules, constants, and files that extend SequenceServer
  # module (e.g. sys).
  require 'sequenceserver/version'
  require 'sequenceserver/logger'
  require 'sequenceserver/config'
  require 'sequenceserver/server'
  require 'sequenceserver/routes'
  require 'sequenceserver/makeblastdb'
  require 'sequenceserver/job_remover'
  require 'sequenceserver/exceptions'
  require 'sequenceserver/sys'
  require 'sequenceserver/refinements'

  # The singleton methods defined below constitute the "runtime" environment of
  # SequenceServer.
  class << self
    # Returns ENV['RACK_ENV']. This environment variable determines if we are
    # in development on in production mode (default).
    def environment
      ENV['RACK_ENV']
    end

    # Returns true if RACK_ENV is set to 'development'. Raw JS and CSS files
    # are served in development mode and the logger is made more verbose.
    def development?
      environment == 'development'
    end
    alias verbose? development?

    # Logger object used in the initialisation routine and throughout the
    # application.
    def logger
      @logger ||= case environment
                  when 'development'
                    Logger.new(STDERR, Logger::DEBUG)
                  when 'test'
                    Logger.new(STDERR, Logger::WARN)
                  else
                    Logger.new(STDERR, Logger::INFO)
                  end
    end

    # MAKEBLASTDB service object.
    def makeblastdb
      @makeblastdb ||= MAKEBLASTDB.new(config[:database_dir])
    end

    # SequenceServer initialisation routine.
    def init(config = {})
      # Use default config file if caller didn't specify one.
      config[:config_file] ||= DEFAULT_CONFIG_FILE

      # Initialise global configuration object from the above config hash.
      @config = Config.new(config)

      # When in development mode, cause SequenceServer to terminate if any
      # thread spawned by the main process raises an unhandled exception. In
      # production mode the expectation is to log at appropriate severity level
      # and continue operating.
      Thread.abort_on_exception = true if development?

      # Now locate binaries, scan databases directory, require any plugin files.
      load_extension
      init_binaries
      init_database

      # The above methods validate bin dir, database dir, and path to plugin
      # files. Port and host settings don't need to be validated: if running
      # in self-hosted mode, WEBrick will handle incorrect values and if
      # running via Apache+Passenger host and port settings are not used.
      # Let's validate remaining configuration keys next.

      # Validate number of threads to use with BLAST.
      check_num_threads

      # Doesn't make sense to activate JobRemover when testing. It anyway
      # keeps stumbling on the mock test jobs that miss a few keys.
      unless environment == 'test'
        @job_remover = JobRemover.new(@config[:job_lifetime])
      end

      # 'self' is the most meaningful object that can be returned by this
      # method.
      self
    end

    # Holds SequenceServer configuration object for this process. This is
    # available only after calling SequenceServer.init.
    attr_reader :config

    # Rack-interface.
    #
    # Add our logger to Rack env and let Routes do the rest.
    def call(env)
      env['rack.logger'] = logger
      Routes.call(env)
    end

    # Run SequenceServer using WEBrick.
    def run
      Server.run(self)
    rescue Errno::EADDRINUSE
      puts "** Could not bind to port #{config[:port]}."
      puts "   Is SequenceServer already accessible at #{server_url}?"
      puts '   No? Try running SequenceServer on another port, like so:'
      puts
      puts '       sequenceserver -p 4570.'
    rescue Errno::EACCES
      puts "** Need root privilege to bind to port #{config[:port]}."
      puts '   It is not advisable to run SequenceServer as root.'
      puts '   Please use Apache/Nginx to bind to a privileged port.'
      puts '   Instructions available on http://sequenceserver.com.'
    end

    # This method is called after WEBrick has bound to the host and port and is
    # ready to accept connections.
    def on_start
      puts '** SequenceServer is ready.'
      puts "   Go to #{server_url} in your browser and start BLASTing!"
      if ip_address
        puts '   To share your setup, try one of the following addresses. These'
        puts '   may only work within your home, office, or university network.'
        puts "     -  http://#{ip_address}:#{config[:port]}"
        puts "     -  http://#{hostname}:#{config[:port]}" if hostname
        puts '   To share your setup with anyone in the world, ask your IT team'
        puts '   for a public IP address or consider the SequenceServer cloud'
        puts '   hosting service: https://sequenceserver.com/cloud'
        puts '   To disable sharing, set :host: key in config file to 127.0.0.1'
        puts '   and restart server.'
      end
      puts '   To terminate server, press CTRL+C'
      open_in_browser(server_url)
    end

    # This method is called when WEBrick is terminated.
    def on_stop
      puts
      puts '** Thank you for using SequenceServer :).'
      puts '   Please cite: '
      puts '       Priyam A, Woodcroft BJ, Rai V, Moghul I, Munagala A, Ter F,'
      puts '       Chowdhary H, Pieniak I, Maynard LJ, Gibbins MA, Moon H,'
      puts '       Davis-Richardson A, Uludag M, Watson-Haigh N, Challis R,'
      puts '       Nakamura H, Favreau E, Gómez EA, Pluskal T, Leonard G,'
      puts '       Rumpf W & Wurm Y.'
      puts '       Sequenceserver: A modern graphical user interface for'
      puts '       custom BLAST databases.'
      puts '       Molecular Biology and Evolution (2019)'
    end

    # This method is invoked by the -i switch to start an IRB shell with
    # SequenceServer loaded.
    def irb
      ARGV.clear
      require 'irb'
      IRB.setup nil
      IRB.conf[:MAIN_CONTEXT] = IRB::Irb.new.context
      require 'irb/ext/multi-irb'
      IRB.irb nil, self
    end

    private

    def init_binaries
      if config[:bin]
        config[:bin] = File.expand_path config[:bin]
        unless File.exist?(config[:bin]) && File.directory?(config[:bin])
          fail ENOENT.new('bin dir', config[:bin])
        end
        logger.debug("Will use NCBI BLAST+ at: #{config[:bin]}")
      else
        logger.debug('Location of NCBI BLAST+ not provided. Assuming NCBI' \
                     ' BLAST+ to be present in: $PATH')
      end

      assert_blast_installed_and_compatible
    end

    def init_database
      fail DATABASE_DIR_NOT_SET unless config[:database_dir]

      config[:database_dir] = File.expand_path(config[:database_dir])
      unless File.exist?(config[:database_dir]) &&
             File.directory?(config[:database_dir])
        fail ENOENT.new('database dir', config[:database_dir])
      end

      logger.debug("Will look for BLAST+ databases in: #{config[:database_dir]}")

      makeblastdb.scan
      fail NO_BLAST_DATABASE_FOUND, config[:database_dir] if !makeblastdb.any_formatted?

      Database.collection = makeblastdb.formatted_fastas
      Database.each do |database|
        logger.debug "Found #{database.type} database '#{database.title}' at '#{database.path}'"
        if database.non_parse_seqids?
          logger.warn "Database '#{database.title}' was created without using the" \
                      ' -parse_seqids option of makeblastdb. FASTA download will' \
                      " not work correctly (path: '#{database.path}')."
        elsif database.v4?
          logger.warn "Database '#{database.title}' is of older format. Mixing" \
                      ' old and new format databases can be problematic' \
                      "(path: '#{database.path}')."
        end
      end
    end

    def check_num_threads
      num_threads = Integer(config[:num_threads])
      fail NUM_THREADS_INCORRECT unless num_threads.positive?
      logger.debug "Will use #{num_threads} threads to run BLAST."
      if num_threads > 256
        logger.warn "Number of threads set at #{num_threads} is unusually high."
      end
    rescue ArgumentError
      raise NUM_THREADS_INCORRECT
    end

    def load_extension
      return unless config[:require]

      config[:require] = File.expand_path config[:require]
      unless File.exist?(config[:require]) && File.file?(config[:require])
        fail ENOENT.new('extension file', config[:require])
      end

      logger.debug("Loading extension: #{config[:require]}")
      require config[:require]
    end

    def assert_blast_installed_and_compatible
      begin
        out, = sys('blastdbcmd -version', path: config[:bin])
      rescue CommandFailed
        fail BLAST_NOT_INSTALLED_OR_NOT_EXECUTABLE
      end
      version = out.split[1]
      fail BLAST_NOT_INSTALLED_OR_NOT_EXECUTABLE if version.empty?
      fail BLAST_NOT_COMPATIBLE, version unless is_compatible(version, BLAST_VERSION)
    end

    def server_url
      host = config[:host]
      host = 'localhost' if ['127.0.0.1', '0.0.0.0'].include?(host)
      "http://#{host}:#{config[:port]}"
    end

    # Returns a local ip adress.
    def ip_address
      addrinfo = Socket.ip_address_list.find { |ai| ai.ipv4? && !ai.ipv4_loopback? }
      addrinfo.ip_address if addrinfo
    end

    # Returns machine's hostname based on the local ip. If hostname cannot be
    # determined returns nil.
    def hostname
      Resolv.getname(ip_address) rescue nil
    end

    # Uses `open` on Mac or `xdg-open` on Linux to opens the search form in
    # user's default browser. This function is called when SequenceServer
    # is launched from the terminal. Errors, if any, are silenced.
    #
    # rubocop:disable Metrics/CyclomaticComplexity, Style/RescueStandardError,
    # Lint/HandleExceptions
    def open_in_browser(server_url)
      return if using_ssh? || verbose?
      if RUBY_PLATFORM =~ /linux/ && xdg?
        sys("xdg-open #{server_url}")
      elsif RUBY_PLATFORM =~ /darwin/
        sys("open #{server_url}")
      end
    rescue
      # fail silently
    end
    # rubocop:enable Metrics/CyclomaticComplexity, Style/RescueStandardError,
    # Lint/HandleExceptions

    def using_ssh?
      true if ENV['SSH_CLIENT'] || ENV['SSH_TTY'] || ENV['SSH_CONNECTION']
    end

    def xdg?
      true if ENV['DISPLAY'] && command?('xdg-open')
    end

    # Return `true` if the given command exists and is executable.
    def command?(command)
      system("which #{command} > /dev/null 2>&1")
    end

    # Returns true if the given version is higher than the minimum expected
    # version string.
    def is_compatible(given, expected)
      # The speceship operator (<=>) below returns -1, 0, 1 depending on
      # on whether the left operand is lower, same, or higher than the
      # right operand. We want the left operand to be the same or higher.
      (parse_version(given) <=> parse_version(expected)) >= 0
    end

    # Turn version string into an arrary of its component numbers.
    def parse_version(version_string)
      version_string.split('.').map(&:to_i)
    end
  end
end
