require 'spec_helper'
require 'sequenceserver/database'

# Test Database class.
module SequenceServer
  describe 'Database' do
    let 'root' do
      __dir__
    end

    let 'database_dir' do
      File.join(root, 'database')
    end

    let 'database_dir_sample' do
      File.join(database_dir, 'v5', 'sample')
    end

    before do
      SequenceServer.init(database_dir: database_dir_sample)
    end

    let 'solenopsis_protein_database' do
      path = 'spec/database/v5/sample/proteins/Solenopsis_invicta/'\
             'Sinvicta2-2-3.prot.subset.fasta'
      id = Digest::MD5.hexdigest File.expand_path path
      Database[id].first
    end

    describe '#include?' do
      it 'knows if a given accession is present in the database' do
        expect(solenopsis_protein_database).to include('SI2.2.0_06267')
      end

      it 'knows if a given accession is absent in the database' do
        expect(solenopsis_protein_database).not_to include('LOL.2.0_404')
      end

      it 'validates the id' do
        expect do
          solenopsis_protein_database.include?("';hi")
        end.to raise_error(ArgumentError, "Invalid sequence id: ';hi")
      end
    end

    describe '.retrieve' do
      it "retrieves the sequence for a given accession" do
        sequence = Database.retrieve("SI2.2.0_06267")
        expect(sequence).to include('SI2.2.0_06267')
        expect(sequence).to include('MNTLWLSLWDYPGKL') # start of fasta sequence
      end

      it "retrieves an open sequence range for a given accession" do
        sequence = Database.retrieve("SI2.2.0_06267:10-")
        expect(sequence).to include('SI2.2.0_06267')
        expect(sequence).not_to include('MNTLWLSLWD') # excludes first 10 chars
        expect(sequence.lines[1]).to start_with('DYPGKLP') # start at an offset of 10
      end

      it "retrieves a closed sequence range for a given accession" do
        sequence = Database.retrieve("SI2.2.0_06267:1-10")
        expect(sequence).to include('SI2.2.0_06267')
        expect(sequence.lines.last.size).to eq(10)
      end

      it "validates the sequence id" do
        expect do
          Database.retrieve("';hi")
        end.to raise_error(SequenceServer::InvalidSequenceIdError)
      end

      it "validates the range" do
        expect do
          Database.retrieve("SI2.2.0_06267:';hi")
        end.to raise_error(SequenceServer::InvalidParameterError)
      end
    end
  end
end
