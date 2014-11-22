module SequenceServer
  # Module to contain methods for generating sequence retrieval links.
  module Links
    require 'yaml'
    require 'erb'

    # See [1]
    include ERB::Util

    NCBI_ID_PATTERN = /gi\|(\d+)\|/
    UNIPROT_ID_PATTERN = /SI2.2.0.(\d*)/
    SINV = YAML.load_file('./ext/uniprot/sinv.yml')

    # Your custom method should have following pattern:
    #
    # Input:
    # @param sequence_id: Array of sequence ids
    # @param querydb: An array of queried database ids in format (name, title,
    # type)
    #
    # Return:
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
    # Examples:
    # See methods provided by default for an example implementation.

    def sequence_viewer(sequence_ids)
      sequence_ids = Array sequence_ids
      sequence_ids = url_encode(sequence_ids.join(' '))
      database_ids = querydb.map(&:id).join(' ')
      url = "get_sequence/?sequence_ids=#{sequence_ids}" \
            "&database_ids=#{database_ids}"

      {
        :title => 'View Sequence',
        :url => url,
        :order => 0,
        :classes => ['view-sequence']
      }
    end

    def fasta_download(sequence_ids)
      sequence_ids = Array sequence_ids
      sequence_ids = url_encode(sequence_ids.join(' '))
      database_ids = querydb.map(&:id).join(' ')
      url = "get_sequence/?sequence_ids=#{sequence_ids}" \
            "&database_ids=#{database_ids}&download=fasta"

      {
        :title => 'Download FASTA',
        :url => url,
        :order => 1,
        :classes => []
      }
    end

    def uniprot(sequence_id)
      return nil unless sequence_id.match(UNIPROT_ID_PATTERN)

      # construct uniprot link
      ukey = sequence_id.match(/SI2.2.0_(\d*)/)[1]
      uid  = url_encode(SINV["SINV_#{ukey}"])
      return uid if uid.nil?

      uniprot = "http://www.uniprot.org/uniprot/#{uid}"
      {
        :title => 'View on UniProt',
        :url => uniprot,
        :order => 2,
        :classes => []
      }
    end

    def ncbi(sequence_id)
      return nil unless sequence_id.match(NCBI_ID_PATTERN)

      ncbi_id = url_encode(Regexp.last_match[1])
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
        :order => 3,
        :classes => []
      }
    end
  end
end

# [1]: https://stackoverflow.com/questions/2824126/whats-the-difference-between-uri-escape-and-cgi-escape
