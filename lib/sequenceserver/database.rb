module SequenceServer
  class Database < Struct.new("Database", :name, :title)
    def to_s
      "#{title} #{name}"
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
        self.title <=> other.title
      else
        self.name <=> other.name
      end
    end
  end
end
