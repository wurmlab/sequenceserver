require 'spec_helper'

require 'rack/test'

# Basic unit tests for HTTP / Rack interface.
module SequenceServer
  RSpec.describe 'Routes' do
    ENV['RACK_ENV'] = 'test'
    include Rack::Test::Methods

    before do
      SequenceServer.init(database_dir: "#{__dir__}/database/v5/sample")
    end

    let 'app' do
      SequenceServer
    end

    context 'POST /' do
      before :each do
        get '/' # make a request so we have an env with CSRF token
        @params = {
          'sequence'  => 'AGCTAGCTAGCT',
          'databases' => [Database.first.id],
          'method'    => (Database.first.type == 'protein' ? 'blastp' : 'blastn'),
          '_csrf'     => Rack::Csrf.token(last_request.env)
        }
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

    context 'POST /get_sequence' do
      before :each do
        get '/' # make a request so we have an env with CSRF token
        @csrf_token = Rack::Csrf.token(last_request.env)
      end

      let(:job) do
        SequenceServer::BLAST::Job.new(
          sequence: ">test\nACGT",
          databases: [SequenceServer::Database.ids[1]],
          method: 'blastp'
        )
      end

      it 'returns 422 if no sequence_ids are provided' do
        post '/get_sequence', {
          '_csrf' => @csrf_token,
          'sequence_ids' => "",
          'database_ids' => Database.first.id.to_s
        }

        expect(last_response.status).to eq(422)
        expect(last_response.body).to include('No sequence ids provided')
      end

      it 'returns 422 if no database_ids are provided' do
        post '/get_sequence', {
          '_csrf' => @csrf_token,
          'sequence_ids' => "contig1",
          'database_ids' => ""
        }

        expect(last_response.status).to eq(422)
        expect(last_response.body).to include('No database ids provided')
      end

      it 'does not allow invalid sequence ids' do
        post '/get_sequence', {
          '_csrf' => @csrf_token,
          'sequence_ids' => "invalid_sequence_id';sleep 30;",
          'database_ids' => Database.first.id.to_s
        }

        expect(last_response.status).to eq(422)
        expect(last_response.body).to include('Invalid sequence id(s): invalid_sequence_id')
      end
    end
  end
end
