require 'forwardable'

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
  class Sequence < Struct.new(:gi, :seqid, :accession, :title, :value)

    class << self

      extend Forwardable

      # Derive `logger` from SequenceServer module.
      def_delegators SequenceServer, :logger

      # Disable using `Sequence.new`. Should use `Sequence.from_blastdb`
      # instead.
      private :new

      # Returns an Array of `Sequence` objects each capturing a sequence
      # fetched from BLAST database.
      def from_blastdb(accessions, database_ids)
        accessions = Array accessions
        database_ids = Array database_ids

        accessions = accessions.join(',')
        database_names = Database[database_ids].map(&:name).join(' ')

        # Output of the command will be five columns TSV.
        command = "blastdbcmd -outfmt '%g	%i	%a	%t	%s'" \
          " -db '#{database_names}' -entry '#{accessions}'"

        logger.debug("Executing: #{command}")

        # Not interested in stderr.
        `#{command} 2> /dev/null`.
          each_line.map {|line| new(*line.chomp.split('	'))}
      end

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
          na_count = na_count + count if character.match(/[ACGTU]/i)
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

    # Returns FASTA formatted sequence.
    def fasta
      chars = 60
      lines = (length / chars.to_f).ceil
      defline  = ">#{id} #{title}"
      seqlines = (1..lines).map {|i| to_s[chars * (i - 1), chars]}
      [defline].concat(seqlines).join("\n")
    end

    # Returns genbank-style formatted sequence.
    def genbank
      chars = 60
      lines = (length / chars.to_f).ceil
      width = length.to_s.length

      s = ''
      (1..lines).each do |i|
        s << "%#{width}d" % (chars * (i - 1) + 1)
        s << ' '
        s << to_s[chars * (i - 1), chars].scan(/\w{1,10}/).join(' ')
        s << "\n"
      end
      s
    end
  end
end

# References
# ----------
# [1]: http://blast.ncbi.nlm.nih.gov/blastcgihelp.shtml
