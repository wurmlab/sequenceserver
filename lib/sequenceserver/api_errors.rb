module SequenceServer
  # API errors have an http status, title, message, and additional information
  # like stacktrace or information from program output.
  class APIError < StandardError
  end

  # Job not found (404).
  class NotFound < APIError
    def http_status
      404
    end

    def title
      'Job not found'
    end

    def message
      'The requested job could not be found'
    end

    undef_method :backtrace
  end

  # Errors caused due to incorrect user input.
  class InputError < APIError
    def initialize(more_info)
      @more_info = more_info
      super
    end

    def http_status
      400
    end

    def title
      'Input error'
    end

    def message
      <<~MSG
        Looks like there's a problem with one of the query sequences, selected
        databases, or advanced parameters.
      MSG
    end

    attr_reader :more_info
  end

  # Errors caused by everything other than invalid user input.
  class SystemError < APIError
    def initialize(more_info = nil)
      @more_info = more_info || backtrace
      super
    end

    def http_status
      500
    end

    def title
      'System error'
    end

    def message
      <<~MSG
        Looks like there is a problem with the server. Try visiting the page again
        after a while. If this message persists, please report the problem on our
        <a href="https://github.com/wurmlab/sequenceserver/issues" target="_blank">
        issue tracker</a>.
      MSG
    end

    attr_reader :more_info
  end
end
