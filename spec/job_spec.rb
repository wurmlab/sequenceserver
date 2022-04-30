require 'spec_helper'
require 'sequenceserver/job'
require 'sequenceserver/blast/job'
require 'rack/test'

# Test Job class from module SequenceServer
module SequenceServer
    describe 'blank Job' do
        my_job = Job.new

        it 'should have an id' do
            expect(my_job.id).to match(/\A(urn:uuid:)?[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}\z/i)
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
                sequence: 'AGCTAGCTAGCT', 
                databases: [Database.first.id],
                method: (Database.first.id == 'protein' ? 'blastp' : 'blastn'),
            }
        end

        context 'with params' do
            let(:test_job){test_job = Job.create(@params)}


            it 'should create a job.yaml' do
                expect("#{__dir__}/dotdir/#{test_job.id}/job.yaml").not_to be_empty
            end

            it 'should create a stderr' do
                expect("#{__dir__}/dotdir/*/stderr").not_to be_empty
            end

            it 'should create a stdout' do
                expect("#{__dir__}/dotdir/*/stdout").not_to be_empty
            end

            it 'should have total database length' do
                total_database_length = test_job.ncharacters_total
                expect(total_database_length).to eql(total_database_length)
            end
                
            it 'should compute query length' do
                test_job.query_size
                expect(test_job.query_size).to eq(12)
            end

            it 'should be able to store a sequence in query.fa' do
                test_job.send("store", 'query.fa', 'ACTA')
                expect(test_job.query_size).to eq(4)
                expect("#{__dir__}/dotdir/*/query.fa").not_to be_empty
            end

            it 'should have a command' do
                expect(test_job.command).to start_with('blastn -db')
            end
            
            it 'should have a method blastn when AGCTAGCTAGCT ' do
                expect(@params[:method]).to eq('blastn')
            end
        end
    end
end
