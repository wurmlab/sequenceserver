module SequenceServer

  # Return version number of SequenceServer from the gemspec.  Version number
  # is read from gemspec, which might fail on older versions of Bundler or
  # RubyGems.  Return `nil` if version number couldn't be determined.
  def self.version
    Bundler.rubygems.loaded_specs('sequenceserver').version rescue nil
  end
end
