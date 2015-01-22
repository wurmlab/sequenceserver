require 'forwardable'
require 'tempfile'
require 'English'
require 'ox'

require 'sequenceserver/links'
require 'sequenceserver/blast/exceptions'
require 'sequenceserver/blast/report'
require 'sequenceserver/blast/query'
require 'sequenceserver/blast/hit'
require 'sequenceserver/blast/hsp'

module SequenceServer
  # Simple wrapper around BLAST+ search algorithms.
  #
  # `BLAST::ArgumentError` and `BLAST::RuntimeError` signal errors encountered
  # when attempting a BLAST search.
  module BLAST
    ERROR_LINE = /\(CArgException.*\)\s(.*)/

    ALGORITHMS = %w(blastn blastp blastx tblastn tblastx)

    OUTFMT = {
      'pairwise'        => [0, 'txt'],
      'qa_identity'     => [1, 'txt'],
      'qa_no_identity'  => [2, 'txt'],
      'fqa_identity'    => [3, 'txt'],
      'fqa_no_identity' => [4, 'txt'],
      'xml'             => [5, 'xml'],
      'tsv'             => [6, 'tsv'],
      'tsv_commented'   => [7, 'tsv'],
      'asn_text'        => [8, 'asn'],
      'asn_binary'      => [9, 'asn'],
      'csv'             => [10, 'csv'],
      'archive'         => [11, 'txt']
    } # See [1]

    class << self
      extend Forwardable

      def_delegators SequenceServer, :config, :logger

      # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity
      # rubocop:disable Metrics/MethodLength
      def run(params)
        pre_process params
        validate_blast_params params

        # Compile parameters for BLAST search into a shell executable command.
        #
        # BLAST method to use.
        method  = params[:method]
        #
        # BLAST+ expects query sequence as a file.
        qfile = Tempfile.new('sequenceserver_query')
        qfile.puts(params[:sequence])
        qfile.close
        #
        # Retrieve database objects from database id.
        databases = Database[params[:databases]]
        #
        # Concatenate other blast options.
        options = params[:advanced].to_s.strip + defaults
        #
        # blastn implies blastn, not megablast; but let's not interfere if a
        # user specifies `task` herself.
        options << ' -task blastn' if method == 'blastn' && !(options =~ /task/)

        # Run BLAST search.
        #
        # Command to execute.
        command = "#{method} -db '#{databases.map(&:name).join(' ')}'" \
                  " -query '#{qfile.path}' #{options}"
        #
        # Debugging log.
        logger.debug("Executing: #{command}")
        #
        # Temporary files to capture stdout and stderr.
        rfile = Tempfile.new('sequenceserver_blast_result')
        efile = Tempfile.new('sequenceserver_blast_error')
        [rfile, efile].each(&:close)
        #
        # Execute.
        system("#{command} > #{rfile.path} 2> #{efile.path}")

        # Capture error.
        status = $CHILD_STATUS.exitstatus
        case status
        when 1 # error in query sequence or options; see [1]
          efile.open

          # Most of the time BLAST+ generates a verbose error message with
          # details we don't require.  So we parse out the relevant lines.
          error = efile.each_line do |l|
            break Regexp.last_match[1] if l.match(ERROR_LINE)
          end

          # But sometimes BLAST+ returns the exact/relevant error message.
          # Trying to parse such messages returns nil, and we use the error
          # message from BLAST+ as it is.
          error = efile.rewind && efile.read unless error.is_a? String

          efile.close
          fail ArgumentError, error
        when 2, 3, 4, 255 # see [1]
          efile.open
          error = efile.read
          efile.close
          fail RuntimeError.new(status, error)
        end

        Report.new(File.basename(rfile), databases)
      end

      def format(params)
        validate_format_params params

        rfile = create_file_path params['report']
        ofmt  = OUTFMT[params['format']]
        type  = params['type']

        oname = "seqserv_#{type}_#{Time.now.strftime('%H%M')}.#{ofmt[1]}"
        ofile = Tempfile.new oname

        command =  "blast_formatter -archive '#{rfile}' -out #{ofile.path}" \
                   " -outfmt '#{ofmt[0]} #{params['specifiers']}' 2> /dev/null"

        logger.debug("Executing: #{command}")
        system command

        {
          :filepath => ofile.path,
          :filename => oname,
          :type     => ofmt[1]
        }
      end
      # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity
      # rubocop:enable Metrics/MethodLength

      def pre_process(params)
        params[:sequence].strip! unless params[:sequence].nil?
      end

      def validate_format_params(params)
        return true if params.include?('report') &&
                       params.include?('format') &&
                       File.exist?(create_file_path params['report'])
        fail ArgumentError, <<MSG
Incorrect request parameters. Please ensure that requested file name is
correct and the file type is either xml or tsv.
MSG
      end

      def validate_blast_params(params)
        validate_blast_method params[:method]
        validate_blast_sequences params[:sequence]
        validate_blast_databases params[:databases]
        validate_blast_options params[:advanced]
      end

      def defaults
        " -outfmt 11 -num_threads #{config[:num_threads]}"
      end

      def validate_blast_method(method)
        return true if ALGORITHMS.include? method
        fail ArgumentError, 'BLAST algorithm should be one of:' \
                            " #{ALGORITHMS.join(', ')}."
      end

      def validate_blast_sequences(sequences)
        return true if sequences.is_a?(String) && !sequences.empty?
        fail ArgumentError, 'Sequences should be a non-empty string.'
      end

      def validate_blast_databases(database_ids)
        ids = Database.ids
        return true if database_ids.is_a?(Array) && !database_ids.empty? &&
                       (ids & database_ids).length == database_ids.length
        fail ArgumentError, 'Database id should be one of:' \
                            " #{ids.join("\n")}."
      end

      # Advanced options are specified by the user. Here they are checked for
      # interference with SequenceServer operations.
      #
      # Raise ArgumentError if an error has occurred.
      def validate_blast_options(options)
        return true if !options || (options.is_a?(String) &&
                                    options.strip.empty?)

        unless allowed_chars.match(options)
          fail ArgumentError, 'Invalid characters detected in options.'
        end

        if disallowed_options.match(options)
          failedopt = Regexp.last_match[0]
          fail ArgumentError, "Option \"#{failedopt}\" is prohibited."
        end

        true
      end

      # Returns filename if path exists otherwise returns a path to tmp dir.
      def create_file_path(filename)
        return File.join(Dir.tmpdir, filename) unless File.exist? filename
        filename
      end

      def allowed_chars
        /\A[a-z0-9\-_\. ']*\Z/i
      end

      def disallowed_options
        /-out|-html|-outfmt|-db|-query/i
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
