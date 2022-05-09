require 'spec_helper'
require 'sequenceserver/job'
require 'sequenceserver/blast/job'
require 'rack/test'

# Test Job class from module SequenceServer
module SequenceServer
  describe 'blank Job' do
    my_job = Job.new

    it 'should have an id' do
      regex = /\A(urn:uuid:)?[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}\z/i
      expect(my_job.id).to match(regex)
    end

    it 'should have a time of submission' do
      expect(my_job.submitted_at).to be_kind_of(Time)
    end

    it 'should have an false exitstatus' do
      expect(my_job.done?).to be_falsey
    end

    it 'should not be completed yet' do
      expect(my_job.completed_at).to be(nil)
    end

    it 'should have a job directory' do
      expect("#{__dir__}/dotdir/#{my_job.id}").not_to be_empty
    end
  end

  describe 'BLAST Job' do
    # Test Job class from module Blast and params
    ENV['RACK_ENV'] = 'test'
    include Rack::Test::Methods

    before do
      SequenceServer.init(database_dir: "#{__dir__}/database/v5/sample")

      @params = {
        sequence: ">seq1\nAGCTAGCTAGCT\n>seq2\nAATAGCTA",
        databases: [Database.first.id],
        method: (Database.first.id == 'protein' ? 'blastp' : 'blastn')
      }
    end

    context 'with params' do
      let(:test_job) { Job.create(@params) }

      it 'should compute total characters of databases used' do
        expect(test_job.databases_ncharacters_total).to eql(39_185_542)
      end

      it 'should compute query length' do
        expect(test_job.query_length).to eq(20)
      end
    end
  end
end
