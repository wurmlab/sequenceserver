# We change Logging format so that it is consistent with Sinatra's
class SinatraLikeLogFormatter < Logger::Formatter 
  MyFormat = "[%s] %s  %s\n"
  def initialize
    self.datetime_format = "%Y-%m-%d %H:%M:%S" 
  end
  def call(severity, time, progname, msg)
    MyFormat % [format_datetime(time), severity, msg2str(msg)]
  end
end
