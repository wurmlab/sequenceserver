require 'tempfile'

module SequenceServer
  # Simple BLAST+ wrapper.
  class Blast
    # command string to be executed
    attr_reader :command

    # result of executing command
    attr_reader :result

    # errors as [status, message]
    attr_reader :error

    # Initialize a new blast search.
    # ---
    # Arguments:
    # * method (String)    - blast executable (shell executable, or absolute path)
    # * query (String)     - query string
    # * databases (String) - database name as returned by 'blastdbcmd -list'
    # * options (String)   - other options
    #
    # ---
    # Examples:
    #
    #   b = Blast.new("blastn", 'ATGTCCGCGAATCGATTGAACGTGCTGGTGACCCTGATGCTCGCCGTCGCGCTTCTTGTG', "S.cdna.fasta",  "-html -num_threads 4")
    #
    #   b.run!        => true
    #   b.result      => "blast output"
    def initialize(method, query, databases, options = nil)
      @method    = method
      @databases = databases

      # create a tempfile for the given query
      qfile = Tempfile.new('sequenceserver_query')
      qfile.puts(query)
      qfile.close
      @query = qfile.path

      # Add -outfmt 11 to list of options so that it outputs a blast archive
      @options = options.to_s
      @options += " -html"
    end

    # Run blast everytime it is called. Returns the success
    # status - true, or false.
    def run!
      @result, @error, status = execute(command)

      @success = status.success? and return @success
      if status.exitstatus == 1
        message = @error.select{|l| l.match(/CArgException::eConstraint/)}.first
        message and message.gsub!('Error: (CArgException::eConstraint)', '')
        message ||= @error
        @error = [400,  message]
      else
        @error = [500, @error]
      end

      false
    end

    # The command that will be executed.
    def command
      @command ||= "#@method -db '#@databases' -query '#@query' #@options"
    end

    # Return success status.
    def success?
      @success
    end

    private

    # Adapted from Ruby 1.8.7's Open3.popen3.
    def execute(command)
      # pipe[0] for read, pipe[1] for write
      po = IO::pipe
      pe = IO::pipe

      pid = fork {
        po[0].close
        STDOUT.reopen(po[1])
        po[1].close

        pe[0].close
        STDERR.reopen(pe[1])
        pe[1].close

        exec(command)
      }
      po[1].close
      pe[1].close

      pid, status = Process.waitpid2(pid)

      return po.first.readlines, pe.first.readlines, status
    ensure
      [po[0], pe[0]].each{|p| p.close unless p.closed?}
    end
  end
end
