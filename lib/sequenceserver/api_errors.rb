module SequenceServer

  class APIError < StandardError
    def initialize(gist, desc, info = nil)
      @gist = gist
      @desc = desc
      @info = info
      super gist
    end

    attr_reader :gist, :desc, :info

    def to_json
      {
        :gist => gist,
        :desc => desc,
        :info => info
      }.to_json
    end
  end

  class NotFound < APIError
    def initialize
      super 'Job not found', <<DESC
The requested job couldn't be found.
DESC
    end

    def http_status
      404
    end
  end

  # Errors caused due to incorrect user input.
  class InputError < APIError
    def initialize(info)
      super 'Job failed', <<DESC, info
Looks like there's a problem with the query sequence or advanced parameters.
DESC
    end

    def http_status
      400
    end
  end

  # Errors caused by everything other than invalid user input.
  class SystemError < APIError
    def initialize(info)
      super 'Job failed', <<DESC, info
There was a problem running BLAST. Could be BLAST crashed because it is not
compiled correctly, or the system is out of memory or disk space. Or may be
the databases files are corrupt or have duplicated ids.
DESC
    end

    def http_status
      500
    end
  end
end
