require 'spec_helper'

# Basic unit tests for HTTP / Rack interface.
module SequenceServer
  describe 'Routes' do
    ENV['RACK_ENV'] = 'test'
    include Rack::Test::Methods

    let 'root' do
      SequenceServer.root
    end

    let 'empty_config' do
      File.join(root, 'spec', 'empty_config.yml')
    end

    let 'database_dir' do
      File.join(root, 'spec', 'database')
    end

    before :each do
      SequenceServer.init(:config_file  => empty_config,
                          :database_dir => database_dir)

      algorithm = Database.first.type == 'protein' ? 'blastp' : 'blastn'
      sequence  = 'AGCTAGCTAGCT'
      databases = [Database.first.id]

      @params   = {
        'method'    => algorithm,
        'sequence'  => sequence,
        'databases' => databases
      }
    end

    let 'app' do
      SequenceServer
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
      @params['databases'].should be_empty

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

    it 'redirects to /:jobid (302) when correct method, sequence, and database ids are'\
       'provided but no advanced params' do
      post '/', @params
      last_response.should be_redirect
      last_response.status.should eq 302

      @params['advanced'] = '  '
      post '/', @params
      last_response.should be_redirect
      last_response.status.should == 302
    end

    it 'redirects to /jobid (302) when correct method, sequence, and database ids and'\
       'advanced params are provided' do
      @params['advanced'] = '-evalue 1'
      post '/', @params
      last_response.should be_redirect
      last_response.status.should == 302
    end
  end
end
