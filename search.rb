# search.rb
require 'rubygems'
require 'sinatra'
require 'tempfile'
require 'yaml'
require 'pp'

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

      puts "warning: no protein database found" if @db[ :protein ].empty?
      puts "warning: no nucleotide database found" if @db[ :nucleotide ].empty?
      fail "No formatted databases found!" if @db[ :protein ].empty?\
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
      # fail to include a leading '>sequenceIdentifer' no longer breaks blast, but leaves an empty query 
      # line in the blast report. lets replace it with info about the user
      sequence = '>Submitted_By_'+request.ip.to_s + '_at_' + Time.now.strftime("%Y-%m-%d-%H:%M:%S") + "\n" + sequence
    end
    sequence
  end

  def sequence_type(sequence)
    # returns Bio::Sequence::AA or Bio::Sequence::NA
    fasta_sequences = Bio::FlatFile.new(Bio::FastaFormat,StringIO.new(sequence))  # flatfile requires stream
    sequence_types  = fasta_sequences.collect { |seq| Bio::Sequence.guess(seq) }.uniq # get all sequence types
    case sequences_types.length
    when 0
      fail 'did not determine sequence type - should never happen'
    when 2..Infinity
      fail 'warning: query should only contain EITHER amino-acid OR nucleotide sequences'
    end
    sequence_types.first  # length is ==1
  end
end

# Initialize the blast server.
BlastServer.init
