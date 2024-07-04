require 'erb'
require 'json'
require 'pp'
require 'benchmark'
require 'logger'

# Initialize a logger
$logger = Logger.new(STDOUT)
$logger.level = Logger::DEBUG

module SequenceServer
  # Module to contain methods for generating sequence retrieval links.
  module Links
    # Provide a method to URL encode _query parameters_. See [1].
    include ERB::Util
    alias encode url_encode

    def jbrowse
      Benchmark.bm do |bm|
        bm.report("jbrowse total time") do
          $logger.debug "Starting jbrowse method"

          bm.report("whichdb") { database_filepath = whichdb.map(&:name).at(0) }
          $logger.debug "Database filepath: #{database_filepath}"

          database_filename = File.basename(database_filepath)
          fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
          filepath_parts = database_filepath.split(File::SEPARATOR)
          config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"

          $logger.debug "Config filename: #{config_filename}"

          bm.report("read config file") { file = File.read('/sequenceserver/public/environments/' + config_filename) }
          bm.report("parse JSON") { database_config = JSON.parse(file) }

          sequence_metadata = {}
          bm.report("find sequence metadata") do
            for reference_sequence in database_config["data"]
              if reference_sequence["uri"].include? fasta_file_basename
                sequence_metadata = reference_sequence
                break
              end
            end
          end

          $logger.debug "Sequence metadata: #{sequence_metadata}"

          if !sequence_metadata.has_key?("genome_browser")
            $logger.debug "No genome_browser key in sequence_metadata"
            return
          end

          assembly = sequence_metadata["genome_browser"]["assembly"]
          if sequence_metadata["genome_browser"]["type"] == "jbrowse"
            $logger.debug "Processing jbrowse type"
            subfeatures = []

            features_start = -1
            features_end = -1
            bm.report("process hsps") do
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
            end

            $logger.debug "Features start: #{features_start}, end: #{features_end}"

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
            $logger.debug "Processing jbrowse2 type"
            unique_ids = []
            subfeatures = []

            features_start = -1
            features_end = -1
            count = 1
            bm.report("process hsps for jbrowse2") do
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
            end

            $logger.debug "Features start: #{features_start}, end: #{features_end}"

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

          $logger.debug "Generated URL: #{url}"
        end
      end

      {
        :order => 2,
        :title => 'JBrowse',
        :url   => url,
        :icon  => 'fa-external-link'
      }
    end

    def mod_gene_link
      Benchmark.bm do |bm|
        bm.report("mod_gene_link total time") do
          $logger.debug "Starting mod_gene_link method"

          bm.report("whichdb") { database_filepath = whichdb.map(&:name).at(0) }
          $logger.debug "Database filepath: #{database_filepath}"

          database_filename = File.basename(database_filepath)
          fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
          filepath_parts = database_filepath.split(File::SEPARATOR)
          config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"

          $logger.debug "Config filename: #{config_filename}"

          bm.report("read config file") { file = File.read('/sequenceserver/public/environments/' + config_filename) }
          bm.report("parse JSON") { database_config = JSON.parse(file) }

          first_hit_start = hsps.map(&:sstart).at(0)
          first_hit_end = hsps.map(&:send).at(0)
          organism = accession.partition('-').first

          $logger.debug "First hit start: #{first_hit_start}, end: #{first_hit_end}, organism: #{organism}"

          sequence_metadata = {}
          bm.report("find sequence metadata") do
            for reference_sequence in database_config["data"]
              if reference_sequence["uri"].include? fasta_file_basename
                sequence_metadata = reference_sequence
                break
              end
            end
          end

          $logger.debug "Sequence metadata: #{sequence_metadata}"

          if !sequence_metadata.has_key?("genome_browser")
            $logger.debug "No genome_browser key in sequence_metadata"
            return
          end
          genome_browser_metadata = sequence_metadata["genome_browser"]
          if !genome_browser_metadata.has_key?("gene_track") || !genome_browser_metadata.has_key?("mod_gene_url")
            $logger.debug "Missing gene_track or mod_gene_url in genome_browser_metadata"
            return
          end

          data_url = genome_browser_metadata["data_url"]
          gene_track = genome_browser_metadata["gene_track"]
          command = "jbrowse-nclist-cli -b " + data_url + " -t tracks/" + gene_track + "/{refseq}/trackData.jsonz -s " \
                                          + first_hit_start.to_s + " -e " + first_hit_end.to_s + " -r " + organism
          $logger.debug "Command: #{command}"
          bm.report("execute command") { response = `#{command}` }
          $logger.debug "Response: #{response}"

          if response != ''
            data = JSON.parse(response)
            if data && data.length >= 1
              url_data = data[0]
              if url_data && url_data["display_name"] &&
                  filepath_parts && filepath_parts[2] &&
                  genome_browser_metadata && genome_browser_metadata["mod_gene_url"]

                $logger.debug "Returning mod gene link"
                return {
                  order: 2,
                  title: "#{filepath_parts[2]}: #{url_data['display_name']}",
                  url:   "#{genome_browser_metadata['mod_gene_url']}#{url_data['id']}",
                  icon:  'fa-external-link'
                }
              end
            end
          end
        end
      end
      $logger.debug "No mod gene link generated"
      nil
    end

    def agr_gene_link
      Benchmark.bm do |bm|
        bm.report("agr_gene_link total time") do
          $logger.debug "Starting agr_gene_link method"

          bm.report("whichdb") { database_filepath = whichdb.map(&:name).at(0) }
          $logger.debug "Database filepath: #{database_filepath}"

          database_filename = File.basename(database_filepath)
          fasta_file_basename = File.basename(database_filename,File.extname(database_filename))
          filepath_parts = database_filepath.split(File::SEPARATOR)
          config_filename = filepath_parts[2] + "/" + filepath_parts[3] + "/environment.json"

          $logger.debug "Config filename: #{config_filename}"

          bm.report("read config file") { file = File.read('/sequenceserver/public/environments/' + config_filename) }
          bm.report("parse JSON") { database_config = JSON.parse(file) }

          first_hit_start = hsps.map(&:sstart).at(0)
          first_hit_end = hsps.map(&:send).at(0)
          organism = accession.partition('-').first

          $logger.debug "First hit start: #{first_hit_start}, end: #{first_hit_end}, organism: #{organism}"

          sequence_metadata = {}
          bm.report("find sequence metadata") do
            for reference_sequence in database_config["data"]
              if reference_sequence["uri"].include? fasta_file_basename
                sequence_metadata = reference_sequence
                break
              end
            end
          end

          $logger.debug "Sequence metadata: #{sequence_metadata}"

          if !sequence_metadata.has_key?("genome_browser")
            $logger.debug "No genome_browser key in sequence_metadata"
            return
          end
          genome_browser_metadata = sequence_metadata["genome_browser"]
          if !genome_browser_metadata.has_key?("gene_track")
            $logger.debug "No gene_track key in genome_browser_metadata"
            return
          end

          data_url = genome_browser_metadata["data_url"]
          gene_track = genome_browser_metadata["gene_track"]
          command = "jbrowse-nclist-cli -b " + data_url + " -t tracks/" + gene_track + "/{refseq}/trackData.jsonz -s " \
                                          + first_hit_start.to_s + " -e " + first_hit_end.to_s + " -r " + organism
          $logger.debug "Command: #{command}"
          bm.report("execute command") { response = `#{command}` }
          $logger.debug "Response: #{response}"

          if response != ''
            data = JSON.parse(response)
            if data && !data.empty? && filepath_parts[2]
              url_data = data[0]
              if url_data && url_data["id"] && url_data["display_name"]
                url = "https://www.alliancegenome.org/gene/#{filepath_parts[2]}:#{url_data['id']}"
                $logger.debug "Returning AGR gene link"
                return {
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
      $logger.debug "No AGR gene link generated"
      nil
    end
  end
end
# [1]: https://stackoverflow.com/questions/2824126/whats-the-difference-between-ur#{sequence_id}i-escape-and-cgi-escape