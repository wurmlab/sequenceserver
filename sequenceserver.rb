# sequenceserver.rb

unless RUBY_VERSION == "1.8.7"
  puts "Apologies, #{$1} requires ruby 1.8.7. You are running #{RUBY_VERSION}."
  puts "You may want to set up Ruby Version Manager."
  exit
end

require 'rubygems'
require 'sinatra/base'
require 'yaml'
require 'logger'
require 'lib/helpers'
require 'lib/blast.rb'
require 'lib/sequencehelpers.rb'
require 'lib/sinatralikeloggerformatter.rb'
require 'customisation'


# Helper module - initialize the blast server.
module SequenceServer
  class App < Sinatra::Base
    include Helpers
    include SequenceHelpers
    include SequenceServer::Customisation

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

    # Local, app configuration settings derived from config.yml.
    #
    # A config.yml should contain the settings described in the following
    # configure block as key, value pairs. See example.config.yml in the
    # installation directory.
    #
    # The app looks for config.yml in the the current working directory.
    # Sane defaults are assumed in the absence of a config.yml, or a
    # corresponding entry.
    configure do
      # store the settings hash from config.yml; further configuration values
      # are derived from it
      set :config,      {}

      # absolute path to the blast binaries
      #
      # A default of 'nil' is indicative of blast binaries being present in
      # system PATH.
      set :bin,         Proc.new{ File.expand_path(config['bin']) rescue nil }

      # absolute path to the database directory
      #
      # As a default use 'database' directory relative to current working
      # directory of the running app.
      set :database,    Proc.new{ File.expand_path((config['database'] or 'database')) }

      # the port number to run Sequence Server standalone
      set :port,        Proc.new{ (config['port'] or 4567).to_i }

      # number of threads to be used during blasting
      #
      # This option is passed directly to BLAST+. We use a default value of 1
      # as a higher value may cause BLAST+ to crash if it was not compiled with
      # threading support.
      set :num_threads, Proc.new{ (config['num_threads'] or 1).to_i }
    end

    # Lookup tables used by Sequence Server to pick up the right blast binary,
    # or database. These tables should be populated during app initialization
    # by scanning bin, and database directories.
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
        init
        super
      end
      
      # Initializes the blast server : executables, database. Exit if blast
      # executables, and databses can not be found. Logs the result if logging
      # has been enabled.
      def init
        # first read the user supplied configuration options
        self.config = parse_config

        # scan for blast binaries
        self.binaries = scan_blast_executables(bin).freeze

        # Log the discovery of binaries.
        binaries.each do |command, path|
          log.info("Found #{command} at #{path}")
        end

        # scan for blast database
        self.databases = scan_blast_db(database, binaries['blastdbcmd']).freeze

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

      # Parse config.yml, and return the resulting hash.
      #
      # This method uses YAML.load_file to read config.yml. Absence of a
      # config.yml is safely ignored as the app should then fall back on
      # default configuration values. Any other error raised by YAML.load_file
      # is not rescued.
      def parse_config
        return YAML.load_file( "config.yml" )
      rescue Errno::ENOENT
        log.warn("config.yml not found - will assume default settings")
        return {}
      end
    end

    get '/' do
      erb :search
    end

    post '/' do
      method        = params['method']
      db_type_param = params['db']
      sequence      = params[:sequence]

      # Raise ArgumentError if there is no database selected
      if db_type_param.nil?
        raise ArgumentError, "No BLAST database selected"
      end
      db_type = db_type_param.first.first

      # evaluate empty sequence as nil, otherwise as fasta
      sequence = sequence.empty? ? nil : to_fasta(sequence)
      
      # can not proceed if one of these is missing
      raise ArgumentError unless sequence and db_type and method
      settings.log.info("requested #{method} against #{db_type.to_s} database")

      # only allowed blast methods should be used
      blast_methods = %w|blastn blastp blastx tblastn tblastx|
      raise ArgumentError, "wrong method: #{method}" unless blast_methods.include?(method)

      # check if input_fasta is compatible with the selected blast method
      sequence_type       = type_of_sequences(sequence)
      settings.log.debug('sequence: ' + sequence)
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
      settings.log.debug('settings.databases:   ' + settings.databases.inspect)
      databases = params['db'][db_type].map{|index| 
        settings.databases[db_type][index.to_i].name
        } 
      dbs    = databases.join(' ')
      advanced_opts = params['advanced']

      raise ArgumentError, "Invalid advanced options" unless advanced_opts =~ /\A[a-z0-9\-_\. ']*\Z/i
      raise ArgumentError, "using -out is not allowed" if advanced_opts =~ /-out/i

      blast = Blast.blast_string(method, dbs, sequence, advanced_opts)

      # log the command that was run
      settings.log.info('Ran: ' + blast.command) if settings.logging

      @blast = format_blast_results(blast.result, databases)

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

    # Ensure a '>sequence_identifier\n' at the start of a sequence.
    #
    # An empty query line appears in the blast report if the leading
    # '>sequence_identifier\n' in the sequence is missing. We prepend
    # the input sequence with user info in such case.
    #
    #   > to_fasta("acgt")
    #   => 'Submitted_By_127.0.0.1_at_110214-15:33:34\nacgt'
    def to_fasta(sequence)
      sequence.lstrip!
      if sequence[0,1] != '>'
        ip   = request.ip.to_s 
        time = Time.now.strftime("%y%m%d-%H:%M:%S")
        sequence.insert(0, ">Submitted_By_#{ip}_at_#{time}\n")
      end
      return sequence
    end

    def format_blast_results(result, databases)
      raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if !result.class == String 
      raise ArgumentError, 'Problem: empty result! Maybe your query was invalid?' if result.empty?

      formatted_result    = ''
      all_retrievable_ids = []
      string_of_used_databases = databases.join(' ')
      result.each do |line|
        if line.match(/^>/) # If line to possibly replace
          formatted_result += construct_sequence_hyperline_line(line, databases, all_retrievable_ids)
        else
          formatted_result += line
        end
      end

      link_to_fasta_of_all = "/get_sequence/:#{all_retrievable_ids.join(' ')}/:#{string_of_used_databases}" #dbs must be sep by ' '
      retrieval_text       = all_retrievable_ids.empty? ? '' : "<p><a href='#{link_to_fasta_of_all}'>FASTA of #{all_retrievable_ids.length} retrievable hit(s)</a></p>"

      retrieval_text + '<pre><code>' + formatted_result + '</pre></code>'  # should this be somehow put in a div?
    end
    
    def construct_sequence_hyperline_line(line, databases, all_retrievable_ids)
      matches = line.match(/^(.+)/)
      sequence_id = matches[1] 
      
      link = nil
      
      # If a custom sequence hyperlink method has been defined,
      # use that.
      if self.respond_to?(:construct_custom_sequence_hyperlink)
        settings.log.debug("Using custom hyperlink creator with sequence #{sequence_id}")
        link = construct_custom_sequence_hyperlink(sequence_id)
      elsif line.match(/^>\S/) #if there is a space right after the '>', makeblastdb was run without -parse_seqids
        # By default, add a link to a fasta file of the sequence (if makeblastdb was called with -parse_seqids)
        complete_id = line[/^>*(\S+)\s*.*/, 1]  # get id part
        id = complete_id.include?('|') ? complete_id.split('|')[1] : complete_id.split('|')[0]
        all_retrievable_ids.push(id)
        
        link = "/get_sequence/:#{id}/:#{databases.join(' ')}" # several dbs... separate by ' '
      else
         # do nothing - link == nil means no link will be incorporated
      end
      
      # Return the BLAST output line with the link in it
      if link.nil?
        return line
      else
        settings.log.debug('Added link for: `'+ sequence_id +'\', '+ link)
        return replacement_text_with_link  = "<a href='#{link}'>#{sequence_id}</a>"
      end
    end

    at_exit { run! if $!.nil? and run? }
  end
end
