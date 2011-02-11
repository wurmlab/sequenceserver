# search.rb
require 'rubygems'
require 'sinatra/base'
require 'yaml'
require 'logger'
require 'lib/helpers'
require 'lib/blast.rb'
require 'lib/sequencehelpers.rb'
require 'lib/sinatralikeloggerformatter.rb'


# Helper module - initialize the blast server.
module SequenceServer
  class App < Sinatra::Base
    include Helpers
    include SequenceHelpers

    # Basic configuration settings for app.
    configure do
      # enable some builtin goodies
      enable :session, :logging

      # base setting; Sinatra can then figure :root, :public, and :views itself
      set :app_file,   __FILE__

      # run with builin server when invoked directly (ruby search.rb)
      set :run,        Proc.new { app_file == $0 }

      set :log,        Proc.new { Logger.new(STDOUT) }
      log.formatter = SinatraLikeLogFormatter.new()

      set :environment, :development
      #set :environment, :production
    end

    # These are build based on the values read from config.yml.
    configure do
      # blast methods (executables) and their corresponding absolute path
      set :binaries,  {}

      # list of sorted blast databases grouped by databse type:
      # 'protein', or 'nucleotide'
      set :databases, {}
    end

    configure(:development) do
      log.level     = Logger::DEBUG
      begin
        require 'sinatra/reloader'
        register Sinatra::Reloader
      rescue LoadError
        puts("** install sinatra-reloader gem for automatic reloading of code during development **\n\n")
      end
    end

    configure(:production) do
      log.level     = Logger::INFO
      error do
        erb :'500'
      end
      not_found do
        erb :'500'
      end
    end

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
        self.binaries = scan_blast_executables(config["bin"] || nil).freeze

        # Log the discovery of binaries.
        binaries.each do |command, path|
          log.info("Found #{command} at #{path}")
        end

        # use 'db' relative to the current working directory as fallback
        self.databases = scan_blast_db(config["db"] || 'db').freeze

        # Log the discovery of databases.
        databases.each do |type, dbs|
          dbs.each do |d|
            log.info("Found #{type} database: #{d.title} at #{d.name}")
          end
        end
      rescue IOError => error
        log.fatal("Fail: #{error}")
        exit
      end

      # Load config.yml; return a Hash. The Hash is empty if config.yml does not exist.
      def config
        config = YAML.load_file( "config.yml" )
        raise IOError, "config.yml should return a hash" unless config.is_a?( Hash )
        return config
      rescue Errno::ENOENT
        log.warn("config.yml not found - assuming default settings")
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
      settings.log.info("requested #{method} against #{db_type.to_s} database")

      # only allowed blast methods should be used
      blast_methods = %w|blastn blastp blastx tblastn tblastx|
      raise ArgumentError, "wrong method: #{method}" unless blast_methods.include?(method)

      # check if input_fasta is compatible with the selected blast method
      sequence_type       = type_of_sequences(sequence)
      settings.log.debug('input seq type: ' + sequence_type.to_s)
      settings.log.debug('blast db type:  ' + db_type)
      settings.log.debug('blast method:   ' + method)

      unless blast_methods_for(sequence_type).include?(method)
        raise ArgumentError, "Cannot #{method} a #{sequence_type} query."
      end

      # check if selected db is comaptible with the selected blast method
      allowed_db_type     = db_type_for(method)
      unless allowed_db_type.to_s == db_type
        raise ArgumentError, "Cannot #{method} against a #{db_type} database.
      Need #{allowed_db_type} database."
      end

      method = settings.binaries[ method ]
      dbs    = params['db'][db_type].map{|index| settings.databases[db_type][index.to_i].name}.join(' ')
      advanced_opts = params['advanced']

      raise ArgumentError, "Invalid advanced options" unless advanced_opts =~ /\A[a-z0-9\-_\. ']*\Z/i
      raise ArgumentError, "using -out is not allowed" if advanced_opts =~ /-out/i

      blast = Blast.blast_string(method, dbs, sequence, advanced_opts)

      # log the command that was run
      settings.log.info('Ran: ' + blast.command) if settings.logging

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
      settings.log.info('Getting: ' + sequenceids.join(' ') + ' for ' + request.ip.to_s)

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
          settings.log.debug('None of the following sequences: '+ sequenceids.to_s + ' found in '+ database)
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
          settings.log.debug('Added link for: '+ id)
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
