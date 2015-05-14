# Define constants used by SequenceServer module
module SequenceServer
  # Constant for denoting the path ~/.sequenceserver
  DOTDIR = File.expand_path('~/.sequenceserver')
  # Define constanst used by BLAST module.
  module BLAST
    ERROR_LINE = /\(CArgException.*\)\s(.*)/

    ALGORITHMS = %w(blastn blastp blastx tblastn tblastx)

    OUTFMT_SPECIFIERS = %w(qseqid qgi qacc sseqid sallseqid sgi sallgi sacc
                           sallacc qstart qend sstart send qseq sseq evalue
                           bitscore score length length pident nident
                           mismatch positive gapopen gaps ppos frames
                           qframe hframe btop staxids sscinames scomnames
                           sblastnames sskingdoms stitle salltitles sstrand
                           qcovs qcovhsp).join(' ')
    OUTFMT = {
      'pairwise'        => [0, :txt],
      'qa'              => [1, :txt],
      'qa_no_identity'  => [2, :txt],
      'fqa'             => [3, :txt],
      'fqa_no_identity' => [4, :txt],
      'xml'             => [5, :xml],
      'std_tsv'         => [7, :tsv],
      'full_tsv'        => [7, :tsv, OUTFMT_SPECIFIERS],
      'asn_text'        => [8, :asn],
      'asn_binary'      => [9, :asn],
      'csv'             => [10, :csv],
      'archive'         => [11, :txt]
    }
  end
end

# References
# ----------
# [1]: http://www.ncbi.nlm.nih.gov/books/NBK1763/
