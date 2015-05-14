module SequenceServer
  # Define BLAST::HSP and BLAST::HSP::*.
  module BLAST
    # Structure to hold generic HSP data for each hit.
    #
    # HSP class is not used directly.  Relevant HSP stats and formatting the
    # alignment changes with BLAST algorithm. We subclass HSP for each BLAST
    # algorithm.
    HSP = Struct.new(:hit, :number, :bit_score, :score, :evalue, :qstart, :qend,
                     :sstart, :send, :qframe, :sframe, :identity, :positives,
                     :gaps, :length, :qseq, :sseq, :midline) do
      INTEGER_ARGS = [1, 3].concat((5..14).to_a)
      FLOAT_ARGS   = [2, 4]

      def initialize(*args)
        INTEGER_ARGS.each do |i|
          args[i] = args[i].to_i
        end

        FLOAT_ARGS.each do |i|
          args[i] = args[i].to_f
        end

        super
      end

      # Returns a Hash of stats common to all BLAST algorithms. Subclasses must
      # update the returned Hash to add relevant stats of their own.
      #
      # rubocop:disable Metrics/AbcSize
      def stats
        {
          'Score'      => [in_twodecimal(bit_score), score],
          'E value'    => in_scientific_or_twodecimal(evalue),
          'Identities' => [in_fraction(identity,   length),
                           in_percentage(identity, length)],
          'Gaps'       => [in_fraction(gaps,   length),
                           in_percentage(gaps, length)]
        }
      end
      # rubocop:enable Metrics/AbcSize

      # Returns pretty formatted alignment String.
      #
      # Calls out to `nqseq`, `nsseq`, `qframe_unit`, `sframe_unit`,
      # `qframe_sign`, and `sframe_sign` attributes. The default value of
      # these attributes suit BLASTP. Subclasses must override these
      # attributes appropriately.
      #
      # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity
      # rubocop:disable Metrics/MethodLength, Style/FormatString
      def pp
        chars = 60
        lines = (length / chars.to_f).ceil
        width = [qend, send, qstart, sstart].map(&:to_s).map(&:length).max

        nqseq = self.nqseq
        nsseq = self.nsseq

        s = ''
        (1..lines).each do |i|
          lqstart = nqseq
          lqseq = qseq[chars * (i - 1), chars]
          nqseq += (lqseq.length - lqseq.count('-')) * qframe_unit * qframe_sign
          lqend = nqseq - qframe_sign
          s << "Query   %#{width}d  #{lqseq}  #{lqend}\n" % lqstart

          lmseq = midline[chars * (i - 1), chars]
          s << "#{' ' * (width + 8)}  #{lmseq}\n"

          lsstart = nsseq
          lsseq = sseq[chars * (i - 1), chars]
          nsseq += (lsseq.length - lsseq.count('-')) * sframe_unit * sframe_sign
          lsend = nsseq - sframe_sign
          s << "Subject %#{width}d  #{lsseq}  #{lsend}\n" % lsstart

          s << "\n" unless i == lines
        end
        s
      end
      # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity
      # rubocop:enable Metrics/MethodLength, Style/FormatString

      ## We calculate start and end coordinate of each line of the alignment ##
      ## based on the six attributes below. See `pp` method.                 ##

      # Alignment start coordinate for query sequence.
      #
      # This will be qstart or qend depending on the direction in which the
      # (translated) query sequence aligned.
      def nqseq
        qframe >= 0 ? qstart : qend
      end

      # Alignment start coordinate for subject sequence.
      #
      # This will be sstart or send depending on the direction in which the
      # (translated) subject sequence aligned.
      def nsseq
        sframe >= 0 ? sstart : send
      end

      # Jump in query coordinate.
      #
      # Roughly,
      #
      #   qend = qstart + n * qframe_unit
      #
      # This will be 1 or 3 depending on whether the query sequence was
      # translated or not.
      def qframe_unit
        1
      end

      # Jump in subject coordinate.
      #
      # Roughly,
      #
      #   send = sstart + n * sframe_unit
      #
      # This will be 1 or 3 depending on whether the subject sequence was
      # translated or not.
      def sframe_unit
        1
      end

      # If we should add or subtract qframe_unit from qstart to arrive at qend.
      #
      # Roughly,
      #
      #   qend = qstart + (qframe_sign) * n * qframe_unit
      #
      # This will be +1 or -1, depending on the direction in which the
      # (translated) query sequence aligned.
      def qframe_sign
        qframe >= 0 ? 1 : -1
      end

      # If we should add or subtract sframe_unit from sstart to arrive at send.
      #
      # Roughly,
      #
      #   send = sstart + (sframe_sign) * n * sframe_unit
      #
      # This will be +1 or -1, depending on the direction in which the
      # (translated) subject sequence aligned.
      def sframe_sign
        sframe >= 0 ? 1 : -1
      end

      ## We define stats in terms of the following functions. ##

      # Returns fractional representation as String.
      #
      # NOTE:
      #   Rational class reduces the fraction so we can't use that.
      def in_fraction(num, den)
        "#{num}/#{den}"
      end

      # Returns percentage as Float-String formatted to two decimal places.
      def in_percentage(num, den)
        format '%.2f', (num * 100.0 / den)
      end

      # Returns given Float as String formatted to two decimal places.
      def in_twodecimal(num)
        format '%.2f', num
      end

      # Formats the given number as "1e-3" if the number is less than 1 or
      # greater than 10.
      def in_scientific_or_twodecimal(num)
        return in_twodecimal(num) if num >= 1 && num < 10
        format '%.2e', num.to_f
      end
    end

    class HSP
      # HSP subclass for BLASTX algorithm.
      class BLASTX < self
        def stats
          super.update 'Query frame' => qframe
        end

        # Translated nucleotide query against protein database, hence 3.
        def qframe_unit
          3
        end
      end

      # HSP subclass for BLASTP algorithm.
      class BLASTP < self
        def stats
          super.update(
            'Positives' =>
            [
              in_fraction(positives,   length),
              in_percentage(positives, length)
            ]
          )
        end
      end

      # HSP subclass for BLASTN algorithm.
      class BLASTN < self
        def stats
          super.update('Strand' =>
                       "#{qframe > 0 ? '+' : '-'}/#{sframe > 0 ? '+' : '-'}")
        end

        # BLASTN is a bit weird in that, no matter which direction the query
        # sequence aligned in, qstart is taken as alignment start coordinate
        # for query.
        #
        # NOTE:
        #   Because BLAST reverses the qstart and qend for BLASTN?
        def nqseq
          qstart
        end

        # BLASTN is a bit weird in that, no matter which direction the subject
        # sequence aligned in, sstart is taken as alignment start coordinate
        # for subject.
        #
        # NOTE:
        #   Because BLAST reverses the sstart and send for BLASTN?
        def nsseq
          sstart
        end
      end

      # HSP subclass for TBLASTX algorithm.
      class TBLASTX < self
        def stats
          super.update(
            'Frame'     => in_fraction(qframe, sframe),
            'Positives' =>
            [
              in_fraction(positives, length),
              in_percentage(positives, length)
            ]
          )
        end

        # Translated nucleotide query against translated nucleotide database,
        # hence 3.
        def qframe_unit
          3
        end

        # Translated nucleotide query against translated nucleotide database,
        # hence 3.
        def sframe_unit
          3
        end
      end

      # HSP subclass for TBLASTN algorithm.
      class TBLASTN < self
        def stats
          super.update 'Hit frame' => sframe
        end

        # Protein query against translated nucleotide database, hence 3.
        def sframe_unit
          3
        end
      end
    end
  end
end
