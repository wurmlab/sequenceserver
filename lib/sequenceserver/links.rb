require 'erb'
require 'json'
require 'pp'

module SequenceServer
  # Module to contain methods for generating sequence retrieval links.
  module Links
    # Provide a method to URL encode _query parameters_. See [1].
    include ERB::Util
    alias encode url_encode
    # Link generators are methods that return a Hash as defined below.
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
    #   dbtype:
    #     Returns the database type (nucleotide or protein) that was used for
    #     BLAST search.
    #
    #   whichdb:
    #     Returns the databases from which the hit could have originated. To
    #     ensure that one and the correct database is returned, ensure that
    #     your sequence ids are unique across different FASTA files.
    #     NOTE: This method is slow.
    #
    #   coordinates:
    #     Returns min alignment start and max alignment end coordinates for
    #     query and hit sequences.
    #
    #     e.g.,
    #     query_coords = coordinates[0]
    #     hit_coords = coordinates[1]

    def jbrowse
        qstart = hsps.map(&:qstart).min
        sstart = hsps.map(&:sstart).min
        qend = hsps.map(&:qend).max
        send = hsps.map(&:send).max
        first_hit_start = hsps.map(&:sstart).at(0)
        first_hit_end = hsps.map(&:send).at(0)
        database_filepath = whichdb.map(&:name).at(0)
        database_filename = File.basename(database_filepath)
        fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
        filepath_parts = database_filepath.split(File::SEPARATOR)
        config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"
        file = File.read('/sequenceserver/public/environments/' + config_filename)
        database_config = JSON.parse(file)
     #   organism = accession.partition('-').first
        sequence_id = accession.partition('-').last
      #  puts "accession" 
      #  puts accession 
        sequence_metadata = {}
        puts fasta_file_basename
        for reference_sequence in database_config["data"]
          if reference_sequence["uri"].include? fasta_file_basename
            sequence_metadata = reference_sequence
            break
          end  
        end
        puts "sequence_metadata"
        puts sequence_metadata
         
        if !sequence_metadata.has_key?("genome_browser")
            puts "no genome_browser key"
            return
        end

        if sequence_metadata["genome_browser"]["type"] == "jbrowse"
            puts "jbrowse"
            my_features = ERB::Util.url_encode(JSON.generate([{
                :seq_id => accession,
                :start => sstart,
                :end => send,
                :type => "match",
                :subfeatures =>  hsps.map {
                  |hsp| {
                    :start => hsp.send < hsp.sstart ? hsp.send : hsp.sstart,
                    :end => hsp.send < hsp.sstart ? hsp.sstart : hsp.send,
                    :type => "match_part"
                  }
                }
            }]))

                      url = "https://wormbase.org/tools/genome/jbrowse-simple" \
                         "?data=data/c_elegans_PRJNA13758" \
                       #  "?data=#{organism}" \
                         "&loc=#{sequence_id}:#{first_hit_start-500}..#{first_hit_start+500}" \
                         "&addFeatures=#{my_features}" \
                         "&addTracks=#{my_track}" \
                         "&tracks=BLAST" \
                         "&highlight=#{accession}:#{first_hit_start}..#{first_hit_end}"

        elsif sequence_metadata["genome_browser"]["type"] == "jbrowse2"
            puts "jbrowse2"
            my_features = ERB::Util.url_encode(JSON.generate([{
              "type":"FeatureTrack",
              "trackId":"blasthits",
              "name":"BLAST Hits",
              "assemblyNames":["c_elegans_PRJNA13758"],
              "adapter":{"type":"FromConfigAdapter",
                         "features":[{"uniqueId":"5691461-5693071,5693116-5693229,1727379-1727409,3028488-3028526,4411037-4411071,13705113-13705143,10688597-10688634,10964311-10964343,421151-421178,3755143-3755170",
                                      "refName":"III",
                                      "start":421151,
                                      "end":13705143,
                                      "name":"Hits",
                                      "subfeatures":[{"uniqueId":"ARRAY(0x5633c1206958)","refName":"III","start":5691461,"end":5693071},
                                                     {"uniqueId":"ARRAY(0x5633c1dc0308)","refName":"III","start":5693116,"end":5693229},
                                                     {"uniqueId":"ARRAY(0x5633c1e1d0a8)","refName":"III","start":1727379,"end":1727409},
                                                     {"uniqueId":"ARRAY(0x5633c0f9bf98)","refName":"III","start":3028488,"end":3028526},
                                                     {"uniqueId":"ARRAY(0x5633c1984fe0)","refName":"III","start":4411037,"end":4411071},
                                                     {"uniqueId":"ARRAY(0x5633c1a30690)","refName":"III","start":13705113,"end":13705143},
                                                     {"uniqueId":"ARRAY(0x5633c1d82900)","refName":"III","start":10688597,"end":10688634},
                                                     {"uniqueId":"ARRAY(0x5633bf96c660)","refName":"III","start":10964311,"end":10964343},
                                                     {"uniqueId":"ARRAY(0x5633c1e23ff0)","refName":"III","start":421151,"end":421178},
                                                     {"uniqueId":"ARRAY(0x5633c19d4ac8)","refName":"III","start":3755143,"end":3755170}]}
                         ]}
              }]))
            PP.pp hsps
            #PP.pp hsps[0].hit.query.hits

