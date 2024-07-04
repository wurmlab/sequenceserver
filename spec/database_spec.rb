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

    describe '#retrieve' do

    end
  end
end
