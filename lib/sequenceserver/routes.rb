require 'json'
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

    # For any request that hits the app in development mode, log incoming
    # params.
    before do
      logger.debug params
    end

    # Renders search form.
    get '/' do
      erb :layout
    end

    get '/searchdata.json' do
      {database: Database.all, options: SequenceServer.config[:options]}.to_json
    end

    # Queues a search job and redirects to a page that will poll for and render
    # the results when available.
    post '/' do
      job = Job.create(params)
      redirect "/#{job.id}"
    end

    get '/:jid.json' do |jid|
      job = Job.fetch(jid)
      halt 202 unless job.done?
      rep = Report.generate job
      rep.to_json
    end

    # Retrieve data for the given search id.
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

      sequences = Sequence::Retriever.new(sequence_ids, database_ids,
                                          params[:download])

      send_file(sequences.file.path,
                :type     => sequences.mime,
                :filename => sequences.filename) if params[:download]

      sequences.to_json
    end

    # Download BLAST report in various formats.
    get '/download/:jid.:type' do |jid, type|
      job = Job.fetch(jid)
      out = BLAST::Formatter.new(job.rfile, type)
      send_file out.file.path, :filename => out.filename, :type => out.mime
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
