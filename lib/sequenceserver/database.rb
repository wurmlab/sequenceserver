require 'open3'
require 'digest/md5'
require 'forwardable'

require 'sequenceserver/sequence'

# Define Database class.
module SequenceServer
  # Captures a directory containing FASTA files and BLAST databases.
  #
  # Formatting a FASTA for use with BLAST+ will create 3 or 6 files,
  # collectively referred to as a BLAST database.
  #
  # It is important that formatted BLAST database files have the same dirname
  # and basename as the source FASTA for SequenceServer to be able to tell
  # formatted FASTA from unformatted. And that FASTA files be formatted with
  # `parse_seqids` option of `makeblastdb` for sequence retrieval to work.
  #
  # SequenceServer will always place BLAST database files alongside input FASTA,
  # and use `parse_seqids` option of `makeblastdb` to format databases.
  Database = Struct.new(:name, :title, :type, :nsequences, :ncharacters,
                        :updated_on) do

    extend Forwardable

    def_delegators SequenceServer, :config, :sys

    def initialize(*args)
      args[2].downcase! # database type
      args.each(&:freeze)
      super

      @id = Digest::MD5.hexdigest args.first
    end

    attr_reader :id

    def retrieve(accession, coords = nil)
      cmd = "blastdbcmd -db #{name} -entry '#{accession}'"
      if coords
        cmd << " -range #{coords}"
      end
      out, = sys(cmd, path: config[:bin])
      out.chomp
    rescue CommandFailed
      # Command failed beacuse stdout was empty, meaning accession not
      # present in this database.
      nil
    end

    def include?(accession)
      cmd = "blastdbcmd -entry '#{accession}' -db #{name}"
      out, = sys(cmd, path: config[:bin])
      !out.empty?
    end

    def ==(other)
      @id == Digest::MD5.hexdigest(other.name)
    end

    def to_s
      "#{type}: #{title} #{name}"
    end

    def to_json(*args)
      to_h.update(id: id).to_json(*args)
    end
  end

  # Model Database's eigenclass as a collection of Database objects.
  class Database
    class << self
      include Enumerable

      extend Forwardable

      def_delegators SequenceServer, :config, :sys

      def collection
        @collection ||= {}
      end

      def collection=(databases_attrs)
        databases_attrs.each do |db_attrs|
          db = Database.new(*db_attrs)
          collection[db.id] = db
        end
      end

      private :collection

      def [](ids)
        ids = Array ids
        collection.values_at(*ids)
      end

      def ids
        collection.keys
      end

      def all
        collection.values
      end

      def each(&block)
        all.each(&block)
      end

      def include?(path)
        collection.include? Digest::MD5.hexdigest path
      end

      def group_by(&block)
        all.group_by(&block)
      end

      def to_json
        collection.values.to_json
      end

      # Retrieve given loci from the databases we have.
      #
      # loci to retrieve are specified as a String:
      #
      #    "accession_1,accession_2:start-stop,accession_3"
      #
      # Return value is a FASTA format String containing sequences in the same
      # order in which they were requested. If an accession could not be found,
      # a commented out error message is included in place of the sequence.
      # Sequences are retrieved from the first database in which the accession
      # is found. The returned sequences can, thus, be incorrect if accessions
      # are not unique across all database (admins should make sure of that).
      def retrieve(loci)
        # Exit early if loci is nil.
        return unless loci

        # String -> Array
        # We may have empty string if loci contains a double comma as a result
        # of typo (remember - loci is external input). These are eliminated.
        loci = loci.split(',').delete_if(&:empty?)

        # Each database is searched for each locus. For each locus, search is
        # terminated on the first database match.
        # NOTE: This can return incorrect sequence if the sequence ids are
        # not unique across all databases.
        seqs = loci.map do |locus|
          # Get sequence id and coords. coords may be nil. accession can't
          # be.
          accession, coords = locus.split(':')

          # Initialise a variable to store retrieved sequence.
          seq = nil

          # Go over each database looking for this accession.
          each do |database|
            # Database lookup  will return a string if given accession is
            # present in the database, nil otherwise.
            seq = database.retrieve(accession, coords)
            # Found a match! Terminate iteration returning the retrieved
            # sequence.
            break if seq
          end

          # If accession was not present in any database, insert an error
          # message in place of the sequence. The line starts with '#'
          # and should be ignored by BLAST (not tested).
          unless seq
            seq = "# ERROR: #{locus} not found in any database"
          end

          # Return seq.
          seq
        end

        # Array -> String
        seqs.join("\n")
      end

      # Intended to be used only for testing.
      def first
        all.first
      end

      # Intended to be used only for testing.
      def clear
        collection.clear
      end
    end
  end
end
