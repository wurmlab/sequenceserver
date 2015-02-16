require 'spec_helper'
require 'sequenceserver/doctor'
require 'sequenceserver/database'

# Test suite for SequenceServer --doctor
module SequenceServer
  describe 'Doctor' do
    let 'root' do
      SequenceServer.root
    end

    let 'database_dir' do
      File.join(root, 'spec', 'database')
    end

    let 'database_dir_test' do
      File.join(database_dir, 'test')
    end

    let 'database_dir_unformatted' do
      File.join(database_dir_test, 'unformatted')
    end

    let 'database_without_parseqids' do
      File.join(database_dir_test, 'without_parse_seqids')
    end

    let 'database_funky_ids' do
      File.join(database_dir_test, 'funky_ids')
    end

    let 'database_problematic_ids' do
      File.join(database_dir_test, 'problematic_ids')
    end

    let 'binary_file' do
      File.join(database_dir_sample, 'proteins', 'Solenopsis_invicta',
                'Sinvicta2-2-3.prot.subset.fasta.phr')
    end

    let 'data_for_makeblastdb' do
      [
        File.join(database_dir_unformatted, 'Cardiocondyla_obscurior',
                  'Cobs1.4.proteins.fa'),
        :protein,
        'Cobs 1.4 proteins',
        true
      ]
    end

    let 'makeblastdb_result_pattern' do
      File.join(database_dir_unformatted, 'Cardiocondyla_obscurior',
                'Cobs1.4.proteins.fa.*')
    end

    before :each do
      # Empty Database collection so we can use different directories as
      # needed.
      Database.clear
    end

    it 'detects databases formatted without -parse_seqids option' do
      SequenceServer.config[:database_dir] = database_without_parseqids
      Database.scan_databases_dir

      doctor = Doctor.new
      Doctor.inspect_parse_seqids(doctor.all_seqids).should_not be_empty
    end

    it 'detects databases with funky (numeric) sequence ids' do
      SequenceServer.config[:database_dir] = database_dir_test
      Database.scan_databases_dir
      selector = proc { |id| !id.to_i.zero? }

      doctor = Doctor.new
      Doctor.inspect_seqids(doctor.all_seqids, &selector).should_not be_empty
    end

    it 'detects databases with problematic sequence ids' do
      SequenceServer.config[:database_dir] = database_dir_test
      Database.scan_databases_dir

      selector = proc { |id| id.match(Doctor::AVOID_ID_REGEX) }

      doctor = Doctor.new
      Doctor.inspect_seqids(doctor.all_seqids, &selector).should_not be_empty
    end

    it 'detects inconsistent file permission settings' do
      Doctor.inspect_file_access.should eq(true)
    end
  end
end
