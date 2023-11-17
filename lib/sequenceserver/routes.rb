require 'json'
require 'tilt/erb'
require 'sinatra/base'

require 'sequenceserver/job'
require 'sequenceserver/blast'
require 'sequenceserver/report'
require 'sequenceserver/database'
require 'sequenceserver/sequence'
require 'sequenceserver/makeblastdb'

module SequenceServer
  # Controller.
  class Routes < Sinatra::Base
    # See
    # http://www.sinatrarb.com/configuration.html
    configure do
      # We don't need Rack::MethodOverride. Let's avoid the overhead.
      disable :method_override

      # Ensure exceptions never leak out of the app. Exceptions raised within
      # the app must be handled by the app.
      disable :show_exceptions, :raise_errors

      # Make it a policy to dump to 'rack.errors' any exception raised by the
      # app.
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
      set :root, File.join(__dir__, '..', '..')

      # Allow :frame_options to be configured for Rack::Protection.
      #
      # By default _any website_ can embed SequenceServer in an iframe. To
      # change this, set `:frame_options` config to :deny, :sameorigin, or
      # 'ALLOW-FROM uri'.
      set :protection, lambda {
        frame_options = SequenceServer.config[:frame_options]
        frame_options && { frame_options: frame_options }
      }

      # Serve compressed responses.
      use Rack::Deflater
    end

    # For any request that hits the app,  log incoming params at debug level.
    before do
      logger.debug params
    end

    # Set JSON content type for JSON endpoints.
    before '*.json' do
      content_type 'application/json'
    end

    # Returns base HTML. Rest happens client-side: rendering the search form.
    get '/blast/' do
      erb :search, layout: true
    end

    # Returns data that is used to render the search form client side. These
    # include available databases and user-defined search options.
    get '/blast/:segment1/searchdata.json' do
      puts params
      #Database.reset
      searchdata = {
        query: Database.retrieve(params[:query]),
        database: Database.all,
        options: Database.config[:options]
      }

      if SequenceServer.config[:databases_widget] == 'tree'
        searchdata.update(tree: Database.tree)
      end

      # If a job_id is specified, update searchdata from job meta data (i.e.,
      # query, pre-selected databases, advanced options used). Query is only
      # updated if params[:query] is not specified.
      update_searchdata_from_job(searchdata) if params[:job_id]

      searchdata.to_json
    end

    # Queues a search job and redirects to `/:jid`.
    post '/blast/:segment1/:segment2' do
      if params[:input_sequence]
        @input_sequence = params[:input_sequence]
        erb :search, layout: true
      else
        job = Job.create(params)
        redirect to("/blast/" + params[:segment1] + "/" + params[:segment2] + "/#{job.id}")
      end
    end

    # Returns results for the given job id in JSON format.  Returns 202 with
    # an empty body if the job hasn't finished yet.
    get '/blast/:segment1/:segment2/:jid.json' do
      jid = params[:jid]
      job = Job.fetch(jid)
      halt 202 unless job.done?
      Report.generate(job).to_json
    end

    # Returns base HTML. Rest happens client-side: polling for and rendering
    # the results.
    get '/blast/:segment1/:segment2/:jid' do
      erb :report, layout: true
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
    get '/blast/:segment1/:segment2/get_sequence/' do
      sequence_ids = params[:sequence_ids].split(',')
      database_ids = params[:database_ids].split(',')
      sequences = Sequence::Retriever.new(sequence_ids, database_ids)
      sequences.to_json
    end

    post '/blast/:segment1/:segment2/get_sequence' do
      sequence_ids = params['sequence_ids'].split(',')
      database_ids = params['database_ids'].split(',')
      sequences = Sequence::Retriever.new(sequence_ids, database_ids, true)
      send_file(sequences.file.path,
                type:     sequences.mime,
                filename: sequences.filename)
    end

    # Download BLAST report in various formats.
    get '/blast/:segment1/:segment2/download/:jid.:type' do
      jid = params["jid"]
      type = params["type"]
      job = Job.fetch(jid)
      out = BLAST::Formatter.new(job, type)
      send_file out.file, filename: out.filename, type: out.mime
    end

    get '/blast/fonts/*' do |file|
      puts "static font file"
      # Combine with the base directory
      file_path = File.join(settings.root, 'public', 'fonts', file)
      # Check if the file exists
      if File.exist?(file_path)
        send_file file_path, disposition: :inline
      else
        # Handle case when file doesn't exist
        status 404
        'File not found'
      end
    end

    get '/blast/css/*' do |file|
      puts "static css file"
      # Combine with the base directory
      file_path = File.join(settings.root, 'public', 'css', file)
      # Check if the file exists
      if File.exist?(file_path)
        send_file file_path, disposition: :inline
      else
        # Handle case when file doesn't exist
        status 404
        'File not found'
      end
    end

    get '/blast/:segment1/:segment2/?' do
      env_database_dir = "/db/" + params[:segment1] + "/" + params[:segment2] + "/databases/"
      makeblastdb(env_database_dir).scan
      
      fail NO_BLAST_DATABASE_FOUND, env_database_dir if !makeblastdb(env_database_dir).any_formatted?
      Database.collection = makeblastdb(env_database_dir).formatted_fastas
      Database.each do |database|
        logger.debug "Found #{database.type} database '#{database.title}' at '#{database.path}'"
        if database.non_parse_seqids?
          logger.warn "Database '#{database.title}' was created without using the" \
                      ' -parse_seqids option of makeblastdb. FASTA download will' \
                      " not work correctly (path: '#{database.path}')."
        elsif database.v4?
          logger.warn "Database '#{database.title}' is of older format. Mixing" \
                      ' old and new format databases can be problematic' \
                      "(path: '#{database.path}')."
        end
      end
      erb :search, layout: true
    end

    get '/blast/*' do |file|
      # Combine with the base directory
      # Check if `settings` is nil
      if settings.nil?
        status 500
        return 'Internal Server Error'
      end
      file_path = File.join(settings.root, 'public', file)

      # Check if the file exists
      if File.exist?(file_path)
        send_file file_path, disposition: :inline
      else
        puts "file does not exist"
        # Handle case when file doesn't exist
        status 404
        'File not found'
      end
    end
    # Catches any exception raised within the app and returns JSON
    # representation of the error:
    # {
    #    title: ...,     // plain text
    #    message: ...,   // plain or HTML text
    #    more_info: ..., // pre-formatted text
    # }
    #
    # If the error class defines `http_status` instance method, its return
    # value will be used to set HTTP status. HTTP status is set to 500
    # otherwise.
    #
    # If the error class defines `title` instance method, its return value
    # will be used as title. Otherwise name of the error class is used as
    # title.
    #
    # All error classes should define `message` instance method that provides
    # a short and simple explanation of the error.
    #
    # If the error class defines `more_info` instance method, its return value
    # will be used as more_info, otherwise `backtrace.join("\n")` is used as
    # more_info.
    error 400..500 do
      error = env['sinatra.error']

      # All errors will have a message.
      error_data = { message: error.message }

      # If error object has a title method, use that, or use name of the
      # error class as title.
      error_data[:title] = if error.respond_to? :title
                             error.title
                           else
                             error.class.name
                           end

      # If error object has a more_info method, use that. If the error does not
      # have more_info, use backtrace.join("\n") as more_info.
      if error.respond_to? :more_info
        error_data[:more_info] = error.more_info
      elsif error.respond_to? :backtrace
        error_data[:more_info] = error.backtrace.join("\n")
      end

      error_data.to_json
    end

    # Get the query sequences, selected databases, and advanced params used.
    def update_searchdata_from_job(searchdata)
      job = Job.fetch(params[:job_id])
      return if job.imported_xml_file

      # Only read job.qfile if we are not going to use Database.retrieve.
      searchdata[:query] = File.read(job.qfile) if !params[:query]

      # Which databases to pre-select.
      searchdata[:preSelectedDbs] = job.databases

      # job.advanced may be nil in case of old jobs. In this case, we do not
      # override searchdata so that default advanced parameters can be applied.
      # Note that, job.advanced will be an empty string if a user deletes the
      # default advanced parameters from the advanced params input field. In
      # this case, we do want the advanced params input field to be empty when
      # the user hits the back button. Thus we do not test for empty string.
      method = job.method.to_sym
      if job.advanced && job.advanced !=
           searchdata[:options][method][:default].join(' ')
        searchdata[:options] = searchdata[:options].deep_copy
        searchdata[:options][method]['last search'] = [job.advanced]
      end
    end

    def makeblastdb(database_dir)
      @makeblastdb ||= MAKEBLASTDB.new(database_dir)
    end
  end
end
