require 'json'
require 'tilt/erb'
require 'sinatra/base'

module SequenceServer
  # Controller.
  class Routes < Sinatra::Base
    # See
    # http://www.sinatrarb.com/configuration.html
    configure do
      # We don't need Rack::MethodOverride. Let's avoid the overhead.
      disable :method_override

      # Ensure exceptions never leak out of the app. Exceptions raised within
      # the app must be handled by the app. We do this by attaching error
      # blocks to exceptions we know how to handle and attaching to Exception
      # as fallback.
      disable :show_exceptions, :raise_errors

      # Make it a policy to dump to 'rack.errors' any exception raised by the
      # app so that error handlers don't have to do it themselves. But for it
      # to always work, Exceptions defined by us should not respond to `code`
      # or `http_status` methods. Error blocks must explicitly set http
      # status, if needed, by calling `status` method.
      enable :dump_errors

      # We don't want Sinatra do setup any loggers for us. We will use our own.
      set :logging, nil
    end

    # See
    # http://www.sinatrarb.com/intro.html#Mime%20Types
    configure do
      mime_type :fasta, 'text/fasta'
      mime_type :xml,   'text/xml'
      mime_type :tsv,   'text/tsv'
    end

    configure do
      # Public, and views directory will be found here.
      set :root, lambda { SequenceServer.root }

      # Allow :frame_options to be configured for Rack::Protection.
      #
      # By default _any website_ can embed SequenceServer in an iframe. To
      # change this, set `:frame_options` config to :deny, :sameorigin, or
      # 'ALLOW-FROM uri'.
      set :protection, lambda {
        frame_options = SequenceServer.config[:frame_options]
        frame_options && { :frame_options => frame_options }
      }
    end

    # For any request that hits the app,  log incoming params at debug level.
    before do
      logger.debug params
    end

    # Returns base HTML. Rest happens client-side: rendering the search form.
    get '/' do
      erb :layout
    end

    # Returns data that is used to render the search form client side. These
    # include available databases and user-defined search options.
    get '/searchdata.json' do
      searchdata = {
        database: Database.all,
        options: SequenceServer.config[:options]
      }
      if params[:query]
        # if the url contains a query param (query=seqid1:start-stop,seqid2:start-stop)
        # parse the sequence ids and retrieve the sequences to be added to the textarea
        # by updating query state in search.js.
        #
        # Have to check both database types as we don't know what type of id we have and
        # blastdbcmd throws an error if given a set of databases with mixed type.
        #
        # Loop through query sequences one-by-one to allow us to specify range and catch
        # individual identifiers that cannot be found.
        databases = Database.all.select { |x| x.type == 'protein' }
        protein_database_ids = databases.map { |x| x.id }
        databases = Database.all.select { |x| x.type == 'nucleotide' }
        nucleotide_database_ids = databases.map { |x| x.id }
        retrieved_seqs = {}
        sequences = params[:query].split(',')
        sequences.each do |sequence|
          sequence_id,range = sequence.split(':')
          new_seqs = {}
          begin
            new_seqs = Sequence::Retriever.new(sequence_id, protein_database_ids,false,range).to_hash
          rescue
            begin
              new_seqs = Sequence::Retriever.new(sequence_id, nucleotide_database_ids,false,range).to_hash
            rescue
              # will get here if no sequence matched the provided identifier
              new_seqs = { :error_msgs=> [ "You requested a sequence with the identifier "+sequence_id+" but no matching sequences were found." ] }
            end
          end
          retrieved_seqs = retrieved_seqs.merge( new_seqs ){ |k,a,b| a + b }
        end
        searchdata = searchdata.merge( { query: retrieved_seqs } )
      end
      searchdata.to_json
    end

    # Queues a search job and redirects to `/:jid`.
    post '/' do
      if params[:input_sequence]
        @input_sequence = params[:input_sequence]
        erb :layout
      else
        job = Job.create(params)
        redirect "/#{job.id}"
      end
    end

    # Returns results for the given job id in JSON format.  Returns 202 with
    # an empty body if the job hasn't finished yet.
    get '/:jid.json' do |jid|
      job = Job.fetch(jid)
      halt 202 unless job.done?
      rep = Report.generate job
      rep.to_json
    end

    # Returns base HTML. Rest happens client-side: polling for and rendering
    # the results.
    get '/:jid' do |jid|
      erb :layout
    end

    # @params sequence_ids: whitespace separated list of sequence ids to
    # retrieve
    # @params database_ids: whitespace separated list of database ids to
    # retrieve the sequence from.
    # @params download: whether to return raw response or initiate file
    # download
    #
    # Use whitespace to separate entries in sequence_ids (all other chars exist
    # in identifiers) and retreival_databases (we don't allow whitespace in a
    # database's name, so it's safe).
    get '/get_sequence/' do
      sequence_ids = params[:sequence_ids].split(/\s/)
      database_ids = params[:database_ids].split(/\s/)
      sequences = Sequence::Retriever.new(sequence_ids, database_ids)
      sequences.to_json
    end

    post '/get_sequence' do
      sequence_ids = params["sequence_ids"].split(",")
      database_ids = params["database_ids"].split(",")
      sequences = Sequence::Retriever.new(sequence_ids, database_ids, true)
      send_file(sequences.file.path,
                :type     => sequences.mime,
                :filename => sequences.filename)
    end

    # Download BLAST report in various formats.
    get '/download/:jid.:type' do |jid, type|
      job = Job.fetch(jid)
      out = BLAST::Formatter.new(job.rfile, type)
      send_file out.file, :filename => out.filename, :type => out.mime
    end

    # This error block will only ever be hit if the user gives us a funny
    # sequence or incorrect advanced parameter. Well, we could hit this block
    # if someone is playing around with our HTTP API too.
    error BLAST::ArgumentError do
      status 400
      error = env['sinatra.error']
      erb :'400', :layout => nil, :locals => { :error => error }
    end

    # This will catch any unhandled error and some very special errors. Ideally
    # we will never hit this block. If we do, there's a bug in SequenceServer
    # or something really weird going on. If we hit this error block we show
    # the stacktrace to the user requesting them to post the same to our Google
    # Group.
    error Exception, BLAST::RuntimeError do
      status 500
      error = env['sinatra.error']
      erb :'500', :layout => nil, :locals => { :error => error }
    end
  end
end
