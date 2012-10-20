require 'tempfile'

module SequenceServer
  # Simple BLAST+ wrapper.
  class Blast

    ERROR_LINE = /\(CArgException.*\)\s(.*)/

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
      @query = qfile

      # Add -outfmt 11 to list of options so that it outputs a blast archive
      @options = options.to_s
      @options += " -html"
    end

    # Run blast everytime it is called. Returns the success
    # status - true, or false.
    def run!
      @result, @error, status = execute(command)

      status == 0 and return @success = true

      if status == 1
        message = @error.each{|l| l.match(ERROR_LINE) and break Regexp.last_match[1]}
        message = message || @error
        @error  = [400,  message]
      else
        @error = [500, @error]
      end

      false
    end

    # The command that will be executed.
    def command
      @command ||= "#@method -db '#@databases' -query '#{@query.to_path}' #@options"
    end

    # Return success status.
    def success?
      @success
    end

    private

    # Execute a command and return its stdout, stderr, and exit status.
    def execute(command)
      rfile = Tempfile.new('sequenceserver_result')
      efile = Tempfile.new('sequenceserver_error')
      [rfile, efile].each {|file| file.close}

      system("#{command} > #{rfile.path} 2> #{efile.path}")
      status = $?.exitstatus

      return File.readlines(rfile.path), File.readlines(efile.path), status
    ensure
      rfile.unlink
      efile.unlink
    end
  end
end
