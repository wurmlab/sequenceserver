# search.rb
require 'rubygems'
require 'sinatra'
require 'tempfile'
require 'yaml'

ROOT = File.dirname( __FILE__ )

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
      case bin = config[ :bin ]
      when String
        fail "no such directory#{ bin }" unless Dir.exists?( bin )
      end

      # initialize @blast
      %w|blastn blastp blastx tblastn tblastx|.each do |method|
        command = bin ? File.join( bin, method ) : method
        fail "command #{command} not found" unless command?( command )
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
      fail "database not found or is not formatted" if @db[ :protein ].empty?\
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
      dbinfo = %x|blastdbcmd -info -db db/nucleotide/Sinvicta2-2-3.cdna.subset.fasta|
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
    seqfile.puts( params[ :sequence ] )
    seqfile.close

    result = %x|#{yield seqfile.path}|

    seqfile.delete
    result
  end
end

# Initialize the blast server.
BlastServer.init
