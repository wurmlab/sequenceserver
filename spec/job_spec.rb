require 'spec_helper'
require 'sequenceserver/job'
require 'sequenceserver/blast/job'
require 'rack/test'

# Test Job class from module SequenceServer
module SequenceServer
  describe 'blank Job' do
    my_job = Job.new

    it 'should have an id' do
      regex = /\A(urn:uuid:)?[\da-z]{8}-([\da-z]{4}-){3}[\da-z]{12}\z/i
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
    # Test Job class from module Blast and situational params
    ENV['RACK_ENV'] = 'test'
    include Rack::Test::Methods

    let(:nucleotide_seq) do
      ">   SI2.2.0_11917 Si_gnF.scaffold05747[1091012..1091951].pep_1\n"\
      "  AATT   CCGG  TCTCTCTCTC AC AC AC AC AC GACGT AGTC    G\n"\
      ">gnl|dmel|ID  \n  G A G A C G C G G C     \n"\
      ">abcdef##$%^&*(funky_header)!  \n  AATCT   CTC  TTAT  \n"
    end

    let(:protein_seq) do
      '>SI2.2.0_1322 locus=Si_gnF.scaffold06207[1925625..1928536].pep_1 '\
      "quality=100.00   \n MSANR     LNVLVTLMLAV     LSNALQI       IC \n" \
      '>SI2.2.0_1426  locus=Si_gnF.scaffold07837[1480027..1480908].pep_1' \
      "quality=100.00 merge_with=SI2.2.0_80956\n MM KK XX LL PP O R TY \n"\
      '>SI2.2.0_14266 locus=Si_gnF.scaff07837[,funky:,><*()!@#$%&]tag=gw_'\
      "corrected\n YUOP POKJ M NAHAA JJHFGF YERTQ                        "
    end

    let(:query_without_symbol) do
    "MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIPLAVIFEDPQPISQRLIYEIR
    TNPSYTLPPPPTKLYSAPISCRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITD
    ITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVIPLYMVLALSQFITYLLILIVGE
    KENKIKEGMKMMGLNDSVF"
    end

    let(:query_with_symbol) do
    '>SI2.2.0_13722 locus=Si_gnF.scaffold06207[1925625..1928536].pep_1 quality=100.00
    MSANRLNVLVTLMLAVALLVTESGNAQVDGYLQFNPKRSAVSSPQKYCGKKLSNALQIIC
    DGVYNSMFKKSGQDFPPQNKRHIAHRINGNEEESFTTLKSNFLNWCVEVYHRHYRFVFVS
    EMEMADYPLAYDISPYLPPFLSRARARGMLDGRFAGRRYRRESRGIHEECCINGCTINEL
    TSYCGP'
    end

    let(:query_with_and_without_symbol) do
    "MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIPLAVIFEDPQPISQRLIYEIR
    TNPSYTLPPPPTKLYSAPISCRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITD
    ITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVIPLYMVLALSQFITYLLILIVGE
    KENKIKEGMKMMGLNDSVF
    >SI2.2.0_13722 locus=Si_gnF.scaffold06207[1925625..1928536].pep_1 quality=100.00
    MSANRLNVLVTLMLAVALLVTESGNAQVDGYLQFNPKRSAVSSPQKYCGKKLSNALQIIC
    DGVYNSMFKKSGQDFPPQNKRHIAHRINGNEEESFTTLKSNFLNWCVEVYHRHYRFVFVS
    EMEMADYPLAYDISPYLPPFLSRARARGMLDGRFAGRRYRRESRGIHEECCINGCTINEL
    TSYCGP
    "
    end

    # all databases used here are v5 databases included in
    # SequenceServer.init(database_dir: "#{__dir__}/database")
    # [15] = funky ids (nucleotide)
    # [16] = Solenopsis invicta gnG subset (nucleotide)
    # [17] = Sinvicta 2-2-3 prot subset (protein_)
    # [19] = Sinvicta 2-2-3 cdna subset (nucleotide)
    # [20] = without_parse_seqids.fa (protein)
    # [21] = 2020-11-Swiss-Prot insecta (subset taxid 102803) (protein)
    before do
      SequenceServer.init(database_dir: "#{__dir__}/database")

      @params_prot_1db = {
        sequence: protein_seq,
        databases: [Database.ids[17]],
        method: 'blastp'
      }

      @params_prot_3dbs = {
        sequence: protein_seq,
        databases: [Database.ids[17], Database.ids[20], Database.ids[21]],
        method: 'blastp'
      }

      @params_nucleo_1db = {
        sequence: nucleotide_seq,
        databases: [Database.ids[15]],
        method: 'blastn'
      }

      @params_nucleo_3dbs = {
        sequence: nucleotide_seq,
        databases: [Database.ids[15], Database.ids[16], Database.ids[19]],
        method: 'blastn'
      }

      @params_query_without_symbol ={
        sequence: query_without_symbol,
        databases: [Database.ids[17]],
        method: 'blastp'
      }

      @params_query_with_symbol ={
        sequence: query_with_symbol,
        databases: [Database.ids[17]],
        method: 'blastp'
      }
      @params_query_with_and_without_symbol ={
        sequence: query_with_and_without_symbol,
        databases: [Database.ids[17]],
        method: 'blastp'
      }

      @params_with_custom_threads = {
        sequence: protein_seq,
        databases: [Database.ids[17]],
        method: 'blastp',
        num_threads: 4
      }

      @params_without_threads = {
        sequence: protein_seq,
        databases: [Database.ids[17]],
        method: 'blastp'
      }
    end

    context 'num_threads parameter' do
      context 'when num_threads is provided in params' do
        let(:job) { Job.create(@params_with_custom_threads) }

        it 'should use the provided num_threads value' do
          expect(job.num_threads).to eq(4)
        end

        it 'should include num_threads in the command' do
          expect(job.command).to include('-num_threads 4')
        end
      end

      context 'when num_threads is not provided in params' do
        let(:job) { Job.create(@params_without_threads) }

        it 'should use the default num_threads from config' do
          expect(job.num_threads).to eq(SequenceServer.config[:num_threads])
        end

        it 'should include default num_threads in the command' do
          default_threads = SequenceServer.config[:num_threads]
          expect(job.command).to include("-num_threads #{default_threads}")
        end
      end

      context 'when num_threads is explicitly set to nil in params' do
        let(:params_with_nil_threads) do
          @params_without_threads.merge(num_threads: nil)
        end
        let(:job) { Job.create(params_with_nil_threads) }

        it 'should fall back to config num_threads' do
          expect(job.num_threads).to eq(SequenceServer.config[:num_threads])
        end
      end
    end

    context 'advanced options validation' do
      context 'when advanced options contain num_threads' do
        let(:params_with_num_threads_in_advanced) do
          @params_without_threads.merge(advanced: '-num_threads 8')
        end

        it 'should raise InputError when advanced options contain num_threads' do
          expect { Job.create(params_with_num_threads_in_advanced) }.to raise_error(InputError)
        end
      end

      context 'when advanced options contain other prohibited options' do
        let(:params_with_prohibited_options) do
          @params_without_threads.merge(advanced: '-out results.txt')
        end

        it 'should raise InputError when advanced options contain -out' do
          expect { Job.create(params_with_prohibited_options) }.to raise_error(InputError)
        end
      end

      context 'when advanced options contain valid options' do
        let(:params_with_valid_advanced) do
          @params_without_threads.merge(advanced: '-evalue 1e-10 -max_target_seqs 5')
        end
        let(:job) { Job.create(params_with_valid_advanced) }

        it 'should create job successfully with valid advanced options' do
          expect(job).to be_a(SequenceServer::BLAST::Job)
        end

        it 'should include advanced options in the command' do
          expect(job.command).to include('-evalue 1e-10')
          expect(job.command).to include('-max_target_seqs 5')
        end
      end
    end

    context 'queries not containing a >' do
        let(:job) {Job.create(@params_query_without_symbol)}
      it 'should accurately compute number of sequences' do
        expect(job.number_of_query_sequences).to eq(1)
      end
    end
    context 'queries containing a > at the start' do
        let(:job) {Job.create(@params_query_with_symbol)}
      it 'should accurately compute number of sequences' do
        expect(job.number_of_query_sequences).to eq(1)
      end
    end
    context 'queries containing a > but not at the start' do
        let(:job) {Job.create(@params_query_with_and_without_symbol)}
      it 'should accurately compute number of sequences' do
        expect(job.number_of_query_sequences).to eq(2)
      end
    end

    context 'with one protein database' do
      let(:test_job1) { Job.create(@params_prot_1db) }

      it 'should accurately compute total characters of databases used' do
        expect(test_job1.databases_ncharacters_total).to eql(280_047)
      end

      it 'should accurately compute query length' do
        expect(test_job1.query_length).to eq(64)
      end
    end

    context 'with several protein database' do
      let(:test_job2) { Job.create(@params_prot_3dbs) }

      it 'should accurately compute total characters of databases used' do
        expect(test_job2.databases_ncharacters_total).to eql(280_685)
      end

      it 'should accurately compute query length' do
        expect(test_job2.query_length).to eq(64)
      end
    end

    context 'with one nucleotide database' do
      let(:test_job3) { Job.create(@params_nucleo_1db) }

      it 'should accurately compute total characters of databases used' do
        expect(test_job3.databases_ncharacters_total).to eql(312)
      end

      it 'should accurately compute query length' do
        expect(test_job3.query_length).to eq(60)
      end
    end

    context 'with several nucleotide databases' do
      let(:test_job4) { Job.create(@params_nucleo_3dbs) }

      it 'should accurately compute total characters of databases used' do
        expect(test_job4.databases_ncharacters_total).to eql(39_473_606)
      end

      it 'should accurately compute query length' do
        expect(test_job4.query_length).to eq(60)
      end
    end
  end
end
