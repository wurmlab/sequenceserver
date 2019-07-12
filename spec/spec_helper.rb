require 'simplecov'
SimpleCov.start

# Load SequenceServer in testing mode.
ENV['RACK_ENV'] = 'test'
require 'sequenceserver'

# For the purpose of testing, set DOTDIR to spec/dotdir.
SequenceServer::DOTDIR = File.join(__dir__, 'dotdir')

# Explicit enable should syntax of rspec.
RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.syntax = [:should, :expect]
  end
end

# To use url_encode function import_spec.
include ERB::Util
