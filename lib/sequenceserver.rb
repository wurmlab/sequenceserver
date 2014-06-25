require 'thin'
require 'sinatra/base'
require 'yaml'
require 'logger'
require 'fileutils'
require 'sequenceserver/database'
require 'sequenceserver/blast'
require 'sequenceserver/sequencehelpers'
require 'sequenceserver/sinatralikeloggerformatter'
require 'sequenceserver/customisation'

# Helper module - initialize the blast server.
module SequenceServer

  extend self

  # Path to SequenceServer installation.
  def root
    File.dirname(File.dirname(__FILE__))
  end

  # Path to example configuration file.
  #
  # SequenceServer ships with a dummy configuration file. Users can simply
  # copy it and make necessary changes to get started.
  def example_config_file
    File.join(root, 'example.config.yml')
  end

  # Path to sample database.
  #
  # SequenceServer ships with test database (fire ant genome) so users can
  # launch and preview SequenceServer without any configuration, and/or run
  # test suite.
  def sample_database
    File.join(root, 'spec', 'database')
  end

  # Path to SequenceServer's configuration file.
  #
  # The configuration file is a simple, YAML data store.
  def config_file(config_file = nil)
    config_file  ||= '~/.sequenceserver.conf'
    @config_file ||= File.expand_path(config_file)
  end

  def environment
    ENV['RACK_ENV']
  end

  def host
    'localhost'
  end

  def port(port = nil)
    @port ||= Integer(port || 4567)
  rescue ArgumentError
    puts "*** Port must be number."
    puts "    Typo?"
  end

  def logger
    return @logger if @logger
    @logger = Logger.new(STDERR)
    @logger.formatter = SinatraLikeLogFormatter.new()
    case environment
    when 'production'
      logger.level = Logger::INFO
    when 'development'
      logger.level = Logger::DEBUG
    end
    @logger
  end

  def init(config = {})
    config_file config.delete 'config_file'
    assert_config_file_present

    puts "** Starting SequenceServer."
    config = parse_config_file.merge(config)

    bin_dir = File.expand_path(config.delete 'bin') rescue nil
    assert_bin_dir_present bin_dir
    export_bin_dir bin_dir

    assert_blast_installed_and_compatible

    @database_dir = File.expand_path(config.delete 'database') rescue sample_database
    assert_blast_database_directory_present database_dir
    @databases = scan_blast_database_directory(database_dir).freeze

    @app = App.new(databases)

    @num_threads = Integer(config.delete 'num_threads') rescue 1
    logger.info("Will use #@num_threads threads to run BLAST.")

    port config.delete 'port'

    @app
  end

  # For databaseformatter.
  def init2(config = {})
    config_file config.delete 'config_file'
    assert_config_file_present

    puts "** Starting SequenceServer."
    config = parse_config_file

    bin_dir = File.expand_path(config.delete 'bin') rescue nil
    assert_bin_dir_present bin_dir
    export_bin_dir bin_dir

    assert_blast_installed_and_compatible

    @database_dir = File.expand_path(config.delete 'database') rescue sample_database
    assert_blast_database_directory_present database_dir
  end

  attr_reader :app, :database_dir, :databases, :num_threads

  # Run SequenceServer as a self-hosted server using Thin webserver.
  def run
    url = "http://#{host}:#{port}"
    server = Thin::Server.new(app, host, port, :signals => false)
    server.silent = true
    server.backend.start do
      puts "** SequenceServer is ready."
      puts "   Go to #{url} in your browser and start BLASTing!"
      puts "   Press CTRL+C to quit."
      [:INT, :TERM].each do |sig|
        trap sig do
          server.stop!
          puts
          puts "** Thank you for using SequenceServer :)."
          puts "   Please cite: "
          puts "             Priyam A., Woodcroft B.J., Wurm Y (in prep)."
          puts "             Sequenceserver: BLAST searching made easy."
        end
      end
    end
  rescue RuntimeError
    puts "** Oops! There was an error."
    puts "   Is SequenceServer already accessible at #{url}?"
    puts "   Try running SequenceServer on another port, like so: sequenceserver -p 4570."
  end

  private

  def parse_config_file
    logger.info("Reading configuration file: #{config_file}.")
    config = YAML.load_file config_file
    unless config
      logger.warn("Empty configuration file: #{config_file} - will assume default settings.")
      config = {}
    end
    config
  rescue ArgumentError => error
    puts "*** Error in config file: #{error}."
    puts "YAML is white space sensitive. Is your config file properly indented?"
    exit
  end

  def assert_config_file_present
    unless File.exists? config_file
      puts '*** Configuration file not found.'
      FileUtils.cp(example_config_file, config_file)
      puts "*** Generated sample configuration file at #{config_file}."
      puts "    Please edit #{config_file} to indicate the location of your BLAST databases and run SequenceServer again."
      exit
    end
  end

  def assert_bin_dir_present bin_dir
    return unless bin_dir
    unless File.exists? bin_dir
      puts "*** Couldn't find #{bin_dir}."
      puts "    Typo in #{config_file}?"
      exit
    end
  end

  def assert_blast_installed_and_compatible
    unless command? 'blastdbcmd'
      puts "*** Could not find blast binaries."
      puts "    You may need to download BLAST+ from - "
      puts "      http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=Download"
      puts "    And/or edit #{SequenceServer.config_file} to indicate the location of BLAST+ binaries."
      exit
    end
    version = %x|blastdbcmd -version|.split[1]
    unless version > '2.2.25+'
      puts "*** Your BLAST version #{version} is outdated."
      puts "    SequenceServer needs NCBI BLAST+ version 2.2.25+ or higher."
      exit
    end
  end

  def assert_blast_database_directory_present blast_database_directory
    unless File.exists? blast_database_directory
      puts "*** Couldn't find #{blast_database_directory}."
      puts "    Typo in #{config_file}?"
      exit
    end
  end

  # Export NCBI BLAST+ bin dir to PATH environment variable.
  def export_bin_dir(bin_dir)
    if bin_dir
      bin_dir = File.expand_path(bin_dir)
      unless ENV['PATH'].split(':').include? bin_dir
        ENV['PATH'] = "#{bin_dir}:#{ENV['PATH']}"
      end
    end
  end

  # Scan the given directory (including subdirectory) for blast databases.
  # ---
  # Arguments:
  # * db_root(String) - absolute path to the blast databases
  # ---
  # Returns:
  # * a hash of sorted blast databases indexed by their id.
  def scan_blast_database_directory(db_root)
    find_dbs_command = %|blastdbcmd -recursive -list #{db_root} -list_outfmt "%p %f %t" 2>&1|

    db_list = %x|#{find_dbs_command}|
    if db_list.empty?
      puts "*** No formatted blast databases found in '#{db_root}'."
      puts "    Run 'sequenceserver format-databases' to create BLAST database from your FASTA files in #{database_dir}."
      exit
    elsif db_list.match(/BLAST Database error/)
      puts "*** Error parsing one of the blast databases."
      # FIXME: sequenceserver format-databases should take care of this.
      puts "    Mostly likely some of your BLAST databases were created by an old version of 'makeblastdb'."
      puts "    You will have to manually delete problematic BLAST databases and subsequently run 'sequenceserver format-databases' to create new ones."
      exit
    elsif not $?.success?
      puts "*** Error obtaining BLAST databases."
      puts "    Tried: #{find_dbs_command}"
      puts "    Error:"
      db_list.strip.split("\n").each do |l|
        puts "      #{l}"
      end
      puts "    Please could you report this to 'https://groups.google.com/forum/#!forum/sequenceserver'?"
      exit
    end

    db = {}
    db_list.each_line do |line|
      next if line.empty?  # required for BLAST+ 2.2.22
      type, name, *title =  line.split(' ')
      type = type.downcase.intern
      name = name.freeze
      title = title.join(' ').freeze

      # skip past all but alias file of a NCBI multi-part BLAST database
      if multipart_database_name?(name)
        settings.log.info(%|Found a multi-part database volume at #{name} - ignoring it.|)
        next
      end

      database = Database.new(name, title, type)
      db[database.hash] = database
      logger.info("Found #{database.type} database: #{database.title} at #{database.name}")
    end
    db
  end

  private

  # check if the given command exists and is executable
  # returns True if all is good.
  def command?(command)
    system("which #{command} > /dev/null 2>&1")
  end

  # Returns true if the database name appears to be a multi-part database name.
  #
  # e.g.
  # /home/ben/pd.ben/sequenceserver/db/nr.00 => yes
  # /home/ben/pd.ben/sequenceserver/db/nr => no
  # /home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01 => yes
  def multipart_database_name?(db_name)
    !(db_name.match(/.+\/\S+\d{2}$/).nil?)
  end

  class App < Sinatra::Base
    include SequenceHelpers
    include SequenceServer::Customisation

    enable :logging
    set :root, SequenceServer.root

    configure :production do
      error do
        erb :'500'
      end

      not_found do
        erb :'500'
      end
    end

    # A Hash of BLAST databases indexed by their id (or hash).
    attr_reader :databases

    def initialize(database)
      @databases = database
      super()
    end

    def log
      SequenceServer.logger
    end

    def num_threads
      SequenceServer.num_threads
    end

    get '/' do
      erb :search, :locals => {:databases => databases.values.group_by(&:type)}
    end

    before '/' do
      pass if params.empty?

      # ensure required params present
      #
      # If a required parameter is missing, SequnceServer returns 'Bad Request
      # (400)' error.
      #
      # See Twitter's [Error Codes & Responses][1] page for reference.
      #
      # [1]: https://dev.twitter.com/docs/error-codes-responses

      if params[:method].nil? or params[:method].empty?
         halt 400, "No BLAST method provided."
      end

      if params[:sequence].nil? or params[:sequence].empty?
         halt 400, "No input sequence provided."
      end

      if params[:databases].nil?
         halt 400, "No BLAST database provided."
      end

      # ensure params are valid #

      # only allowed blast methods should be used
      blast_methods = %w|blastn blastp blastx tblastn tblastx|
      unless blast_methods.include?(params[:method])
        halt 400, "Unknown BLAST method: #{params[:method]}."
      end

      # check the advanced options are sensible
      begin #FIXME
        validate_advanced_parameters(params[:advanced])
      rescue ArgumentError => error
        halt 400, "Advanced parameters invalid: #{error}"
      end

      # log params
      log.debug('method: '   + params[:method])
      log.debug('sequence: ' + params[:sequence])
      log.debug('database: ' + params[:databases].inspect)
      log.debug('advanced: ' + params[:advanced])
    end

    post '/' do
      method        = params['method']
      databases     = params[:databases]
      sequence      = params[:sequence]
      advanced_opts = params['advanced']

      # evaluate empty sequence as nil, otherwise as fasta
      sequence = sequence.empty? ? nil : to_fasta(sequence)

      # blastn implies blastn, not megablast; but let's not interfere if a user
      # specifies `task` herself
      if method == 'blastn' and not advanced_opts =~ /task/
        advanced_opts << ' -task blastn '
      end

      databases = params[:databases].map{|index|
        self.databases[index].name
      }
      advanced_opts << " -num_threads #{num_threads}"

      # run blast and log
      blast = Blast.new(method, sequence, databases.join(' '), advanced_opts)
      blast.run!
      log.info('Ran: ' + blast.command)

      unless blast.success?
        halt(*blast.error)
      end

      format_blast_results(blast.result, databases)
    end

    # get '/get_sequence/?id=sequence_ids&db=retreival_databases'
    #
    # Use whitespace to separate entries in sequence_ids (all other chars exist
    # in identifiers) and retreival_databases (we don't allow whitespace in a
    # database's name, so it's safe).
    get '/get_sequence/' do
      sequenceids = params[:id].split(/\s/).uniq  # in a multi-blast
      # query some may have been found multiply
      retrieval_databases = params[:db].split(/\s/)

      log.info("Looking for: '#{sequenceids.join(', ')}' in '#{retrieval_databases.join(', ')}'")

      # the results do not indicate which database a hit is from.
      # Thus if several databases were used for blasting, we must check them all
      # if it works, refactor with "inject" or "collect"?
      found_sequences     = ''

      retrieval_databases.each do |database|     # we need to populate this session variable from the erb.
        sequence = sequence_from_blastdb(sequenceids, database)
        if sequence.empty?
          log.debug("'#{sequenceids.join(', ')}' not found in #{database}")
        else
          found_sequences += sequence
        end
      end

      found_sequences_count = found_sequences.count('>')

      out = ''
      # just in case, checking we found right number of sequences
      if found_sequences_count != sequenceids.length
        out << <<HEADER
<h1>ERROR: incorrect number of sequences found.</h1>
<p>Dear user,</p>

<p><strong>We have found
<em>#{found_sequences_count > sequenceids.length ? 'more' : 'less'}</em>
sequence than expected.</strong></p>

<p>This is likely due to a problem with how databases are formatted.
<strong>Please share this text with the person managing this website so
they can resolve the issue.</strong></p>

<p> You requested #{sequenceids.length} sequence#{sequenceids.length > 1 ? 's' : ''}
with the following identifiers: <code>#{sequenceids.join(', ')}</code>,
from the following databases: <code>#{retrieval_databases.join(', ')}</code>.
But we found #{found_sequences_count} sequence#{found_sequences_count> 1 ? 's' : ''}.
</p>

<p>If sequences were retrieved, you can find them below (but some may be incorrect, so be careful!).</p>
<hr/>
HEADER
      end

      out << "<pre><code>#{found_sequences}</pre></code>"
      out
    end

    # Ensure a unique sequence identifier for each sequence. If the sequence
    # identifier is missing, add one.
    #
    #   > to_fasta("acgt")
    #   => '>Submitted_By_127.0.0.1_at_110214-15:33:34\nacgt'
    def to_fasta(sequence)
      sequence = sequence.lstrip
      unique_queries = Hash.new()
      if sequence[0,1] != '>'
        sequence.insert(0, ">Submitted at #{Time.now.strftime('%H:%M, %A, %B %d, %Y')}\n")
      end
      sequence.gsub!(/^\>(\S+)/) do |s|
        if unique_queries.has_key?(s)
          unique_queries[s] += 1
          s + '_' + (unique_queries[s]-1).to_s
        else
          unique_queries[s] = 1
          s
        end
      end
      return sequence
    end

    def format_blast_results(result, databases)
      # Constructing the result in an Array and then calling Array#join is much faster than
      # building up a String and using +=, as older versions of SeqServ did.
      formatted_results = []

      @all_retrievable_ids = []
      string_of_used_databases = databases.join(' ')
      blast_database_number = 0
      line_number = 0
      finished_database_summary = false
      finished_alignments = false
      reference_string = ''
      database_summary_string = ''
      result.each do |line|
        line_number += 1
        next if line_number <= 5 #skip the first 5 lines

        # Add the reference to the end, not the start, of the blast result
        if line_number >= 7 and line_number <= 15
          reference_string += line
          next
        end

        if !finished_database_summary and line_number > 15
          database_summary_string += line
          finished_database_summary = true if line.match(/total letters/)
          next
        end

        # Remove certain lines from the output
        skipped_lines = [/^<\/BODY>/,/^<\/HTML>/,/^<\/PRE>/]
        skip = false
        skipped_lines.each do |skippy|
        #  $stderr.puts "`#{line}' matches #{skippy}?"
          if skippy.match(line)
            skip = true
         #   $stderr.puts 'yes'
          else
          #  $stderr.puts 'no'
          end
        end
        next if skip

        # Remove the javascript inclusion
        line.gsub!(/^<script src=\"blastResult.js\"><\/script>/, '')

        if line.match(/^>/) # If line to possibly replace
          # Reposition the anchor to the end of the line, so that it both still works and
          # doesn't interfere with the diagnostic space at the beginning of the line.
          #
          # There are two cases:
          #
          # database formatted _with_ -parse_seqids
          line.gsub!(/^>(.+)(<a.*><\/a>)(.*)/, '>\1\3\2')
          #
          # database formatted _without_ -parse_seqids
          line.gsub!(/^>(<a.*><\/a>)(.*)/, '>\2\1')

          # get hit coordinates -- useful for linking to genome browsers
          hit_length      = result[line_number..-1].index{|l| l =~ />lcl|Lambda/}
          hit_coordinates = result[line_number, hit_length].grep(/Sbjct/).
            map(&:split).map{|l| [l[1], l[-1]]}.flatten.map(&:to_i).minmax

          # Create the hyperlink (if required)
          formatted_results << construct_sequence_hyperlink_line(line, databases, hit_coordinates)
        else
          # Surround each query's result in <div> tags so they can be coloured by CSS
          if matches = line.match(/^<b>Query=<\/b> (.*)/) # If starting a new query, then surround in new <div> tag, and finish the last one off
            line = "<div class=\"resultn\" id=\"#{matches[1]}\">\n<h3>Query= #{matches[1]}</h3><pre>"
            unless blast_database_number == 0
              line = "</pre></div>\n#{line}"
            end
            blast_database_number += 1
          elsif line.match(/^  Database: /) and !finished_alignments
            formatted_results << "</div>\n<pre>#{database_summary_string}\n\n"
            finished_alignments = true
          end
          formatted_results << line
        end
      end
      formatted_results << "</pre>"

      link_to_fasta_of_all = "/get_sequence/?id=#{@all_retrievable_ids.join(' ')}&db=#{string_of_used_databases}"
      # #dbs must be sep by ' '
      retrieval_text       = @all_retrievable_ids.empty? ? '' : "<a href='#{url(link_to_fasta_of_all)}'>FASTA of #{@all_retrievable_ids.length} retrievable hit(s)</a>"

      "<h2>Results</h2>"+
      retrieval_text +
      "<br/><br/>" +
      formatted_results.join +
      "<br/>" +
      "<pre>#{reference_string.strip}</pre>"
    end

    def construct_sequence_hyperlink_line(line, databases, hit_coordinates)
      matches = line.match(/^>(.+)/)
      sequence_id = matches[1]

      link = nil

      # If a custom sequence hyperlink method has been defined,
      # use that.
      options = {
        :sequence_id => sequence_id,
        :databases => databases,
        :hit_coordinates => hit_coordinates
      }

      # First precedence: construct the whole line to be customised
      if self.respond_to?(:construct_custom_sequence_hyperlinking_line)
        log.debug("Using custom hyperlinking line creator with sequence #{options.inspect}")
        link_line = construct_custom_sequence_hyperlinking_line(options)
        unless link_line.nil?
          return link_line
        end
      end

      # If we have reached here, custom construction of the
      # whole line either wasn't defined, or returned nil
      # (indicating failure)
      if self.respond_to?(:construct_custom_sequence_hyperlink)
        log.debug("Using custom hyperlink creator with sequence #{options.inspect}")
        link = construct_custom_sequence_hyperlink(options)
      else
        log.debug("Using standard hyperlink creator with sequence `#{options.inspect}'")
        link = construct_standard_sequence_hyperlink(options)
      end

      # Return the BLAST output line with the link in it
      if link.nil?
        log.debug('No link added link for: `' + sequence_id + '\'')
        return line
      else
        log.debug('Added link for: `' + sequence_id + '\''+ link)
        return "><a href='#{url(link)}' target='_blank'>#{sequence_id}</a> \n"
      end

    end

    # Advanced options are specified by the user. Here they are checked for interference with SequenceServer operations.
    # raise ArgumentError if an error has occurred, otherwise return without value
    def validate_advanced_parameters(advanced_options)
      raise ArgumentError, "Invalid characters detected in the advanced options" unless advanced_options =~ /\A[a-z0-9\-_\. ']*\Z/i
      disallowed_options = %w(-out -html -outfmt -db -query)
      disallowed_options.each do |o|
        raise ArgumentError, "The advanced BLAST option \"#{o}\" is used internally by SequenceServer and so cannot be specified by you" if advanced_options =~ /#{o}/i
      end
    end
  end
end
