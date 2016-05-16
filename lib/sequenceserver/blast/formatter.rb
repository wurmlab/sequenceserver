require 'forwardable'

module SequenceServer
  module BLAST
    # Formats BLAST+ archive file format into other file formats.
    class Formatter
      class << self
        alias_method :run, :new
      end

      extend Forwardable
      def_delegators SequenceServer, :logger

      def initialize(archive_file, type)
        @archive_file = archive_file
        @format, @mime, @specifiers = OUTFMT[type]
        @type = type

        validate && run
      end

      attr_reader :archive_file, :type

      attr_reader :format, :mime, :specifiers

      def file
        @file = File.join(File.dirname(archive_file), filename)
      end

      def filename
        @filename ||=
          "sequenceserver-#{type}_report.#{mime}"
      end

      private

      def run
        return if File.exist?(file)
        command =
          "blast_formatter -archive '#{archive_file}'" \
          " -outfmt '#{format} #{specifiers}'" \
          " -out '#{file}' 2> /dev/null"
        logger.debug("Executing: #{command}")
        Dir.chdir(File.exist?(DOTDIR) && DOTDIR || Dir.pwd) do
          system(command)
        end
      end

      def validate
        return true if archive_file && format &&
                       File.exist?(archive_file)
        fail ArgumentError, <<MSG
Incorrect request parameters. Please ensure that requested file name is
correct and the file type is either xml or tsv.
MSG
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
