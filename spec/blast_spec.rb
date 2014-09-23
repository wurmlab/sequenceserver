require 'sequenceserver'

module SequenceServer

  with_hits_xml = File.join(SequenceServer.root, 'spec', 'ss_sample_blast_with_hits.xml')
  no_hits_xml = File.join(SequenceServer.root, 'spec', 'ss_sample_blast_no_hits.xml')

  describe 'Report' do
    hits_report = Blast::Report.new(File.new(with_hits_xml))
    no_hits_report = Blast::Report.new(File.new(no_hits_xml))

    it 'will return an Array of queries' do
      hits_report.queries.should be_a Array
      no_hits_report.queries.should be_a Array
    end

  end

  describe 'Query' do
    hits_report = Blast::Report.new(File.new(with_hits_xml))
    no_hits_report = Blast::Report.new(File.new(no_hits_xml))

    it 'will return queries with valid length' do
      hits_report.queries.first.len.should be_a Fixnum
      hits_report.queries.first.len.should satisfy {|n| n > 0}
      no_hits_report.queries.first.len.should be_a Fixnum
      no_hits_report.queries.first.len.should satisfy {|n| n > 0}
    end

    it 'will return an Array of hits' do
      hits_report.queries.first.hits.should be_a Array
      no_hits_report.queries.first.hits.should be_a Array
    end

    it 'will return an Array of stats' do
      hits_report.queries.last.stats.should be_a Array
      no_hits_report.queries.last.stats.should be_a Array
    end

    it 'contains all the necessary stats' do
      hits_report.queries.first.stats.length.should eql(7)
      no_hits_report.queries.first.stats.length.should eql(7)
    end

  end

  describe 'Hits' do
    hits_report = Blast::Report.new(File.new(with_hits_xml))
    no_hits_report = Blast::Report.new(File.new(no_hits_xml))

    it 'will have non zero length' do
      hits_report.queries.last.hits.first.len.should satisfy {|n| n > 0}
    end

    it 'will return an Array of HSPs' do
      hits_report.queries.first.hits.first.hsps.should be_a Array
    end

    it 'will return an Array with atleast one HSP' do
      hits_report.queries.first.hits.first.hsps.should have_at_least(1).items
    end

    it 'will contain no element if no hits were obtained' do
      no_hits_report.queries.first.hits.length.should eql(0)
    end

  end

  describe 'HSPs' do
    hits_report = Blast::Report.new(File.new(with_hits_xml))

    # Currently using all 17 HSP parameters in BLAST Report.
    it 'have all the necessary values' do
      hits_report.queries.last.hits.first.hsps.last.count.should eql(17)
    end

    # Test Random HSPs to ensure that all the values from HSP struct are valid.
    it 'have correct alignment values' do
      hits_report.queries.last.hits.first.hsps.last.bit_score.should be_a Float
      hits_report.queries.last.hits.first.hsps.last.score.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.first.evalue.should be_a Float

      hits_report.queries.first.hits.last.hsps.first.qstart.should be_a Fixnum
      hits_report.queries.first.hits.last.hsps.first.qstart.should_not satisfy {|n| n < 0}

      hits_report.queries.first.hits.last.hsps.first.qend.should be_a Fixnum
      hits_report.queries.first.hits.last.hsps.first.qend.should_not satisfy {|n| n < 0}

      hits_report.queries.last.hits.last.hsps.last.start.should be_a Fixnum
      hits_report.queries.last.hits.last.hsps.last.start.should_not satisfy {|n| n < 0}

      hits_report.queries.first.hits.first.hsps.last.send.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.last.send.should_not satisfy {|n| n < 0}

      hits_report.queries.first.hits.first.hsps.last.qframe.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.last.hframe.should be_a Fixnum

      hits_report.queries.first.hits.first.hsps.last.identity.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.last.identity.should_not satisfy {|n| n < 0 }

      hits_report.queries.first.hits.first.hsps.last.gaps.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.last.gaps.should_not satisfy {|n| n < 0}

      hits_report.queries.first.hits.first.hsps.last.positives.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.last.positives.should_not satisfy {|n| n < 0}

      hits_report.queries.first.hits.first.hsps.last.len.should be_a Fixnum
      hits_report.queries.first.hits.first.hsps.last.len.should satisfy {|n| n > 0}

      hits_report.queries.last.hits.last.hsps.first.qseq.should be_a String
      hits_report.queries.last.hits.last.hsps.first.hseq.should be_a String
      hits_report.queries.last.hits.last.hsps.first.midline.should be_a String
    end

    it 'have correctly matched query, hit and midline alignments' do
      hsp = hits_report.queries.last.hits.last.hsps.first
      hsp.qseq.length.should eql(hsp.hseq.length)
      hsp.hseq.length.should eql(hsp.midline.length)
      hsp.midline.length.should eql(hsp.qseq.length)
    end

  end
end
