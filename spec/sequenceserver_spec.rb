require 'spec_helper'

# Test the main module, startup process, etc.
module SequenceServer
  describe 'SequenceServer' do

    # Clear config and databases before each test.
    before :each do
      @config = nil
      Database.clear
    end

    # bin, if set, should be a _directory_ that exists
    it 'raises appropriate error if bin incorrectly set' do
      # Raise if bin dir is not a directory.
      expect do
        SequenceServer.init(bin: __FILE__)
      end.to raise_error(ENOENT)

      # Raise if bin dir does not exist.
      expect do
        SequenceServer.init(bin: '/foo/bar')
      end.to raise_error(ENOENT)
    end

    # database_dir is compulsory
    it 'raises appropriate error if database_dir not set' do
      expect do
        SequenceServer.init(database_dir: nil)
      end.to raise_error(DATABASE_DIR_NOT_SET)
    end

    # database_dir, when set, should be a _directory_ that exists.
    it 'raises appropriate error if database_dir incorrectly set' do
      # Raise if database_dir is not a directory.
      expect do
        SequenceServer.init(database_dir: __FILE__)
      end.to raise_error(ENOENT)

      # Raise if database_dir does not exist.
      expect do
        SequenceServer.init(database_dir: '/foo/bar')
      end.to raise_error(ENOENT)
    end

    # database_dir, when correctly set, should contain at least one BLAST+
    # database.
    it "raises appropriate error if database_dir doesn't contain any BLAST+"\
       'database' do
      expect do
        database_dir_no_db = File.join(__dir__, 'database', 'unformatted',
                                       'Cardiocondyla_obscurior')
        SequenceServer.init(database_dir: database_dir_no_db)
      end.to raise_error(NO_BLAST_DATABASE_FOUND)
    end

    # num_threads, if set, should a number not less than 1.
    it 'raises appropriate error if num_threads incorrectly set' do
      # Raise if not a number.
      expect do
        SequenceServer.init(num_threads: 'foo')
      end.to raise_error(NUM_THREADS_INCORRECT)

      # Raise if less than 1.
      expect do
        SequenceServer.init(num_threads: 0)
      end.to raise_error(NUM_THREADS_INCORRECT)
    end

    # extension file, if set, should be a _file_ that exists.
    it 'raises appropriate error if require incorrectly set' do
      # Raise if not found.
      expect do
        SequenceServer.init(require: 'foo/bar')
      end.to raise_error(ENOENT)

      # Raise if directory.
      expect do
        SequenceServer.init(require: __dir__)
      end.to raise_error(ENOENT)
    end

    it 'has a list of databases after startup' do
      SequenceServer.init()
      # assuming database_dir is set to spec/database/sample
      Database.all.length.should == 4
      Database.all.should_not be_empty
    end
  end
end
