require_relative 'blast/job'
require_relative 'blast/report'
require_relative 'blast/constants'

module SequenceServer
  module BLAST
    VALID_SEQUENCE_ID = /\A[a-zA-Z0-9\-_.:*#|\[\]]+\z/
  end
end
