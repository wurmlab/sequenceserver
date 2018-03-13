require 'spec_helper'
require 'sequenceserver/database'

# Test Database class.
module SequenceServer
  describe 'Database' do
    let 'root' do
      SequenceServer.root
    end

    let 'database_dir' do
      File.join(root, 'spec', 'database')
    end

    let 'database_dir_sample' do
      File.join(database_dir, 'sample')
    end

    let 'database_dir_unformatted' do
      File.join(database_dir, 'unformatted')
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

    before :each do
      # Empty Database collection so we can use different directories as
      # needed.
      Database.clear
    end

    it 'can tell FASTA file' do
      Database.probably_fasta?(text_file).should be_falsey
      Database.probably_fasta?(binary_file).should be_falsey
      Database.probably_fasta?(fasta_file_prot_seqs).should be_truthy
      Database.probably_fasta?(fasta_file_nucl_seqs).should be_truthy
    end

    it 'can tell type of sequences in FASTA file' do
      Database.guess_sequence_type_in_fasta(fasta_file_prot_seqs)
        .should eq :protein
      Database.guess_sequence_type_in_fasta(fasta_file_nucl_seqs)
        .should eq :nucleotide
    end

    it 'can tell NCBI multipart database name' do
      sample_name1 = '/home/ben/pd.ben/sequenceserver/db/nr'
      sample_name2 = '/home/ben/pd.ben/sequenceserver/db/nr.00'
      sample_name3 = '/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01'
      Database.multipart_database_name?(sample_name1).should be_falsey
      Database.multipart_database_name?(sample_name2).should be_truthy
      Database.multipart_database_name?(sample_name3).should be_truthy
    end

    it 'can tell FASTA files that are yet to be made into a BLAST+ database' do
      SequenceServer.config[:database_dir] = database_dir_unformatted
      # rubocop:disable Style/RescueModifier
      Database.scan_databases_dir rescue NO_BLAST_DATABASE_FOUND
      # rubocop:enable Style/RescueModifier
      Database.unformatted_fastas.should_not be_empty
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
        Database.make_db_title(db[0]).should eql(db[1])
      end
    end

    let 'solenopsis_protein_database' do
      path = 'spec/database/sample/proteins/Solenopsis_invicta/'\
             'Sinvicta2-2-3.prot.subset.fasta'
      id = Digest::MD5.hexdigest File.expand_path path
      Database[id].first
    end

    it 'knows if a given accession is in the database or not' do
      SequenceServer.config[:database_dir] = database_dir_sample
      Database.scan_databases_dir
      solenopsis_protein_database.include?('SI2.2.0_06267').should be_truthy
    end
  end
end
