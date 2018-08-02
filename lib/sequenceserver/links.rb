require 'erb'

module SequenceServer
  # Module to contain methods for generating sequence retrieval links.
  module Links
    # Provide a method to URL encode _query parameters_. See [1].
    include ERB::Util
    alias encode url_encode

    NCBI_ID_PATTERN    = /gi\|(\d+)\|/
    UNIPROT_ID_PATTERN = /sp\|(\w+)\|/

    # Link generators return a Hash like below.
    #
    # {
    #   # Required. Display title.
    #   :title => "title",
    #
    #   # Required. Generated url.
    #   :url => url,
    #
    #   # Optional. Left-right order in which the link should appear.
    #   :order => num,
    #
    #   # Optional. Classes, if any, to apply to the link.
    #   :class => "class1 class2",
    #
    #   # Optional. Class name of a FontAwesome icon to use.
    #   :icon => "fa-icon-class"
    # }
    #
    # If no url could be generated, return nil.
    #
    # Helper methods
    # --------------
    #
    # Following helper methods are available to help with link generation.
    #
    #   encode:
    #     URL encode query params.
    #
    #     Don't use this function to encode the entire URL. Only params.
    #
    #     e.g:
    #         sequence_id = encode sequence_id
    #         url = "http://www.ncbi.nlm.nih.gov/nucleotide/#{sequence_id}"
    #
    #   querydb:
    #     Returns an array of databases that were used for BLASTing.
    #
    #   whichdb:
    #     Returns the database from which the given hit came from.
    #
    #     e.g:
    #
    #         hit_database = whichdb
    #
    # Examples:
    # ---------
    # See methods provided by default for an example implementation.

    def ncbi
      return nil unless id.match(NCBI_ID_PATTERN)
      ncbi_id = Regexp.last_match[1]
      ncbi_id = encode ncbi_id
      url = "http://www.ncbi.nlm.nih.gov/#{querydb.first.type}/#{ncbi_id}"
      {
        order: 2,
        title: 'NCBI',
        url:   url,
        icon:  'fa-external-link'
      }
    end

    def uniprot
      return nil unless id.match(UNIPROT_ID_PATTERN)
      uniprot_id = Regexp.last_match[1]
      uniprot_id = encode uniprot_id
      url = "http://www.uniprot.org/uniprot/#{uniprot_id}"
      {
        order: 2,
        title: 'Uniprot',
        url:   url,
        icon:  'fa-external-link'
      }
    end
  end
end

# [1]: https://stackoverflow.com/questions/2824126/whats-the-difference-between-uri-escape-and-cgi-escape
