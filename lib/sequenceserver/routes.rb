require 'json'
require 'tilt/erb'
require 'sinatra/base'
require 'rest-client'

require 'sequenceserver/job'
require 'sequenceserver/blast'
require 'sequenceserver/report'
require 'sequenceserver/database'
require 'sequenceserver/sequence'

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

      # Override in config.ru if the instance is served under a subpath
      # e.g. for example.org/our-sequenceserver set to '/our-sequenceserver'
      set :root_path_prefix, ''
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
    end

    unless ENV['SEQUENCE_SERVER_COMPRESS_RESPONSES'] == 'false'
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
    get '/' do
      erb :search, layout: true
    end

    # Returns data that is used to render the search form client side. These
    # include available databases and user-defined search options.
    get '/searchdata.json' do
      searchdata = {
        query: Database.retrieve(params[:query]),
        database: Database.all,
        options: SequenceServer.config[:options]
      }

      searchdata.update(tree: Database.tree) if SequenceServer.config[:databases_widget] == 'tree'

      # If a job_id is specified, update searchdata from job meta data (i.e.,
      # query, pre-selected databases, advanced options used). Query is only
      # updated if params[:query] is not specified.
      update_searchdata_from_job(searchdata) if params[:job_id]

      searchdata.to_json
    end

    # Queues a search job and redirects to `/:jid`.
    post '/' do
      if params[:input_sequence]
        @input_sequence = params[:input_sequence]
        erb :search, layout: true
      else
        job = Job.create(params)
        redirect to("/#{job.id}")
      end
    end

    # Returns results for the given job id in JSON format.  Returns 202 with
    # an empty body if the job hasn't finished yet.
    get '/:jid.json' do |jid|
      job = Job.fetch(jid)
      halt 404, { error: 'Job not found' }.to_json if job.nil?
      halt 202 unless job.done?

      report = Report.generate(job)
      halt 202 unless report.done?

      display_large_result_warning =
        SequenceServer.config[:large_result_warning_threshold].to_i.positive? &&
        params[:bypass_file_size_warning] != 'true' &&
        report.xml_file_size > SequenceServer.config[:large_result_warning_threshold]

      if display_large_result_warning
        halt 200,
             {
               user_warning: 'LARGE_RESULT',
               download_links: [
                 { name: 'Standard Tabular Report', url: "download/#{jid}.std_tsv" },
                 { name: 'Full Tabular Report', url: "/download/#{jid}.full_tsv" },
                 { name: 'Results in XML', url: "/download/#{jid}.xml" }
               ]
             }.to_json
      end

      report.to_json
    end

    # Returns base HTML. Rest happens client-side: polling for and rendering
    # the results.
    get '/:jid' do |jid|
      job = Job.fetch(jid)
      halt 404, File.read(File.join(settings.root, 'public/404.html')) if job.nil?

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
    get '/get_sequence/' do
      sequence_ids = params[:sequence_ids].split(',')
      database_ids = params[:database_ids].split(',')
      sequences = Sequence::Retriever.new(sequence_ids, database_ids)
      sequences.to_json
    end

    post '/get_sequence' do
      sequence_ids = params['sequence_ids'].split(',')
      database_ids = params['database_ids'].split(',')
      sequences = Sequence::Retriever.new(sequence_ids, database_ids, true)
      send_file(sequences.file.path,
                type: sequences.mime,
                filename: sequences.filename)
    end

    # Download BLAST report in various formats.
    get '/download/:jid.:type' do |jid, type|
      job = Job.fetch(jid)
      halt 404, { error: 'Job not found' }.to_json if job.nil?
      out = BLAST::Formatter.new(job, type)
      halt 404, { error: 'File not found"' }.to_json unless File.exist?(out.filepath)
      send_file out.filepath, filename: out.filename, type: out.mime
    end

    post '/cloud_share' do
      content_type :json
      request_params = JSON.parse(request.body.read)
      job = Job.fetch(request_params['job_id'])
      halt 404, { error: 'Job not found' }.to_json if job.nil?

      unless job.done?
        status 422
        { errors: ["Job #{request_params['job_id']} is not finished yet."] }.to_json
      end

      unless SequenceServer.config[:cloud_share_url]
        status 503
        { errors: ['Sorry, cloud sharing is not enabled on this server.'] }.to_json
      end

      begin
        job.as_archived_file do |archived_job_file|
          cloud_share_response = RestClient.post(
            SequenceServer.config[:cloud_share_url],
            {
              shared_job: {
                sender: {
                  email: request_params['sender_email']
                },
                archived_job_file: archived_job_file,
                original_job_id: job.id
              }
            }
          )

          return cloud_share_response.body
        end
      rescue RestClient::ExceptionWithResponse => e
        cloud_share_response = e.response

        case cloud_share_response.code
        when 413
          halt 413,
               { errors: ['Sorry, the results are too large to share, please consider \
                  using https://sequenceserver.com/cloud'] }.to_json
        when 422
          halt 422, JSON.parse(cloud_share_response.body).to_json
        else
          error cloud_share_response.code,
                { errors: ["Unexpected Cloudshare response: #{cloud_share_response.code}"] }.to_json
        end
      rescue Errno::ECONNREFUSED
        error 503, { errors: ['Sorry, the cloud sharing server may not be running. Try again later.'] }.to_json
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
      return unless error

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

      if request.env['HTTP_ACCEPT'].to_s.include?('application/json')
        status 422
        content_type :json
        error_data.to_json
      else
        content_type :html
        erb :error, locals: { error_data: error_data }, layout: true
      end
    end

    # Get the query sequences, selected databases, and advanced params used.
    def update_searchdata_from_job(searchdata)
      job = fetch_job(params[:job_id])
      return { error: 'Job not found' }.to_json if job.nil?
      return if job.imported_xml_file

      # Only read job.qfile if we are not going to use Database.retrieve.
      searchdata[:query] = File.read(job.qfile) unless params[:query]

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

    helpers do
      def root_path_prefix
        settings.root_path_prefix.to_s
      end
    end

    private

    def fetch_job(job_id)
      Job.fetch(job_id)
    end
  end
end
