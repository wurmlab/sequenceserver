module SequenceServer
  # Module to collect some sequence-related helper functions
  module SequenceHelpers

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

    # Strips all non-letter characters. guestimates sequence based on that.
    # If less than 10 useable characters... returns nil
    # If more than 90% ACGTU returns :nucleotide. else returns :protein
    def guess_sequence_type(sequence_string)
      cleaned_sequence = sequence_string.gsub(/[^A-Z]/i, '')  # removing non-letter characters
      cleaned_sequence.gsub!(/[NX]/i, '')                     # removing ambiguous  characters

      return nil if cleaned_sequence.length < 10 # conservative

      composition = composition(cleaned_sequence)       
      composition_NAs    = composition.select { |character, count|character.match(/[ACGTU]/i) } # only putative NAs
      putative_NA_counts = composition_NAs.collect { |key_value_array| key_value_array[1] }     # only count, not char
      putative_NA_sum    = putative_NA_counts.inject { |sum, n| sum + n }                       # count of all putative NA
      putative_NA_sum    = 0 if putative_NA_sum.nil?

      if putative_NA_sum > (0.9 * cleaned_sequence.length)
        return :nucleotide
      else
        return :protein
      end
    end

    # splits input at putative fasta definition lines (like ">adsfadsf"), guesses sequence type for each sequence. 
    # if not enough sequence to determine, returns nil.
    # if 2 kinds of sequence mixed together, raises ArgumentError
    # otherwise, returns :nucleotide or :protein
    def type_of_sequences(fasta_format_string)
      # the first sequence does not need to have a fasta definition line
      sequences = fasta_format_string.split(/^>.*$/).delete_if { |seq| seq.empty? }

      # get all sequence types
      sequence_types = sequences.collect { |seq|  guess_sequence_type(seq) }.uniq.compact

      return nil if sequence_types.empty?

      if sequence_types.length == 1
        return sequence_types.first # there is only one (but yes its an array)
      else 
        raise ArgumentError, "Insufficient info to determine sequence type. Cleaned queries are: #{ sequences.to_s }"
      end
    end

    # Return the database type that can be used for a given blast method.
    #   db_type_for("blastp")  => :protein
    #   db_type_for("tblastn") => :nucleotide
    #   db_type_for(nil)       => nil
    def db_type_for(blast_method)
      case blast_method
      when 'blastp', 'blastx'
        :protein
      when 'blastn', 'tblastx', 'tblastn'
        :nucleotide
      end
    end

    # Return the blast methods that can be used for a given type of sequence.
    #   blast_methods_for(:protein)     => ['blastp', 'tblastn']
    #   blast_methods_for(:nucleotide)  => ['blastn','tblastx','blastx']
    #   blast_methods_for(nil)          => ['blastp', 'tblastn','blastn','tblastx','blastx']
    def blast_methods_for(seq_type)
      case seq_type
      when :protein
        ['blastp', 'tblastn']
      when :nucleotide
        ['blastn','tblastx','blastx']
      else # Sequence type not predicted, so don't make any assumptions about the blast method
        ['blastp', 'tblastn','blastn','tblastx','blastx']
      end
    end

    def sequence_from_blastdb(ids, db)  # helpful when displaying parsed blast results
      # we know how to handle an Array of ids
      ids = ids.join(',') if ids.is_a? Array

      # we don't know what to do if the arguments ain't String
      raise TypeError unless ids.is_a? String and db.is_a? String

      # query now!
      #
      # If `blastdbcmd` throws error, we assume sequence not found.
      blastdbcmd = settings.binaries['blastdbcmd']
      command = %x|#{blastdbcmd} -db #{db} -entry #{ids} 2> /dev/null|
    end

    # Given a sequence_id and databases, apply the default (standard)
    # way to convert a sequence_id into a hyperlink, so that the
    # blast results include hyperlinks.
    def construct_standard_sequence_hyperlink(options)
      if options[:sequence_id].match(/^[^ ]/) #if there is a space right after the '>', makeblastdb was run without -parse_seqids
        # By default, add a link to a fasta file of the sequence (if makeblastdb was called with -parse_seqids)
        complete_id = options[:sequence_id][/^(\S+)\s*.*/, 1]  # get id part
        id = complete_id.include?('|') ? complete_id.split('|')[1] : complete_id.split('|')[0]
        @all_retrievable_ids ||= []
        @all_retrievable_ids.push(id)

        link = "/get_sequence/?id=#{id}&db=#{options[:databases].join(' ')}" # several dbs... separate by ' '
        return link
      else
        # do nothing - link == nil means no link will be incorporated
        return nil
      end
    end
  end
end
