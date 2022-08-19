require 'json'
require 'tilt/erb'
require 'sinatra/base'
require 'rest-client'
require 'socket'

require 'sequenceserver/job'
require 'sequenceserver/blast'
require 'sequenceserver/report'
require 'sequenceserver/database'
require 'sequenceserver/sequence'
require 'sequenceserver/server'

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
    get '/' do
      erb :search, layout: true
    end

    # Returns base HTML with the response of cloudShare POST request.
    get '/response' do
      # Initalises a session variable to update cloudShare status.
      session[:response] ||= 'No results have been submitted to the cloud.'

      # Renders the message on the response template
      erb :response, layout: true
    end

    # Returns data that is used to render the search form client side. These
    # include available databases and user-defined search options.
    get '/searchdata.json' do
      searchdata = {
        query: Database.retrieve(params[:query]),
        database: Database.all,
        options: SequenceServer.config[:options]
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
      halt 202 unless job.done?
      Report.generate(job).to_json
    end

    # Returns base HTML. Rest happens client-side: polling for and rendering
    # the results.
    get '/:jid' do
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
      out = BLAST::Formatter.new(job, type)
      send_file out.file, filename: out.filename, type: out.mime
    end

    ## Share results with non-SequenceServer users

    # Enables sessions to send the post's response to the /response route https://sinatrarb.com/faq.html#sessions
    enable :sessions

    # Posts jobs to the sharing cloud service.
    post '/cloudshare' do
      # Extracts values from frontend and fetches the job
      job = Job.fetch(params['id'])
      sender = params['sender']
      emails = params['emails']

      # Sends job to server and stores it in a session variable
      logger.debug "Sending job #{job.id} to #{post_url}"
      session[:response] = send_job(job.id, sender, emails)
      logger.debug("Cloud server says: #{session[:response]}")
      puts
      puts "Thank you for using SequenceServer's cloud sharing feature :)."
      puts
      # redirect user to see the response
      redirect to('/response')
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

    # /cloudshare Helpers

    # Helper function to send a POST request to the server.
    # Returns a custom message with the status of the request.
    def send_job(job_id, email_sender, email_list)
      RestClient.post(post_url,
                      payload: {
                        jobid: job_id,
                        myjob: File.new(File.join(job_dir, job_id, 'job.yaml'), 'rb'),
                        myquery: File.new(File.join(job_dir, job_id, 'query.fa'), 'rb'),
                        tsvReport: File.new(File.join(job_dir, job_id, 'sequenceserver-custom_tsv_report.tsv'), 'rb'),
                        xmlReport: File.new(File.join(job_dir, job_id, 'sequenceserver-xml_report.xml'), 'rb'),
                        stderr: File.new(File.join(job_dir, job_id, 'stderr'), 'rb'),
                        stdout: File.new(File.join(job_dir, job_id, 'stdout'), 'rb')
                      },
                      headers: {
                        sender: email_sender,
                        emails: email_list,
                        ip_address: sender_ip
                      }) do |response|
        case response.code
        when 302
          'Whoops... looks like the production server is offline. Please try again later'
        else
          response.body
        end
      end
    rescue Errno::ECONNREFUSED
      'Whoops... looks like the development server is offline, please try again later.'
    end

    # Define the URL to post depending on environment
    def post_url
      @post_url ||= if ENV['RACK_ENV'] == 'production'
                      'https://sharing.sequenceserver.com/shareresults'
                    else
                      'http://localhost:8335/shareresults'
                    end
    end

    # Define the URL to fetch jobs from
    def job_dir
      @job_dir ||= if ENV['RACK_ENV'] == 'test'
                     File.expand_path('spec/dotdir').freeze
                   else
                     File.expand_path('~/.sequenceserver').freeze
                   end
    end

    # Gets sender's ip address to append to post request from https://stackoverflow.com/a/39367219/18117380
    def sender_ip
      ip = Socket.ip_address_list.detect(&:ipv4_private?)
      ip.ip_address
    end
  end
end
