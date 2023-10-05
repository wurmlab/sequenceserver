require 'spec_helper'

# Test BLAST module.
module SequenceServer
 with_hits = Job.fetch('blast_2.4.0/blastn')
  no_hits = Job.fetch('blast_2.4.0/blastn_nohits')

  init

  describe 'Report' do
    hits_report = Report.generate(with_hits)
    no_hits_report = Report.generate(no_hits)

    it 'will return an Array of queries' do
      hits_report.queries.should be_a Array
      no_hits_report.queries.should be_a Array
    end

    it 'will return a Hash of stats' do
      hits_report.stats.should be_a Hash
      no_hits_report.stats.should be_a Hash
    end

    it 'contains all the necessary stats' do
      hits_report.stats.length.should eql(7)
      no_hits_report.stats.length.should eql(7)
    end
  end

  describe 'Query' do
    hits_report = Report.generate(with_hits)
    no_hits_report = Report.generate(no_hits)

    it 'will return queries with valid length' do
      hits_report.queries.first.length.should be_a Integer
      hits_report.queries.first.length.should satisfy { |n| n > 0 }
      no_hits_report.queries.first.length.should be_a Integer
      no_hits_report.queries.first.length.should satisfy { |n| n > 0 }
    end

    it 'will return an Array of hits' do
      hits_report.queries.first.hits.should be_a Array
      no_hits_report.queries.first.hits.should be_a Array
    end
  end

  describe 'Hits' do
    hits_report = Report.generate(with_hits)
    no_hits_report = Report.generate(no_hits)

    it 'will have non zero length' do
      hits_report.queries.last.hits.first.length.should satisfy { |n| n > 0 }
    end

    it 'will return an Array of HSPs' do
      hits_report.queries.first.hits.first.hsps.should be_a Array
    end

    it 'will return an Array with atleast one HSP' do
      hits_report.queries.first.hits.first.hsps.length.should be >= 1
    end

    it 'will contain no element if no hits were obtained' do
      no_hits_report.queries.first.hits.length.should eql(0)
    end
  end

  # Test general features of HSPs. Algorithm specific customizations are
  # tested separetly.
  describe 'HSPs' do
    hits_report = Report.generate(with_hits)

    # Currently using all 17 HSP parameters in BLAST Report + 1 to refer to the
    # hit object it belongs to.
    it 'have all the necessary values' do
      hits_report.queries.last.hits.first.hsps.last.count.should eql(19)
    end

    # Test Random HSPs to ensure that all the values from HSP struct are valid.
    it 'have correct alignment values' do
      hits_report.queries.last.hits.first.hsps.last.bit_score.should be_a Float
      hits_report.queries.last.hits.first.hsps.last.score.should be_a Integer

      hits_report.queries.first.hits.first.hsps.first.evalue.should be_a Float
      hits_report.queries.first.hits.first.hsps.first.evalue
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.last.hsps.first.qstart.should be_a Integer
      hits_report.queries.first.hits.last.hsps.first.qstart
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.last.hsps.first.qend.should be_a Integer
      hits_report.queries.first.hits.last.hsps.first.qend
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.last.hits.last.hsps.last.sstart.should be_a Integer
      hits_report.queries.last.hits.last.hsps.last.sstart
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.first.hsps.last.send.should be_a Integer
      hits_report.queries.first.hits.first.hsps.last.send
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.first.hsps.last.qframe.should be_a Integer
      hits_report.queries.first.hits.first.hsps.last.sframe.should be_a Integer

      hits_report.queries.first.hits.first.hsps.last.identity.should be_a Integer
      hits_report.queries.first.hits.first.hsps.last.identity
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.first.hsps.last.gaps.should be_a Integer
      hits_report.queries.first.hits.first.hsps.last.gaps
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.first.hsps.last.positives
        .should be_a Integer
      hits_report.queries.first.hits.first.hsps.last.positives
        .should_not satisfy { |n| n < 0 }

      hits_report.queries.first.hits.first.hsps.last.length.should be_a Integer
      hits_report.queries.first.hits.first.hsps.last.length
        .should satisfy { |n| n > 0 }

      hits_report.queries.last.hits.last.hsps.first.qseq.should be_a String
      hits_report.queries.last.hits.last.hsps.first.sseq.should be_a String
      hits_report.queries.last.hits.last.hsps.first.midline.should be_a String
    end

    it 'have correctly matched query, hit and midline alignments' do
      hsp = hits_report.queries.last.hits.last.hsps.first
      hsp.qseq.length.should eql(hsp.sseq.length)
      hsp.sseq.length.should eql(hsp.midline.length)
      hsp.midline.length.should eql(hsp.qseq.length)
    end
  end

  # Individually test different BLAST+ algorithms
  #
  describe 'BLASTN' do
    let 'hsp' do
      report = Report.generate(Job.fetch('blast_2.4.0/blastn'))
      report.queries.first.hits.last.hsps.first
    end

    it 'have correct query and subject frame' do
      [1, -1].should include(hsp.qframe)
      [1, -1].should include(hsp.sframe)
    end

    it 'have correct qstart, qend, sstart, send' do
      if hsp.sframe > 0
        hsp.sstart.should be <= hsp.send
      else
        hsp.sstart.should be >= hsp.send
      end
    end
  end

  describe 'BLASTP' do
    let 'hsp' do
      report = Report.generate(Job.fetch('blast_2.4.0/blastp'))
      report.queries.first.hits.last.hsps.first
    end

    it 'have correct query and subject frame' do
      hsp.qframe.should eql(0)
      hsp.sframe.should eql(0)
    end

    it 'have correct qstart, qend, sstart, send values' do
      hsp.qstart.should be <= hsp.qend
      hsp.sstart.should be <= hsp.send
    end

  end

  describe 'BLASTX' do
    let 'hsp' do
      report = Report.generate(Job.fetch('blast_2.4.0/blastx'))

      report.queries.first.hits.last.hsps.first
    end

    it 'have correct query and subject frame' do
      hsp.qframe.should_not eql(0)
      hsp.sframe.should eql(0)
    end

    it 'have correct qstart, qend, sstart, send' do
      hsp.qstart.should be <= hsp.qend
      hsp.sstart.should be <= hsp.send
    end
  end

  describe 'TBLASTX' do
    let 'hsp' do
      report = Report.generate(Job.fetch('blast_2.4.0/tblastx'))
      report.queries.first.hits.last.hsps.first
    end

    it 'have correct query and subject frame' do
      hsp.qframe.should_not eql(0)
      hsp.sframe.should_not eql(0)
    end

    it 'have correct qstart, qend, sstart, send' do
      hsp.qstart.should be <= hsp.qend
      hsp.sstart.should be <= hsp.send
    end
  end

  describe 'TBLASTN' do
    let 'hsp' do
      report = Report.generate(Job.fetch('blast_2.4.0/tblastn'))
      report.queries.first.hits.last.hsps.first
    end

    it 'have correct query and subject frame' do
      hsp.qframe.should eql(0)
      hsp.sframe.should_not eql(0)
    end

    it 'have correct qstart, qend, sstart, send' do
      hsp.qstart.should be <= hsp.qend
      hsp.sstart.should be <= hsp.send
    end
  end
end
