# search.rb
require 'rubygems'
require 'sinatra'
require 'tempfile'
require 'yaml'
require 'bio'
require 'logger'
require 'pp'

ROOT     = File.dirname( __FILE__ )
Infinity = 1 / 0.0
$log     = Logger.new(STDOUT)     # I googled a bit but couldn't find how to send this stuff directly into WEBrick's logger
                                  # ok maybe http://github.com/kematzy/sinatra-logger  ...but yet another dependency?
# Helper module - initialize the blast server.
module BlastServer
  class << self
    # Path to the blast executables and database stored as a Hash.
    attr_accessor :blast, :db
    enable :session

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
      $log.info("Database directory: #{db_root} (actually: #{File.expand_path(db_root)})")

      # initialize @db
      # we could refactor with new: 'blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t"'
      Dir.glob( File.join( db_root, "**", "*.[np]in" ) ) do |file|
        fasta, format = split( file )
        title = get_db_title( fasta )
        if format == 'pin'
          $log.info("Found protein database: #{title} at #{fasta}")
          @db[ :protein ][ fasta ] = title
        elsif format == 'nin'
          $log.info("Found nucleotide database: #{title} at #{fasta}")
          @db[ :nucleotide ][ fasta ] = title
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

#get '/get_sequence/:sequenceids/:retreival_databases' do # multiple seqs separated by whitespace... all other chars exist in identifiers
# I have the feeling you need to spat for multiple dbs... that sucks.
get '/get_sequence/:*/:*' do
  params[ :sequenceids], params[ :retrieval_databases] = params["splat"] 
  sequenceids = params[ :sequenceids].split(/\s/)  
  $log.info('Getting: ' + sequenceids.to_s)
 
  # the results do not indicate which database a hit is from. 
  # Thus if several databases were used for blasting, we must check them all
  # if it works, refactor with "inject" or "collect"?
  found_sequences = ''
  retrieval_databases = params[ :retrieval_databases ].split(/\s/)
  raise ArgumentError, 'Nothing in params[ :retrieval_databases]. session info is lost?'  if retrieval_databases.nil?

  retrieval_databases.each do |database|     # we need to populate this session variable from the erb.
    begin
      found_sequences += sequence_from_blastdb(sequenceids, database)
    rescue 
      $log.debug('None of the following sequences: '+ sequenceids.to_s + ' found in '+ database)
    end
  end

  # just in case, checking we found right number of sequences
  if sequenceids.length != found_sequences.count('>')
    raise IOError, 'Wrong number of sequences found. Expecting: ' + sequenceids.to_s + '. Found: "' + found_sequences + '"'
  end
  found_sequences
end

