module SequenceServer

  Sequence = Struct.new(:accession, :title, :value) do
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

      s = ">#{accession} #{title}\n"
      (1..lines).each do |i|
        s << to_s[chars * (i - 1), chars].scan(/\w{1,10}/).join(' ')
        s << "\n"
      end
      s
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

  class << Sequence
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
  end
end

# References
# ----------
# [1]: http://blast.ncbi.nlm.nih.gov/blastcgihelp.shtml
