# ensure 'lib/' is in the load path
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))

require 'sequenceserver'
require 'sequenceserver/sequencehelpers'
require 'test/unit'

class Tester < Test::Unit::TestCase
  include SequenceServer::SequenceHelpers
  def test_guess_sequence_type_nucleotide
  #must 'correctly detect nucleotide sequence, even when it includes crap' do   
    ['AAAAAAAAAAAAAAAAAAAAAT',
     '           CAGATGCRRCAAAGCAAACGGCAA 34523453 652352',
     'ACCNNNNNNXXXXCAUUUUUU',
     "ACGT\n\t\t\nACCACGGACCACGAAAGCG"               ].each do |seq|
      assert_equal(:nucleotide, guess_sequence_type(seq), message="for #{seq}")
    end
  end

  def test_guess_sequence_type_aminoacid
  #must 'correctly detect aminoacid sequence, even when it includes a lot of crap' do
  ['ADSACGHKSJLFCVMGTL',
   '  345   KSSYPHYSPPPPHS      345 23453 652352',
   'GEYSNLNNNNNNXXXXSSSSSSSSSSSSSSSSSSSSSSS',
   "EE\n\t\t\n         \t\t\EEQRRQQSARTSRRQR"     ].each do |seq|
      assert_equal(:protein, guess_sequence_type(seq) , message="for #{seq}")
    end
  end

  def test_guess_sequence_type_impossible
    assert_equal(nil, guess_sequence_type('ACSFGT'), message='too little sequence')
  end

  ## Tests for type_of_sequences  (multi-fasta  kind of thing the user would enter)
  def test_type_of_sequences
    aa_multifasta = ">SDFDSF\nACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n>asdfas\nasfasdfffffffffffffffffffff\n>alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf"
    aa_multifasta_including_short_seq_missing_lead = "ACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n>asdfas\nasf\n>alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf"
    aa_singlesequence =  "ACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n"
    nt_multifasta = ">asdf\nAAAAAAAAAAAAAAAAAAAAT\n>sfaslkj\nCAGATGCRRCAAAGCAAACGGCAA\n>asssssjlkj\nACCCANNNNNNXXXXCAUUUUUU"
    aa_nt_mix = ">alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf\n>ffffffassdf\nACGCNAGTGCCCCCCCCGANATGGGTGGTTXXXXXGGTG"

    assert_equal(:protein, type_of_sequences(aa_multifasta), 'aa_multifasta')
    assert_equal(:protein, type_of_sequences(aa_multifasta_including_short_seq_missing_lead ), 'aa_multifasta_short_seq_and_no_>')
    assert_equal(:protein, type_of_sequences(aa_singlesequence), 'single AA sequence')
    assert_equal(:nucleotide, type_of_sequences(nt_multifasta), 'nt_multifasta')
    assert_raise(ArgumentError, 'mixed aa and nt should raise') { type_of_sequences(aa_nt_mix) }
  end

  def test_composition
    expected_comp = {"a"=>2, "d"=>3, "f"=>7, "s"=>3, "A"=>1}
    assert_equal(expected_comp, composition('asdfasdfffffAsdf'))
  end
  
  def test_construct_standard_sequence_hyperlink
    assert_equal "/get_sequence/?id=one&db=abc def", construct_standard_sequence_hyperlink({:sequence_id => 'one', :databases => %w(abc def)})
    assert_equal nil, construct_standard_sequence_hyperlink({:sequence_id => ' one', :databases =>  %w(abc def)})
    assert_equal "/get_sequence/?id=MAL13P1.218&db=abc def", construct_standard_sequence_hyperlink({:sequence_id => 'lcl|MAL13P1.218', :databases =>  %w(abc def)})
  end
end

class AppTester < Test::Unit::TestCase
  def test_process_advanced_blast_options
    app = SequenceServer::App.new!

    assert_nothing_raised {app.validate_advanced_parameters('')}
    assert_nothing_raised {app.validate_advanced_parameters('-word_size 5')}
    assert_raise(ArgumentError, 'security advanced option parser'){app.validate_advanced_parameters('-word_size 5; rm -rf /')}
    assert_raise(ArgumentError, 'conflicting advanced option'){app.validate_advanced_parameters('-db roar')}
  end
end

class SystemHelpersTester < Test::Unit::TestCase
  include SequenceServer::Helpers::SystemHelpers

  def test_multipart_database_name?
    assert_equal true, multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/nr.00')
    assert_equal false, multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/nr')
    assert_equal true, multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01')
  end
end
