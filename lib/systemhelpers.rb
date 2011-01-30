# Module to colelct some system-related helper functions
# copyright yannick wurm and anurag priyam

module SystemHelpers

    # check if the given command exists and is executable
    # returns True if all is good.
    def command?(command)
      system("which #{command} > /dev/null 2>&1")
    end

end