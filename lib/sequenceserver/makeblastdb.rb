require 'find'
require 'forwardable'

module SequenceServer
  # Smart `makeblastdb` wrapper: recursively scans database directory determining
  # which files need to be formatted or re-formatted.
  #
  # Example usage:
  #
  #   makeblastdb = MAKEBLASTDB.new(database_dir)
  #   makeblastdb.run # formats and re-formats databases in database_dir
  #   makeblastdb.formatted_fastas # lists formatted databases
  #
  class MAKEBLASTDB
    extend Forwardable

    def_delegators SequenceServer, :config, :sys

    def initialize(database_dir)
      @database_dir = database_dir
    end

    attr_reader :database_dir

    def any_formatted?
      formatted_fastas.any?
    end

    def any_to_format_or_reformat?
      any_to_format? || any_to_reformat?
    end

    def no_fastas?
      probably_fastas.empty?
    end

    # Runs makeblastdb on each file in `fastas_to_format` and
    # `fastas_to_reformat`.
    def run
      format
      reformat
    end

    # Format any unformatted FASTA files in database directory. Returns Array
    # of files that were formatted.
    def format
      # Make the intent clear as well as ensure the program won't crash if we
      # accidentally call format before calling scan.
      return unless any_to_format?

      fastas_to_format.select do |path, title, type|
        make_blast_database('format', path, title, type)
      end
    end

    # Re-format databases that require reformatting. Returns Array of files
    # that were reformatted.
    def reformat
      # Make the intent clear as well as ensure the program won't crash if
      # we accidentally call reformat before calling scan.
      return unless any_to_reformat?

      fastas_to_reformat.select do |path, title, type, non_parse_seqids|
        make_blast_database('reformat', path, title, type, non_parse_seqids)
      end
    end

    # Determines which FASTA files in the database directory are already
    # formatted.
    def formatted_fastas
      return @formatted_fastas if defined?(@formatted_fastas)

      @formatted_fastas = []

      blastdbcmd.each_line do |line|
        path, *rest = line.chomp.split("\t")
        next if multipart_database_name?(path)

        rest << get_categories(path)
        @formatted_fastas << Database.new(path, *rest)
      end

      @formatted_fastas
    end

    def any_to_format?
      fastas_to_format.any?
    end

    private

    def any_to_reformat?
      fastas_to_reformat.any?
    end

    # Determines which FASTA files in the database directory require
    # reformatting.
    def fastas_to_reformat
      return @fastas_to_reformat if defined?(@fastas_to_reformat)

      @fastas_to_reformat = []
      formatted_fastas.each do |ff|
        @fastas_to_reformat << [ff.path, ff.title, ff.type, ff.non_parse_seqids?] if ff.v4? || ff.non_parse_seqids?
      end

      @fastas_to_reformat
    end

    # Determines which FASTA files in the database directory are
    # unformatted.
    def fastas_to_format
      return @fastas_to_format if defined?(@fastas_to_format)

      formatted_fasta_paths = formatted_fastas.map { |f| f[0] }
      fasta_paths_to_format = probably_fastas - formatted_fasta_paths

      @fastas_to_format = fasta_paths_to_format.map do |path|
        [
          path,
          make_db_title(path),
          guess_sequence_type_in_fasta(path)
        ]
      end

      @fastas_to_format
    end

    def probably_fastas
      return @probably_fastas if defined?(@probably_fastas)

      @probably_fastas = []

      Find.find(database_dir + '/') do |path|
        next if File.directory?(path)

        @probably_fastas << path if probably_fasta?(path)
      end

      @probably_fastas
    end

    # Runs `blastdbcmd` to determine formatted FASTA files in the database
    # directory. Returns the output of `blastdbcmd`. This method is called
    # by `determine_formatted_fastas`.
    def blastdbcmd
      cmd = "blastdbcmd -recursive -list #{config[:database_dir]}" \
            ' -list_outfmt "%f	%t	%p	%n	%l	%d	%v"'
      out, err = sys(cmd, path: config[:bin])
      errpat = /BLAST Database error/
      fail BLAST_DATABASE_ERROR.new(cmd, err) if err.match(errpat)

      out
    rescue CommandFailed => e
      raise BLAST_DATABASE_ERROR.new(cmd, e.stderr)
    end

    # Create BLAST database, given FASTA file and sequence type in FASTA file.
    def make_blast_database(action, file, title, type, non_parse_seqids = false)
      return unless make_blast_database?(action, file, type)

      title = confirm_database_title(title)
      extract_fasta(file) unless File.exist?(file)
      taxonomy = taxid_map(file, non_parse_seqids) || taxid
      _make_blast_database(file, type, title, taxonomy)
    end

    # Show file path and guessed sequence type to the user and obtain a y/n
    # response.
    #
    # Returns true if the user entered anything but 'n' or 'N'.
    def make_blast_database?(action, file, type)
      puts
      puts
      puts "FASTA file to #{action}: #{file}"
      puts "FASTA type: #{type}"
      print 'Proceed? [y/n] (Default: y): '
      response = STDIN.gets.to_s.strip
      !response.match(/n/i)
    end

    # Show the database title that we are going to use to the user for
    # confirmation.
    #
    # Returns user input if any. Auto-determined title otherwise.
    def confirm_database_title(default)
      print "Enter a database title or will use '#{default}': "
      from_user = STDIN.gets.to_s.strip
      from_user.empty? && default || from_user
    end

    # Check if a '.taxid_map.txt' file exists. If not, try getting it
    # using blastdbcmd.
    def taxid_map(db, non_parse_seqids)
      return if non_parse_seqids

      taxid_map = db.sub(/#{File.extname(db)}$/, '.taxid_map.txt')
      extract_taxid_map(db, taxid_map) unless File.exist?(taxid_map)
      "-taxid_map #{taxid_map}" unless File.zero?(taxid_map)
    end

    # Get taxid from the user. Returns user input or 0.
    #
    # Using 0 as taxid is equivalent to not setting taxid for the database
    # that will be created.
    def taxid
      default = 0
      print 'Enter taxid (optional): '
      user_response = STDIN.gets.strip
      "-taxid #{user_response.empty? && default || Integer(user_response)}"
    rescue ArgumentError # presumably from call to Interger()
      puts 'taxid should be a number'
      retry
    end

    def _make_blast_database(file, type, title, taxonomy)
      cmd = "makeblastdb -parse_seqids -hash_index -in '#{file}'" \
            " -dbtype #{type.to_s.slice(0, 4)} -title '#{title}'" \
            " #{taxonomy}"

      output = if File.directory?(file)
                 File.join(file, 'makeblastdb')
               else
                 "#{file}.makeblastdb"
               end

      out, err = sys(
        cmd,
        path: config[:bin],
        stderr: [output, 'stderr'].join,
        stdout: [output, 'stdout'].join
      )

      puts out.strip
      puts err.strip

      true
    rescue CommandFailed => e
      puts <<~MSG
        Could not create BLAST database for: #{file}
        Tried: #{cmd}
        stdout: #{e.stdout}
        stderr: #{e.stderr}
      MSG
      exit!
    end

    # Extract FASTA file from BLAST database.
    #
    # Invoked while reformatting a BLAST database if the corresponding
    # FASTA file does not exist.
    def extract_fasta(db)
      puts
      puts 'Extracting sequences ...'
      cmd = "blastdbcmd -entry all -db #{db}"
      sys(cmd, stdout: db, path: config[:bin])
    rescue CommandFailed => e
      puts <<~MSG
        Could not extract sequences from: #{db}
        Tried: #{cmd}
        stdout: #{e.stdout}
        stderr: #{e.stderr}
      MSG
      exit!
    end

    def extract_taxid_map(db, taxmap_file)
      cmd = "blastdbcmd -entry all -db #{db} -outfmt '%i %T'"
      sys(cmd, stdout: taxmap_file, path: config[:bin])
    rescue CommandFailed => e
      # silence error
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
      !db_name.match(%r{.+/\S+\.\d{2,3}$}).nil?
    end

    def get_categories(path)
      path
        .gsub(config[:database_dir], '') # remove database_dir from path
        .split('/')
        .reject(&:empty?)[0..-2] # the first entry might be '' if database_dir does not end with /
    end

    # Returns true if first character of the file is '>'.
    def probably_fasta?(file)
      unless file.match(/((cdna)|(cds)|(dna)|(fa)|(faa)|(fas)|(fasta)|(fna)|(genome)|(nt)|(nuc)|(pep)|(prot))$/i)
        return false
      end

      File.read(file, 1) == '>'
    end

    # Suggests improved titles when generating database names from files
    # for improved apperance and readability in web interface.
    # For example:
    # Cobs1.4.proteins.fasta -> Cobs 1.4 proteins
    # S_invicta.xx.2.5.small.nucl.fa -> S invicta xx 2.5 small nucl
    def make_db_title(path)
      db_name = File.basename(path)
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

    # Guess whether FASTA file contains protein or nucleotide sequences by
    # sampling a few few characters of the file.
    def guess_sequence_type_in_fasta(file)
      sequences = sample_sequences(file)
      sequence_types = sequences.map { |seq| Sequence.guess_type(seq) }
      sequence_types = sequence_types.uniq.compact
      (sequence_types.length == 1) && sequence_types.first
    end

    # Read first 1,048,576 characters of the file, split the read text on
    # fasta def line pattern and return.
    #
    # If the given file is FASTA, returns Array of as many different
    # sequences in the portion of the file read. Returns the portion
    # of the file read wrapped in an Array otherwise.
    def sample_sequences(file)
      File.read(file, 1_048_576).split(/^>.+$/).delete_if(&:empty?)
    end
  end
end
