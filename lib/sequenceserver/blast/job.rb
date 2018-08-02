require 'sequenceserver/job'

module SequenceServer
  # BLAST module.
  module BLAST
    # Extends SequenceServer::Job to describe a BLAST job.
    class Job < Job
      def initialize(params)
        validate params
        super do
          @method    = params[:method]
          @qfile     = store('query.fa', params[:sequence])
          @databases = Database[params[:databases]]
          @options   = params[:advanced].to_s.strip + defaults
          @advanced_params = parse_advanced params[:advanced]
        end
      end

      attr_reader :advanced_params

      # :nodoc:
      # Attributes used by us - should be considered private.
      attr_reader :method, :qfile, :databases, :options

      # Returns the command that will be executed. Job super class takes care
      # of actual execution.
      def command
        @command ||= "#{method} -db '#{databases.map(&:name).join(' ')}'" \
                     " -query '#{qfile}' #{options}"
      end

      # Override Job#raise! to raise specific API errors based on exitstatus
      # and using contents of stderr to provide context about the error.
      #
      # rubocop:disable Metrics/CyclomaticComplexity
      def raise!
        # Return true exit status is 0 and stdout is not empty.
        return true if exitstatus.zero? && !File.zero?(stdout)

        # Handle error. See [1].
        case exitstatus
        when 1
          # Error in query sequence or options.
          error = IO.foreach(stderr).grep(ERROR_LINE).join
          error = File.read(stderr) if error.empty?
          fail InputError, error
        when 4
          # Out of memory. User can retry with a shorter search, so raising
          # InputError here instead of SystemError.
          fail InputError, <<~MSG
            Ran out of memory. Please try a smaller query, or searching fewer and smaller
            databases, or limiting the output by using advanced options.
            MSG
        when 6
          # Error creating output files. It can't be a permission issue as that
          # would have been caught while creating job directory. But we can run
          # out of storage after creating the job directory and while running
          # the job. This is a SystemError.
          fail SystemError, 'Ran out of disk space.'
        else
          # I am not sure what the exit codes 2 & 3 means and we should note
          # encounter exit code 5. The only other error that I know can happen
          # but is not yet handled is when BLAST+ binaries break such as after
          # macOS updates. So raise SystemError, include the exit status in the
          # message, and say that that the "most likely" reason is broken BLAST+
          # binaries.
          fail SystemError, <<~MSG
            BLAST failed abruptly (exit status: #{exitstatus}). Most likely there is a
            problem with the BLAST+ binaries.
            MSG
        end
      end
      # rubocop:enable Metrics/CyclomaticComplexity

      private

      def parse_advanced(param_line)
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

        unless allowed_chars.match(options)
          fail InputError, 'Invalid characters detected in options.'
        end

        if disallowed_options.match(options)
          failedopt = Regexp.last_match[0]
          fail InputError, "Option \"#{failedopt}\" is prohibited."
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
