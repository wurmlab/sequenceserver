require 'forwardable'

module SequenceServer
  # Create report for the given job.
  #
  # Report is a generic superclass. Programs, like BLAST, must implement their
  # own report subclass.
  class Report
    class << self
      # Generates report for the given job. Returns generated report object.
      #
      # TODO: Dynamic dispatch.
      def generate(job)
        BLAST::Report.new(job)
      end
    end

    # Provide access to global `config` & `logger` services to the report
    # objects.
    extend Forwardable
    def_delegators SequenceServer, :config, :logger

    def initialize(job)
      @job = job
      yield if block_given?
      generate
    end

    attr_reader :job
  end
end
