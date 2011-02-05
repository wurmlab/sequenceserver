# search.rb
require 'rubygems'
require 'sinatra/base'
require 'yaml'
require 'logger'
require 'lib/blast.rb'
require 'lib/sequencehelpers.rb'
require 'lib/systemhelpers.rb'
require 'lib/sinatralikeloggerformatter.rb'


# Helper module - initialize the blast server.
module SequenceServer
class App < Sinatra::Base
  include SequenceHelpers

  set :environment, :development
  #  set :environment, :production


  class Database < Struct.new("Database", :name, :title)
    def to_s
      "#{title} #{name}"
    end

    # Its not very meaningful to compare Database objects, however,
    # we still add the 'spaceship' operator to be able to sort the
    # databases by 'title', or 'name' for better visual presentation.
    # 
    # We use 'title' for comparison, while relying on 'name' as fallback.
    #
    # Trying to sort a list of dbs with 'title' set only for some of them
    # will obviously produce unpredictable sorting order.
    def <=>(other)
      if self.title and other.title
        self.title <=> other.title
      else
        self.name <=> other.name
      end
    end
  end

  LOG = Logger.new(STDOUT)
  LOG.formatter = SinatraLikeLogFormatter.new()

  configure(:development) do
    LOG.level     = Logger::DEBUG
    begin
      require 'sinatra/reloader'
      register Sinatra::Reloader
    rescue LoadError
      puts("** install sinatra-reloader gem for automatic reloading of code during development **\n\n")
    end
  end

  configure(:production) do
    LOG.level     = Logger::INFO
    error do
      erb :'500'
    end
    not_found do
      erb :'500'
    end
  end

  enable :session
  enable :logging

  set :run,        Proc.new { app_file == $0 }
  set :app_file,   __FILE__
  set :blasturl, 'http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download'

  class << self
    def run!(options={})
      init(config)
      super
    end

    # Initializes the blast server : executables, database. Exit if blast
    # executables, and databses can not be found. Logs the result if logging
    # has been enabled.
    def init(config = {})
      # scan system path as fallback
      bin = scan_blast_executables(config["bin"] || nil)
      bin = bin.freeze
      set :bin, bin

      # use 'db' relative to the current working directory as fallback
      db = scan_blast_db(config["db"] || 'db')
      db = db.freeze
      set :db, db
    rescue IOError => error
      LOG.fatal("Fail: #{error}")
      exit
    end

    # Returns a shell executable string corresponding to the given blast command.
    # Expects the path to blast binaries be set to 'nil' if the blast commands
    # are to be found in the sytem PATH.
    def executable(command)
      File.join(settings.bin, command) rescue command
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
      bin = File.expand_path(bin) rescue nil
      LOG.info("Config bin dir:          #{bin}")
      unless bin
        # search system path
        %w|blastn blastp blastx tblastn tblastx blastdbcmd|.each do |method|
          raise IOError, "You may need to install BLAST+ from: #{settings.blasturl}.
          And/or create a config.yml file that points to blast's 'bin' directory." unless SystemHelpers::command?( method )
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
    # * a hash of sorted blast databases grouped by database type:
    # protein, or nucleotide
    # ---
    # Raises:
    # * IOError - if no database can be found
    def scan_blast_db(db_root)
      db_root = File.expand_path(db_root)
      raise IOError, "Database directory doesn't exist: #{db_root}" unless File.directory?( db_root )
      LOG.info("Config database dir:     #{db_root}")

      blastdbcmd = executable('blastdbcmd')
      find_dbs_command = %|#{blastdbcmd} -recursive -list #{db_root} -list_outfmt "%p %f %t" 2>&1 |
        db_list = %x|#{find_dbs_command}|
        raise IOError, "No formatted blast databases found in '#{ db_root }' . \n"\
        "You may need to run 'makeblastdb' on some fasta files." if db_list.empty?

      if db_list.match(/BLAST Database error/)
        raise IOError, "Error parsing blast databases.\n" + "Tried: '#{find_dbs_command}'\n"+
          "It crashed with the following error: '#{db_list}'\n" +
          "Try reformatting databases using makeblastdb.\n"
      end


      db = {}

      db_list.each_line do |line|
        type, name, *title =  line.split(' ') 
        type = type.downcase
        name = name.freeze
        title = title.join(' ').freeze
        LOG.info("Found #{type} database: #{title} at #{name}")
        (db[type] ||= []) << Database.new(name, title)
      end


      # the erb would fail as calling nil.each_with_index if a dbtype was undefined. 
      db['protein']    = [] unless db.keys.include?('protein')
      db['nucleotide'] = [] unless db.keys.include?('nucleotide')

      # sort the list of dbs
      db['protein'].sort!
      db['nucleotide'].sort!

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

  end

  get '/' do
    erb :search
  end

  post '/' do
    method     = params['method']
    db_type    = params['db'].first.first
    sequence   = to_fasta(params[:sequence])

    # can not proceed if one of these is missing
    raise ArgumentError unless sequence and db_type and method
    LOG.info("requested #{method} against #{db_type.to_s} database")

    # only allowed blast methods should be used
    blast_methods = %w|blastn blastp blastx tblastn tblastx|
    raise ArgumentError, "wrong method: #{method}" unless blast_methods.include?(method)

    # check if input_fasta is compatible with the selected blast method
    sequence_type       = type_of_sequences(sequence)
    LOG.debug('input seq type: ' + sequence_type.to_s)
    LOG.debug('blast db type:  ' + db_type)
    LOG.debug('blast method:   ' + method)

    unless blast_methods_for(sequence_type).include?(method)
      raise ArgumentError, "Cannot #{method} a #{sequence_type} query."
    end

    # check if selected db is comaptible with the selected blast method
    allowed_db_type     = db_type_for(method)
    unless allowed_db_type.to_s == db_type
      raise ArgumentError, "Cannot #{method} against a #{db_type} database.
      Need #{allowed_db_type} database."
    end

    method = App.executable(method)
    dbs    = params['db'][db_type].map{|index| settings.db[db_type][index.to_i].name}.join(' ')
    advanced_opts = params['advanced']

    raise ArgumentError, "Invalid advanced options" unless advanced_opts =~ /\A[a-z0-9\-_\. ']*\Z/i
    raise ArgumentError, "using -out is not allowed" if advanced_opts =~ /-out/i

    blast = Blast.blast_string(method, dbs, sequence, advanced_opts)

    # log the command that was run
    LOG.info('Ran: ' + blast.command) if settings.logging

    @blast = format_blast_results(blast.result, dbs)

    erb :search
  end

  post '/ajax' do
    sequence   = to_fasta(params[:sequence])
    sequence_type       = type_of_sequences(sequence)
    sequence_type.to_s
  end

  #get '/get_sequence/:sequenceids/:retreival_databases' do # multiple seqs separated by whitespace... all other chars exist in identifiers
  # I have the feeling you need to spat for multiple dbs... that sucks.
  get '/get_sequence/:*/:*' do
    params[ :sequenceids], params[ :retrieval_databases] = params["splat"] 
    sequenceids = params[ :sequenceids].split(/\s/).uniq  # in a multi-blast query some may have been found multiply
    LOG.info('Getting: ' + sequenceids.join(' ') + ' for ' + request.ip.to_s)

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

  def to_fasta(sequence)
    sequence.lstrip!  # removes leading whitespace
    if sequence[0,1] != '>'
      # forgetting the  leading '>sequenceIdentifer\n' no longer breaks blast, but leaves an empty query 
      # line in the blast report. lets replace it with info about the user
      sequence.insert(0, '>Submitted_By_'+request.ip.to_s + '_at_' + Time.now.strftime("%y%m%d-%H:%M:%S") + "\n")
    end
    return sequence
  end

  def format_blast_results(result, string_of_used_databases)
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if !result.class == String 
    raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if result.empty?

    formatted_result    = ''
    all_retrievable_ids = []
    result.each do |line|
      if line.match(/^>\S/)  #if there is a space right after the '>', makeblastdb was run without -parse_seqids
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

  at_exit { run! if $!.nil? and run? }
end
end
