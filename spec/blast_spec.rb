require 'sequenceserver'

module SequenceServer

  test_file = File.join(SequenceServer.root, 'spec', 'ss_sample_blast_results.xml')
  blast_report = Blast::Report.new(File.new(test_file))

  describe 'Report' do

    it 'will return an Array of queries' do
      blast_report.queries.should be_a Array
    end

  end

  describe 'Query' do
    it 'will return queries with valid length' do
      blast_report.queries.first.len.should be_a Fixnum
      blast_report.queries.first.len.should satisfy {|n| n > 0}
    end

    it 'will return an Array of hits' do
      blast_report.queries.first.hits.should be_a Array
    end

    it 'will return an Array of stats' do
      blast_report.queries.last.stats.should be_a Array
    end

    it 'contains all the necessary stats' do
      blast_report.queries.first.stats.length.should eql(7)
    end

  end

  describe 'Hits' do
    it 'will have non zero length' do
      blast_report.queries.last.hits.first.len.should satisfy {|n| n > 0}
    end

    it 'will return an Array of HSPs' do
      blast_report.queries.first.hits.first.hsps.should be_a Array
    end

    it 'will return an Array with atleast one HSP' do
      blast_report.queries.first.hits.first.hsps.should have_at_least(1).items
    end

  end

  describe 'HSPs' do
    # Currently using all 17 HSP parameters in BLAST Report.
    it 'have all the necessary values' do
      blast_report.queries.last.hits.first.hsps.last.count.should eql(17)
    end

    # Test Random HSPs to ensure that all the values from HSP struct are valid.
    it 'have correct alignment values' do
      blast_report.queries.last.hits.first.hsps.last.bit_score.should be_a Float
      blast_report.queries.last.hits.first.hsps.last.score.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.first.evalue.should be_a Float
      blast_report.queries.first.hits.last.hsps.first.qstart.should be_a Fixnum
      blast_report.queries.first.hits.last.hsps.first.qend.should be_a Fixnum
      blast_report.queries.last.hits.last.hsps.last.start.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.send.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.qframe.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.hframe.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.identity.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.gaps.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.positives.should be_a Fixnum
      blast_report.queries.first.hits.first.hsps.last.len.should be_a Fixnum
      blast_report.queries.last.hits.last.hsps.first.qseq.should be_a String
      blast_report.queries.last.hits.last.hsps.first.hseq.should be_a String
      blast_report.queries.last.hits.last.hsps.first.midline.should be_a String
    end

  end
end
