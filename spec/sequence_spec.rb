require 'spec_helper'
require 'sequenceserver/sequence'
require 'digest/md5'

# Test Sequence class.
module SequenceServer
  describe 'Sequence type detection' do
    it 'should be able to detect nucleotide sequences' do
      sequences = [
        'AAAAAAAAAAAAAAAAAAAAAT',
        '           CAGATGCRRCAAAGCAAACGGCAA 34523453 652352',
        'ACCNNNNNNXXXXCAUUUUUU',
        "ACGT\n\t\t\nACCACGGACCACGAAAGCG"
      ]
      sequences.each do |sequence|
        Sequence.guess_type(sequence).should == :nucleotide
      end
    end

    it 'should be able to detect protein sequences' do
      sequences = [
        'ADSACGHKSJLFCVMGTL',
        '  345   KSSYPHYSPPPPHS      345 23453 652352',
        'GEYSNLNNNNNNXXXXSSSSSSSSSSSSSSSSSSSSSSS',
        "EE\n\t\t\n         \t\t\EEQRRQQSARTSRRQR"
      ]
      sequences.each do |sequence|
        Sequence.guess_type(sequence).should == :protein
      end
    end

    it 'should be able to say sequence type detection impossible' do
      Sequence.guess_type('ACSFGT').should be_nil
    end

    it 'should be able to tell composition of a sequence string' do
      Sequence.composition('asdfasdfffffAsdf').should == { 'a' => 2, 'd' => 3,
                                                           'f' => 7, 's' => 3,
                                                           'A' => 1 }
    end
  end

  describe 'Sequence retrieval' do
    root = SequenceServer.root
    database_dir = File.join(root, 'spec', 'database')

    let 'a_normal_database_id' do
      Digest::MD5.hexdigest File.join(database_dir, 'sample', 'proteins',
                                      'Solenopsis_invicta',
                                      'Sinvicta2-2-3.prot.subset.fasta')
    end

    let 'funky_ids_database_id' do
      Digest::MD5.hexdigest File.join(database_dir, 'funky_ids',
                                      'funky_ids.fa')
    end

    before :all do
      SequenceServer.config[:database_dir] = database_dir
      Database.scan_databases_dir
    end

    it 'should be able to retrieve sequences from database' do
      sequences = Sequence::Retriever.new('SI2.2.0_06267',
                                          a_normal_database_id).sequences

      sequences.length.should eq 1
      sequences.first.gi.should be_nil
      sequences.first.seqid.should eq 'SI2.2.0_06267'
      sequences.first.accession.should eq 'SI2.2.0_06267'
      sequences.first.id.should eq 'SI2.2.0_06267'
      sequences.first.title.should eq 'locus=Si_gnF.scaffold02592'\
                                      '[1282609..1284114].pep_2 quality=100.00'
      sequences.first.value.should == "\
MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIPLAVIFEDPQPISQRLIYEIRTNPSYTLPPPPTKLYSAPI\
SCRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITDITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVI\
PLYMVLALSQFITYLLILIVGEKENKIKEGMKMMGLNDSVF"
    end

    it 'should be able to retrieve more than one sequence from a database' do
      sequences = Sequence::Retriever.new(['SI2.2.0_06267', 'SI2.2.0_13722'],
                                          a_normal_database_id).sequences
      sequences.length.should == 2
    end

    # it 'should be able to retrieve sequences from database even if accession'\
    #    'contains only numbers' do
    #   Database.scan_databases_dir
    #   sequences = Sequence.from_blastdb(123456, funky_ids_database_id)
    #   sequences.length.should == 1
    # end

    it 'should be able to retrieve sequences from database for all kinds of'\
       'funky accessions' do
      funky_accessions = ['abcdef#', 'abc#def', '123#456'] # , '123456#']
      sequences = Sequence::Retriever.new(funky_accessions,
                                          funky_ids_database_id).sequences
      sequences.length.should == 3
    end
  end
end
