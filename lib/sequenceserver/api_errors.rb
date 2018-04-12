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
      'Job failed'
    end

    def message
<<MSG
Looks like there's a problem with one of the query sequences, selected
databases, or advanced parameters.
MSG
    end

    attr_reader :more_info
  end

  # Errors caused by everything other than invalid user input.
  class SystemError < APIError
    def http_status
      500
    end

    def title
      'Job failed'
    end

    def message
<<MSG
Sorry BLAST failed - please try again. If this message persists, there is a
problem with the server. In this case, please report the bug on our
<a href="https://github.com/wurmlab/sequenceserver/issues" target="_blank">
issue tracker</a>.
MSG
    end
  end
end
