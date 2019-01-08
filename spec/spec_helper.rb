require 'simplecov'
SimpleCov.start

# This will tell SequenceServer that we are testing.
ENV['RACK_ENV'] = 'test'

require 'sequenceserver'
