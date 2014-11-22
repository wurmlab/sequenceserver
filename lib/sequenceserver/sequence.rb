require 'forwardable'

module SequenceServer

  class Sequence < Struct.new(:accession, :title, :value)

    class << self

      extend Forwardable

      def_delegators SequenceServer, :config, :logger

      # copied from bioruby's Bio::Sequence
      # returns a Hash. Eg: composition("asdfasdfffffasdf")
      #                      => {"a"=>3, "d"=>3, "f"=>7, "s"=>3}
      def composition(sequence_string)
        count = Hash.new(0)
        sequence_string.scan(/./) do |x|
          count[x] += 1
        end
        return count
      end

      # Strips all non-letter characters. If less than 10 useable characters
      # return `nil`. If at least 90% is ACGTU, returns `:nucleotide`, else
      # `:protein`.
      def guess_type(sequence_string)
        cleaned_sequence = sequence_string.gsub(/[^A-Z]/i, '')  # removing non-letter characters
        cleaned_sequence.gsub!(/[NX]/i, '')                     # removing ambiguous  characters

        return nil if cleaned_sequence.length < 10 # conservative

        composition = composition(cleaned_sequence)
        composition_NAs    = composition.select {|character, count| character.match(/[ACGTU]/i)} # only putative NAs
        putative_NA_counts = composition_NAs.collect {|key_value_array| key_value_array[1]}      # only count, not char
        putative_NA_sum    = putative_NA_counts.inject {|sum, n| sum + n}                        # count of all putative NA
        putative_NA_sum    = 0 if putative_NA_sum.nil?

        if putative_NA_sum > (0.9 * cleaned_sequence.length)
          return :nucleotide
        else
          return :protein
        end
      end

      # Returns an Array of Sequences capturing the sequences fetched from BLAST
      # database.
      def from_blastdb(sequence_ids, database_ids)
        sequence_ids   = sequence_ids.join(',')
        database_names = Database[database_ids].map(&:name).join(' ')

        # Output of the command will be tab separated three columns.
        command = "blastdbcmd -outfmt '%a	%t	%s'" \
          " -db '#{database_names}' -entry '#{sequence_ids}'"

        logger.debug("Executing: #{command}")

        # Not interested in stderr.
        `#{command} 2> /dev/null`.
          each_line.map {|line| Sequence.new(*line.chomp.split('	'))}
      end
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
      defline  = ">#{accession} #{title}"
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
