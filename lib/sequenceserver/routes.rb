require 'json'
require 'tilt/erb'
require 'sinatra/base'
require 'rest-client'

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
                type:     sequences.mime,
                filename: sequences.filename)
    end

    # Download BLAST report in various formats.
    get '/download/:jid.:type' do |jid, type|
      job = Job.fetch(jid)
      out = BLAST::Formatter.new(job, type)
      send_file out.file, filename: out.filename, type: out.mime
    end

    # Copies the job into another folder
    get '/cloudShare/:jid' do |jid|
      
      puts "Copying job to cloudJobs..."
      job = Job.fetch(jid)
      system("cp -a ~/.sequenceserver/#{job.id} #{cloud_dir}")
      puts "Done!"
      redirect to("/#{job.id}")
    end
    
    # Gets after posting the job id
    get '/SharePost' do
      erb :report, layout: true
    end

    # POSTS the folder of the job ID to the server. WORKS
    post '/SharePost' do 
      # sinatra_job_id does have what it should from front end. 
      
      #gets job
      jobID = params["sinatra_job_id"]
      puts "This is the jobID: #{jobID}"
      job = Job.fetch(jobID)
      puts "Job was fetched"

      # defines path of the yaml file
      ruta = File.join(job_dir,job.id,"job.yaml")
      puts "this is the path #{ruta}"

      # Downloads file locally. 
      send_file(ruta, filename: job.id)
      # Redirects back to /jid
      redirect back
    end


    get '/cloudSharePost/:jid' do
      erb :report, layout: true
      # redirect back
    end

    ## get with :jid to simplify posting -trying it out with working method. Only works when get. No problem.
    post '/cloudSharePost/:jid' do 
      jid = params['jid']
      puts "This is the job: #{jid}"
      job = Job.fetch(jid)
      puts "Job was fetched"
      
       # defines path of the yaml file
      ruta = File.join(job_dir,job.id,"job.yaml")
      puts "this is the path #{ruta}"

    #   # Downloads file locally. 
      send_file(ruta)
      puts 'Downloaded'

    #   # Redirects back to /jid
       redirect_to("/#{job.id}")
      
    end
 
  # Deprecated
  get '/switchPort/:jid' do |jid|
    job = Job.fetch(jid)
    puts "This is the job #{job.id}"
    send_job(job.id)
    puts "Your job was sent"
    # sleep 5
    # redirect to("/#{job.id}")
    # flash[:jid] = "Yo were feeling blah at the time"
    # flash[:jid]
  end

  post'/switchPort' do
  
    identif = params['id']
    emails = params['emails']

    # get job directory
    job = Job.fetch(identif)
    puts "Sending job..."

    send_job(job.id,emails)

    #Response
    puts "Done"


  end

  
  # Sends a post request to the specified URL with a job.yaml file
  # e.response and img can be debugged using pry (see e.response.methods)

  def send_job(job_ID, emailList)
      cloudJob =  RestClient.post('http://localhost:4567/object',
        {
          payload: {
            jobid: job_ID,
            myjob: File.new(File.join(job_dir,job_ID,'job.yaml'),'rb'),
            myquery: File.new(File.join(job_dir,job_ID,'query.fa'),'rb'),
            tsvReport: File.new(File.join(job_dir,job_ID,'sequenceserver-custom_tsv_report.tsv'),'rb'),
            xmlReport: File.new(File.join(job_dir,job_ID,'sequenceserver-xml_report.xml'),'rb'),
            stderr: File.new(File.join(job_dir,job_ID,'stderr'),'rb'),
            stdout: File.new(File.join(job_dir,job_ID,'stdout'),'rb')
      },
          headers: {
            email: emailList
            # other data we might require
      }
      }) do |response|
        case response.code
          # response.body
          when 200
          p 'Job Shared Successfully' unless response.body.include? 'Invalid' 
          response.body
          # response.body
          when 500
          # raise 'Invalid files were uploaded, check files and format. Check HTTP code 500 for more details.'
          response.body
          else
          response.body
        end
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

    # Folder to store job in route to cloud
    def cloud_dir
      File.expand_path('~/cloudJobs').freeze
    end

    # Job Folder 
    def job_dir
      File.expand_path('~/.sequenceserver').freeze
    end
  end
end
