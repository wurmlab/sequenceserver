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

    let 'database_dir_v5' do
      File.join(database_dir, 'v5', 'sample')
    end

    let 'database_dir_v4' do
      File.join(database_dir, 'v4', 'sample')
    end

    let 'database_dir_unformatted' do
      File.join(database_dir, 'unformatted')
    end

    let 'database_dir_without_parse_seqids' do
      File.join(database_dir, 'v5', 'without_parse_seqids')
    end

    let 'database_dir_blastdb_aliastool' do
      File.join(database_dir, 'v5', 'using_blastdb_aliastool')
    end

    let 'fasta_file_prot_seqs' do
      File.join(database_dir_v5, 'proteins', 'Solenopsis_invicta',
                'Sinvicta2-2-3.prot.subset.fasta')
    end

    let 'fasta_file_nucl_seqs' do
      File.join(database_dir_v5, 'transcripts', 'Solenopsis_invicta',
                'Sinvicta2-2-3.cdna.subset.fasta')
    end

    let 'text_file' do
      File.join(database_dir_v5, 'links.rb')
    end

    let 'binary_file' do
      File.join(database_dir_v5, 'proteins', 'Solenopsis_invicta',
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
      SequenceServer.init(database_dir: database_dir_v5)
    end

    it 'can tell FASTA file' do
      expect(makeblastdb.send(:probably_fasta?, text_file)).to be_falsey
      expect(makeblastdb.send(:probably_fasta?, binary_file)).to be_falsey
      expect(makeblastdb.send(:probably_fasta?, fasta_file_prot_seqs)).to be_truthy
      expect(makeblastdb.send(:probably_fasta?, fasta_file_nucl_seqs)).to be_truthy
    end

    it 'can tell type of sequences in FASTA file' do
      expect(makeblastdb.send(:guess_sequence_type_in_fasta, fasta_file_prot_seqs)).to eq :protein
      expect(makeblastdb.send(:guess_sequence_type_in_fasta, fasta_file_nucl_seqs)).to eq :nucleotide
    end

    it 'can tell FASTA files that are yet to be made into a BLAST+ database' do
      makeblastdb.instance_variable_set(:@database_dir, database_dir_unformatted)
      expect(makeblastdb.scan).to be_truthy
    end

    it 'can tell databases that require reformatting' do
      # Control: shouldn't report sample v5 databases as requiring reformatting.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_v5)
      expect(makeblastdb.scan).to be_falsey

      # Databases created using blastdb_aliastool don't require reformatting either.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_blastdb_aliastool)
      expect(makeblastdb.scan).to be_falsey

      # Databases created without -parse_seqids option don't require reformatting either.
      # We disable 'sequence download' link instead.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_without_parse_seqids)
      expect(makeblastdb.scan).to be_falsey

      # v4 databases require reformatting.
      makeblastdb.instance_variable_set(:@database_dir, database_dir_v4)
      expect(makeblastdb.scan).to be_truthy
    end

    it 'can make intelligent database name suggestions' do
      db_name_pairs = [['Si_gnf.fasta', 'Si gnf'],
                       ['Aech.3.8.cds.fasta', 'Aech 3.8 cds'],
                       ['Cobs1.4.proteins.fasta', 'Cobs 1.4 proteins'],
                       ['S_inv.x.small.2.5.nucl.fa', 'S inv x small 2.5 nucl'],
                       ['Sinvicta2-2-3.prot.fasta', 'Sinvicta 2-2-3 prot']]
      db_name_pairs.each do |db|
        expect(makeblastdb.send(:make_db_title, db[0])).to eql(db[1])
      end
    end

    it 'can tell NCBI multipart database name' do
      sample_name1 = '/home/ben/pd.ben/sequenceserver/db/nr'
      sample_name2 = '/home/ben/pd.ben/sequenceserver/db/nr.00'
      sample_name3 = '/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01'
      expect(makeblastdb.send(:multipart_database_name?, sample_name1)).to be_falsey
      expect(makeblastdb.send(:multipart_database_name?, sample_name2)).to be_truthy
      expect(makeblastdb.send(:multipart_database_name?, sample_name3)).to be_truthy
    end
  end
end
