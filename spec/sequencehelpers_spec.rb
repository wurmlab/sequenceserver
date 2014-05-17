require 'sequenceserver'
require 'sequenceserver/sequencehelpers'
require 'rspec'

def assert_equal(expected, observed, message=nil)
  observed.should == expected
end

describe 'Sequence helpers' do
  include SequenceServer::SequenceHelpers

  it 'test_guess_sequence_type_nucleotide' do
  #must 'correctly detect nucleotide sequence, even when it includes crap' do
    ['AAAAAAAAAAAAAAAAAAAAAT',
     '           CAGATGCRRCAAAGCAAACGGCAA 34523453 652352',
     'ACCNNNNNNXXXXCAUUUUUU',
     "ACGT\n\t\t\nACCACGGACCACGAAAGCG"               ].each do |seq|
      assert_equal(:nucleotide, guess_sequence_type(seq), message="for #{seq}")
    end
  end

  it 'test_guess_sequence_type_aminoacid' do
  #must 'correctly detect aminoacid sequence, even when it includes a lot of crap' do
  ['ADSACGHKSJLFCVMGTL',
   '  345   KSSYPHYSPPPPHS      345 23453 652352',
   'GEYSNLNNNNNNXXXXSSSSSSSSSSSSSSSSSSSSSSS',
   "EE\n\t\t\n         \t\t\EEQRRQQSARTSRRQR"     ].each do |seq|
      assert_equal(:protein, guess_sequence_type(seq) , message="for #{seq}")
    end
  end

  it 'test_guess_sequence_type_impossible' do
    assert_equal(nil, guess_sequence_type('ACSFGT'), message='too little sequence')
  end

  ## Tests for type_of_sequences  (multi-fasta  kind of thing the user would enter)
  it 'test_type_of_sequences' do
    aa_multifasta = ">SDFDSF\nACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n>asdfas\nasfasdfffffffffffffffffffff\n>alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf"
    aa_multifasta_including_short_seq_missing_lead = "ACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n>asdfas\nasf\n>alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf"
    aa_singlesequence =  "ACGTGSDLKJGNLDKSJFLSDKJFLSDKOIU\n"
    nt_multifasta = ">asdf\nAAAAAAAAAAAAAAAAAAAAT\n>sfaslkj\nCAGATGCRRCAAAGCAAACGGCAA\n>asssssjlkj\nACCCANNNNNNXXXXCAUUUUUU"
    aa_nt_mix = ">alksjflkasdj slakdjf\nasdfasdfasdfljaslkdjf\n>ffffffassdf\nACGCNAGTGCCCCCCCCGANATGGGTGGTTXXXXXGGTG"

    assert_equal(:protein, type_of_sequences(aa_multifasta), 'aa_multifasta')
    assert_equal(:protein, type_of_sequences(aa_multifasta_including_short_seq_missing_lead ), 'aa_multifasta_short_seq_and_no_>')
    assert_equal(:protein, type_of_sequences(aa_singlesequence), 'single AA sequence')
    assert_equal(:nucleotide, type_of_sequences(nt_multifasta), 'nt_multifasta')
    expect { type_of_sequences(aa_nt_mix) }.to raise_error(ArgumentError)
  end

  it 'test_to_fasta' do
    query_no_header = 'TACTGCTAGTCGATCGTCGATGCTAGCTGAC'
    query_with_header = '>athcatrandom\nTACTGCTAGTCGATCGTCGATGCTAGCTGAC'
    ip   = request.ip.to_s
    time = Time.now.strftime("%y%m%d-%H:%M:%S")
    assert_equal(">Submitted_By_#{ip}_at_#{time}\n"+query_no_header, to_fasta(query_no_header))
    assert_equal(query_with_header, to_fasta(query_with_header))
  end

  it 'test_unique_sequence_ids' do
    ip   = request.ip.to_s
    time = Time.now.strftime("%y%m%d-%H:%M:%S")
    aa_multifasta = ">a\nATGCTCA\n>bob\nGTCGCGA\n>a\nATGCTCAAGAa\n>c\nGTacgtcgCGCGA>bob\nrandom\ncomments\nTAGGCGACT"
    aa_multifasta_out = ">a\nATGCTCA\n>bob\nGTCGCGA\n>a_1\nATGCTCAAGAa\n>c\nGTacgtcgCGCGA>bob_1\nrandom\ncomments\nTAGGCGACT"
    aa_multifasta_with_missing_lead = "ACGTGSDLKJGNLDK\n>a\natgctgatcgta\n>a\natgctgatcgta"
    aa_multifasta_with_missing_lead_out = ">Submitted_By_#{ip}_at_#{time}\n"+"ACGTGSDLKJGNLDK\n>a\natgctgatcgta\n>a_1\natgctgatcgta"
    assert_equal(aa_multifasta_out, to_fasta(aa_multifasta))
    assert_equal(aa_multifasta_with_missing_lead_out, to_fasta(aa_multifasta_with_missing_lead))
  end

  it 'test_composition' do
    expected_comp = {"a"=>2, "d"=>3, "f"=>7, "s"=>3, "A"=>1}
    assert_equal(expected_comp, composition('asdfasdfffffAsdf'))
  end

  it 'test_construct_standard_sequence_hyperlink' do
    assert_equal "/get_sequence/?id=one&db=abc def", construct_standard_sequence_hyperlink({:sequence_id => 'one', :databases => %w(abc def)})
    assert_equal nil, construct_standard_sequence_hyperlink({:sequence_id => ' one', :databases =>  %w(abc def)})
    assert_equal "/get_sequence/?id=MAL13P1.218&db=abc def", construct_standard_sequence_hyperlink({:sequence_id => 'lcl|MAL13P1.218', :databases =>  %w(abc def)})
  end
end

describe 'app tester' do
  it 'test_process_advanced_blast_options' do
    app = SequenceServer::App.new!

    # Tests below fail by raising and error
    app.validate_advanced_parameters('')
    app.validate_advanced_parameters('-word_size 5')

    expect {app.validate_advanced_parameters('-word_size 5; rm -rf /')}.to raise_error(ArgumentError)
    expect {app.validate_advanced_parameters('-db roar')}.to raise_error(ArgumentError)
  end
end

describe 'SystemHelpers' do
  include SequenceServer::Helpers::SystemHelpers

  it 'test_multipart_database_name?' do
    assert_equal true, multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/nr.00')
    assert_equal false, multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/nr')
    assert_equal true, multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01')
  end
end
