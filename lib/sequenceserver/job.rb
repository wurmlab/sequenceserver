require 'yaml'
require 'English'
require 'fileutils'
require 'digest/md5'
require 'forwardable'
require 'securerandom'

module SequenceServer
  # Abstract job super class.
  #
  # Provides a simple framework to store job data, execute shell commands
  # asynchronously and capture stdout, stderr and exit status. Subclasses
  # must provide a concrete implementation for `command` and may override
  # any other methods as required.
  #
  # Global `config` and `logger` object are available as instance methods.
  #
  # Singleton methods provide the facility to create and queue a job,
  # fetch a job or all jobs, and delete a job.
  class Job
    class << self
      # Creates and queues a job. Returns created job object.
      def create(params)
        job = BLAST::Job.new(params)# TODO: Dynamic dispatch.
        SequenceServer.pool.queue { job.run }
        job
      end

      # Fetches job with the given id.
      def fetch(id)
        job_file = File.join(DOTDIR, id, 'job.yaml')
        fail NotFound unless File.exist?(job_file)
        YAML.load_file(job_file)
      end

      # Deletes job with the given id.
      def delete(id)
        FileUtils.rm_r File.join(DOTDIR, id)
      end

      # Returns an Array of all jobs.
      def all
        Dir["#{DOTDIR}/**/job.yaml"].
          map { |f| fetch File.basename File.dirname f }
      end
    end

    include FileUtils

    # Provide access to global `config` & `logger` services to the job objects.
    extend Forwardable
    def_delegators SequenceServer, :config, :logger, :sys

    # Initialize the job: generates a job id, creates directory where all kind
    # of job data will be held, yields (if block given) and saves the job.
    #
    # Subclasses should extend `initialize` as per requirement.
    def initialize(*args)
      @id = SecureRandom.uuid
      mkdir_p dir
      yield if block_given?
      save
    rescue => e
      rm_rf dir
      raise e
    end

    attr_reader :id, :completed_at, :exitstatus

    # Shell out and execute the job.
    #
    # NOTE: This method is called asynchronously by thread pool.
    def run
      sys(command, :stdout => stdout, :stderr => stderr)
      done!
    rescue CommandFailed => e
      done! e.exitstatus
    end

    # Returns shell command that will be executed. Subclass needs to provide a
    # concrete implementation.
    def command
      raise "Not implemented."
    end

    # Where will the stdout be written to during execution and read from later.
    def stdout
      File.join(dir, 'stdout')
    end

    # Where will the stderr be written to during execution and read from later.
    def stderr
      File.join(dir, 'stderr')
    end

    # Was the job successful?
    def success?
      exitstatus == 0
    end

    # Is the job done?
    def done?
      !!@exitstatus
    end

    private

    # Saves job object to a YAML file in job directory.
    def save
      File.write(yfile, to_yaml)
    end

    # Save arbitrary blob of data for this job to a file. Returns absolute path
    # to the file. Doesn't mean the saved file will be linked to the job object
    # Downstream code must do that itself.
    #
    # NOTE:
    #   Job dir should have been created before `store` is called.  In a
    #   subclass this can be ensured by appropriately calling `super` in
    #   `initialize` method.
    def store(key, value)
      filename = File.join(dir, key)
      File.write(filename, value)
      filename
    end

    # Retrieve file from job dir with the given name. Raises RuntimeError if
    # the file can't be found.
    #
    # NOTE: Not used.
    def fetch(key)
      filename = File.join(dir, key)
      raise if !File.exist? filename
      filename
    end

    # Marks the job as done and save its exitstatus.
    def done!(status = 0)
      @completed_at = Time.now
      @exitstatus = status
      save
    end

    # Where to save all kind of data for this job.
    def dir
      File.join(DOTDIR, id)
    end

    # Where to write serialised job object.
    def yfile
      File.join(dir, 'job.yaml')
    end
  end
end
