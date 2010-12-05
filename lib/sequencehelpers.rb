require 'logger'

# Module to collect some sequence-related helper functions
module SequenceHelpers
  # for debugging
  LOG = Logger.new(STDOUT) unless defined?(LOG) 

  # copied from bioruby's Bio::Sequence
  # returns a Hash. Eg: composition("asdfasdfffffasdf")
  #                      => {"a"=>3, "d"=>3, "f"=>7, "s"=>3} 
  def composition(sequence_string)
    count = Hash.new(0) # otherwise it fails
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

    if cleaned_sequence.length < 10  then # conservative 
      LOG.debug('Could not determine type for sequence: '+ cleaned_sequence)
      return nil 
    end
     
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
    sequence_types = sequences.collect { |seq|  guess_sequence_type(seq) }.uniq 
    sequence_types.delete_if { |type| type.nil? }  # we can get nil if seq too short
    
    if sequence_types.empty?
      LOG.debug("Insufficient info to determine sequence type. Cleaned queries are: #{ sequences.to_s }")
      return nil
    end

    if sequence_types.length == 1
      return sequence_types.first # there is only one (but yes its an array)
    else 
      raise ArgumentError, "Insufficient info to determine sequence type. Cleaned queries are: #{ sequences.to_s }"
    end
  end

  def database_type_for_blast_method(blast_method)
    case blast_method
    when 'blastp'  then return :protein
    when 'blastx'  then return :protein
    when 'blastn'  then return :nucleotide
    when 'tblastx' then return :nucleotide
    when 'tblastn' then return :nucleotide
    else raise ArgumentError, "Don't know how to '#{blast_method}'"
    end
  end
end
