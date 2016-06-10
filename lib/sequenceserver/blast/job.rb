require 'sequenceserver/pool'
require 'sequenceserver/job'

module SequenceServer

  # BLAST module.
  module BLAST
    # Extends SequenceServer::Job to describe a BLAST job.
    #
    # `BLAST::ArgumentError` and `BLAST::RuntimeError` signal errors
    # encountered when attempting a BLAST search.
    class Job < Job

      def initialize(params)
        validate params
        super do
          @method    = params[:method]
          @qfile     = store('query.fa', params[:sequence])
          @databases = Database[params[:databases]]
          @options   = params[:advanced].to_s.strip + defaults
          @advanced_params = parse_advanced params[:advanced]


          # BLASTN implies BLASTN, not MEGABLAST. But let's not interfere if
          # user specifies `task` herself.
          @options << ' -task blastn' if @method == 'blastn' && !(@options =~ /task/)
        end
      end


      attr_reader :advanced_params
      # :nodoc:
      # Attributes used by us.
      #
      # Should be considered private.
      attr_reader :method, :qfile, :databases, :options

      # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity
      # rubocop:disable Metrics/MethodLength
      def run
        command = "#{method} -db '#{databases.map(&:name).join(' ')}'" \
                  " -query '#{qfile}' #{options}"

        logger.debug("Executing: #{command}")

        system("#{command} > #{rfile} 2> #{efile}")
        status = $CHILD_STATUS.exitstatus
        done!(status)
      end

      def rfile
        File.join(dir, 'rfile')
      end

      def efile
        File.join(dir, 'efile')
      end

      def success?
        exitstatus == 0 && File.exist?(rfile) && !File.zero?(rfile)
      end

      private

      def parse_advanced param_line
        param_list = (param_line || '').split(' ')
        res = {}

        param_list.each_with_index do |word, i|
          nxt = param_list[i + 1]
          if word.start_with? '-'
            word.sub!('-', '')
            unless nxt.nil? || nxt.start_with?('-')
              res[word] = nxt
            else
              res[word] = 'True'
            end
          end
        end
        res.delete 'evalue'
        res
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
        fail ArgumentError, 'BLAST algorithm should be one of:' \
                            " #{ALGORITHMS.join(', ')}."
      end

      def validate_sequences(sequences)
        return true if sequences.is_a?(String) && !sequences.empty?
        fail ArgumentError, 'Sequences should be a non-empty string.'
      end

      def validate_databases(database_ids)
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
      def validate_options(options)
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

      def allowed_chars
        /\A[a-z0-9\-_\. ']*\Z/i
      end

      def disallowed_options
        /-out|-html|-outfmt|-db|-query|-num_threads/i
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
