require 'sequenceserver'

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
    File.join(root, 'spec', 'database', 'proteins', 'Cardiocondyla_obscurior')
  end

  let 'app' do
    SequenceServer.init(:config_file  => empty_config,
                        :database_dir => database_dir)
  end

  it "exits if database dir not given" do
    expect{SequenceServer.init(:config_file => empty_config)}.to raise_error(SystemExit)
  end

  it "exits if database dir doesn't contain any BLAST+ database" do
    expect{SequenceServer.init(:database_dir => database_dir_no_db)}.to raise_error(SystemExit)
  end

  it "can make BLAST+ database from a FASTA file"

  it "has a list of databases after startup" do
    app.databases.should_not be_empty
    app.databases.length.should == 2
  end

  it "can list FASTA files that are yet to be made into a BLAST+ database" do
    app.unformatted_fastas.should_not be_empty
  end
end
