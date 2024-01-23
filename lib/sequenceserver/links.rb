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
        database_filepath = whichdb.map(&:name).at(0)
        database_filename = File.basename(database_filepath)
        fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
        filepath_parts = database_filepath.split(File::SEPARATOR)
        config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"
        file = File.read('/sequenceserver/public/environments/' + config_filename)
        database_config = JSON.parse(file)

        sequence_metadata = {}
        for reference_sequence in database_config["data"]
          if reference_sequence["uri"].include? fasta_file_basename
            sequence_metadata = reference_sequence
            break
          end  
        end

        if !sequence_metadata.has_key?("genome_browser")
            return
        end

        assembly = sequence_metadata["genome_browser"]["assembly"]
        if sequence_metadata["genome_browser"]["type"] == "jbrowse"
            subfeatures = []

            features_start = -1
            features_end = -1
            for hsp in hsps
              refname = hsp["hit"]["accession"]
              if hsp["sstart"] > hsp["send"]
                  sequence_start = hsp["send"]
                  sequence_end = hsp["sstart"]
              else
                  sequence_start = hsp["sstart"]
                  sequence_end = hsp["send"]
              end

              if features_start == -1 || features_start > sequence_start
                features_start = sequence_start
              end

              if features_end == -1 || features_end < sequence_end
                features_end = sequence_end
              end
 
              subfeature = {"seq_id": refname,
                            "start": sequence_start,
                            "end": sequence_end,
                            "type": "match_part"}
              subfeatures.push(subfeature)
            end

            loc = ERB::Util.url_encode(accession + ":" + features_start.to_s + ".." + features_end.to_s)
            features = ERB::Util.url_encode(JSON.generate([{
                :seq_id => accession,
                :start => features_start,
                :end => features_end,
                :type => "match",
                :subfeatures => subfeatures
            }]))
            tracks = ERB::Util.url_encode(sequence_metadata["genome_browser"]["tracks"].join(",") + ",Hits")
            add_tracks = ERB::Util.url_encode('[{"label":"Hits","type":"JBrowse/View/Track/CanvasFeatures","store":"url","subParts":"match_part","glyph":"JBrowse/View/FeatureGlyph/Segments"}]')

            url = "#{sequence_metadata['genome_browser']['url']}" \
                  "?data=data/#{assembly}" \
                  "&loc=#{loc}" \
                  "&addFeatures=#{features}" \
                  "&addTracks=#{add_tracks}" \
                  "&tracks=#{tracks}" \
                  "&highlight="
        elsif sequence_metadata["genome_browser"]["type"] == "jbrowse2"
            unique_ids = []
            subfeatures = []

            features_start = -1
            features_end = -1
            count = 1
            for hsp in hsps
              refname = hsp["hit"]["accession"]
              if hsp["sstart"] > hsp["send"]
                  sequence_start = hsp["send"]
                  sequence_end = hsp["sstart"]
              else
                  sequence_start = hsp["sstart"]
                  sequence_end = hsp["send"]
              end

              if features_start == -1 || features_start > sequence_start
                features_start = sequence_start
              end

              if features_end == -1 || features_end < sequence_end
                features_end = sequence_end
              end
 
              unique_id = sequence_start.to_s + "-" + sequence_end.to_s + "-" + count.to_s
              count = count + 1
              unique_ids = unique_ids.push(unique_id)

              subfeature = {"uniqueId": unique_id,
                            "refName": refname,
                            "start": sequence_start,
                            "end": sequence_end}
              subfeatures.push(subfeature)
            end

            session_tracks = ERB::Util.url_encode(
                             [{"type": "FeatureTrack",
                              "trackId":"blasthits",
                              "name": "BLAST Hits",
                              "assemblyNames": [assembly],
                              "adapter":{"type":"FromConfigAdapter",
                                         "features": [{"uniqueId": unique_ids.join(","),
                                                      "refName": refname,
                                                      "start": features_start,
                                                      "end": features_end,
                                                      "name": "Hits",
                                                      "subfeatures": subfeatures}]}}].to_json)
            tracks = ERB::Util.url_encode(sequence_metadata["genome_browser"]["tracks"].join(",") + ",blasthits")
            loc = ERB::Util.url_encode(accession + ":" + features_start.to_s + ".." + features_end.to_s)

            url = "#{sequence_metadata['genome_browser']['url']}?" \
                         "loc=#{loc}" \
                         "&tracks=#{tracks}"\
                         "&sessionTracks=#{session_tracks}" \
                         "&assembly=#{assembly}"
       end

       {
         :order => 2,
         :title => 'JBrowse',
         :url   => url,
         :icon  => 'fa-external-link'
       }
    end

    def mod_gene_link
        database_filepath = whichdb.map(&:name).at(0)
        database_filename = File.basename(database_filepath)
        fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
        filepath_parts = database_filepath.split(File::SEPARATOR)
        config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"
        file = File.read('/sequenceserver/public/environments/' + config_filename)
        database_config = JSON.parse(file)

        first_hit_start = hsps.map(&:sstart).at(0)
        first_hit_end = hsps.map(&:send).at(0)
        organism = accession.partition('-').first

        sequence_metadata = {}
        for reference_sequence in database_config["data"]
          if reference_sequence["uri"].include? fasta_file_basename
            sequence_metadata = reference_sequence
            break
          end  
        end

        if !sequence_metadata.has_key?("genome_browser")
          return
        end
        genome_browser_metadata = sequence_metadata["genome_browser"]
        if !genome_browser_metadata.has_key?("gene_track") || !genome_browser_metadata.has_key?("mod_gene_url")
            return
        end

        data_url = genome_browser_metadata["data_url"]
        gene_track = genome_browser_metadata["gene_track"]
        command = "jbrowse-nclist-cli -b " + data_url + " -t tracks/" + gene_track + "/{refseq}/trackData.jsonz -s " \
                                        + first_hit_start.to_s + " -e " + first_hit_end.to_s + " -r " + organism
        response = `#{command}`
        if response != ''
            data = JSON.parse(response)
            if data && data.length >= 1
                url_data = data[0]
                if url_data && url_data["display_name"] && 
                    filepath_parts && filepath_parts[2] && 
                    genome_browser_metadata && genome_browser_metadata["mod_gene_url"]

                    {
                     order: 2,
                     title: "#{filepath_parts[2]}: #{url_data['display_name']}",
                     url:   "#{genome_browser_metadata['mod_gene_url']}#{url_data['id']}",
                     icon:  'fa-external-link'
                    }
                end
            end
        end
    end

    def agr_gene_link
        database_filepath = whichdb.map(&:name).at(0)
        database_filename = File.basename(database_filepath)
        fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
        filepath_parts = database_filepath.split(File::SEPARATOR)
        config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"
        file = File.read('/sequenceserver/public/environments/' + config_filename)
        database_config = JSON.parse(file)

        first_hit_start = hsps.map(&:sstart).at(0)
        first_hit_end = hsps.map(&:send).at(0)
        organism = accession.partition('-').first

        sequence_metadata = {}
        for reference_sequence in database_config["data"]
          if reference_sequence["uri"].include? fasta_file_basename
            sequence_metadata = reference_sequence
            break
          end  
        end

        if !sequence_metadata.has_key?("genome_browser")
          return
        end
        genome_browser_metadata = sequence_metadata["genome_browser"]
        if !genome_browser_metadata.has_key?("gene_track")
            return
        end

        data_url = genome_browser_metadata["data_url"]
        gene_track = genome_browser_metadata["gene_track"]
        command = "jbrowse-nclist-cli -b " + data_url + " -t tracks/" + gene_track + "/{refseq}/trackData.jsonz -s " \
                                        + first_hit_start.to_s + " -e " + first_hit_end.to_s + " -r " + organism
        response = `#{command}`

        if response != ''
            data = JSON.parse(response)
            if data && !data.empty? && filepath_parts[2]
                url_data = data[0]
                if url_data && url_data["id"] && url_data["display_name"]
                    url = "https://www.alliancegenome.org/gene/#{filepath_parts[2]}:#{url_data['id']}"
                        {
                         order: 2,
                         title: "Alliance: #{url_data['display_name']}",
                         url: url,
                         icon: 'fa-external-link'
                        }
                end
            end
        end
    end
  end
end
# [1]: https://stackoverflow.com/questions/2824126/whats-the-difference-between-ur#{sequence_id}i-escape-and-cgi-escape
