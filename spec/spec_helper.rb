require 'simplecov'
SimpleCov.start


# This will tell SequenceServer that we are testing.
ENV['RACK_ENV'] = 'test'
require 'sequenceserver'

# For the purpose of testing, set DOTDIR to spec/dotdir.
SequenceServer::DOTDIR = File.join(__dir__, 'dotdir')

# Explicit enable should syntax of rspec.
#Rspec.configure do |config|
#  config.expect_with :rspec do |expectations|
#    expectations.syntax = [:should, :expect]
#  end
#end
