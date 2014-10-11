require 'sequenceserver'
require 'sequenceserver/database'
require 'rspec'

module SequenceServer

  describe 'Database' do

    let 'root' do
      SequenceServer.root
    end

    let 'empty_config' do
      File.join(root, 'spec', 'empty_config.yml')
    end

    let 'database_dir' do
      File.join(root, 'spec', 'database')
    end

    let 'database_dir_no_db' do
      File.join(root, 'spec', 'database', 'proteins', 'Cardiocondyla_obscurior')
    end

    let 'app' do
      SequenceServer.init(:config_file  => empty_config,
                          :database_dir => database_dir)
    end

    it 'can tell BLAST+ databases in a directory' do

    end

    it 'can tell NCBI multipart database name' do
      Database.multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/nr.00').should be_true
      Database.multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/nr').should be_false
      Database.multipart_database_name?('/home/ben/pd.ben/sequenceserver/db/img3.5.finished.faa.01').should be_true
    end

    it "can tell FASTA files that are yet to be made into a BLAST+ database" do
      Database.unformatted_fastas.should_not be_empty
    end

    it "can make BLAST+ database from a FASTA file"

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
  end
end
