require 'English'

require 'sequenceserver/version'
require 'sequenceserver/exceptions'
require 'sequenceserver/config'
require 'sequenceserver/logger'
require 'sequenceserver/server'
require 'sequenceserver/sequence'
require 'sequenceserver/database'
require 'sequenceserver/blast'
require 'sequenceserver/routes'
require 'sequenceserver/job_remover'

# Top level module / namespace.
module SequenceServer
  # Use a fixed minimum version of BLAST+
  MINIMUM_BLAST_VERSION = '2.2.31+'

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

    def pool
      @pool ||= Pool.new(config[:num_threads])
    end

    def init(config = {})
      @config = Config.new(config)
      Thread.abort_on_exception = true if ENV['RACK_ENV'] == 'development'

      init_binaries
      init_database
      load_extension
      check_num_threads
      @job_remover = JobRemover.new(@config[:job_lifetime])

      self

      # We don't validate port and host settings. If SequenceServer is run
      # self-hosted, bind will fail on incorrect values. If SequenceServer
      # is run via Apache+Passenger, we don't need to worry.
    end

    attr_reader :config

    # Run SequenceServer as a self-hosted server using Thin webserver.
    def run
      check_host
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

    def on_start
      puts '** SequenceServer is ready.'
      puts "   Go to #{server_url} in your browser and start BLASTing!"
      puts '   Press CTRL+C to quit.'
      open_in_browser(server_url)
    end

    def on_stop
      puts
      puts '** Thank you for using SequenceServer :).'
      puts '   Please cite: '
      puts '       Priyam A, Woodcroft BJ, Rai V, Munagala A, Moghul I, Ter F,'
      puts '       Gibbins MA, Moon H, Leonard G, Rumpf W & Wurm Y. 2015.'
      puts '       Sequenceserver: a modern graphical user interface for'
      puts '       custom BLAST databases. biorxiv doi: 10.1101/033142.'
    end

    # Rack-interface.
    #
    # Inject our logger in the env and dispatch request to our
    # controller.
    def call(env)
      env['rack.logger'] = logger
      Routes.call(env)
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

    def init_binaries
      if config[:bin]
        config[:bin] = File.expand_path config[:bin]
        unless File.exist?(config[:bin]) && File.directory?(config[:bin])
          fail BIN_DIR_NOT_FOUND, config[:bin]
        end
        logger.debug("Will use NCBI BLAST+ at: #{config[:bin]}")
        export_bin_dir
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
        fail DATABASE_DIR_NOT_FOUND, config[:database_dir]
      end

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

    # Check and warn user if host is 0.0.0.0 (default).
    def check_host
      # rubocop:disable Style/GuardClause
      if config[:host] == '0.0.0.0'
        logger.warn 'Will listen on all interfaces (0.0.0.0).' \
                    ' Consider using 127.0.0.1 (--host option).'
      end
      # rubocop:enable Style/GuardClause
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
      fail BLAST_NOT_EXECUTABLE if !$CHILD_STATUS.success? || version.empty?
      fail BLAST_NOT_COMPATIBLE, version unless version >= MINIMUM_BLAST_VERSION
    end

    def server_url
      host = config[:host]
      host = 'localhost' if host == '127.0.0.1' || host == '0.0.0.0'
      "http://#{host}:#{config[:port]}"
    end

    def open_in_browser(server_url)
      return if using_ssh? || verbose?
      if RUBY_PLATFORM =~ /linux/ && xdg?
        system "xdg-open #{server_url}"
      elsif RUBY_PLATFORM =~ /darwin/
        system "open #{server_url}"
      end
    end

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
  end
end
