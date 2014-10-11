require 'find'
require 'digest/md5'
require 'forwardable'

require 'sequenceserver/sequence'

module SequenceServer

  # Captures a directory containing FASTA files and BLAST databases.
  #
  # Formatting a FASTA for use with BLAST+ will create 3 or 6 files,
  # collectively referred to as a BLAST database.
  #
  # It is important that formatted BLAST database files have the same dirname and
  # basename as the source FASTA for SequenceServer to be able to tell formatted
  # FASTA from unformatted. And that FASTA files be formatted with `parse_seqids`
  # option of `makeblastdb` for sequence retrieval to work.
  #
  # SequenceServer will always place BLAST database files alongside input FASTA,
  # and use `parse_seqids` option of `makeblastdb` to format databases.
  class Database < Struct.new(:name, :title, :type)

    class << self

      extend Forwardable

      def_delegators SequenceServer, :config, :logger

      def collection
        @collection ||= {}
      end

      private :collection

      def <<(database)
        collection[database.id] = database
      end

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

      def include?(path)
        collection.include? Digest::MD5.hexdigest path
      end

      def group_by(&block)
        all.group_by(&block)
      end

      # Intended to be used only for testing.
      def first
        all.first
      end

      # Recurisvely scan `database_dir` for blast databases.
      def scan_databases_dir
        database_dir = config[:database_dir]
        list = %x|blastdbcmd -recursive -list #{database_dir} -list_outfmt "%p	%f	%t" 2>&1|
        list.each_line do |line|
          type, name, title =  line.split('	')
          next if multipart_database_name?(name)
          self << Database.new(name, title, type)
        end
      end

      # Recursively scan `database_dir` for un-formatted FASTA and format them
      # for use with BLAST+.
      def make_blast_databases
        unformatted_fastas.each do |file, sequence_type|
          make_blast_database(file, sequence_type)
        end
      end

      # Returns an Array of FASTA files that may require formatting, and the type
      # of sequence contained in each FASTA.
      #
      #   > unformatted_fastas
      #   => [['/foo/bar.fasta', :nulceotide], ...]
      def unformatted_fastas
        list = []
        database_dir = config[:database_dir]
        Find.find database_dir do |file|
          next if File.directory?(file)
          next if Database.include? file
          if probably_fasta? file
            sequence_type = guess_sequence_type_in_fasta file
            if [:protein, :nucleotide].include?(sequence_type)
              list << [file, sequence_type]
            end
          end
        end
        list
      end

      # Create BLAST database, given FASTA file and sequence type in FASTA file.
      def make_blast_database(file, type)
        puts "FASTA file: #{file}"
        puts "FASTA type: #{type}"

        response = ''
        until response.match(/^[yn]$/i) do
          print "Proceed? [y/n]: "
          response = STDIN.gets.chomp
        end

        if response.match(/y/i)
          print "Enter a database title or will use '#{File.basename(file)}': "
          title = STDIN.gets.chomp
          title.gsub!('"', "'")
          title = File.basename(file) if title.empty?

          `makeblastdb -in #{file} -dbtype #{type.to_s.slice(0,4)} -title "#{title}" -parse_seqids`
        end
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

      # Returns true if first character of the file is '>'.
      def probably_fasta?(file)
        File.read(file, 1) == '>'
      end

      # Guess whether FASTA file contains protein or nucleotide sequences based
      # on first 32768 characters.
      #
      # NOTE: 2^15 == 32786. Approximately 546 lines, assuming 60 characters on
      # each line.
      def guess_sequence_type_in_fasta(file)
        sample = File.read(file, 32768)
        sequences = sample.split(/^>.+$/).delete_if { |seq| seq.empty? }
        sequence_types = sequences.map {|seq| Sequence.guess_type(seq)}.uniq.compact
        (sequence_types.length == 1) && sequence_types.first
      end
    end

    def initialize(*args)
      args.last.downcase!
      args.each(&:freeze)
      super

      @id = Digest::MD5.hexdigest args.first
    end

    attr_reader :id

    def to_s
      "#{type}: #{title} #{name}"
    end
  end
end
