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

    configure :production do
      set :public_folder,
          lambda { File.join SequenceServer.root, 'public', 'dist' }
    end

    helpers do
      # Render an anchor element from the given Hash.
      #
      # See links.rb for example of a Hash object that will be rendered.
      def a(link)
        return unless link[:title] && link[:url]
        target = absolute?(link[:url]) && '_blank' || '_self'
        a =  %(<a href="#{link[:url]}" class="#{link[:class]}" \
target="#{target}">)
        a << %(<i class="fa #{link[:icon]}"></i> ) if link[:icon]
        a << "#{link[:title]}</a>"
      end

      # Is the given URI absolute? (or relative?)
      #
      # Returns false if nil is passed.
      def absolute?(uri)
        uri && URI.parse(uri).absolute?
      end

      # Prettify given data.
      def prettify(data)
        return prettify_tuple(data) if tuple? data
        return prettify_float(data) if float? data
        data
      end

      # Formats float as "a.bc" or "a x b^c". The latter if float is in
      # scientific notation. Former otherwise.
      def prettify_float(data)
        data.to_s.match(/(\d+\.\d+)e?([+-]\d+)?/)
        base  = Regexp.last_match[1]
        power = Regexp.last_match[2]
        s = format '%.2f', base
        s << " &times; 10<sup>#{power}</sup>" if power
        s
      end

      # Formats an array of two elements as "first (last)".
      def prettify_tuple(tuple)
        "#{tuple.first} (#{tuple.last})"
      end

      # Is the given value a tuple? (array of length two).
      def tuple?(data)
        data.is_a?(Array) && data.length == 2
      end

      def float?(data)
        data.is_a?(Float) ||
          (data.is_a?(String) && data =~ /(\d+\.\d+)e?([+-]\d+)?/)
      end
    end

    # For any request that hits the app in development mode, log incoming
    # params.
    before do
      logger.debug params
    end

    # Render the search form.
    get '/' do
      erb :search, :locals => { :databases => Database.group_by(&:type) }
    end

    # BLAST search!
    post '/' do
      erb :result, :locals => { :report => BLAST.run(params) }
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
    get '/download/:search_id.:type' do
      out = BLAST::Formatter.new(params[:search_id], params[:type])
      send_file out.file.path, :filename => out.filename, :type => out.mime
    end

    # This error block will only ever be hit if the user gives us a funny
    # sequence or incorrect advanced parameter. Well, we could hit this block
    # if someone is playing around with our HTTP API too.
    error BLAST::ArgumentError do
      status 400
      error = env['sinatra.error']
      erb :'400', :locals => { :error => error }
    end

    # This will catch any unhandled error and some very special errors. Ideally
    # we will never hit this block. If we do, there's a bug in SequenceServer
    # or something really weird going on. If we hit this error block we show
    # the stacktrace to the user requesting them to post the same to our Google
    # Group.
    error Exception, BLAST::RuntimeError do
      status 500
      error = env['sinatra.error']
      erb :'500', :locals => { :error => error }
    end
  end
end
