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
end

# References
# ----------
# [1]: http://blast.ncbi.nlm.nih.gov/blastcgihelp.shtml
