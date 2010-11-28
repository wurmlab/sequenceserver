require 'tempfile'
require 'open3'

# Simple ncbi-blast wrapper. Check examples below.
class Blast
  # blast method
  attr_accessor :method

  # database name
  attr_accessor :db

  # query sequence string
  attr_accessor :qstring
  
  # query file name
  attr_accessor :qfile

  # advanced blast options
  attr_accessor :options

  # command string to be executed
  attr_reader   :command

  # result of executing command
  attr_reader   :result

  # errors if any while executing command
  attr_reader   :error

  # Initialize a new blast search.
  # ---
  # Arguments(optional):
  # * method(String)  - blast executable (shell executable, or absolute path)
  # * db(String)      - database name as returned by 'blastdbcmd -list'
  # * query(Hash)     - query string/file, and options.
  #
  # In the query Hash, use:
  # * :qfile(String)   - to run Blast against a file.
  # * :qstrin(String)  - to run Blast against a string.
  # * :options(String) - to specify multiple blast options.
  #
  # Either :qfile, or :qstring should be used. If both are given, by design
  # :qstring will be used to run blast.
  # ---
  # Examples:
  #
  #   b = Blast.new("blastn", "S.cdna.fasta", :qfile => 'query.seq', :options => "-html -num_threads 4")
  #   b = Blast.new("blastn", "S.cdna.fasta", :qstring => 'ATGTCCGCGAATCGATTGAACGTGCTGGTGACCCTGATGCTCGCCGTCGCGCTTCTTGTG')
  #
  #   b.run!        => true
  #   b.result      => "blast output"
  #
  #   # change the blast method.
  #   b.method = 'blastp'
  #
  #   b.run!        => false
  #   b.error       => "blast error output"
  def initialize(method = nil, db = nil, query = {})
    @method  = method
    @db      = db
    @qstring = query[:qstring]
    @qfile   = query[:qfile]
    @options = query[:options]
  end

  # Run blast everytime it is called. Returns the success
  # status - true, or false. Blast method, db, and qfile/qstring
  # need to be set before calling this method, else blast will fail.
  #
  #   b = Blast.new
  #   b.run!   => false
  #
  #   # set blast method, and db
  #   b.method = 'blastn'
  #   b.db     = 'S.cdna.fasta'
  #
  #   b.run!   => false
  #   b.errors => "blast error output"
  #
  #   # set qfile
  #   b.qfile  = 'query1.seq'    
  #
  #   b.run!   => true
  #   b.reuslt => "blast output"
  def run!
    # can not run blast if method is not specified
    return false unless @method

    # create a tempfile if qstring is given
    if @qstring
      @tempfile = Tempfile.new('qfile')
      @tempfile.puts(qstring)
      @tempfile.close
      @qfile    = @tempfile.path
    end

    # form command to execute
    @command = to_s

    # execute command and capture both stdout, and stderr
    Open3.popen3(@command) do |stdin, stdout, stderr|
      @result = stdout.readlines # convert to string?
      @error  = stderr.readlines
    end

    # set and return success status
    return @success = @error.empty?

  ensure
    # delete tempfile if it was created
    @tempfile.unlink if @tempfile
  end

  # Return the blast type used as a String.
  #
  #   b.method = '/home/yeban/opt/blastn'
  #   b.type   => 'blastn'
  def type
    @type ||= @method[(@method.rindex('/') + 1)..-1]
  end

  # Return success status - true, false, or nil.
  # 'nil' implies that blast has not been run yet.
  def success?
    @success
  end

  # String representation of the blast object - same as
  # the command to be executed.
  def to_s
    s = "#@method "
    s << "-db #@db " if @db
    s << "-query #@qfile " if @qfile
    s << @options.to_s if @options
    s
  end

  # Especially helpful in irb - "status : command"
  def inspect
    return to_s if success?.nil?
    (success? ? "success : " : "fail : ") + @command
  end

  class << self
    # shortcut method to run blast against a query file
    def blast_file(method, db, qfile, options = nil)
      b = Blast.new(method, db, :qfile => qfile, :options => options)
      b.run!
      b
    end

    # shortcut method to run blast against a query string
    def blast_string(method, db, qstring, options = nil)
      b = Blast.new(method, db, :qstring => qstring, :options => options)
      b.run!
      b
    end
  end
end
