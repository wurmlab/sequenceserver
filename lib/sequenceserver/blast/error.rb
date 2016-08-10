require 'English'

require_relative 'constants'
require_relative 'exceptions'

module SequenceServer

  #BLAST module
  module BLAST
    class Error
      def initialize(job)
        @job = job
        callError
      end

      attr_reader :job

      def callError
        case job.status
        when 1 # error in query sequence or options; see [1]
          validate_options job.advanced_params # if advanced_params are incorrect
          empty_rfile_error # if rfile is empty
        when 2, 3, 4, 255
          fail ArgumentError, readError
        end
      end

      # Advanced options are specified by the user. Here they are checked for
      # interference with SequenceServer operations.
      #
      # Raise ArgumentError if an error has occurred.
      def validate_options(options)
        puts "validate_options block - #{options}"
        unless allowed_chars.match(options.to_s)
          fail ArgumentError, 'Invalid characters detected in options.'
        end

        if disallowed_options.match(options.to_s)
          fail ArgumentError, "Option \"#{options}\" is prohibited.!!"
        end
      end

      def allowed_chars
        /\A[a-z0-9\-_\. ']*\Z/i
      end

      def disallowed_options
        /-out|-html|-outfmt|-db|-query|-num_threads/i
      end

      def checkError
        File.size(efile) > 0
      end

      def readError
        File.read(efile)
        # IO.readlines(efile).last(3).each { |x| puts x } # for the -foo bar error.
      end

      def empty_rfile_error
        rfile = File.join(DOTDIR, jid, 'efile')
        fail ArgumentError, "BLAST process was terminated prematurely." if File.zero?(rfile)
        true
      end

      def efile
        job.efile
      end
    end

  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK279677/
