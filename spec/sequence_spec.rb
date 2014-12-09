require 'sequenceserver'
require 'sequenceserver/sequence'
require 'digest/md5'
require 'rspec'

module SequenceServer

  describe 'Sequence type detection' do

    it 'should be able to detect nucleotide sequences' do
      [
        'AAAAAAAAAAAAAAAAAAAAAT',
        '           CAGATGCRRCAAAGCAAACGGCAA 34523453 652352',
        'ACCNNNNNNXXXXCAUUUUUU',
        "ACGT\n\t\t\nACCACGGACCACGAAAGCG"
      ].each do |sequence|
          Sequence.guess_type(sequence).should == :nucleotide
       end
    end

    it 'should be able to detect protein sequences' do
      [
        'ADSACGHKSJLFCVMGTL',
        '  345   KSSYPHYSPPPPHS      345 23453 652352',
        'GEYSNLNNNNNNXXXXSSSSSSSSSSSSSSSSSSSSSSS',
        "EE\n\t\t\n         \t\t\EEQRRQQSARTSRRQR"
      ].each do |sequence|
        Sequence.guess_type(sequence).should == :protein
       end
    end

    it 'should be able to say sequence type detection impossible' do
      Sequence.guess_type('ACSFGT').should == nil
    end

    it 'should be able to tell composition of a sequence string' do
      Sequence.composition('asdfasdfffffAsdf').should == {"a"=>2, "d"=>3,
                                                          "f"=>7, "s"=>3,
                                                          "A"=>1}
    end
  end

  describe 'Sequence retrieval' do

    let 'root' do
      SequenceServer.root
    end

    let 'a_normal_database_id' do
      Digest::MD5.hexdigest File.join(root, 'spec', 'database', 'sample',
                                      'proteins', 'Solenopsis_invicta',
                                      'Sinvicta2-2-3.prot.subset.fasta')
    end

    let 'funky_ids_database_id' do
      Digest::MD5.hexdigest File.join(root, 'spec', 'database',
                                      'funky_ids', 'funky_ids.fa')
    end

    it 'should be able to retrieve sequences from database' do
      Database.scan_databases_dir
      sequences = Sequence.from_blastdb('SI2.2.0_06267', a_normal_database_id)

      sequences.length.should      == 1
      sequences.first.gi.should    == nil
      sequences.first.seqid.should == 'SI2.2.0_06267'
      sequences.first.id.should    == 'SI2.2.0_06267'
      sequences.first.title.should ==
        'locus=Si_gnF.scaffold02592[1282609..1284114].pep_2 quality=100.00'
      sequences.first.value.should == "\
MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIPLAVIFEDPQPISQRLIYEIRTNPSYTLPPPPTKLYSAPI\
SCRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITDITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVI\
PLYMVLALSQFITYLLILIVGEKENKIKEGMKMMGLNDSVF"
    end

    it 'should be able to retrieve more than one sequence from a database' do
      Database.scan_databases_dir
      sequences = Sequence.from_blastdb(['SI2.2.0_06267', 'SI2.2.0_13722'],
                                        a_normal_database_id)
      sequences.length.should == 2
    end

    #it 'should be able to retrieve sequences from database even if accession contains only numbers' do
      #Database.scan_databases_dir
      #sequences = Sequence.from_blastdb(123456, funky_ids_database_id)
      #sequences.length.should == 1
    #end

    it 'should be able to retrieve sequences from database for all kinds of funky accessions' do
      Database.scan_databases_dir
      funky_accessions = ['abcdef#', 'abc#def', '123#456']#, '123456#']
      sequences = Sequence.from_blastdb(funky_accessions,
                                        funky_ids_database_id)
      sequences.length.should == 3
    end
  end
end
