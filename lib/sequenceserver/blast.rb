require 'tempfile'
require 'ox'

require 'sequenceserver/sequence'

module SequenceServer

  # Simple wrapper around BLAST+ CLI (command line interface), intended to be
  # mixed into SequenceServer::App.
  #
  # `Blast::ArgumentError` and `Blast::RuntimeError` signal errors encountered
  # when attempting a BLAST search.  The error classes define `http_status`
  # instance method which returns the equivalent HTTP status code, and is used
  # by Sinatra to dispatch appropriate error handlers to fulfill an HTTP
  # request.
  module Blast

    # To signal error in query sequence or options.
    #
    # ArgumentError is raised when BLAST+'s exit status is 1; see [1].
    class ArgumentError < ArgumentError

      # Instruct Sinatra to treat this exception object as HTTP BadRequest
      # (400).
      def http_status
        400
      end
    end

    # To signal internal errors.
    #
    # RuntimeError is raised when BLAST+'s exits status is one of 2, 3, 4, or
    # 255; see [1].  These are rare, infrastructure errors, used internally,
    # and of concern only to the admins/developers.
    class RuntimeError  < RuntimeError

      def initialize(status, message)
        @status  = status
        @message = message
      end

      attr_reader :status, :message

      # Instruct Sinatra to treat this exception object as HTTP
      # InternalServerError (500).
      def http_status
        500
      end

      def to_s
        "#{status}, #{message}"
      end
    end

    # Capture results per query of a BLAST search.
    # @member [String]     number
    # @member [String]     def
    # @member [Fixnum]     len
    # @member [Array(Hit)] hits
    Query = Struct.new(:number, :def, :len, :hits, :stats) do
      def initialize(*args)
        args[1] = "Query_#{args[0]}" if args[1] == 'No definition line'
        @id, *rest = args[1].split
        @meta = rest.join(' ')
        super
      end

      def sort_hits_by_evalue!
        @hits = hits.sort_by(&:evalue)
      end

      attr_reader :id, :meta
    end

    # Hit Object to store all the hits per Query.
    # @member [Fixnum]     number
    # @member [String]     id
    # @member [String]     def
    # @member [String]     accession
    # @member [Fixnum]     len
    # @member [HSP]        hsp
    Hit = Struct.new(:number, :id, :def, :accession, :len, :hsps) do
      def initialize(*args)
        super(*args)
        self.number = args[0].to_i
        self.id = args[1]
        self.def = args[2]
        self.accession = args[3]
        self.len = args[4].to_i
        self.hsps = args[5]
      end

      alias length len

      # Hit evalue is the minimum evalue of all HSP(s).
      def evalue
        hsps.map(&:evalue).min
      end

      # Hit score is the sum of bit scores of all HSP(s).
      def total_score
        hsps.map(&:bit_score).reduce(:+)
      end
    end

    # Structure to hold the HSP information about each hit.
    # More information about values can be found at NCBI's BLAST manual page.
    HSP = Struct.new(:number, :bit_score, :score, :evalue, :qstart, :qend, :start, \
                     :send, :qframe, :hframe, :identity, :positives, :gaps, :len, \
                     :qseq, :hseq, :midline) do
      def initialize(*args)
        super(*args)
        self.number = args[0].to_i
        self.bit_score = args[1].to_f
        self.score = args[2].to_i
        # self.evalue = args[3].split('e').collect { |x| x.to_f.round(1) }.join('e').to_f
        self.evalue = args[3].to_f
        self.qstart = args[4].to_i
        self.qend = args[5].to_i
        self.start = args[6].to_i
        self.send = args[7].to_i
        self.qframe = args[8].to_i
        self.hframe = args[9].to_i
        self.identity = args[10].to_i
        self.positives = args[11].to_i
        self.gaps = args[12].to_i
        self.len = args[13].to_i
        self.qseq = args[14]
        self.hseq = args[15]
        self.midline = args[16]
      end

      alias length len
    end

    # Captures BLAST results.
    class Report

      def initialize(rfile)
        # Generates BLAST report which one or moremultiple Query objects
        # based on the blast query string.
        rfile.open
        parsed_out = Ox.parse(rfile.read)
        hashed_out = node_to_dict(parsed_out.root)
        @program = hashed_out["BlastOutput_program"]
        @querydb = hashed_out["BlastOutput_db"]

        hashed_out["BlastOutput_iterations"].each_with_index do |n, i|
          @queries ||= []
          @queries.push(Query.new(n[0], n[2], n[3], [], n[5]["Statistics"]))

          # Ensure a hit object is received. No hits, returns a newline.
          # Note that checking to "\n" doesn't work since n[4] = ["\n"]
          if n[4]==["\n"]
            @queries[i][:hits] = []
          else
            n[4].each_with_index do |hits, j|
              @queries[i][:hits].push(Hit.new(hits[0], hits[1], hits[2],\
                                              hits[3], hits[4], []))
              hits[5].each_with_index do |hsp, k|
                @queries[i][:hits][j][:hsps].push(HSP.new(*hits[5][k].values))
              end
            end
            @queries[i].sort_hits_by_evalue!
          end
        end
      end

      attr_accessor :program, :querydb

      attr_accessor :queries

      private

      def node_to_array(element)
        a = Array.new
        element.nodes.each do |n|
          a.push(node_to_value(n))
        end
        a
      end

      def node_to_dict(element)
        dict = Hash.new
        key = nil
        element.nodes.each do |n|
          raise "A dict can only contain elements." unless n.is_a?(::Ox::Element)
          key = n.name
          dict[key] = node_to_value(n)
          key = nil
        end
        dict
      end

      def node_to_value(node)
        # Ensure that the recursion doesn't fails when String value is received.
        if node.is_a?(String)
          return node
        end
        if ['Parameters', 'BlastOutput_param', 'Iteration_stat', \
            'Statistics', 'Hsp'].include? node.name
          value = node_to_dict(node)
        elsif ['Iteration_hits', 'BlastOutput_iterations', \
               'Iteration', 'Hit', 'Hit_hsps'].include? node.name
          value = node_to_array(node)
        else
          value = first_text(node)
        end
        value
      end

      def first_text(node)
        node.nodes.each do |n|
          return n if n.is_a?(String)
        end
        nil
      end
    end

    ERROR_LINE = /\(CArgException.*\)\s(.*)/

    ALGORITHMS = %w|blastn blastp blastx tblastn tblastx|

    def blast(params)
      validate_blast_params params

      # Compile parameters for BLAST search into a shell executable command.
      #
      # Blast method to use.
      method  = params[:method]
      #
      # BLAST+ expects query sequence as a file.
      qfile = Tempfile.new('sequenceserver_query')
      qfile.puts(params[:sequence])
      qfile.close
      #
      # Retrieve database file from database id.
      database_ids   = params[:databases]
      database_names = databases.values_at(*database_ids).map(&:name).join(' ')
      #
      # Concatenate other blast options.
      options = params[:advanced].to_s.strip + defaults
      #
      # blastn implies blastn, not megablast; but let's not interfere if a user
      # specifies `task` herself.
      if method == 'blastn' and not options =~ /task/
        options << ' -task blastn'
      end

      # Run BLAST search.
      #
      # Command to execute.
      command = "#{method} -db '#{database_names}' -query '#{qfile.path}' #{options}"
      #
      # Debugging log.
      log.debug("Executing: #{command}")
      #
      # Temporary files to capture stdout and stderr.
      rfile = Tempfile.new('sequenceserver_blast_result')
      efile = Tempfile.new('sequenceserver_blast_error')
      [rfile, efile].each(&:close)
      #
      # Execute.
      system("#{command} > #{rfile.path} 2> #{efile.path}")

      # Capture error.
      status = $?.exitstatus
      case status
      when 1 # error in query sequence or options; see [1]
        efile.open

        # Most of the time BLAST+ generates a verbose error message with
        # details we don't require.  So we parse out the relevant lines.
        error = efile.each_line do |l|
          break Regexp.last_match[1] if l.match(ERROR_LINE)
        end

        # But sometimes BLAST+ returns the exact/relevant error message.
        # Trying to parse such messages returns nil, and we use the error
        # message from BLAST+ as it is.
        error = efile.rewind && efile.read unless error.is_a? String

        efile.close
        raise ArgumentError.new(error)
      when 2, 3, 4, 255 # see [1]
        efile.open
        error = efile.read
        efile.close
        raise RuntimeError.new(status, error)
      end

      # Report the results.
      Report.new(rfile)
    end

    # Returns an Array of SequenceServer::Sequence objects capturing the
    # sequences fetched from BLAST database and an Array of absolute path
    # to BLAST databases from which the sequences were fetched.
    #
    # FIXME: Reconsider if databases should be returned.
    def sequences_from_blastdb(sequence_ids, database_ids)
      sequence_ids   = sequence_ids.join(',')
      database_names = databases.values_at(*database_ids).map(&:name).join(',')

      # Fetch sequences from BLAST db.
      #
      # Command to execute.
      # NOTE: tabs in the command below are intentional.
      command = "blastdbcmd -db #{database_names} -entry '#{sequence_ids}' -outfmt '%a	%t	%s'"
      #
      # Debugging log.
      log.debug("Executing: #{command}")
      #
      # Execute.
      #
      # If `blastdbcmd` throws error, we assume sequence not found.
      output = `#{command} 2> /dev/null`
      #
      # Parse.
      sequences = []
      output.each_line do |line|
        # NOTE: yes, we are splitting on a tab.
        sequences << Sequence.new(*line.split('	'))
      end

      [sequences, database_names]
    end

    def validate_blast_params(params)
      validate_blast_method    params[:method]
      validate_blast_sequences params[:sequence]
      validate_blast_databases params[:databases]
      validate_blast_options   params[:advanced]
    end

    def defaults
      " -outfmt 5 -num_threads #{num_threads}"
    end

    def validate_blast_method(method)
      return true if ALGORITHMS.include? method
      raise ArgumentError.new("BLAST algorithm should be one of:
                              #{ALGORITHMS.join(', ')}.")
    end

    def validate_blast_sequences(sequences)
      return true if sequences.is_a? String and not sequences.empty?
      raise ArgumentError.new("Sequences should be a non-empty string.")
    end

    def validate_blast_databases(database_ids)
      return true if database_ids.is_a?(Array) && !database_ids.empty? &&
        (databases.keys & database_ids).length == database_ids.length
      raise ArgumentError.new("Database id should be one of:
                              #{databases.keys.join("\n")}.")
    end

    # Advanced options are specified by the user. Here they are checked for interference with SequenceServer operations.
    # raise ArgumentError if an error has occurred, otherwise return without value
    def validate_blast_options(options)
      return true if !options || (options.is_a?(String) && options.strip.empty?)

      unless options =~ /\A[a-z0-9\-_\. ']*\Z/i
        raise ArgumentError.new("Invalid characters detected in options.")
      end

      disallowed_options = %w(-out -html -outfmt -db -query)
      disallowed_options.each do |o|
        if options =~ /#{o}/i
          raise ArgumentError.new("Option \"#{o}\" is prohibited.")
        end
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
