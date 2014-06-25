require 'sequenceserver'

describe 'Sequence helpers' do

  it "should exit with 0 if run on a directory containing no unformatted databases" do
    ARGV = [SequenceServer.sample_database]
    require 'sequenceserver/databaseformatter'
    app = SequenceServer::DatabaseFormatter.new(SequenceServer.sample_database)
    app.format_databases.should == 0
  end
end
