require 'codeclimate-test-reporter'
CodeClimate::TestReporter.start

require 'sequenceserver'
require 'rack/test'
require 'rspec'

begin
  require 'capybara/rspec'
  require 'capybara-webkit'

  RSpec.configure do |config|
    config.include Capybara::DSL
  end

  Capybara::Webkit.configure do |config|
    config.block_unknown_urls
  end
  $capybara_available = true
rescue
end
