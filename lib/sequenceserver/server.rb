require 'rack/handler/webrick'

module SequenceServer
  # Simple wrapper around WEBrick and Rack::Handler::WEBrick to host
  # SequenceServer standalone.
  class Server
    class << self
      def run(*args)
        new(*args).start
      end
    end

    def initialize(app)
      @app = app
    end

    attr_reader :app

    # Start server. Raises Errno::EADDRINUSE if port is in use by another
    # process. Raises Errno::EACCES if binding to the port requires root
    # privilege.
    def start
      setup_signal_handlers
      @server = WEBrick::HTTPServer.new(options)
      @server.mount '/', Rack::Handler::WEBrick, app
      @server.start
    end

    # Stop server.
    def stop
      @server.shutdown
    end

    # Options Hash passed to WEBrick::HTTPServer.
    # rubocop:disable Metrics/AbcSize
    def options
      @options ||= {
        BindAddress:      app.config[:host],
        Port:             app.config[:port],
        StartCallback:    proc { app.on_start },
        StopCallback:     proc { app.on_stop  },
        OutputBufferSize: 5,
        AccessLog:        [[logdev, WEBrick::AccessLog::COMMON_LOG_FORMAT]],
        Logger:           WEBrick::Log.new(logdev)
      }
    end
    # rubocop:enable Metrics/AbcSize

    private

    def setup_signal_handlers
      %i[INT TERM].each do |sig|
        trap sig do
          stop
        end
      end
    end

    def logdev
      @logdev ||= app.verbose? ? STDERR : '/dev/null'
    end
  end
end
