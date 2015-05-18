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

      def initialize(search_id, type)
        @archive_file = get_archive_file search_id
        @format, @mime, @specifiers = OUTFMT[type]
        @type = type

        validate && run
      end

      attr_reader :archive_file, :type

      attr_reader :format, :mime, :specifiers

      def file
        @file ||= Tempfile.new filename
      end

      def filename
        @filename ||=
          "sequenceserver-#{type}_report.#{mime}"
      end

      private

      def run
        command =
          "blast_formatter -archive '#{archive_file}'" \
          " -outfmt '#{format} #{specifiers}'" \
          " -out '#{file.path}' 2> /dev/null"
        logger.debug("Executing: #{command}")
        system(command, :chdir => (File.exist?(DOTDIR) && DOTDIR || Dir.pwd))
      end

      def validate
        return true if archive_file && format &&
                       File.exist?(archive_file)
        fail ArgumentError, <<MSG
Incorrect request parameters. Please ensure that requested file name is
correct and the file type is either xml or tsv.
MSG
      end

      # Returns filename if path exists otherwise returns a path to tmp dir.
      def get_archive_file(file)
        return unless file
        return file.path if file.respond_to? :path
        return file if File.exist? file
        File.join Dir.tmpdir, file
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
