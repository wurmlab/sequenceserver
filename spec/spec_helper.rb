require 'codeclimate-test-reporter'
CodeClimate::TestReporter.start

require 'sequenceserver'
require 'rack/test'
require 'rspec'

begin
  require 'capybara/rspec'
  require 'selenium-webdriver'

  RSpec.configure do |config|
    config.include Capybara::DSL
  end

  $capybara_available = true
rescue
end
