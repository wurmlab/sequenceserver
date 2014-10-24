module SequenceServer
  module Links
    require 'yaml'

    NCBI_ID_PATTERN = /gi\|(\d+)\|/
    UNIPROT_ID_PATTERN = /SI2.2.0.(\d*)/
    SINV = YAML.load_file('./ext/uniprot/sinv.yml')

    # Your method should accept the following two arguments as described below
    # @param sequence_ids: Array of sequence ids
    # @param database_ids: Array of database objects (name, title, type)
    # The return value should consist of a Hash in format
    # {:title => "title", :url => url} where the title will be used in dropdown
    # along with the url.
    # If no url could be generated, return nil.

    def uniprot(sequence_id)
      return nil unless sequence_id.match(UNIPROT_ID_PATTERN)

      # construct uniprot link
      ukey = sequence_id.match(/SI2.2.0_(\d*)/)[1]
      uid  = SINV["SINV_#{ukey}"]
      return uid if uid.nil?

      uniprot = "http://www.uniprot.org/uniprot/#{uid}"
      return {:title => 'View on UniProt', :url => uniprot}
    end

    def ncbi(sequence_id)
      return nil unless sequence_id.match(NCBI_ID_PATTERN)

      # Generate urls according to the type of database
      case querydb.first.type
      when 'nucleotide'
        url = "http://www.ncbi.nlm.nih.gov/nucleotide/#{Regexp.last_match[1]}"
      when 'protein'
        url = "http://www.ncbi.nlm.nih.gov/protein/#{Regexp.last_match[1]}"
      end
      return {:title => "View on NCBI", :url => url}
    end

    def fasta_download(sequence_id)
      seq_ids = sequence_id
      db_ids = querydb.map(&:id).join(' ')
      url = "get_sequence/?sequence_ids=#{seq_ids}&database_ids=#{db_ids}" \
            "&download=fasta"
      return {:title => "Download FASTA", :url => url}
    end

  end
end
