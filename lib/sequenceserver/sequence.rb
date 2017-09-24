require 'forwardable'

# Define Sequence class.
module SequenceServer
  # Provides simple sequence processing utilities via class methods. Instance
  # of the class serves as a simple data object to captures sequences fetched
  # from BLAST databases.
  #
  # NOTE:
  #   What all do we need to consistently construct FASTA from `blastdbcmd's`
  #   output?
  #
  #   It would seem rather straightforward. But it's not.
  #
  #   FASTA format:
  #
  #     >defline
  #     actual sequence
  #
  #   where,
  #
  #     defline = >id title
  #
  #   ID of a sequence fetched from nr database should look like this:
  #
  #                  sequence id    -> self.seqid
  #                  -------------
  #                     accession   -> self.accession
  #                     ----------
  #     gi|322796550|gb|EFZ19024.1| -> self.id
  #        ---------
  #        gi number                -> self.gi
  #
  #   while for local databases, the id should be the exact same, as in the
  #   original FASTA file:
  #
  #     SI2.2.0_06267 -> self.id == self.seqid == self.accession.
  Sequence = Struct.new(:gi, :seqid, :accession, :title, :value) do
    def initialize(*args)
      args[0] = nil if args[0] == 'N/A'
      super
    end

    # Returns FASTA sequence id.
    def id
      (gi ? ['gi', gi, seqid] : [seqid]).join('|')
    end

    # Returns length of the sequence.
    def length
      value.length
    end

    # Returns sequence value.
    def to_s
      value
    end

    def info
      { :value => value, :id => id, :title => title }
    end

    # Returns FASTA formatted sequence.
    def fasta
      chars = 60
      lines = (length / chars.to_f).ceil
      defline  = ">#{id} #{title}"
      seqlines = (1..lines).map { |i| to_s[chars * (i - 1), chars] }
      [defline].concat(seqlines).join("\n")
    end
  end

  # Utility methods.
  class Sequence
    class << self
      # Strips all non-letter characters. If less than 10 useable characters
      # return `nil`. If at least 90% is ACGTU, returns `:nucleotide`, else
      # `:protein`.
      def guess_type(sequence)
        # Clean the sequence: first remove non-letter characters, then
        # ambiguous characters.
        cleaned_sequence = sequence.gsub(/[^A-Z]/i, '').gsub(/[NX]/i, '')

        return if cleaned_sequence.length < 10 # conservative

        # Count putative NA in the sequence.
        na_count = 0
        composition = composition(cleaned_sequence)
        composition.each do |character, count|
          na_count += count if character.match(/[ACGTU]/i)
        end

        na_count > (0.9 * cleaned_sequence.length) ? :nucleotide : :protein
      end

      # Copied from BioRuby's `Bio::Sequence` class.
      #
      # > composition("asdfasdfffffasdf")
      # => {"a"=>3, "d"=>3, "f"=>7, "s"=>3}
      def composition(sequence_string)
        count = Hash.new(0)
        sequence_string.scan(/./) do |x|
          count[x] += 1
        end
        count
      end
    end

    # Retrieve sequences from BLAST databases.
    class Retriever
      extend Forwardable

      def_delegators SequenceServer, :logger, :sys

      # Provides IO for Retriever similar to BLAST::Formatter. We dynamically
      # extend Retriever object with this module if file download has been
      # requested (here it must be remembered that Retriever is used by
      # sequence viewer and FASTA download links).
      module IO
        # Returns handle to a temporary file to which data should be written to
        # or read from.
        def file
          @file ||= Tempfile.new filename
        end

        # Returns a file name to use for the temporary file.
        def filename
          return @filename if @filename
          name = sequence_ids.first            if sequence_ids.length == 1
          name = "#{sequence_ids.length}_hits" if sequence_ids.length >= 2
          @filename = "sequenceserver-#{name}.fa"
        end

        # Returns mime type to use if this file were to be transferred over
        # Internet.
        def mime
          :fasta
        end

        private

        def write
          file.open
          write_error_msgs
          write_sequences
          file.close
        end

        # Write error messages to file. Expects file to be open.
        def write_error_msgs
          error_msgs.each do |heading, message|
            file.puts "# #{heading}"
            message.each_line do |line|
              file.puts "# #{line}"
            end
          end
        end

        # Write sequence data to file. Expects file to be open.
        def write_sequences
          sequences.each do |sequence|
            file.puts sequence.fasta
          end
        end
      end

      def initialize(sequence_ids, database_ids, in_file = false, range = false)
        @sequence_ids = Array sequence_ids
        @database_ids = Array database_ids
        @in_file = in_file
        @range = range

        validate && run
      end

      attr_reader :sequence_ids, :database_ids, :in_file, :range

      attr_reader :sequences

      def to_json
        {
          :error_msgs => error_msgs,
          :sequences  => sequences.map(&:info)
        }.to_json
      end

      def to_hash
        {
          :error_msgs => error_msgs,
          :sequences  => sequences.map(&:info)
        }
      end

      private

      def run
        command = "blastdbcmd -outfmt '%g	%i	%a	%t	%s'" \
                  " -db '#{database_names.join(' ')}'" \
                  " -entry '#{sequence_ids.join(',')}'"

        command += " -range '#{range}'" if range

        out, _ = sys(command)

        @sequences = out.each_line.map do |line|
          Sequence.new(*line.chomp.split('	'))
        end
        extend(IO) && write if in_file
      end

      def database_names
        Database[database_ids].map(&:name)
      end

      def database_titles
        Database[database_ids].map(&:title)
      end

      def validate
        ids = Database.ids
        return true if database_ids.is_a?(Array) && !database_ids.empty? &&
                       (ids & database_ids).length == database_ids.length
        fail ArgumentError, 'Database id should be one of:' \
                            " #{ids.join("\n")}."
      end

      # rubocop:disable Metrics/MethodLength
      def error_msgs
        return [] if sequences.length == sequence_ids.length
        [
          ['ERROR: incorrect number of sequences found.',
           <<MSG
You requested #{sequence_ids.length} sequence(s) with the following identifiers:
  #{sequence_ids.join(', ')}
from the following databases:
  #{database_titles.join(', ')}
but we found #{sequences.length} sequence(s).

This is likley due to a problem with how databases are formatted.
Please share this text with the person managing this website (or
https://groups.google.com/forum/?fromgroups#!forum/sequenceserver
if you are the admin) so that the issue can be resolved.

If any sequences were retrieved, you can find them below
(but some may be incorrect, so be careful!)
MSG
          ]
        ]
      end
      # rubocop:enable Metrics/MethodLength

    end
  end
end

# References
# ----------
# [1]: http://blast.ncbi.nlm.nih.gov/blastcgihelp.shtml
