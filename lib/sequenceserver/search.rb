module SequenceServer
  # Keep track of last 100 searches in memory.
  module Search
    TRACK = 100

    class << self
      def <<(file)
        data.shift if data.length >= TRACK
        data << file
      end

      private

      def data
        @data ||= []
      end
    end
  end
end
