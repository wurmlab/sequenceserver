require 'rspec'
require 'sequenceserver/database'

describe 'SequenceServer::Database' do

  let 'databases' do
    [SequenceServer::Database.new('/does/not/exist/foo.fa', 'Foo', :nucleotide), SequenceServer::Database.new('/does/not/exist/bar.fa', 'bar', :nucleotide)]
  end

  it 'should sort alphabetically regardless of the case' do
    databases.sort.first.title.should == 'bar'
  end
end

