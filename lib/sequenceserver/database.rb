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
  class Database < Struct.new(:name, :title, :type, :nsequences, :ncharacters, :updated_on)

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
        list = %x|blastdbcmd -recursive -list #{database_dir} -list_outfmt "%f	%t	%p	%n	%l	%d" 2>&1|
        list.each_line do |line|
          name = line.split('	')[0]
          next if multipart_database_name?(name)
          self << Database.new(*line.split('	'))
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

        print "Proceed? [y/n] (Default: y): "
        response = STDIN.gets.to_s.strip

        unless response.match(/n/i)
          default_title = make_db_title(File.basename(file))
          print "Enter a database title or will use '#{default_title}': "
          title = STDIN.gets.to_s
          title = default_title if title.strip.empty?

          `makeblastdb -parse_seqids -hash_index \
            -in #{file} -dbtype #{type.to_s.slice(0,4)} -title "#{title}"`
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

      # Suggests improved titles when generating database names from files
      # for improved apperance and readability in web interface.
      # For example:
      # Cobs1.4.proteins.fasta -> Cobs 1.4 proteins
      # S_invicta.xx.2.5.small.nucl.fa -> S invicta xx 2.5 small nucl
      def make_db_title(db_name)
        db_name.gsub!('"', "'")
        # removes .fasta like extension names
        db_name.gsub!(File.extname(db_name), '')
        # replaces _ with ' ',
        db_name.gsub!(/(_)/, ' ')
        # replaces '.' with ' ' when no numbers are on either side,
        db_name.gsub!(/(?<![0-9])\.(?![0-9])/, ' ')
        # preserves version numbers
        db_name.gsub!(/\W*(\d+([.-]\d+)+)\W*/, ' \1 ')
        db_name
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
      args[2].downcase!   # database type
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
