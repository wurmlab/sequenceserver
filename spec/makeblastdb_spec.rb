require 'spec_helper'
require 'sequenceserver/database'

module SequenceServer
  describe 'makeblastdb' do
    let 'root' do
      __dir__
    end

    let(:disposable_database_dir) { File.join(root, 'tmp', 'databases') }

    let 'makeblastdb' do
      SequenceServer::MAKEBLASTDB.new(database_dir_v5)
    end

    let 'root_database_dir' do
      File.join(root, 'database')
    end

    let 'database_dir_v5' do
      File.join(root_database_dir, 'v5', 'sample')
    end

    let 'database_dir_v4' do
      File.join(root_database_dir, 'v4', 'sample')
    end

    let 'database_dir_unformatted' do
      File.join(root_database_dir, 'unformatted')
    end

    let 'database_dir_without_parse_seqids' do
      File.join(root_database_dir, 'v5', 'without_parse_seqids')
    end

    let 'database_dir_blastdb_aliastool' do
      File.join(root_database_dir, 'v5', 'using_blastdb_aliastool')
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
      makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_unformatted)
      expect(makeblastdb.any_to_format_or_reformat?).to be_truthy
    end

    it 'can tell databases that require reformatting' do
      # Control: shouldn't report sample v5 databases as requiring reformatting.
      makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_v5)
      expect(makeblastdb.any_to_format_or_reformat?).to be_falsey

      # Databases created using blastdb_aliastool don't require reformatting either.
      makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_blastdb_aliastool)
      expect(makeblastdb.any_to_format_or_reformat?).to be_falsey

      # Databases created without -parse_seqids option don't require reformatting either.
      # We disable 'sequence download' link instead.
      makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_without_parse_seqids)
      expect(makeblastdb.any_to_format_or_reformat?).to be_falsey

      # v4 databases require reformatting.
      makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_v4)
      expect(makeblastdb.any_to_format_or_reformat?).to be_truthy
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

    describe '#no_fastas?' do
      it 'returns true if no FASTA files are found' do
        makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_without_parse_seqids)
        expect(makeblastdb.no_fastas?).to be_truthy
      end

      it 'returns false if FASTA files are found' do
        makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_unformatted)
        expect(makeblastdb.no_fastas?).to be_falsey

        makeblastdb = SequenceServer::MAKEBLASTDB.new(database_dir_v4)
        expect(makeblastdb.no_fastas?).to be_falsey
      end
    end

    describe '#make_blast_database' do
      context 'duplicate sequence ids' do
        before do
          FileUtils.rm_rf(disposable_database_dir)
          allow($stdin).to receive(:gets).exactly(3).times.and_return("\n") # Accept default option prompted by the CLI
          allow_any_instance_of(Object).to receive(:exit!).and_return(nil) # Prevents the CLI from killing Rspec process
          FileUtils.mkdir_p(disposable_database_dir)
          FileUtils.cp_r(File.join(root_database_dir, 'invalid', 'duplicate_ids.fasta'), disposable_database_dir)
        end

        after do
          FileUtils.rm_rf(disposable_database_dir)
        end

        let(:duplicated_id_database) { File.join(disposable_database_dir, 'duplicate_ids.fasta') }

        it 'it records errors in a file' do
          makeblastdb = SequenceServer::MAKEBLASTDB.new(disposable_database_dir)
          makeblastdb.format

          expect(File.read("#{duplicated_id_database}.makeblastdbstderr")).to match(/Duplicate seq_ids are found/)
        end

        it 'it prints errors to stdout' do
          allow($stdout).to receive(:puts).and_call_original
          makeblastdb = SequenceServer::MAKEBLASTDB.new(disposable_database_dir)

          makeblastdb.format

          expect($stdout).to have_received(:puts).with(/Duplicate seq_ids are found/)
        end
      end
    end
  end
end
