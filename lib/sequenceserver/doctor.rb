require 'set'
require 'sequenceserver/config'
require 'sequenceserver/database'
require 'sequenceserver/sequence'

module SequenceServer
  # Doctor detects inconsistencies likely to cause problems with Sequenceserver
  # operation.
  class Doctor
    ERROR_PARSE_SEQIDS        = 1
    ERROR_NUMERIC_IDS         = 2
    ERROR_PROBLEMATIC_IDS     = 3

    AVOID_ID_REGEX            = /^(?!gi|bbs)\w+\|\w*\|?/

    class << self
      extend Forwardable

      def_delegators SequenceServer, :config

      # Returns an array of database objects in which each of the object has an
      # array of sequence_ids satisfying the block passed to the method.
      def inspect_seqids(seqids, &block)
        seqids.map do |sq|
          sq[:db] unless sq[:seqids].select(&block).empty?
        end.compact
      end

      # Retrieve sequence ids (specified by %i) from all databases. Using
      # accession number is problematic because of several reasons.[2]
      def all_sequence_ids(ignore)
        Database.map do |db|
          next if ignore.include? db

          out = `blastdbcmd -entry all -db #{db.name} -outfmt "%i" 2> /dev/null`
          {
            db:     db,
            seqids: out.to_s.split
          }
        end.compact
      end

      # FASTA files formatted without -parse_seqids option won't support the
      # blastdbcmd command of fetching sequence ids using '%i' identifier.
      # In such cases, an array of 'N/A' values are returned which is
      # checked in this case.
      def inspect_parse_seqids(seqids)
        seqids.map do |sq|
          sq[:db] if sq[:seqids].include? 'N/A'
        end.compact
      end

      # Pretty print database list.
      def bullet_list(values)
        list = ''
        values.each do |value|
          list << "      - #{value}\n"
        end
        list
      end

      # Print diagnostic error messages according to the type of error.
      # rubocop:disable Metrics/MethodLength
      def show_message(error, values)
        return if values.empty?

        case error
        when ERROR_PARSE_SEQIDS
          puts <<~MSG
            *** Doctor has found improperly formatted database:
            #{bullet_list(values)}
            Please reformat your databases with -parse_seqids switch (or use
            sequenceserver -m) for using SequenceServer as the current format
            may cause problems.

            These databases are ignored in further checks.
          MSG

        when ERROR_NUMERIC_IDS
          puts <<~MSG
            *** Doctor has found databases with numeric sequence ids:
            #{bullet_list(values)}
            Note that this may cause problems with sequence retrieval.
          MSG

        when ERROR_PROBLEMATIC_IDS
          puts <<~MSG
            *** Doctor has found databases with problematic sequence ids:
            #{bullet_list(values)}
            This causes some sequence to contain extraneous words like `gnl|`
            appended to their id string.
          MSG
        end
      end
      # rubocop:enable Metrics/MethodLength
    end

    def initialize
      @ignore     = []
      @all_seqids = Doctor.all_sequence_ids(@ignore)
    end

    attr_reader :invalids, :all_seqids

    def diagnose
      puts "\n1/3 Inspecting databases for proper -parse_seqids formatting.."
      check_parse_seqids
      remove_invalid_databases

      puts "\n2/3 Inspecting databases for numeric sequence ids.."
      check_numeric_ids

      puts "\n3/3 Inspecting databases for problematic sequence ids.."
      check_id_format
    end

    # Remove entried which are in ignore list or not formatted with
    # -parse_seqids option.
    def remove_invalid_databases
      @all_seqids.delete_if { |sq| @ignore.include? sq[:db] }
    end

    # Obtain files which aren't formatted with -parse_seqids and add them to
    # ignore list.
    def check_parse_seqids
      without_parse_seqids = Doctor.inspect_parse_seqids(@all_seqids)
      Doctor.show_message(ERROR_PARSE_SEQIDS, without_parse_seqids)

      @ignore.concat(without_parse_seqids)
    end

    # Check for the presence of numeric sequence ids within a database.
    def check_numeric_ids
      selector = proc { |id| !id.to_i.zero? }

      Doctor.show_message(ERROR_NUMERIC_IDS,
                          Doctor.inspect_seqids(@all_seqids, &selector))
    end

    # Warn users about sequence identifiers of format abc|def because then
    # BLAST+ appends a gnl (for general) infront of the database
    # identifiers. There are only two identifiers that we need to avoid
    # when searching for this format.[1]
    # bbs|number, gi|number
    # Note that while sequence ids could have been arbitrary, using
    # parse_seqids reduces our search space substantially.
    def check_id_format
      selector = proc { |id| id.match(AVOID_ID_REGEX) }

      Doctor.show_message(ERROR_PROBLEMATIC_IDS,
                          Doctor.inspect_seqids(@all_seqids, &selector))
    end
  end
end

# [1]: http://etutorials.org/Misc/blast/Part+IV+Industrial-Strength+BLAST/Chapter+11.+BLAST+Databases/11.1+FASTA+Files/
# [2]: For sequence deflines of the kind abc|def, accession number is returned
# as abc:def. Even though you take hacky measure and ensure that latter is
# queried, correct entries are not returned. Using the value returned by %i
# works in all cases. This may change in later versions of BLAST+.
