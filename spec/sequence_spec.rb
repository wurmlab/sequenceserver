require 'sequenceserver'
require 'sequenceserver/sequence'
require 'rspec'

def assert_equal(expected, observed, message=nil)
  observed.should == expected
end

module SequenceServer

  describe 'Sequence' do

    it 'test_guess_sequence_type_nucleotide' do
      #must 'correctly detect nucleotide sequence, even when it includes crap' do
      ['AAAAAAAAAAAAAAAAAAAAAT',
       '           CAGATGCRRCAAAGCAAACGGCAA 34523453 652352',
       'ACCNNNNNNXXXXCAUUUUUU',
       "ACGT\n\t\t\nACCACGGACCACGAAAGCG"].each do |seq|
         assert_equal(:nucleotide, Sequence.guess_type(seq), message="for #{seq}")
       end
    end

    it 'test_guess_sequence_type_aminoacid' do
      #must 'correctly detect aminoacid sequence, even when it includes a lot of crap' do
      ['ADSACGHKSJLFCVMGTL',
       '  345   KSSYPHYSPPPPHS      345 23453 652352',
       'GEYSNLNNNNNNXXXXSSSSSSSSSSSSSSSSSSSSSSS',
       "EE\n\t\t\n         \t\t\EEQRRQQSARTSRRQR"     ].each do |seq|
         assert_equal(:protein, Sequence.guess_type(seq) , message="for #{seq}")
       end
    end

    it 'test_guess_sequence_type_impossible' do
      assert_equal(nil, Sequence.guess_type('ACSFGT'), message='too little sequence')
    end

    ## Tests for type_of_sequences  (multi-fasta  kind of thing the user would enter)
    #it 'test_type_of_sequences' do
      #aa_multifasta = ">SDFDSF\nACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n>asdfas\nasfasdfffffffffffffffffffff\n>alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf"
      #aa_multifasta_including_short_seq_missing_lead = "ACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n>asdfas\nasf\n>alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf"
      #aa_singlesequence =  "ACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n"
      #nt_multifasta = ">asdf\nAAAAAAAAAAAAAAAAAAAAT\n>sfaslkj\nCAGATGCRRCAAAGCAAACGGCAA\n>asssssjlkj\nACCCANNNNNNXXXXCAUUUUUU"
      #aa_nt_mix = ">alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf\n>ffffffassdf\nACGCNAGTGCCCCCCCCGANATGGGTGGTTXXXXXGGTG"

      #assert_equal(:protein, type_of_sequences(aa_multifasta), 'aa_multifasta')
      #assert_equal(:protein, type_of_sequences(aa_multifasta_including_short_seq_missing_lead ), 'aa_multifasta_short_seq_and_no_>')
      #assert_equal(:protein, type_of_sequences(aa_singlesequence), 'single AA sequence')
      #assert_equal(:nucleotide, type_of_sequences(nt_multifasta), 'nt_multifasta')
      #expect { type_of_sequences(aa_nt_mix) }.to raise_error(ArgumentError)
    #end

    it 'test_composition' do
      expected_comp = {"a"=>2, "d"=>3, "f"=>7, "s"=>3, "A"=>1}
      assert_equal(expected_comp, Sequence.composition('asdfasdfffffAsdf'))
    end
  end

  describe 'SystemHelpers' do
    it 'test_multipart_database_name?' do
      assert_equal true, SequenceServer.send(:multipart_database_name?, '/home/ben/pd.ben/sequenceserver/db/nr.00')
      assert_equal false, SequenceServer.send(:multipart_database_name?, '/home/ben/pd.ben/sequenceserver/db/nr')
      assert_equal true, SequenceServer.send(:multipart_database_name?, '/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01')
    end
  end
end
