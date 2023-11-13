# http://www.ncbi.nlm.nih.gov/books/NBK1763/ (Appendices)

module SequenceServer
  module BLAST
    class Error
      attr_reader :exitstatus, :stdout, :stderr

      def initialize(exitstatus:, stdout:, stderr:)
        @exitstatus = exitstatus
        @stdout = stdout
        @stderr = stderr
      end

      def raise!
        return true if exitstatus.zero? && !File.zero?(stdout)

        case exitstatus
        when 1..2
          # 1: Error in query sequences or options.
          # 2: Error in BLAST databases.
          error = IO.foreach(stderr).grep(ERROR_LINE).join
          error = File.read(stderr) if error.empty?
          fail InputError, "(#{exitstatus}) #{error}"
        when 4
          # Out of memory. User can retry with a shorter search, so raising
          # InputError here instead of SystemError.
          fail InputError, <<~MSG
            Ran out of memory. Please try a smaller query, fewer and smaller
            databases, or limiting the output by using advanced options.
          MSG
        when 6
          # Error creating output files. It can't be a permission issue as that
          # would have been caught while creating job directory. But we can run
          # out of storage after creating the job directory and while running
          # the job. This is a SystemError.
          fail SystemError, 'Ran out of disk space.'
        else
          # I am not sure what the exit codes 3 means and we should not
          # encounter exit code 5. The only other error that I know can happen
          # but is not yet handled is when BLAST+ binaries break such as after
          # macOS updates. So raise SystemError, include the exit status in the
          # message, and say that that the "most likely" reason is broken BLAST+
          # binaries.

          error = File.read(stderr)
          error = 'Most likely there is a problem with the BLAST+ binaries.' if error.empty?

          fail SystemError, "BLAST failed abruptly (exit status: #{exitstatus}). #{error}"
        end
      end
    end
  end
end
