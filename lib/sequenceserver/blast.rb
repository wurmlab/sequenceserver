require_relative 'blast/job'
require_relative 'blast/report'
require_relative 'blast/constants'

module SequenceServer
  module BLAST
    VALID_SEQUENCE_ID = /\A[a-zA-Z0-9\-_.:*#|\[\]]+\z/

    # Sequence range accepted by `blastdbcmd -range`: "start-stop" or "start-"
    # (open ended). Anchored at both ends so that shell metacharacters cannot
    # be smuggled in alongside an otherwise valid range.
    VALID_SEQUENCE_RANGE = /\A[0-9]+-[0-9]*\z/
  end
end
