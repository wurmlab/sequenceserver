# This file defines all possible exceptions that can be thrown by
# SequenceServer on startup.
#
# Exceptions only ever inform another entity (downstream code or users) of an
# issue. Exceptions may or may not be recoverable.
#
# Error classes should be seen as: the error code (class name), human readable
# message (to_s method), and necessary attributes to act on the error.
#
# We define as many error classes as needed to be precise about the issue, thus
# making it easy for downstream code (bin/sequenceserver or config.ru) to act
# on them.

module SequenceServer
  # Error in config file.
  class CONFIG_FILE_ERROR < StandardError
    def initialize(ent, err)
      @ent = ent
      @err = err
    end

    attr_reader :ent, :err

    def to_s
      <<~MSG
        Error reading config file: #{ent}.
          #{err}
      MSG
    end
  end

  ## ENOENT ##

  # Name borrowed from standard Errno::ENOENT, this class serves as a template
  # for defining errors that mean "expected to find <entity> at <path>, but
  # didn't".
  #
  # ENOENT is raised if and only if an entity was set, either using CLI or
  # config file. For instance, it's compulsory to set database_dir. But ENOENT
  # is not raised if database_dir is not set. ENOENT is raised if database_dir
  # was set, but does not exist.
  class ENOENT < StandardError
    def initialize(des, ent)
      @des = des
      @ent = ent
    end

    attr_reader :des, :ent

    def to_s
      "Could not find #{des}: #{ent}"
    end
  end

  ## NUM THREADS ##

  # Raised if num_threads set by the user is incorrect.
  class NUM_THREADS_INCORRECT < StandardError
    def to_s
      'Number of threads should be a number greater than or equal to 1.'
    end
  end

  ## BLAST NOT INSTALLED OR NOT COMPATIBLE ##

  # Raised if SequenceServer could not locate NCBI BLAST+ installation on
  # user's system.
  class BLAST_NOT_INSTALLED_OR_NOT_EXECUTABLE < StandardError
    def to_s
      'BLAST not installed, or is not executable.'
    end
  end

  # Raised if SequenceServer could not successfully execute 'blastp -version'
  # on user's system (see #141).
  class BLAST_NOT_EXECUTABLE < StandardError
    def to_s
      'Error executing BLAST+ binaries.'
    end
  end

  # Raised if SequenceServer determined NCBI BLAST+ present on the user's
  # system but not meeting SequenceServer's minimum version requirement.
  class BLAST_NOT_COMPATIBLE < StandardError
    def initialize(version)
      @version = version
    end

    attr_reader :version

    def to_s
      <<~MSG
        Your BLAST+ version #{version} is incompatible.
        SequenceServer needs NCBI BLAST+ version #{BLAST_VERSION}.
      MSG
    end
  end

  ## BLAST+ DATABASE RELATED ##

  # Raised if 'database_dir' not set.
  class DATABASE_DIR_NOT_SET < StandardError
    def to_s
      'Database dir not set.'
    end
  end

  # Raised if not even one BLAST+ database was found in database_dir.
  class NO_BLAST_DATABASE_FOUND < StandardError
    def initialize(database_dir)
      @database_dir = database_dir
    end

    attr_reader :database_dir

    def to_s
      "Could not find BLAST+ databases in: #{database_dir}."
    end
  end

  # Raised if there was an error determining BLAST+ databases in database_dir.
  class BLAST_DATABASE_ERROR < StandardError
    def initialize(cmd, out)
      @cmd = cmd
      @out = out
    end

    attr_reader :cmd, :out

    def to_s
      <<~MSG
        Error obtaining BLAST databases.
        Tried: #{cmd}
        Error:
          #{out.strip}

        Please could you report this to 'https://groups.google.com/forum/#!forum/sequenceserver'?
      MSG
    end
  end

  # Raised if the 'sys' method could not successfully execute a shell command.
  class CommandFailed < StandardError
    def initialize(exitstatus, stdout: nil, stderr: nil)
      @exitstatus = exitstatus
      @stdout = stdout
      @stderr = stderr
    end

    attr_reader :stdout, :stderr, :exitstatus
  end
end
