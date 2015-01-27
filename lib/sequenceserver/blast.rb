require 'forwardable'
require 'tempfile'
require 'ox'

require 'sequenceserver/links'

module SequenceServer
  # Simple wrapper around BLAST+ search algorithms.
  #
  # `BLAST::ArgumentError` and `BLAST::RuntimeError` signal errors encountered
  # when attempting a BLAST search.
  module BLAST
    # To signal error in query sequence or options.
    #
    # ArgumentError is raised when BLAST+'s exit status is 1; see [1].
    class ArgumentError < ArgumentError
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

      def to_s
        "#{status}, #{message}"
      end
    end

    # Capture results per query of a BLAST search.
    # @member [String]     number
    # @member [String]     def
    # @member [Fixnum]     len
    # @member [Array(Hit)] hits
    Query = Struct.new(:number, :def, :len, :hits) do
      def initialize(*args)
        args[0] = args[0].to_i
        args[1] = "Query_#{args[0]}" if args[1] == 'No definition line'
        args[2] = args[2].to_i
        @id, *rest = args[1].split
        @title = rest.join(' ')
        super
      end

      def sort_hits_by_evalue!
        @hits = hits.sort_by(&:evalue)
      end

      attr_reader :id, :title

      alias_method :length, :len
    end

    # Hit Object to store all the hits per Query.
    # @member [Fixnum]     number
    # @member [String]     id
    # @member [String]     def
    # @member [String]     accession
    # @member [Fixnum]     len
    # @member [HSP]        hsp
    Hit = Struct.new(:number, :id, :title, :accession, :len, :hsps) do
      def initialize(*args)
        args[0] = args[0].to_i
        args[2] = '' if args[2] == 'No definition line'
        args[4] = args[4].to_i
        super
      end

      alias_method :length, :len

      # Hit evalue is the minimum evalue of all HSP(s).
      def evalue
        hsps.map(&:evalue).min
      end

      # Hit score is the sum of bit scores of all HSP(s).
      def score
        hsps.map(&:bit_score).reduce(:+)
      end
    end

    # Structure to hold the HSP information about each hit. For more
    # information, check the link contained in the references section at the
    # end of the file.
    HSP = Struct.new(:number, :bit_score, :score, :evalue, :qstart, :qend,
                     :sstart, :send, :qframe, :sframe, :identity, :positives,
                     :gaps, :len, :qseq, :sseq, :midline) do

      INTEGER_ARGS = [0, 2].concat((4..13).to_a)
      FLOAT_ARGS   = [1, 3]

      def initialize(*args)
        INTEGER_ARGS.each do |i|
          args[i] = args[i].to_i
        end

        FLOAT_ARGS.each do |i|
          args[i] = args[i].to_f
        end

        super
      end

      alias_method :length, :len

    end

    # Captures BLAST results from BLAST+'s XML output.
    class Report

      include Links

      # Expects a File object and Database objects used to BLAST against.
      #
      # Parses the XML file into an intermediate representation (ir) and
      # constructs an object model from that.
      #
      # NOTE:
      #   Databases param is optional for test suite.
      def initialize(rfile, databases = nil)
        ir = node_to_array Ox.parse(rfile.read).root

        @program = ir[0]
        @program_version = ir[1]
        @querydb = Array databases
        @parameters = {
          :matrix    => ir[7][0],
          :evalue    => ir[7][1],
          :gapopen   => ir[7][2],
          :gapextend => ir[7][3],
          :filters   => ir[7][4]
        }

        ir[8].each_with_index do |n, i|
          @stats ||= n[5][0]
          @queries ||= []
          @queries.push(Query.new(n[0], n[2], n[3], []))

          # Ensure a hit object is received. No hits, returns a newline. Note
          # that checking to "\n" doesn't work since n[4] = ["\n"]
          if n[4] == ["\n"]
            @queries[i][:hits] = []
          else
            n[4].each_with_index do |hits, j|
              @queries[i][:hits].push(Hit.new(hits[0], hits[1], hits[2],
                                              hits[3], hits[4], []))
              hits[5].each do |hsp|
                @queries[i][:hits][j][:hsps].push(HSP.new(*hsp))
              end
            end
            @queries[i].sort_hits_by_evalue!
          end
        end
      end

      attr_reader :program, :program_version

      # :nodoc:
      # params are defaults provided by BLAST or user input to tweak the
      # result. stats are computed metrics provided by BLAST.
      #
      # BLAST+ doesn't list all input params (like word_size) in the XML
      # output. Only matrix, evalue, gapopen, gapextend, and filters.
      attr_reader :params, :stats

      attr_reader :querydb

      attr_reader :queries

      # Helper methods for pretty printing results

      # FIXME: HTML!!
      def pretty_evalue(hsp)
        hsp.evalue.to_s.sub(/(\d*\.\d*)e?([+-]\d*)?/) do
          s = '%.3f' % Regexp.last_match[1]
          s << " &times; 10<sup>#{Regexp.last_match[2]}</sup>" if Regexp.last_match[2]
          s
        end
      end

      def identity_fraction(hsp)
        "#{hsp.identity}/#{hsp.length}"
      end

      def positives_fraction(hsp)
        "#{hsp.positives}/#{hsp.length}"
      end

      def gaps_fraction(hsp)
        "#{hsp.gaps}/#{hsp.length}"
      end

      def identity_percentage(hsp)
        "#{'%.2f' % (hsp.identity * 100.0 / hsp.length)}"
      end

      def positives_percentage(hsp)
        "#{'%.2f' % (hsp.positives * 100.0 / hsp.length)}"
      end

      def gaps_percentage(hsp)
        "#{'%.2f' % (hsp.gaps * 100.0 / hsp.length)}"
      end

      # FIXME: Test me.
      def pp_hsp(hsp)
        # In many of the BLAST algorithms, translated queries are performed
        # which has to be taken care while determining end co ordinates of
        # query and subject sequences. Since each amino acid is encoded using
        # three nucl.  referred to as codons, necessary value is multiplied
        # to determine the coordinates.

        # blastn and blastp search the nucleotide and protein databases using
        # nucleotide and protein queries respectively.
        qframe_unit = 1
        sframe_unit = 1
        # tblastn searches translated nucleotide database using a protein query
        if @program == 'tblastn'
          sframe_unit = 3
        # blastx searches protein database using a translated nucleotide query,
        elsif @program == 'blastx'
          qframe_unit = 3
        # tblastx searches translated nucleotide database using a translated
        # nucleotide query.
        elsif @program == 'tblastx'
          qframe_unit = 3
          sframe_unit = 3
        end

        qframe_sign = hsp.qframe >= 0 ? 1 : -1
        sframe_sign = hsp.sframe >= 0 ? 1 : -1

        chars = 60
        lines = (hsp.length / chars.to_f).ceil
        width = [hsp.qend, hsp.send, hsp.qstart,
                 hsp.sstart].map(&:to_s).map(&:length).max

        # blastn results are inconsistent with the other methods as it
        # automatically reverse the start and end coordinates (based on
        # frame), while for others it has to be inferred.
        if @program != 'blastn'
          nqseq = hsp.qframe >= 0 ? hsp.qstart : hsp.qend
          nsseq = hsp.sframe >= 0 ? hsp.sstart : hsp.send
        else
          nqseq = hsp.qstart
          nsseq = hsp.sstart
        end

        s = ''
        (1..lines).each do |i|
          lqstart = nqseq
          lqseq = hsp.qseq[chars * (i - 1), chars]
          nqseq += (lqseq.length - lqseq.count('-')) * qframe_unit * qframe_sign
          lqend = nqseq - qframe_sign
          s << "Query   %#{width}d  #{lqseq}  #{lqend}\n" % lqstart

          lmseq = hsp.midline[chars * (i - 1), chars]
          s << "#{' ' * (width + 8)}  #{lmseq}\n"

          lsstart = nsseq
          lsseq = hsp.sseq[chars * (i - 1), chars]
          nsseq += (lsseq.length - lsseq.count('-')) * sframe_unit * sframe_sign
          lsend = nsseq - sframe_sign
          s << "Subject %#{width}d  #{lsseq}  #{lsend}\n" % lsstart

          s << "\n" unless i == lines
        end
        s
      end

      # FIXME: Document me.
      def filter_hsp_stats(hsp)
        hsp_stats = {
          'Score' => "#{'%.2f' % hsp[:bit_score]} (#{hsp[:score]})",
          'E value' => "#{pretty_evalue hsp}",
          'Identities' => "#{identity_fraction hsp} " \
                          "(#{identity_percentage hsp}%)",
          'Gaps' => "#{gaps_fraction hsp} (#{gaps_percentage hsp}%)"
        }

        if @program == 'blastp'
          hsp_stats['Positives'] = "#{positives_fraction hsp}" \
                                     "(#{positives_percentage hsp}%)"
        elsif @program == 'blastx'
          hsp_stats['Query frame'] = "#{hsp[:qframe]}"
        elsif @program == 'tblastn'
          hsp_stats['Hit frame'] = "#{hsp[:sframe]}"
        elsif @program == 'tblastx'
          hsp_stats['Positives'] = "#{positives_fraction hsp}" \
                                   "(#{positives_percentage hsp}%)"
          hsp_stats['Frame'] = "#{hsp[:qframe]}/#{hsp[:sframe]}"
        elsif @program == 'blastn'
          hsp_stats['Strand'] = "#{hsp[:qframe] > 0 ? '+' : '-'}/" \
                                "#{hsp[:sframe] > 0 ? '+' : '-'}"
        end

        hsp_stats
      end

      def link_per_hit(sequence_id)
        links = Links.instance_methods.map {|m| send(m, sequence_id)}

        # Sort links based on :order key (ascending)
        links.compact!.sort_by! {|link| link[:order]}
      end

      # Returns an array of database objects which contain the queried
      # sequence id.
      # NOTE: This function may return more than one database object for
      # a single sequence id.
      #
      # e.g., which_blastdb('SI_2.2.23') => [<Database: ...>, ...]
      def which_blastdb(sequence_id)
        querydb.select {|db| db.include? sequence_id}
      end

      private

      PARSEABLE_AS_ARRAY = %w(Parameters BlastOutput_param Iteration_stat
                              Statistics Iteration_hits BlastOutput_iterations
                              Iteration Hit Hit_hsps Hsp)

      def node_to_array(element)
        element.nodes.map {|n| node_to_value n}
      end

      def node_to_value(node)
        # Ensure that the recursion doesn't fails when String value is received.
        return node if node.is_a?(String)

        if PARSEABLE_AS_ARRAY.include? node.name
          value = node_to_array(node)
        else
          value = first_text(node)
        end
        value
      end

      def first_text(node)
        node.nodes.find {|n| n.is_a? String}
      end
    end

    ERROR_LINE = /\(CArgException.*\)\s(.*)/

    ALGORITHMS = %w(blastn blastp blastx tblastn tblastx)

    extend self

    extend Forwardable

    def_delegators SequenceServer, :config, :logger

    def run(params)
      pre_process params
      validate_blast_params params

      # Compile parameters for BLAST search into a shell executable command.
      #
      # BLAST method to use.
      method  = params[:method]
      #
      # BLAST+ expects query sequence as a file.
      qfile = Tempfile.new('sequenceserver_query')
      qfile.puts(params[:sequence])
      qfile.close
      #
      # Retrieve database objects from database id.
      databases = Database[params[:databases]]
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
      command = "#{method} -db '#{databases.map(&:name).join(' ')}'" \
                " -query '#{qfile.path}' #{options}"
      #
      # Debugging log.
      logger.debug("Executing: #{command}")
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
        raise ArgumentError, error
      when 2, 3, 4, 255 # see [1]
        efile.open
        error = efile.read
        efile.close
        raise RuntimeError.new(status, error)
      end

      # Report the results, ensures that file is closed after execution.
      File.open(rfile.path) {|f| Report.new(f, databases)}
    end

    def pre_process(params)
      unless params[:sequence].nil?
        params[:sequence].strip!
      end
    end

    def validate_blast_params(params)
      validate_blast_method params[:method]
      validate_blast_sequences params[:sequence]
      validate_blast_databases params[:databases]
      validate_blast_options params[:advanced]
    end

    def defaults
      " -outfmt 5 -num_threads #{config[:num_threads]}"
    end

    def validate_blast_method(method)
      return true if ALGORITHMS.include? method
      raise ArgumentError, "BLAST algorithm should be one of:" \
                           " #{ALGORITHMS.join(', ')}."
    end

    def validate_blast_sequences(sequences)
      return true if sequences.is_a? String and not sequences.empty?
      raise ArgumentError, 'Sequences should be a non-empty string.'
    end

    def validate_blast_databases(database_ids)
      ids = Database.ids
      return true if database_ids.is_a?(Array) && !database_ids.empty? &&
        (ids & database_ids).length == database_ids.length
      raise ArgumentError, "Database id should be one of:" \
                           " #{ids.join("\n")}."
    end

    # Advanced options are specified by the user. Here they are checked for
    # interference with SequenceServer operations.
    # raise ArgumentError if an error has occurred, else return without value
    def validate_blast_options(options)
      return true if !options || (options.is_a?(String) && options.strip.empty?)

      unless options =~ /\A[a-z0-9\-_\. ']*\Z/i
        raise ArgumentError, 'Invalid characters detected in options.'
      end

      disallowed_options = %w(-out -html -outfmt -db -query)
      disallowed_options.each do |o|
        if options =~ /#{o}/i
          raise ArgumentError, "Option \"#{o}\" is prohibited."
        end
      end
    end
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
