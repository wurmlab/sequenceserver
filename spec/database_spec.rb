require 'spec_helper'
require 'sequenceserver/database'

# Test Database class.
module SequenceServer
  describe 'Database' do
    let 'root' do
      SequenceServer.root
    end

    let 'empty_config' do
      File.join(root, 'spec', 'empty_config.yml')
    end

    let 'database_dir' do
      File.join(root, 'spec', 'database')
    end

    let 'database_dir_no_db' do
      File.join(root, 'spec', 'database', 'proteins', 'Cardiocondyla_obscurior')
    end

    let 'app' do
      SequenceServer.init(:config_file  => empty_config,
                          :database_dir => database_dir)
    end

    it 'can tell BLAST+ databases in a directory'

    it 'can tell NCBI multipart database name' do
      sample_name1 = '/home/ben/pd.ben/sequenceserver/db/nr'
      sample_name2 = '/home/ben/pd.ben/sequenceserver/db/nr.00'
      sample_name3 = '/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01'
      Database.multipart_database_name?(sample_name1).should be_false
      Database.multipart_database_name?(sample_name2).should be_true
      Database.multipart_database_name?(sample_name3).should be_true
    end

    it 'can tell FASTA files that are yet to be made into a BLAST+ database' do
      Database.unformatted_fastas.should_not be_empty
    end

    it 'can make BLAST+ database from a FASTA file'

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
      solenopsis_protein_database.include?('SI2.2.0_06267').should be_true
    end
  end
end
