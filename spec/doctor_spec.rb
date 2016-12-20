require 'spec_helper'
require 'sequenceserver/doctor'
require 'sequenceserver/database'

# Test suite for SequenceServer --doctor
module SequenceServer
  describe 'Doctor' do
    let 'root' do
      SequenceServer.root
    end

    let 'empty_config' do
      File.join(root, 'spec', 'empty_config.yml')
    end

    let 'config' do
      Config.new
      # { :config_file => empty_config }
    end

    let 'database_dir' do
      File.join(root, 'spec', 'database')
    end

    let 'database_dir_unformatted' do
      File.join(database_dir, 'unformatted')
    end

    let 'database_dir_sample' do
      File.join(database_dir, 'sample')
    end

    let 'database_without_parseqids' do
      File.join(database_dir, 'without_parse_seqids')
    end

    let 'database_funky_ids' do
      File.join(database_dir, 'funky_ids')
    end

    let 'database_problematic_ids' do
      File.join(database_dir, 'funky_ids')
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
      SequenceServer.init(config.data.update :database_dir => database_without_parseqids)
      Database.scan_databases_dir

      doctor = Doctor.new
      Doctor.inspect_parse_seqids(doctor.all_seqids).should_not be_empty
    end

    it 'detects databases with funky (numeric) sequence ids' do
      SequenceServer.init(config.data.update :database_dir => database_funky_ids)
      Database.scan_databases_dir
      selector = proc { |id| !id.to_i.zero? }

      doctor = Doctor.new
      Doctor.inspect_seqids(doctor.all_seqids, &selector).should_not be_empty
    end

    it 'detects databases with problematic sequence ids' do
      SequenceServer.init(config.data.update :database_dir => database_problematic_ids)
      Database.scan_databases_dir

      selector = proc { |id| id.match(Doctor::AVOID_ID_REGEX) }

      doctor = Doctor.new
      Doctor.inspect_seqids(doctor.all_seqids, &selector).should_not be_empty
    end

    # a check for false positive
    it 'does not detect normal databases as problematic' do
      SequenceServer.init(config.data.update :database_dir => database_dir_sample)
      Database.scan_databases_dir

      doctor = Doctor.new
      Doctor.inspect_parse_seqids(doctor.all_seqids).should be_empty
    end
  end
end
