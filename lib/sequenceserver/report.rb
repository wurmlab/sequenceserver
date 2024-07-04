require 'forwardable'

module SequenceServer
  # Create report for the given job.
  #
  # Report is a generic superclass. Programs, like BLAST, must implement their
  # own report subclass.
  class Report
    class << self
      # Generates report for the given job. Returns generated report object.
      def generate(job, env_config = nil)
        report = BLAST::Report.new(job)
        report.env_config = env_config if env_config
        report
      end
    end

    # Provide access to global `config` & `logger` services to the report
    # objects.
    extend Forwardable
    def_delegators SequenceServer, :config, :logger

    attr_reader :job
    attr_accessor :env_config

    def initialize(job)
      @job = job
      yield if block_given?
      generate
    end

    private

    def generate
      # This method should be implemented in subclasses
      raise NotImplementedError, "#{self.class} should implement #generate"
    end
  end
end