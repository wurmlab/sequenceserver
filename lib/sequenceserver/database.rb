require 'find'
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

      # Intended to be used only for testing.
      def first
        all.first
      end

      # Intended to be used only for testing.
      def clear
        collection.clear
      end

      # Recurisvely scan `database_dir` for blast databases.
      #
      # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
      def blastdbcmd
        cmd = "blastdbcmd -recursive -list #{config[:database_dir]}" \
              ' -list_outfmt "%f	%t	%p	%n	%l	%d"'
        out, err = sys(cmd, path: config[:bin])
        errpat = /BLAST Database error/
        fail BLAST_DATABASE_ERROR.new(cmd, err) if err.match(errpat)
        return out
      rescue CommandFailed => e
        fail BLAST_DATABASE_ERROR.new(cmd, e.stderr)
      end

      def scan_databases_dir
        out = blastdbcmd
        fail NO_BLAST_DATABASE_FOUND, config[:database_dir] if out.empty?
        out.each_line do |line|
          name = line.split('	')[0]
          next if multipart_database_name?(name)
          self << Database.new(*line.split('	'))
        end
      end
      # rubocop:enable Metrics/AbcSize, Metrics/MethodLength

      # Recursively scan `database_dir` for un-formatted FASTA and format them
      # for use with BLAST+.
      def make_blast_databases
        unformatted_fastas.select do |file, sequence_type|
          make_blast_database(file, sequence_type)
        end
      end

      # Returns an Array of FASTA files that may require formatting, and the
      # type of sequence contained in each FASTA.
      #
      #   > unformatted_fastas
      #   => [['/foo/bar.fasta', :nulceotide], ...]
      def unformatted_fastas
        list = []
        database_dir = config[:database_dir]
        Find.find database_dir do |file|
          next if File.directory? file
          next if Database.include? file
          next unless probably_fasta? file
          sequence_type = guess_sequence_type_in_fasta file
          if %i[protein nucleotide].include?(sequence_type)
            list << [file, sequence_type]
          end
        end
        list
      end

      # Create BLAST database, given FASTA file and sequence type in FASTA file.
      def make_blast_database(file, type)
        return unless make_blast_database? file, type
        title = get_database_title(file)
        taxid = fetch_tax_id
        _make_blast_database(file, type, title, taxid)
      end

      def _make_blast_database(file, type, title, taxid, quiet = false)
        cmd = 'makeblastdb -parse_seqids -hash_index ' \
              "-in #{file} -dbtype #{type.to_s.slice(0, 4)} -title '#{title}'" \
              " -taxid #{taxid}"
        out, err = sys(cmd, path: config[:bin])
        puts out, err unless quiet
      end

      # Show file path and guessed sequence type to the user and obtain a y/n
      # response.
      #
      # Returns true if the user entered anything but 'n' or 'N'.
      def make_blast_database?(file, type)
        puts
        puts
        puts "FASTA file: #{file}"
        puts "FASTA type: #{type}"
        print 'Proceed? [y/n] (Default: y): '
        response = STDIN.gets.to_s.strip
        !response.match(/n/i)
      end

      # Generate a title for the given database and show it to the user for
      # confirmation.
      #
      # Returns user input if any. Auto-generated title otherwise.
      def get_database_title(path)
        default = make_db_title(File.basename(path))
        print "Enter a database title or will use '#{default}': "
        from_user = STDIN.gets.to_s.strip
        from_user.empty? && default || from_user
      end

      # Get taxid from the user. Returns user input or 0.
      #
      # Using 0 as taxid is equivalent to not setting taxid for the database
      # that will be created.
      def fetch_tax_id
        default = 0
        print 'Enter taxid (optional): '
        user_response = STDIN.gets.strip
        user_response.empty? && default || Integer(user_response)
      rescue
        puts 'taxid should be a number'
        retry
      end

      # Returns true if the database name appears to be a multi-part database
      # name.
      #
      # e.g.
      # /home/ben/pd.ben/sequenceserver/db/nr.00 => yes
      # /home/ben/pd.ben/sequenceserver/db/nr => no
      # /home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01 => yes
      # /home/ben/pd.ben/sequenceserver/db/nr00 => no
      # /mnt/blast-db/refseq_genomic.100 => yes
      def multipart_database_name?(db_name)
        !(db_name.match(%r{.+/\S+\.\d{2,3}$}).nil?)
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
        db_name.tr!('"', "'")
        # removes .fasta like extension names
        db_name.gsub!(File.extname(db_name), '')
        # replaces _ with ' ',
        db_name.gsub!(/(_)/, ' ')
        # replaces '.' with ' ' when no numbers are on either side,
        db_name.gsub!(/(\D)\.(?=\D)/, '\1 ')
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
        sequences = sample_sequences(file)
        sequence_types = sequences.map { |seq| Sequence.guess_type(seq) }
        sequence_types = sequence_types.uniq.compact
        (sequence_types.length == 1) && sequence_types.first
      end

      # Read first 32768 characters of the file. Split on fasta def line
      # pattern and return.
      #
      # If the given file is FASTA, returns Array of as many different
      # sequences in the portion of the file read. Returns the portion
      # of the file read wrapped in an Array otherwise.
      def sample_sequences(file)
        File.read(file, 32_768).split(/^>.+$/).delete_if(&:empty?)
      end
    end
  end
end
