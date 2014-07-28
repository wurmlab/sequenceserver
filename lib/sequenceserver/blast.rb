require 'tempfile'
require 'ox'

module SequenceServer
  class Blast

    ERROR_LINE = /\(CArgException.*\)\s(.*)/

    attr_accessor :program, :querydb

    attr_accessor :queries

    # command string to be executed
    attr_reader :command

    # result of executing command
    attr_reader :result

    # errors as [status, message]
    attr_reader :error

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

      attr_reader :id, :meta
    end

    # Hit Object to store all the hits per Query.
    # @member [Fixnum]     number
    # @member [String]     id
    # @member [String]     def
    # @member [String]     accession
    # @member [Fixnum]     len
    # @member [HSP]        hsp
    Hit = Struct.new(:number, :id, :def, :accession, :len, :hsp)

    # Structure to hold the HSP information about each hit.
    # More information about values can be found at NCBI's BLAST manual page.
    HSP = Struct.new(:number, :bit_score, :score, :evalue, :qstart, :qend, :start, \
                     :send, :qframe, :hframe, :identity, :positives, :gaps, :len, \
                     :qseq, :hseq, :midline)

    def initialize(method, query, databases, options = nil)
      @method    = method
      @databases = databases

      # create a tempfile for the given query
      @qfile = Tempfile.new('sequenceserver_query')
      @qfile.puts(query)
      @qfile.close

      @options = options.to_s
      @options += " -outfmt 5"
    end

    def run!
      @result, @error, status = execute(command)
      status == 0 and return @success = true

      if status == 1
        message = @error.each{|l| l.match(ERROR_LINE) and break Regexp.last_match[1]}
        message = message || @error
        @error  = [400,  message]
      else
        @error = [500, @error]
      end

      false
    end

    def command
      @command ||= "#@method -db '#@databases' -query '#{@qfile.path}' #@options"
    end

    # Return success status.
    def success?
      @success
    end

    def report!
      # Generates BLAST report which one or moremultiple Query objects
      # based on the blast query string.
      parsed_out = Ox.parse(@result)
      hashed_out = node_to_dict(parsed_out.root)
      @program = hashed_out["BlastOutput_program"]
      @querydb = hashed_out["BlastOutput_db"]

      hashed_out["BlastOutput_iterations"].each do |n|
        @queries ||= {}
        @queries[n[2]] = Query.new(n[0], n[2], n[3], {}, n[5]["Statistics"])

        # Ensure a hit object is received. No hits, returns a newline.
        # Note that checking to "\n" doesn't work since n[4] = ["\n"]
        if n[4]==["\n"]
          @queries[n[2]][:hits] = []
        else
          n[4].each do |hits|
            @queries[n[2]][:hits][hits[1]] = Hit.new(hits[0], hits[1], hits[2],\
                                                     hits[3], hits[4], {})
            @queries[n[2]][:hits][hits[1]][:hsp] = HSP.new(*hits[5]["Hsp"].values)
          end
        end
      end
    end

    def execute(command)
      rfile = Tempfile.new('sequenceserver_result')
      efile = Tempfile.new('sequenceserver_error')
      [rfile, efile].each {|file| file.close}

      system("#{command} > #{rfile.path} 2> #{efile.path}")
      status = $?.exitstatus

      return File.read(rfile.path), File.read(efile.path), status
    ensure
      rfile.unlink
      efile.unlink
    end

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
      if ['Parameters', 'Hit_hsps', 'BlastOutput_param', 'Iteration_stat', \
          'Hsp', 'Statistics'].include? node.name
        value = node_to_dict(node)
      elsif ['Hit', 'Iteration_hits', 'BlastOutput_iterations', \
             'Iteration'].include? node.name
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
end
