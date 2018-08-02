require 'forwardable'

module SequenceServer
  module BLAST
    # Formatter is invoked during report generation or for results download to
    # convert BLAST+ archive file to other formats. Formatter generates output
    # in Job#dir. Output files persist till the job itself is deleted. Calling
    # Formatter a second time (for the same input job and output format) will
    # return saved ouput.
    class Formatter
      class << self
        alias run new
      end

      extend Forwardable
      def_delegators SequenceServer, :config, :sys

      def initialize(job, type)
        @job = job
        @type = type

        @format, @mime, @specifiers = OUTFMT[type]
        run
      end

      attr_reader :format, :mime, :specifiers

      def file
        @file ||= File.join(job.dir, filename)
      end

      def filename
        @filename ||= "sequenceserver-#{type}_report.#{mime}"
      end

      private

      attr_reader :job, :type

      def run
        return if File.exist?(file)
        command = "blast_formatter -archive '#{job.stdout}'" \
          " -outfmt '#{format} #{specifiers}'"
        sys(command, path: config[:bin], dir: DOTDIR, stdout: file)
      rescue CommandFailed => e
        # Mostly we will never get here: empty archive file,
        # file permissions, broken BLAST binaries, etc. will
        # have been caught before reaching here.
        raise SystemError, e.stderr
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
