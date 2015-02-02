require 'codeclimate-test-reporter'
CodeClimate::TestReporter.start

require 'sequenceserver'
require 'rack/test'
require 'rspec'
require 'capybara/rspec'

RSpec.configure do |config|
  config.include Capybara::DSL
end
