require 'digest/md5'

module SequenceServer
  class Database < Struct.new("Database", :name, :title, :type)
    def to_s
      "#{type}: #{title} #{name}"
    end

    # Its not very meaningful to compare Database objects, however,
    # we still add the 'spaceship' operator to be able to sort the
    # databases by 'title', or 'name' for better visual presentation.
    # 
    # We use 'title' for comparison, while relying on 'name' as fallback.
    #
    # Trying to sort a list of dbs with 'title' set only for some of them
    # will obviously produce unpredictable sorting order.
    def <=>(other)
      if self.title and other.title
        self.title.downcase <=> other.title.downcase
      else
        self.name.downcase <=> other.name.downcase
      end
    end

    def hash
      @hash ||= Digest::MD5.hexdigest(self.name)
    end
  end
end