#[{"type":"FeatureTrack",
#  "trackId":"blasthits",
#  "name":"BLAST Hits",
#  "assemblyNames":["c_elegans_PRJNA13758"],
#  "adapter":{"type":"FromConfigAdapter",
#             "features":[{"uniqueId":"5692578-5692730,5692445-5692530,5692317-5692398",
#                          "refName":"III",
#                          "start":5692317,
#                          "end":5692730,
#                          "name":"Hits",
#                          "subfeatures":[{"uniqueId":"ARRAY(0x55a9c80b7590)",
#                                          "refName":"III",
#                                          "start":5692578,
#                                          "end":5692730},
#                                         {"uniqueId":"ARRAY(0x55a9c80be3a8)","refName":"III","start":5692445,"end":5692530},
#                                         {"uniqueId":"ARRAY(0x55a9c80bd258)","refName":"III","start":5692317,"end":5692398}]}]}}]

            my_track = ERB::Util.url_encode(JSON.generate([
                 {
                    :label => "BLAST",
                    :key => "BLAST hits",
                    :type => "JBrowse/View/Track/CanvasFeatures",
                    :store => "url",
                    :glyph => "JBrowse/View/FeatureGlyph/Segments"
                 }
            ]))
            my_tracks = ERB::Util.url_encode(sequence_metadata["genome_browser"]["tracks"].join(",") + ",blasthits")
            hit_coords = coordinates[1]
            my_loc = ERB::Util.url_encode(accession + ":" + hit_coords[1].to_s + ".." + hit_coords[0].to_s)
            url = "#{sequence_metadata['genome_browser']['url']}?" \
                         "loc=#{my_loc}" \
                         "&tracks=#{my_tracks}"\
                         "&sessionTracks=#{my_features}" \
                         "&assembly=c_elegans_PRJNA13758"




       #      puts url
 #           https://wormbase.org/tools/genome/jbrowse2/index.html
 #           loc=III:5688461..5696071
 #           tracks=c_elegans_PRJNA13758_curated_genes,c_elegans_PRJNA13758_protein_motifs,c_elegans_PRJNA13758_classical_alleles,blasthits
 #           sessionTracks=[{"type":"FeatureTrack","trackId":"blasthits","name":"BLAST Hits","assemblyNames":["c_elegans_PRJNA13758"],"adapter":{"type":"FromConfigAdapter","features":[{"uniqueId":"5691461-5693071,5693116-5693229,1727379-1727409,3028488-3028526,4411037-4411071,13705113-13705143,10688597-10688634,10964311-10964343,421151-421178,3755143-3755170","refName":"III","start":421151,"end":13705143,"name":"Hits","subfeatures":[{"uniqueId":"ARRAY(0x5633c1206958)","refName":"III","start":5691461,"end":5693071},{"uniqueId":"ARRAY(0x5633c1dc0308)","refName":"III","start":5693116,"end":5693229},{"uniqueId":"ARRAY(0x5633c1e1d0a8)","refName":"III","start":1727379,"end":1727409},{"uniqueId":"ARRAY(0x5633c0f9bf98)","refName":"III","start":3028488,"end":3028526},{"uniqueId":"ARRAY(0x5633c1984fe0)","refName":"III","start":4411037,"end":4411071},{"uniqueId":"ARRAY(0x5633c1a30690)","refName":"III","start":13705113,"end":13705143},{"uniqueId":"ARRAY(0x5633c1d82900)","refName":"III","start":10688597,"end":10688634},{"uniqueId":"ARRAY(0x5633bf96c660)","refName":"III","start":10964311,"end":10964343},{"uniqueId":"ARRAY(0x5633c1e23ff0)","refName":"III","start":421151,"end":421178},{"uniqueId":"ARRAY(0x5633c19d4ac8)","refName":"III","start":3755143,"end":3755170}]}]}}]
    #        assembly=c_elegans_PRJNA13758
       end

       {
         :order => 2,
         :title => 'JBrowse',
         :url   => url,
         :icon  => 'fa-external-link'
       }

    end

