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
There was a problem running BLAST. Could be BLAST crashed because it is not
compiled correctly, or the system is out of memory or disk space. Or may be
the databases files are corrupt or have duplicated ids.
MSG
    end
  end
end
