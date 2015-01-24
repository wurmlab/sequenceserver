module SequenceServer

  module Links

    SI_UNIPROT_IDPAT = /SI2.2.0.(\d*)/
    SI_UNIPROT_IDMAP = YAML.load_file(File.expand_path('si_uniprot_idmap.yml', File.dirname(__FILE__)))

    def uniprot(sequence_id)
      return nil unless sequence_id.match(SI_UNIPROT_IDPAT)

      # construct uniprot link
      ukey = sequence_id.match(/SI2.2.0_(\d*)/)[1]
      uid  = SI_UNIPROT_IDMAP["SINV_#{ukey}"]
      return unless uid

      uid = encode uid
      uniprot = "http://www.uniprot.org/uniprot/#{uid}"
      {
        :title => 'View on UniProt',
        :url => uniprot,
        :order => 2,
        :classes => [],
        :icon => ['fa-external-link']
      }
    end
  end
end
