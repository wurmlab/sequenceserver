require 'spec_helper'
require 'sequenceserver/report'
require 'sequenceserver/blast/report'

module SequenceServer
  RSpec.describe BLAST::Job do
    before do
      FileUtils.mkdir_p(DOTDIR)
      FileUtils.rm_r(File.join(DOTDIR, job_id)) if File.exist?(File.join(DOTDIR, job_id))
      FileUtils.cp_r(File.join(__dir__, '..', 'fixtures', job_id), DOTDIR)

      # For all files in DOTDIR/job_id, replace $PATH_PREFIX with the root dir of the project.
      job_dir = File.join(DOTDIR, job_id)
      root_dir = File.expand_path(File.join(__dir__, '..', '..', '..'))
      Dir[File.join(job_dir, '**', '*')].each do |f|
        File.write(f, File.read(f).gsub('$PATH_PREFIX', root_dir)) if File.file?(f)
      end

      SequenceServer.init
    end

    let(:job_id) { '38334a72-e8e7-4732-872b-24d3f8723563' }
    let(:job) { SequenceServer::Job.fetch(job_id) }
    let(:report) { BLAST::Report.new(job) }
    let(:keys_to_ignore) { %i[querydb submitted_at imported_xml seqserv_version cloud_sharing_enabled] }

    describe "#to_json" do
      it "returns a JSON representation of the job" do
        actual_report = JSON.parse(report.to_json).reject { |k, _| keys_to_ignore.include?(k) }
        expected_report = JSON.parse(File.read(File.join(job.dir, 'expected_outputs/frontend.json'))).reject { |k, _| keys_to_ignore.include?(k) }

        actual_report.each do |k, v|
          expect(v).to eq(expected_report[k])
        end
      end
    end
  end
end