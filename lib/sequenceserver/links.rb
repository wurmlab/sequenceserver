module SequenceServer
  # Module to contain methods for generating sequence retrieval links.
  module Links
    require 'erb'

    # Provide a method to URL encode _query parameters_. See [1].
    include ERB::Util
    #
    alias encode url_encode

    NCBI_ID_PATTERN = /gi\|(\d+)\|/

    # Your custom method should have following pattern:
    #
    # Input:
    # ------
    # @param sequence_id: Array of sequence ids
    #
    # Return:
    # -------
    # The return value should consist of a Hash in format
    #
    # {
    #  :title => "title", # title used in dropdown
    #  :url => url, # generated url
    #  :order => int, signifying the order in which it appears in dropdown list,
    #  :classes => [classes] # classes to apply to the button
    # }
    #
    # If no url could be generated, return nil.
    #
    # Accessory Methods:
    # ------------------
    # You can use a couple of accessory methods from SequenceServer to generate
    # highly specific links. Say you want to find which database the hit came from
    # and then accordingly create a database specific URI. You could then do:
    #
    # hit_database = send :which_blastdb, sequence_ids.join(',')
    #
    # `which_blastdb` takes atleast one comma separated sequence ids.
    #
    # Examples:
    # ---------
    # See methods provided by default for an example implementation.

    def sequence_viewer(sequence_ids)
      sequence_ids = Array sequence_ids
      sequence_ids = encode sequence_ids.join(' ')
      database_ids = encode querydb.map(&:id).join(' ')
      url = "get_sequence/?sequence_ids=#{sequence_ids}" \
            "&database_ids=#{database_ids}"

      {
        :title => 'View Sequence',
        :url => url,
        :order => 0,
        :classes => ['view-sequence'],
        :icon => ['fa-eye']
      }
    end

    def fasta_download(sequence_ids)
      sequence_ids = Array sequence_ids
      sequence_ids = encode sequence_ids.join(' ')
      database_ids = encode querydb.map(&:id).join(' ')
      url = "get_sequence/?sequence_ids=#{sequence_ids}" \
            "&database_ids=#{database_ids}&download=fasta"

      {
        :title => 'Download FASTA',
        :url => url,
        :order => 1,
        :classes => [],
        :icon => ['fa-download']
      }
    end

    def ncbi(sequence_id)
      return nil unless sequence_id.match(NCBI_ID_PATTERN)

      ncbi_id = encode Regexp.last_match[1]
      # Generate urls according to the type of database
      case querydb.first.type
      when 'nucleotide'
        url = "http://www.ncbi.nlm.nih.gov/nucleotide/#{ncbi_id}"
      when 'protein'
        url = "http://www.ncbi.nlm.nih.gov/protein/#{ncbi_id}"
      end
      {
        :title => 'View on NCBI',
        :url => url,
        :order => 2,
        :classes => [],
        :icon => ['fa-external-link']
      }
    end
  end
end

# [1]: https://stackoverflow.com/questions/2824126/whats-the-difference-between-uri-escape-and-cgi-escape
