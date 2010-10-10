# search.rb
require 'rubygems'
require 'sinatra'
require 'tempfile'
require 'yaml'
require 'pp'  #only during development
require 'bio'

ROOT = File.dirname( __FILE__ )
Infinity = 1 / 0.0

# Helper module - initialize the blast server.
module BlastServer
  class << self
    # Path to the blast executables and database stored as a Hash.
    attr_accessor :blast, :db

    # Initializes the blast server : executables, database.
    def init
      init_cmd
      init_db
    end

    # Initializes blast executables. Assumes the path of blast executables to be
    # specified in config.yml or present in the system PATH. After this method is
    # called the executables for each blast method can be accessed by indexing the
    # hash returned by BlastServer.blast.
    #   >> BlastServer.blast[ :blastn ] => '/home/yeban/opt/ncbi-blast/bin/blastn'
    def init_cmd
      @blast ||= {}
      # check in config.yml for a path to the blast executables
      case bin = config[ "bin"]   ## sorry I couldnt figure out how to make the yaml work with config[ :bin]...
      when String
        fail "no such directory#{ bin }" unless Dir.exists?( bin )
      end

      # initialize @blast
      %w|blastn blastp blastx tblastn tblastx|.each do |method|
        command = bin ? File.join( bin, method ) : method
        fail "Cannot find: #{command}. Check path in config.yml" unless command?( command )
        @blast[ method ] = command
      end
    end

    # Initialize the blast database.
    def init_db
      @db ||= { :nucleotide => {}, :protein => {} }

      case db_root = config[ :db ]
      when nil # assume db in ./db
        db_root = File.join( ROOT, "db" )
        fail "no such directory: #{db_root}" unless File.exists?( db_root )
      when String # assume absolute db path
        fail "no such directory: #{db_root}" unless File.exists?( db_root )
      end

      # initialize @db
      Dir.glob( File.join( db_root, "**", "*.[np]in" ) ) do |file|
        fasta, format = split( file )
        title = get_db_title( fasta )
        if format == 'pin'
          @db[ :protein ][ title ] = fasta
        elsif format == 'nin'
          @db[ :nucleotide ][ title ] = fasta
        end
      end

      puts "warning: no protein database found"    if @db[ :protein ].empty?
      puts "warning: no nucleotide database found" if @db[ :nucleotide ].empty?
      fail "No formatted databases found!"         if @db[ :protein ].empty?\
        and @db[ :nucleotide ].empty?
    end

    # Load config.yml; return a Hash. The Hash is empty if config.yml does not exist.
    def config
      config = YAML.load_file( "config.yml" )
      fail "config.yml should return a hash" unless config.is_a?( Hash )
      return config
    rescue Errno::ENOENT
      puts "warning: config.yml not found - assuming default settings"
      return {}
    end

    # check if the given command exists and is executable
    def command?(command)
      system("which #{command}")
    end

    def split( file )
      index = file.index( /\.[pn]in$/ )
      [ file[0..index-1], file[ index+1..-1] ]
    end

    def get_db_title( fasta )
      dbinfo = %x|blastdbcmd -info -db #{fasta}|
      dbinfo.lines.first[10..-2]
    end
  end
end

get '/' do
  erb :search
end

post '/' do
  report = execute_query do |seqfile| 
    construct_query( seqfile )
  end

  report
end

helpers do
  def construct_query( seqfile )
    method = params[ :method ]

    puts 'must determine blast_database_type'
    blast_database_type = 'protein' ## this will need to be determined from GUI.
    legal_blast_search?(seqfile, method, blast_database_type)
    command = "#{method} -db #{BlastServer.db[ params[ :database ].to_sym ].first.last} -query #{seqfile}"
  end

  def execute_query
    seqfile = Tempfile.new("seqfile")
    
    seqfile.puts( clean_sequence(params[ :sequence ]))
    seqfile.close


    result = %x|#{yield seqfile.path}|

    seqfile.delete
    '<pre><code>' +result + '</pre></code>'  # should this be somehow put in a div?
  end

  def clean_sequence(sequence)
    sequence.lstrip!  # removes leading whitespace
    if sequence[0] != '>'
      # forgetting the  leading '>sequenceIdentifer\n' no longer breaks blast, but leaves an empty query 
      # line in the blast report. lets replace it with info about the user
      sequence.insert(0, '>Submitted_By_'+request.ip.to_s + '_at_' + Time.now.strftime("%y%m%d-%H:%M:%S") + "\n")
    end
    sequence
  end

  def sequence_type(sequence)
    # returns Bio::Sequence::AA or Bio::Sequence::NA
    fasta_sequences = Bio::FlatFile.new(Bio::FastaFormat,StringIO.new(sequence))  # flatfile requires stream
    sequence_types  = fasta_sequences.collect { |seq| Bio::Sequence.guess(seq) }.uniq # get all sequence types
    if sequence_types.length != 1
      fail 'cannot mix Aminoacids and Nucleotides. Queries include:' + sequence_types.to_s
    end
    sequence_types.first
  end

  def legal_blast_search?(input_fasta, blast_method, blast_db_type)
    # returns TRUE if everything is ok.
    legal_blast_methods = ['blastp', 'tblastn', 'blastn', 'tblastx', 'blastx']
    raise IOError, 'input_fasta missing:'   + input_fasta         if !File.exists?(input_fasta)     #unnecessary?
    raise ArgumentError, 'wrong method : '  + blast_method        if !legal_blast_methods.include?(blast_method)
 
    # check if input_fasta is compatible within blast_method
    input_fasta_string  = File.read(input_fasta)
    input_sequence_type = sequence_type(input_fasta_string)

    case input_sequence_type.to_s  # strangely using the class always put me into the else block...
    when Bio::Sequence::AA.to_s
      raise ArgumentError, "Can't #{blast_method} prot. query" if !['blastp', 'tblastn'].include?(blast_method)
    when Bio::Sequence::NA.to_s
      raise ArgumentError, "Can't #{blast_method} nucl. query" if !['blastn','tblastx','blastx'].include?(blast_method) 
    else 
      raise ArgumentError, 'WTF? Whats this sequence type???' + input_sequence_type.to_s
    end
    
    # check if blast_database_type is compatible with blast_method
    raise ArgumentError, 'wrong db type: ' + blast_database_type if !['protein', 'nucleotide'].include?(blast_db_type)
    case blast_db_type
    when :protein
      raise ArgumentError, "Can't #{blast_method} against prot. db" if !['blastp','blastx'].include?(blast_method)
    when :nucleotide
      raise ArgumentError, "Can't #{blast_method} against nucl. db" if !['blastn','tblastx','tblastn'].include?(blast_method)
    end
    TRUE
  end

end

# Initialize the blast server.
BlastServer.init
