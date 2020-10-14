module SequenceServer
  # Sample hit link customization file.
  module Links
    SI_UNIPROT_IDPAT = /SI2.2.0.(\d*)/
    SI_UNIPROT_IDMAP = YAML.load_file(File.expand_path('si_uniprot_idmap.yml',
                                                       File.dirname(__FILE__)))

    def uniprot
      return unless accession.match(SI_UNIPROT_IDPAT)
      uniprot_id = SI_UNIPROT_IDMAP["SINV_#{Regexp.last_match[1]}"]
      return unless uniprot_id

      uniprot_id = encode uniprot_id
      url = "http://www.uniprot.org/uniprot/#{uniprot_id}"
      {
        :order => 2,
        :title => 'UniProt',
        :url   => url,
        :icon  => 'fa-external-link'
      }
    end
  end
end
