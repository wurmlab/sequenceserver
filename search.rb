# search.rb
require 'rubygems'
require 'sinatra/base'
require 'tempfile'
require 'yaml'
require 'bio'
require 'logger'
require 'pp'
require 'stringio'

BLASTURL = 'http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download'
ROOT     = File.dirname( __FILE__ )
Infinity = 1 / 0.0
LOG      = Logger.new(STDOUT)

# Helper module - initialize the blast server.
class SequenceServer < Sinatra::Base
  enable :session

  class << self
    # Path to the blast executables and database stored as a Hash.
    attr_accessor :blast

    def db
      @db ||= Hash.new {|hash, key| hash[key] = []}
    end
    private :db

    def add_db(type, name, title = nil)
      db[type] << [name, title]
    end

    def get_db(type, key = nil)
      return db unless type
      return db[type] unless key
      key.is_a?(Integer) ?  db[type][key] : db[type].assoc(key) #or, nil
    end

    def db_name(type, key = nil)
      return type.first unless key
      get_db(type, key).first
    end

    def db_title(type, key = nil)
      return type.last unless key
      db(type, key).last
    end

    # Initializes the blast server : executables, database.
    def run!(options={})
      init_cmd
      init_db
      super
    rescue  => error
      LOG.fatal("Sorry, cannot run #{ __FILE__ }: #{ error }")
      exit
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
        raise IOError, "The directory '#{ bin }' defined in config.yml doesn't exist." unless Dir.exists?( bin )
      end

      # initialize @blast
      %w|blastn blastp blastx tblastn tblastx blastdbcmd|.each do |method|
        command = bin ? File.join( bin, method ) : method
        raise IOError, "Sorry, cannot execute the command:  '#{ command }'.  \n" +
                       "You may need to install BLAST+ from: #{ BLASTURL } . \n" +
                       "And/or create a config.yml file that points to blast's 'bin' directory." \
              unless command?( command )
        LOG.info("Found: #{ command }")
        @blast[ method ] = command
      end
    end

    # Initialize the blast database.
    def init_db
      case db_root = config[ :db ]
      when nil # assume db in ./db
        db_root = File.join( ROOT, "db" )
        raise IOError, "Database directory doesn't exist: #{db_root}" unless File.exists?( db_root )
      when String # assume absolute db path
        raise IOError, "Database directory doesn't exist: #{db_root}" unless File.exists?( db_root )
      end
      LOG.info("Database directory: #{db_root} (actually: #{File.expand_path(db_root)})")

      # initialize @db
      # we could refactor with new: 'blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t"'
      %x|blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t"|.each_line do |line|
        type, name, *title =  line.split(' ') 
        type = type.downcase.to_sym
        name = name.freeze
        title = title.join(' ').freeze
        LOG.info("Found #{ type } database: '#{ title }' at #{ name }")
        add_db(type, name, title)
      end

      raise IOError, "No formatted blast databases found! You may need to run 'makeblastdb' "\
                     "on a fasta file in '#{ db_root }' ." if get_db(nil).empty?
      LOG.warn("No protein databases found")               if get_db(:protein).empty?
      LOG.warn("No nucleotide databases found")            if get_db(:nucleotide).empty?
    end

    # Load config.yml; return a Hash. The Hash is empty if config.yml does not exist.
    def config
      config = YAML.load_file( "config.yml" )
      raise IOError, "config.yml should return a hash" unless config.is_a?( Hash )
      return config
    rescue Errno::ENOENT
      LOG.warn("config.yml not found - assuming default settings")
      return {}
    end

    # check if the given command exists and is executable
    def command?(command)
      system("which #{command} > /dev/null 2>&1")
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
    sequenceids = params[ :sequenceids].split(/\s/).uniq  # in a multi-blast query some may have been found multiply
    LOG.info('Getting: ' + sequenceids.to_s)

    # the results do not indicate which database a hit is from. 
    # Thus if several databases were used for blasting, we must check them all
    # if it works, refactor with "inject" or "collect"?
    found_sequences     = ''
    retrieval_databases = params[ :retrieval_databases ].split(/\s/)  

    raise ArgumentError, 'Nothing in params[ :retrieval_databases]. session info is lost?'  if retrieval_databases.nil?

    retrieval_databases.each do |database|     # we need to populate this session variable from the erb.
      begin
        found_sequences += sequence_from_blastdb(sequenceids, database)
      rescue 
        LOG.debug('None of the following sequences: '+ sequenceids.to_s + ' found in '+ database)
      end
    end

    # just in case, checking we found right number of sequences
    if sequenceids.length != found_sequences.count('>')
      raise IOError, 'Wrong number of sequences found. Expecting: ' + sequenceids.to_s + '. Found: "' + found_sequences + '"'
    end
    found_sequences
  end

  # if protein databases, say 'protein foo', and 'protein moo' were selected,
  # return - ['protein', ['protein foo', 'protein moo']]
  def selected_db
    # params['db'] should contain only one entry
    params['db'].first
  end

  # returns, type of selected databases, as a symbol
  # in the above example - :protein
  def selected_db_type
    params['db'].first.first.to_sym
  end

  # return a string of fasta files corresponding to the dbs selected
  # eg. - 'Protein_foo.fasta Protein_moo.fasta'
  def selected_db_files
    type = selected_db_type
    return params[:db][type].map {|key| SequenceServer.db_name(type, key.to_i)}.join(' ')
  end

  def construct_query( seqfile )
    method = params[ :method ]

    legal_blast_search?(seqfile, method, selected_db_type)  # quiet if ok; raises if bad     

    ##in the future, we will want to use ncbi's formatter (it gives more flexibility & can provide html). Eg: 
    ## blastp -db ./db/protein/Sinvicta2-2-3.prot.subset.fasta -query a.fasta  -outfmt 11 > a.asn1
    ## blast_formatter -archive ./a.asn1 -outfmt 2 -html # But now its too slow.
    "#{method} -db '#{selected_db_files}' -query #{seqfile}"
  end

  def execute_query
    seqfile = Tempfile.new("seqfile")
    
    seqfile.puts( clean_sequence(params[ :sequence ]))
    seqfile.close

    result = execute_command_line("#{yield seqfile.path}")
    puts result
    seqfile.delete

    '<pre><code>' +format_blast_results(result, selected_db_files)+ '</pre></code>'  # put in a div?
  end

  def execute_command_line(command)
    LOG.info('Will run: ' +command)
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
    puts sequence_types.first
    return sequence_types.first # there is only one
  end

  def legal_blast_search?(input_fasta, blast_method, blast_db_type)
    # returns TRUE if everything is ok.
    # legal_blast_methods = ['blastp', 'tblastn', 'blastn', 'tblastx', 'blastx']
    legal_blast_methods = SequenceServer.blast.keys
    #raise IOError, 'input_fasta missing:'   + input_fasta.to_s   if !File.exists?(input_fasta)     #unnecessary?
    raise IOError, 'undefined blast method...'                   if blast_method.nil?
    raise ArgumentError, 'wrong method : '  + blast_method.to_s  if !legal_blast_methods.include?(blast_method)
 
    # check if input_fasta is compatible within blast_method
    input_sequence_type = sequence_type(File.read(input_fasta))
    LOG.debug('input seq type: ' + input_sequence_type.to_s)
    LOG.debug('blast db type:  ' + blast_db_type.to_s)
    LOG.debug('blast method:   ' + blast_method)


    #if !blast_methods_for_query_type(input_sequence_type).include?(blast_method)
      #raise ArgumentError, "Cannot #{blast_method} a #{input_sequence_type} query"
    #end
    
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

  def format_blast_results(result, string_of_used_databases)
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if !result.class == String 
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if result.empty?

    formatted_result    = ''
    all_retrievable_ids = []
    result.each_line do |line|
      if line.match(/^>\S/)  #if there is a space right after the '>', makeblastdb was run without -parse_seqids
        puts line
        complete_id = line[/^>*(\S+)\s*.*/, 1]  # get id part
        id = complete_id.include?('|') ? complete_id.split('|')[1] : complete_id.split('|')[0]
        all_retrievable_ids.push(id)
        LOG.debug('Added link for: '+ id)
        link_to_fasta = "/get_sequence/:#{id}/:#{string_of_used_databases}" # several dbs... separate by ' '
        
        replacement_text_with_link  = "<a href='#{link_to_fasta}' title='Full #{id} FASTA sequence'>#{id}</a>"
        formatted_result += line.gsub(id, replacement_text_with_link)
      else
        formatted_result += line
      end
    end

    link_to_fasta_of_all = "/get_sequence/:#{all_retrievable_ids.join(' ')}/:#{string_of_used_databases}" #dbs must be sep by ' '
    retrieval_text       = all_retrievable_ids.empty? ? '' : "<p><a href='#{link_to_fasta_of_all}'>FASTA of #{all_retrievable_ids.length} retrievable hit(s)</a></p>"

    retrieval_text + '<pre><code>' +formatted_result + '</pre></code>'  # should this be somehow put in a div?
  end
end

SequenceServer.run!
