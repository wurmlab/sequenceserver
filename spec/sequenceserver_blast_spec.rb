require 'sequenceserver'
require 'rack/test'

module SequenceServer
  describe "App" do
    ENV['RACK_ENV'] = 'test'
    include Rack::Test::Methods

    def app
      @app ||= SequenceServer.init
    end

    before :each do
      app
      @params = {'method'    => (SequenceServer.databases.first.last.type == 'protein' ? 'blastp' : 'blastn'),
                 'sequence'  => 'AGCTAGCTAGCT',
                 'databases' => [SequenceServer.databases.first.first]}
    end

    it 'returns Bad Request (400) if no blast method is provided' do
      @params.delete('method')
      post '/', @params
      last_response.status.should == 400
    end

    it 'returns Bad Request (400) if no input sequence is provided' do
      @params.delete('sequence')
      post '/', @params
      last_response.status.should == 400
    end

    it 'returns Bad Request (400) if no database id is provided' do
      @params.delete('databases')
      post '/', @params
      last_response.status.should == 400
    end

    it 'returns Bad Request (400) if an empty database list is provided' do
      @params['databases'].pop

      # ensure the list of databases is empty
      @params['databases'].length.should == 0

      post '/', @params
      last_response.status.should == 400
    end

    it 'returns Bad Request (400) if incorrect database id is provided' do
      @params['databases'] = ['123']
      post '/', @params
      last_response.status.should == 400
    end

    it 'returns Bad Request (400) if an incorrect blast method is supplied' do
      @params['method'] = 'foo'
      post '/', @params
      last_response.status.should == 400
    end

    it 'returns Bad Request (400) if incorrect advanced params are supplied' do
      @params['advanced'] = '-word_size 5; rm -rf /'
      post '/', @params
      last_response.status.should == 400
    end

    it 'returns OK (200) when correct method, sequence, and database ids are provided but no advanced params' do
      post '/', @params
      last_response.status.should == 200

      @params['advanced'] = '  '
      post '/', @params
      last_response.status.should == 200
    end

    it 'returns OK (200) when correct method, sequence, and database ids and advanced params are provided' do
      @params['advanced'] = '-evalue 1'
      post '/', @params
      last_response.status.should == 200
    end
  end
end
