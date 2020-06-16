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
      File.join(database_dir, 'sample')
    end

    before do
      SequenceServer.init
    end

    before :each do
      # Empty Database collection so we can use different directories as
      # needed.
      Database.clear
    end

    it 'can tell NCBI multipart database name' do
      sample_name1 = '/home/ben/pd.ben/sequenceserver/db/nr'
      sample_name2 = '/home/ben/pd.ben/sequenceserver/db/nr.00'
      sample_name3 = '/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01'
      Database.multipart_database_name?(sample_name1).should be_falsey
      Database.multipart_database_name?(sample_name2).should be_truthy
      Database.multipart_database_name?(sample_name3).should be_truthy
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
