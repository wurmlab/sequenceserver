#!/usr/bin/env ruby 
# test_ssequencehelpers.rb

require 'lib/sequencehelpers'
require 'test/unit'

class Tester < Test::Unit::TestCase
  include SequenceHelpers

  def test_guess_sequence_type_nucleotide
  #must 'correctly detect nucleotide sequence, even when it includes crap' do   
    ['AAAAAAAAAAAAAAAAAAAAAT',
     '           CAGATGCRRCAAAGCAAACGGCAA 34523453 652352',
     'ACCNNNNNNXXXXCAUUUUUU',
     "ACGT\n\t\t\nACCACGGACCACGAAAGCG"               ].each do |seq|
      assert_equal(SequenceHelpers::NUCLEICACID, guess_sequence_type(seq), message="for #{seq}")
    end
  end

  def test_guess_sequence_type_aminoacid
  #must 'correctly detect aminoacid sequence, even when it includes a lot of crap' do
  ['ADSACGHKSJLFCVMGTL',
   '  345   KSSYPHYSPPPPHS      345 23453 652352',
   'GEYSNLNNNNNNXXXXSSSSSSSSSSSSSSSSSSSSSSS',
   "EE\n\t\t\n         \t\t\EEQRRQQSARTSRRQR"     ].each do |seq|
      assert_equal(SequenceHelpers::PROTEIN, guess_sequence_type(seq) , message="for #{seq}")
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

    assert_equal(SequenceHelpers::PROTEIN, type_of_sequences(aa_multifasta), 'aa_multifasta')
    assert_equal(SequenceHelpers::PROTEIN, type_of_sequences(aa_multifasta_including_short_seq_missing_lead ), 'aa_multifasta_short_seq_and_no_>')
    assert_equal(SequenceHelpers::PROTEIN, type_of_sequences(aa_singlesequence), 'single AA sequence')
    assert_equal(SequenceHelpers::NUCLEICACID, type_of_sequences(nt_multifasta), 'nt_multifasta')
    assert_raise(ArgumentError, 'mixed aa and nt should raise') { type_of_sequences(aa_nt_mix) }
  end
end

