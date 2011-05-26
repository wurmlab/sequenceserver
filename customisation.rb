module SequenceServer
  module Customisation
    ## When not commented out, this method is used to take a
    ## sequence ID, and return a hyperlink that
    ## replaces the hit in the BLAST output. 
    ## 
    ## When this method
    ## is commented out, the default link is used. The default
    ## is a link to the full sequence of
    ## the hit is displayed (if makeblastdb has been run with
    ## -parse_seqids), or no link at all otherwise.
    # def construct_custom_sequence_hyperlink(sequence_id)
    # 	## Example:
    # 	## sequence_id comes in like "psu|MAL13P1.200 | organism=Plasmodium_falciparum_3D7 | product=mitochondrial"
    # 	## output: "http://apiloc.bio21.unimelb.edu.au/apiloc/gene/MAL13P1.200"
    # 	matches = sequence_id.match(/^>\s*psu\|(\S+) /)
    # 	raise ArgumentError, "Unable to parse sequence id `#{sequence_id}'" unless matches
    #   return "http://apiloc.bio21.unimelb.edu.au/apiloc/gene/#{matches[1]}"
    # end
  end
end