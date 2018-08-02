require 'English'
require 'tempfile'

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
require 'sequenceserver/doctor'

# Top level module / namespace.
module SequenceServer
  # Use a fixed minimum version of BLAST+
  BLAST_VERSION = '2.6.0+'.freeze

  # Default location of configuration file.
  DEFAULT_CONFIG_FILE = '~/.sequenceserver.conf'.freeze

  # Constant for denoting the path ~/.sequenceserver
  DOTDIR = File.expand_path('~/.sequenceserver').freeze

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
      # Use default config file if caller didn't specify one.
      config[:config_file] ||= DEFAULT_CONFIG_FILE
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

    # 'sys' executes a shell command.
    #
    # 'sys' can write the stdout and/or stderr from a shell command to files, or
    #  return these values.
    #
    # 'sys' can get from a failed shell command stdout, stderr, and exit status.
    #
    # Supply 'sys' with the shell command and optionally:
    # dir: A directory to change to for the duration of the execution of
    # the shell command.
    # path: A directory to change the PATH environment variable to for the
    # duration of the execution of the shell command.
    # stdout: A path to a file to store stdout.
    # stderr: A path to a file to store stderr.
    #
    # Usage:
    #
    # sys(command, dir: '/path/to/directory', path: '/path/to/directory',
    #     stdout: '/path/to/stdout_file', stderr: '/path/to/stderr_file')
    #
    # rubocop:disable Metrics/CyclomaticComplexity
    def sys(command, options = {})
      # Available output channels
      channels = %i[stdout stderr]

      # Make temporary files to store output from stdout and stderr.
      temp_files = {
        stdout: Tempfile.new('sequenceserver-sys'),
        stderr: Tempfile.new('sequenceserver-sys')
      }

      # Log the command we are going to run - use -D option to view.
      logger.debug("Executing: #{command}")

      # Run command in a child process. This allows us to control PATH
      # and pwd of the running process.
      child_pid = fork do
        # Set the PATH environment variable to the binary directory or
        # safe directory.
        ENV['PATH'] = options[:path] if options[:path]

        # Change to the specified directory.
        Dir.chdir(options[:dir]) if options[:dir] && Dir.exist?(options[:dir])

        # Execute the shell command, redirect stdout and stderr to the
        # temporary files.
        exec("#{command} 1>#{temp_files[:stdout].path}" \
             " 2>#{temp_files[:stderr].path}")
      end

      # Wait for the termination of the child process.
      _, status = Process.wait2(child_pid)

      # If a full path was given for stdout and stderr files, move the
      # temporary files to this path. If the path given does not exist,
      # create it.
      channels.each do |channel|
        filename = options[channel]
        break unless filename

        # If the given path has a directory component, ensure it exists.
        file_dir = File.dirname(filename)
        FileUtils.mkdir_p(file_dir) unless File.directory?(file_dir)

        # Now move the temporary file to the given path.
        # TODO: don't we need to explicitly close the temp file here?
        FileUtils.mv(temp_files.delete(channel), filename)
      end

      # Read the remaining temp files into memory. For large outputs,
      # the caller should supply a file path to prevent loading the
      # output in memory.
      temp_files.each do |channel, tempfile|
        temp_files[channel] = tempfile.read
      end

      # Finally, return contents of the remaining temp files if the
      # command completed successfully or raise CommandFailed error.
      return temp_files.values if status.success?
      raise CommandFailed.new(status.exitstatus, **temp_files)
    end
    # rubocop:enable Metrics/CyclomaticComplexity

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

      logger.debug("Will use BLAST+ databases at: #{config[:database_dir]}")
      Database.scan_databases_dir
      Database.each do |database|
        logger.debug("Found #{database.type} database '#{database.title}'" \
                     " at '#{database.name}'")
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
      fail BLAST_NOT_COMPATIBLE, version unless version == BLAST_VERSION
    end

    def server_url
      host = config[:host]
      host = 'localhost' if ['127.0.0.1', '0.0.0.0'].include?(host)
      "http://#{host}:#{config[:port]}"
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
  end
end
