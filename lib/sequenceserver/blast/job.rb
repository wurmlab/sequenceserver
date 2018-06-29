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
      def raise!
        # Error in query sequence or options; see [1]
        if exitstatus == 1
          error = IO.foreach(stderr).grep(ERROR_LINE).join
          error = File.read(stderr) if error.empty?
          fail InputError, error
        end

        # All other error are caught by this error block. Jobs are run using
        # sys. sys ensures that job's stdout and stderr file will exist even
        # if # empty. If stdout is empty, the program
        # must have crashed.
        if exitstatus >= 2 || File.zero?(stdout)
          fail SystemError, <<MSG
BLAST failed abruptly. Exit status and stderr of the program are displayed
below. Restart SequenceServer once the problem is fixed for the changes to
take effect.

exit status: #{ exitstatus }
stderr: #{ File.read stderr }
MSG
        end

        # We will reach here if exit status was 0 and stdout is not empty.
        true
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