helpers do
  def construct_query( seqfile )
    method = params[ :method ]

    ## we get two arrays: prot_database and nucl_database.... one must be empty. 
    ## actually no value is returned if empty... those we test ".nil?"
    raise ArgumentError, 'chose a single db type!' if params[ :prot_database].nil? == params[ :nucl_database].nil?
    db_type           = params[ :prot_database].nil?  ?            :nucleotide : :protein
    params[ :used_db] = (db_type == :protein)        ? params[ :prot_database] : params[ :nucl_database]
    
    legal_blast_search?(seqfile, method, db_type)  # quiet if ok; raises if bad     


    ##in the future, we will want to use ncbi's formatter (it gives more flexibility & can provide html). Eg: 
    ## blastp -db ./db/protein/Sinvicta2-2-3.prot.subset.fasta -query a.fasta  -outfmt 11 > a.asn1
    ## blast_formatter -archive ./a.asn1 -outfmt 2 -html # But now its too slow.
    "#{method} -db '#{params[ :used_db].join(' ')}' -query #{seqfile}"
  end

  def execute_query
    seqfile = Tempfile.new("seqfile")
    
    seqfile.puts( clean_sequence(params[ :sequence ]))
    seqfile.close

    result = execute_command_line("#{yield seqfile.path}")
    seqfile.delete

    '<pre><code>' +format_blast_results(result, params[ :used_db])+ '</pre></code>'  # put in a div?
  end

  def execute_command_line(command)
    $log.info('Will run: ' +command)
    result = %x|#{command}|    # what about stderr or failures?    
  end

  def clean_sequence(sequence)
    sequence.lstrip!  # removes leading whitespace
    if sequence[0] != '>'
      # forgetting the  leading '>sequenceIdentifer\n' no longer breaks blast, but leaves an empty query 
      # line in the blast report. lets replace it with info about the user
      sequence.insert(0, '>Submitted_By_'+request.ip.to_s + '_at_' + Time.now.strftime("%y%m%d-%H:%M:%S") + "\n")
    end
    return sequence
  end

  def sequence_type(sequence)
    # returns Bio::Sequence::AA or Bio::Sequence::NA
    fasta_sequences = Bio::FlatFile.new(Bio::FastaFormat,StringIO.new(sequence))  # flatfile requires stream
    sequence_types  = fasta_sequences.collect { |seq| Bio::Sequence.guess(seq) }.uniq # get all sequence types
    if sequence_types.length != 1
      raise ArgumentError, 'Cannot mix Aminoacids and Nucleotides. Queries include:' + sequence_types.to_s
    end
    return sequence_types.first # there is only one
  end

  def legal_blast_search?(input_fasta, blast_method, blast_db_type)
    # returns TRUE if everything is ok.
    legal_blast_methods = ['blastp', 'tblastn', 'blastn', 'tblastx', 'blastx']
    raise IOError, 'input_fasta missing:'   + input_fasta.to_s   if !File.exists?(input_fasta)     #unnecessary?
    raise IOError, 'undefined blast method...'                   if blast_method.nil?
    raise ArgumentError, 'wrong method : '  + blast_method.to_s  if !legal_blast_methods.include?(blast_method)
 
    # check if input_fasta is compatible within blast_method
    input_sequence_type = sequence_type(File.read(input_fasta))
    $log.debug('input seq type: ' + input_sequence_type.to_s)
    $log.debug('blast db type:  ' + blast_db_type)
    $log.debug('blast method:   ' + blast_method)


    if !blast_methods_for_query_type(input_sequence_type).include?(blast_method)
      raise ArgumentError, "Cannot #{blast_method} a #{input_sequence_type} query"
    end
    
    # check if blast_database_type is compatible with blast_method
    if !(database_type_for_blast_method(blast_method) == blast_db_type)
      raise ArgumentError, "Cannot #{blast_method} against a #{blast_db_type} database " + 
            "need " + database_type_for_blast_method(blast_method) 
    end      
    return TRUE
  end

  def blast_methods_for_query_type(seq_type)
    case seq_type.to_s # strangely using the class always put me into the else block...
    when Bio::Sequence::AA.to_s then return ['blastp', 'tblastn']
    when Bio::Sequence::NA.to_s then return ['blastn','tblastx','blastx']
    else raise ArgumentError, 'WTF? Whats this sequence type???' + seq_type.to_s
    end
  end

  def database_type_for_blast_method(blast_method)
    case blast_method
    when 'blastp'  then return :protein
    when 'blastx'  then return :protein
    when 'blastn'  then return :nucleotide
    when 'tblastx' then return :nucleotide
    when 'tblastn' then return :nucleotide
    else raise ArgumentError, "Don't know how to '#{blast_method}'"
    end
  end

  def sequence_from_blastdb(identifiers, db)  # helpful when displaying parsed blast results
    entries_to_get = identifiers           if identifiers.class == String
    entries_to_get = identifiers.join(',') if identifiers.class == Array
    raise ArgumentError, "No ids to fetch: #{identifiers.to_s}" if entries_to_get.empty?

    sequences = %x|blastdbcmd -db #{db} -entry #{entries_to_get} 2>&1|
    if sequences.include?("No valid entries to search") 
      raise ArgumentError, "Cannot find ids: #{entries_to_get} in #{db}." +\
                           "OR makeblastdb needs to be rerun with '-parse_seqids'"
    end

    sequences.chomp + "\n"  # fastaformat in a string - not sure blastdbcmd includes newline
  end

  def format_blast_results(result, databases_used)
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if !result.class == String 
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if result.empty?

    formatted_result = ''
    result.each_line do |line|
      if line.match(/^>\S/)  #if there is a space character right after the '>', the blastdb was not run with -parse_seqids
        puts line
        complete_id = line[/^>*(\S+)\s*.*/, 1]  # get id part
        id = complete_id.include?('|') ? complete_id.split('|')[1] : complete_id.split('|')[0]
        $log.info('substituted'+ id)
        link_to_fasta = "/get_sequence/:#{id}/:#{databases_used.join(' ')}" # several dbs... separate by ' '
        
        replacement_text_with_link  = "<a href='#{link_to_fasta}' title='Full #{id} FASTA sequence'>#{id}</a>"
        formatted_result += line.gsub(id, replacement_text_with_link)
      else
        formatted_result += line
      end
    end
    '<pre><code>' +formatted_result + '</pre></code>'  # should this be somehow put in a div?
  end
end


# Initialize the blast server.
BlastServer.init
7
