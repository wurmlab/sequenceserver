require 'tempfile'

module SequenceServer
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
  def self.sys(command, options = {})
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
      exec(command, out: temp_files[:stdout].path.to_s, \
                    err: temp_files[:stderr].path.to_s)

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
end
