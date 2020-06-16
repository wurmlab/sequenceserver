require 'spec_helper'
require 'sequenceserver/database'

# Test Database class.
module SequenceServer
  describe 'Database' do
    let 'root' do
      __dir__
    end

    let 'makeblastdb' do
      SequenceServer.makeblastdb
    end

    let 'database_dir' do
      File.join(root, 'database')
    end

    let 'database_dir_sample' do
      File.join(database_dir, 'sample')
    end

    let 'database_dir_v4' do
      File.join(database_dir, 'v4')
    end

    let 'database_dir_unformatted' do
      File.join(database_dir, 'unformatted')
    end

    let 'database_dir_without_parse_seqids' do
      File.join(database_dir, 'without_parse_seqids')
    end

    let 'fasta_file_prot_seqs' do
      File.join(database_dir_sample, 'proteins', 'Solenopsis_invicta',
                'Sinvicta2-2-3.prot.subset.fasta')
    end

    let 'fasta_file_nucl_seqs' do
      File.join(database_dir_sample, 'transcripts', 'Solenopsis_invicta',
                'Sinvicta2-2-3.cdna.subset.fasta')
    end

    let 'text_file' do
      File.join(database_dir_sample, 'links.rb')
    end

    let 'binary_file' do
      File.join(database_dir_sample, 'proteins', 'Solenopsis_invicta',
                'Sinvicta2-2-3.prot.subset.fasta.phr')
    end

    let 'data_for_makeblastdb' do
      [
        File.join(database_dir_unformatted, 'Cardiocondyla_obscurior',
                  'Cobs1.4.proteins.fa'),
        :protein,
        'Cobs 1.4 proteins',
        true
      ]
    end

    let 'makeblastdb_result_pattern' do
      File.join(database_dir_unformatted, 'Cardiocondyla_obscurior',
                'Cobs1.4.proteins.fa.*')
    end

    before do
      SequenceServer.init
    end

    it 'can tell FASTA file' do
      makeblastdb.send(:probably_fasta?, text_file).should be_falsey
      makeblastdb.send(:probably_fasta?, binary_file).should be_falsey
      makeblastdb.send(:probably_fasta?, fasta_file_prot_seqs).should be_truthy
      makeblastdb.send(:probably_fasta?, fasta_file_nucl_seqs).should be_truthy
    end

    it 'can tell type of sequences in FASTA file' do
      makeblastdb.send(:guess_sequence_type_in_fasta, fasta_file_prot_seqs).should eq :protein
      makeblastdb.send(:guess_sequence_type_in_fasta, fasta_file_nucl_seqs).should eq :nucleotide
    end

    it 'can tell FASTA files that are yet to be made into a BLAST+ database' do
      makeblastdb.instance_variable_set(:@database_dir, database_dir_unformatted)
      makeblastdb.scan.should be_truthy
    end

    it 'can tell databases that require reformatting' do
      # Control: shouldn't report sample v5 databases created using -parse_seqids
      # as requiring reformatting.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_sample)
      makeblastdb.scan.should be_falsey

      # v4 databases require reformatting.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_v4)
      makeblastdb.scan.should be_truthy

      # non -parse_seqids databases require reformatting.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_without_parse_seqids)
      makeblastdb.scan.should be_truthy
    end

    # it 'can make BLAST+ database from a FASTA file' do
    #   Database._make_blast_database(*data_for_makeblastdb).should be_truthy
    #   system "rm #{makeblastdb_result_pattern}"
    # end

    it 'can make intelligent database name suggestions' do
      db_name_pairs = [['Si_gnf.fasta', 'Si gnf'],
                       ['Aech.3.8.cds.fasta', 'Aech 3.8 cds'],
                       ['Cobs1.4.proteins.fasta', 'Cobs 1.4 proteins'],
                       ['S_inv.x.small.2.5.nucl.fa', 'S inv x small 2.5 nucl'],
                       ['Sinvicta2-2-3.prot.fasta', 'Sinvicta 2-2-3 prot']]
      db_name_pairs.each do |db|
        makeblastdb.send(:make_db_title, db[0]).should eql(db[1])
      end
    end
  end
end