#    def gene_link1
#        qstart = hsps.map(&:qstart).min
#        sstart = hsps.map(&:sstart).min
#        qend = hsps.map(&:qend).max
#        send = hsps.map(&:send).max
#        first_hit_start = hsps.map(&:sstart).at(0)
#        first_hit_end = hsps.map(&:send).at(0)
#        organism = accession.partition('-').first
#        sequence_id = accession.partition('-').last
#        puts organism
#        puts accession
#        puts "sequence_id"
#        puts sequence_id
#
#        command = "jbrowse-nclist-cli \
#                        -b \"https://s3.amazonaws.com/agrjbrowse/MOD-jbrowses/WormBase/WS286/c_elegans_PRJNA13758/\" \
#                        -t \"tracks/Curated_Genes/{refseq}/trackData.jsonz\" \
#                        -s "+ first_hit_start.to_s + " -e " + first_hit_start.to_s + " -r " + organism
#        puts command
#        response = `#{command}`
#        puts response
#        if response != ''
#            data = JSON.parse(response)
#            if data.length >= 1
#                url_data = data[0]
#                {
#                    order: 2,
#                    title: url_data["display_name"],
#                    url:   "https://wormbase.org/species/c_elegans/gene/" + url_data["id"],
#                    icon:  'fa-external-link'
#                }
#            end
#        end
#    end

#    def gene_link2
#        qstart = hsps.map(&:qstart).min
#        sstart = hsps.map(&:sstart).min
#        qend = hsps.map(&:qend).max
#        send = hsps.map(&:send).max
#        first_hit_start = hsps.map(&:sstart).at(0)
#        first_hit_end = hsps.map(&:send).at(0)
#        organism = accession.partition('-').first
#        sequence_id = accession.partition('-').last
#        puts organism
#        puts accession
#        puts "sequence_id"
#        puts sequence_id
#
#        command = "jbrowse-nclist-cli \
#                        -b \"https://s3.amazonaws.com/agrjbrowse/MOD-jbrowses/WormBase/WS286/c_elegans_PRJNA13758/\" \
#                        -t \"tracks/Curated_Genes/{refseq}/trackData.jsonz\" \
#                        -s "+ first_hit_start.to_s + " -e " + first_hit_start.to_s + " -r " + organism
#        puts command
#        response = `#{command}`
#        puts response
#        if response != ''
#            data = JSON.parse(response)
#            if data.length >= 2
#                url_data = data[1]
#                {
#                    order: 2,
#                    title: url_data["display_name"],
#                    url:   "https://wormbase.org/species/c_elegans/gene/" + url_data["id"],
#                    icon:  'fa-external-link'
#                }
#            end
#        end
#     end
  end
end

# [1]: https://stackoverflow.com/questions/2824126/whats-the-difference-between-ur#{sequence_id}i-escape-and-cgi-escape
