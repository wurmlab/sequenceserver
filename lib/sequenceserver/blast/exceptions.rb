module SequenceServer
  module BLAST
    # To signal error in query sequence or options.
    #
    # ArgumentError is raised when BLAST+'s exit status is 1; see [1].
    class ArgumentError < ArgumentError
    end

    # To signal internal errors.
    #
    # RuntimeError is raised when BLAST+'s exits status is one of 2, 3, 4, or
    # 255; see [1].  These are rare, infrastructure errors, used internally,
    # and of concern only to the admins/developers.
    class RuntimeError < RuntimeError
      def initialize(status, message)
        @status  = status
        @message = message
      end

      attr_reader :status, :message

      def to_s
        "#{status}, #{message}"
      end
    end
  end
end
