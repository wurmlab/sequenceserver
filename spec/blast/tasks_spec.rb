require 'spec_helper'
require 'sequenceserver/blast/tasks'

module SequenceServer
  RSpec.describe BLAST::Tasks do
    describe '#to_h' do
      it "extracts tasks from help text" do
        expect(described_class.to_h).to eq({
          "blastn"=>["blastn", "blastn-short", "dc-megablast", "megablast", "rmblastn"],
          "blastp"=>["blastp", "blastp-fast", "blastp-short"],
          "blastx"=>["blastx", "blastx-fast"],
          "tblastn"=>["tblastn", "tblastn-fast"],
          "tblastx"=>[]
        })
      end
    end
  end
end