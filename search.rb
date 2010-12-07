# search.rb
require 'rubygems'
require 'sinatra/base'
require 'tempfile'
require 'yaml'
require 'logger'
require 'pp'
require 'stringio'
require './lib/blast.rb'
require 'lib/sequencehelpers.rb'

# Helper module - initialize the blast server.
class SequenceServer < Sinatra::Base
  include SequenceHelpers

  class Database < Struct.new("Database", :name, :title)
    def to_s
      "#{title} #{name}"
    end
  end

  LOG = Logger.new(STDOUT)
  LOG.datetime_format = "%Y-%m-%d %H:%M:%S"  # to be more compact (and a little more like sinatra's)

  enable :session
  enable :logging

  set :root, File.dirname(__FILE__)
  set :blasturl, 'http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download'

  class << self
    def run!(options={})
      init(config)
      super
    end

    # Initializes the blast server : executables, database. Exit if blast
    # executables, and databses can not be found.
    def init(config = {})
      # scan system path as fallback
      bin = scan_blast_executables(config["bin"] || nil)
      bin = bin.freeze
      SequenceServer.set :bin, bin

      # use 'db' relative to the current working directory as fallback
      db = scan_blast_db(config["db"] || 'db')
      db = db.freeze
      SequenceServer.set :db, db
    rescue IOError => error
      LOG.fatal error
      exit
    end

    # Checks for the presence of blast executables. Assumes the executables
    # to be present in the bin directory passed to it, or in the sytem path.
    # ---
    # Arguments:
    # * bin(String) - path (relative/absolute) to the binaries
    # ---
    # Returns:
    # * absolute path to the blast executables directory, or empty
    # string (implies executables in the system path)
    # ---
    # Raises:
    # * IOError - if the executables can't be found
    def scan_blast_executables(bin)
      bin = File.expand_path(bin) rescue ''
      if bin.empty?
        # search system path
        %w|blastn blastp blastx tblastn tblastx blastdbcmd|.each do |method|
          raise IOError, "You may need to install BLAST+ from: #{settings.blasturl}.
          And/or create a config.yml file that points to blast's 'bin' directory." unless command?( method )
        end
      else
        # assume executables in bin
        raise IOError, "The directory '#{bin}' defined in config.yml doesn't exist." unless File.directory?( bin )
      end

      bin
    end

    # Scan the given directory for blast databases.
    # ---
    # Arguments:
    # * db_root(String) - path (relative/absolute) to the databases
    # ---
    # Returns:
    # * a hash of blast databases
    # ---
    # Raises:
    # * IOError - if no database can be found
    def scan_blast_db(db_root)
      db_root = File.expand_path(db_root)
      raise IOError, "Database directory doesn't exist: #{db_root}" unless File.directory?( db_root )

      db_list = %x|blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t"|
      raise IOError, "No formatted blast databases found! You may need to run 'makeblastdb' "\
        "on a fasta file in '#{ db_root }' ." if db_list.empty?

      db = {}

      db_list.each_line do |line|
        type, name, *title =  line.split(' ') 
        type = type.downcase
        name = name.freeze
        title = title.join(' ').freeze
        (db[type] ||= []) << Database.new(name, title)
        LOG.info("Found #{ type } database: '#{ title }' at #{ name }")
      end

      db 
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
    method = settings.bin + params[:method]
    db = selected_db_files
    sequence = to_fasta(params[:sequence])
    legal_blast_search?(sequence, method, selected_db_type)  # quiet if ok; raises if bad     
    blast = Blast.blast_string(method, db, sequence)

    # need to check for errors
    #if blast.success?
    LOG.info('Ran: ' + blast.command)
    '<pre><code>' + format_blast_results(blast.result, selected_db_files) + '</pre></code>'  # put in a div?
    #end
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
    '<pre><code>' + found_sequences + '</pre></code>'
  end

  # returns the type of selected databases - 'protein', or 'nucleotide'
  def selected_db_type
    params['db'].first.first
  end

  # returns a String of fasta files corresponding to the databases selected
  # eg. - 'Protein_foo.fasta Protein_moo.fasta'
  def selected_db_files
    type = selected_db_type
    params['db'][type].map{|index| settings.db[type][index.to_i].name}.join(' ')
  end

  def to_fasta(sequence)
    sequence.lstrip!  # removes leading whitespace
    if sequence[0] != '>'
      # forgetting the  leading '>sequenceIdentifer\n' no longer breaks blast, but leaves an empty query 
      # line in the blast report. lets replace it with info about the user
      sequence.insert(0, '>Submitted_By_'+request.ip.to_s + '_at_' + Time.now.strftime("%y%m%d-%H:%M:%S") + "\n")
    end
    return sequence
  end

  def legal_blast_search?(sequence, blast_method, blast_db_type)     # if ajax stuff is done correctly:checking that user didnt mix seuqences, and constrainind blast_methods_for_query_type and sequence_from_blastdb, then method is not required.
    # returns TRUE if everything is ok.
    legal_blast_methods = %w|blastn blastp blastx tblastn tblastx|
    #raise IOError, 'input_fasta missing:'   + input_fasta.to_s   if !File.exists?(input_fasta)     #unnecessary?
    raise IOError, 'undefined blast method...'                   if blast_method.nil?
    raise ArgumentError, 'wrong method : '  + blast_method.to_s  if !legal_blast_methods.include?(blast_method)

    # check if input_fasta is compatible within blast_method
    input_sequence_type = type_of_sequences(sequence)
    LOG.debug('input seq type: ' + input_sequence_type.to_s)
    LOG.debug('blast db type:  ' + blast_db_type.to_s)
    LOG.debug('blast method:   ' + blast_method)

    #if !blast_methods_for_query_type(input_sequence_type).include?(blast_method)
    #raise ArgumentError, "Cannot #{blast_method} a #{input_sequence_type} query"
    #end

    # check if blast_database_type is compatible with blast_method
    if !(db_type_for(blast_method).to_s == blast_db_type)
      raise ArgumentError, "Cannot #{blast_method} against a #{blast_db_type} database " + 
        "need " + db_type_for(blast_method).to_s
    end      
    return TRUE
  end

  def format_blast_results(result, string_of_used_databases)
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if !result.class == String 
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if result.empty?

    formatted_result    = ''
    all_retrievable_ids = []
    result.each do |line|
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

    retrieval_text + '<pre><code>' + formatted_result + '</pre></code>'  # should this be somehow put in a div?
  end

end

SequenceServer.run! if __FILE__ == $0
