require 'spec_helper'

module SequenceServer

  # NOTE:
  #   Testing SequenceServer's initialization can be a bit tricky. For
  #   instance, to test num_threads, correct database_dir must be set.

  describe 'SequenceServer' do

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
      File.join(root, 'spec', 'database', 'unformatted', 'Cardiocondyla_obscurior')
    end

    let 'config' do
      {:config_file  => empty_config}
    end

    # bin, if set, should be a _directory_ that exists
    it "raises appropriate error if bin incorrectly set" do
      # Raise if bin dir does not exist.
      expect {
        SequenceServer.init(config.update :bin => '/foo/bar')
      }.to raise_error(BIN_DIR_NOT_FOUND)

      # Raise if bin dir is not a directory.
      expect {
        SequenceServer.init(config.update :bin => __FILE__)
      }.to raise_error(BIN_DIR_NOT_FOUND)
    end

    # database_dir is compulsory
    it "raises appropriate error if database_dir not set" do
      expect {
        SequenceServer.init(config.update :config_file => empty_config)
      }.to raise_error(DATABASE_DIR_NOT_SET)
    end

    # database_dir, when set, should be a _directory_ that exists.
    it "raises appropriate error if database_dir incorrectly set" do
      # Raise if database_dir does not exist.
      expect {
        SequenceServer.init(config.update :database_dir => '/foo/bar')
      }.to raise_error(DATABASE_DIR_NOT_FOUND)

      # Raise if database_dir is not a directory.
      expect {
        SequenceServer.init(config.update :database_dir => __FILE__)
      }.to raise_error(DATABASE_DIR_NOT_FOUND)
    end

    # database_dir, when correctly set, should contain at least one BLAST+
    # database.
    it "raises appropriate error if database_dir doesn't contain any BLAST+ database" do
      expect {
        SequenceServer.init(config.update :database_dir => database_dir_no_db)
      }.to raise_error(NO_BLAST_DATABASE_FOUND)
    end

    # num_threads, if set, should a number not less than 1.
    it "raises appropriate error if num_threads incorrectly set" do
      # Raise if not a number.
      expect {
        SequenceServer.init(config.update :database_dir => database_dir, :num_threads => 'foo')
      }.to raise_error(NUM_THREADS_INCORRECT)

      # Raise if less than 1.
      expect {
        SequenceServer.init(config.update :database_dir => database_dir, :num_threads => 0)
      }.to raise_error(NUM_THREADS_INCORRECT)
    end

    # extension file, if set, should be a _file_ that exists.
    it "raises appropriate error if require incorrectly set" do
      # Raise if not found.
      expect {
        SequenceServer.init(config.update :database_dir => database_dir, :require => 'foo/bar')
      }.to raise_error(EXTENSION_FILE_NOT_FOUND)

      # Raise if directory.
      expect {
        SequenceServer.init(config.update :database_dir => database_dir, :require => File.dirname(__FILE__))
      }.to raise_error(EXTENSION_FILE_NOT_FOUND)
    end

    it "has a list of databases after startup" do
      SequenceServer.init(config.update :database_dir => database_dir)
      Database.all.should_not be_empty
      Database.all.length.should == 4
    end
  end
end
