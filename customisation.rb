module SequenceServer
  module Customisation
    ## When not commented out, this method is used to take a
    ## sequence ID, and return a hyperlink that
    ## replaces the hit in the BLAST output. 
    ##
    ## Return the hyperlink to link to, or nil
    ## to not not include a hyperlink.
    ## 
    ## When this method
    ## is commented out, the default link is used. The default
    ## is a link to the full sequence of
    ## the hit is displayed (if makeblastdb has been run with
    ## -parse_seqids), or no link at all otherwise.
    # def construct_custom_sequence_hyperlink(sequence_id)
    #   ## Example:
    #   ## sequence_id comes in like "psu|MAL13P1.200 | organism=Plasmodium_falciparum_3D7 | product=mitochondrial"
    #   ## output: "http://apiloc.bio21.unimelb.edu.au/apiloc/gene/MAL13P1.200"
    #   matches = sequence_id.match(/^>\s*psu\|(\S+) /)
    #   if matches #if the sequence_id conforms to our expectations
    #     # All is good. Return the hyperlink.
    #     return "http://apiloc.bio21.unimelb.edu.au/apiloc/gene/#{matches[1]}"
    #   else
    #     # Parsing the sequence_id didn't work. Don't include a hyperlink for this
    #     # sequence_id, but log that there has been a problem.
    #     system.log.warn "Unable to parse sequence id `#{sequence_id}'"
    #     # Return nil so no hyperlink is generated.
    #     return nil
    #   end
    # end
  end
end