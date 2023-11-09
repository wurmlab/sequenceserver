require 'sequenceserver/job'
require 'sequenceserver/zip_file_generator'
require 'sequenceserver/blast/error'

module SequenceServer
  # BLAST module.
  module BLAST
    # Extends SequenceServer::Job to describe a BLAST job.
    class Job < Job
      def initialize(params)
        if params.key?(:xml)
          super do
            @imported_xml_file = File.basename params[:xml]
            # Copy over the XML file to job directory so that a job dir in
            # itself is self-contained. This will help with tests among
            # other things.
            FileUtils.cp(params[:xml], dir)
            @databases = []
            done!
          end
        else
          validate params
          super do
            @method    = params[:method]
            @qfile     = store('query.fa', params[:sequence])
            @databases = Database[params[:databases]]
            @advanced  = params[:advanced].to_s.strip
            @options   = @advanced + defaults
            # The following params are for analytics only
            @num_threads = config[:num_threads]
            @query_length = calculate_query_size
            @databases_ncharacters_total = calculate_databases_ncharacters_total
          end
        end
      end

      # :nodoc:
      # Attributes used by us - should be considered private.
      attr_reader :advanced
      attr_reader :databases, :databases_ncharacters_total, :method, :num_threads, :options, :qfile, :query_length

      # :nodoc:
      # Deprecated; see Report#extract_params
      attr_reader :advanced_params

      # :nodoc:
      # Returns path to the imported xml file if the job was created using the
      # --import switch. Returns nil otherwise.
      def imported_xml_file
        File.join(dir, @imported_xml_file) if @imported_xml_file
      end

      # Returns the command that will be executed. Job super class takes care
      # of actual execution.
      def command
        @command ||= "#{method} -db '#{databases.map(&:name).join(' ')}'" \
                     " -query '#{qfile}' #{options}"
      end

      def raise!
        SequenceServer::BLAST::Error.new(exitstatus: exitstatus, stdout: stdout, stderr: stderr).raise!
      end

      # Use it with a block to get a self-cleaning temporary archive file
      # of the contents of the job directory.
      # job.as_archived_file do |tmp_file|
      #    # do things with tmp_file
      # end
      def as_archived_file(&block)
        Dir.mktmpdir(id.to_s) do |tmp_dir|
          file_path = "#{tmp_dir}/#{id}.zip"
          ZipFileGenerator.new(dir, file_path).write
          File.open(file_path, 'r') do |file|
            block.call(file)
          end
        end
      end

      private

      def calculate_databases_ncharacters_total
        databases.map(&:ncharacters).map(&:to_i).reduce(:+)
      end

      def calculate_query_size
        size = 0
        IO.foreach(@qfile) do |line|
          next if line[0] == '>'

          size += line.gsub(/\s+/, '').length
        end
        size
      end

      def validate(params)
        validate_method params[:method]
        validate_sequences params[:sequence]
        validate_databases params[:databases]
        validate_options params[:advanced]
      end

      def defaults
        " -outfmt '11 qcovs qcovhsp' -num_threads #{config[:num_threads]}"
      end

      def validate_method(method)
        return true if ALGORITHMS.include? method

        fail InputError, 'BLAST algorithm should be one of:' \
                            " #{ALGORITHMS.join(', ')}."
      end

      def validate_sequences(sequences)
        return true if sequences.is_a?(String) && !sequences.empty?

        fail InputError, 'Sequences should be a non-empty string.'
      end

      def validate_databases(database_ids)
        ids = Database.ids
        return true if database_ids.is_a?(Array) && !database_ids.empty? &&
                       (ids & database_ids).length == database_ids.length

        fail InputError, "Database id should be one of: #{ids.join("\n")}."
      end

      # Advanced options are specified by the user. Here they are checked for
      # interference with SequenceServer operations.
      #
      # Raise InputError if an error has occurred.
      def validate_options(options)
        return true if !options || (options.is_a?(String) &&
                                    options.strip.empty?)

        fail InputError, 'Invalid characters detected in options.' unless allowed_chars.match(options)

        if disallowed_options.match(options)
          failedopt = Regexp.last_match[0]
          fail InputError, "Option \"#{failedopt}\" is prohibited."
        end

        true
      end

      def allowed_chars
        /\A[a-z0-9\-_. ',]*\Z/i
      end

      def disallowed_options
        /-out|-html|-outfmt|-db |-query|-num_threads/i
      end
    end
  end
end
