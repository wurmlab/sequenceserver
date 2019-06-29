require 'simplecov'
SimpleCov.start

# This will tell SequenceServer that we are testing.
ENV['RACK_ENV'] = 'test'

require 'sequenceserver'

# For the purpose of testing, DOTDIR is set to spec/dotdir.
SequenceServer::DOTDIR = File.join(__dir__, 'dotdir')
