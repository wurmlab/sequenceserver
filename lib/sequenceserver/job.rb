require 'yaml'
require 'English'
require 'fileutils'
require 'digest/md5'
require 'forwardable'
require 'securerandom'

module SequenceServer
  # Job super class.
  #
  # Provides access to global `config` and `logger` object as instance methods.
  # Sub-classes must at least define `run` instance method.
  class Job
    DOTDIR = File.expand_path('~/.sequenceserver')
    UUID_PATTERN = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/

    class << self
      # Creates and queues a job. Returns created job object.
      #
      # TODO: Implement dynamic dispatch.
      def create(params)
        queue BLAST::Job.new(params)
      end

      # Fetches job object for the given id.
      #
      # TODO: What if the given job id does not exist?
      def fetch(id)
        YAML.load_file(File.join(DOTDIR, id, 'job.yaml'))
      end

      def all
        jobdirs = Dir["#{DOTDIR}/*"].select{ |f| f =~ UUID_PATTERN }
        jobdirs.map{ |fname| fetch File.basename(fname) }
      end

      def delete(id)
        FileUtils.rm_r File.join(DOTDIR, id)
      end

      private

      # Queues given job on the thread pool. Returns job.
      def queue(job)
        SequenceServer.pool.queue { job.run }
        job
      end
    end

    include FileUtils

    # Provide access to global `config` & `logger` services to the job objects.
    extend Forwardable
    def_delegators SequenceServer, :config, :logger

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

    attr_reader :id, :completed_at

    # How to execute the job.
    #
    # Subclasses should provide their own implementation.  The method should
    # call `done!` and `success!`, as appropriate, to indicate if the job is
    # done and whether it was successful.
    def run
      raise "To be implemented."
    end

    # Is the job done?
    def done?
      !!@done
    end

    # Was the job success?
    def success?
      !!@success
    end

    private

    # Save job state.
    def save
      File.write(File.join(dir, 'job.yaml'), to_yaml)
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

    # Marks the job as done.
    def done!
      @completed_at = Time.now
      @done = true
      save
    end

    # Marks the job as success.
    def success!
      @success = true
      save
    end

    # Where to save all kind of data for this job.
    def dir
      File.join(DOTDIR, id)
    end
  end
end
