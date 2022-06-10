require 'simplecov'
require 'capybara/rspec'
require 'capybara-screenshot/rspec'
require 'selenium-webdriver'

require_relative 'download_helper'

# Start SimpleCov.
SimpleCov.start

# Load SequenceServer in testing mode.
ENV['RACK_ENV'] = 'test'
require 'sequenceserver'

# For the purpose of testing, set DOTDIR to spec/dotdir.
SequenceServer::DOTDIR = File.join(__dir__, 'dotdir')

RSpec.configure do |config|
  # Explicitly enable should syntax of rspec.
  config.expect_with :rspec do |expectations|
    expectations.syntax = [:should, :expect]
  end

  # To use url_encode function in import_spec.
  config.include ERB::Util, type: :feature

  # For file downloading.
  config.include DownloadHelpers, type: :feature

  # Setup capybara tests.
  config.before :context, type: :feature do
    Capybara.app = SequenceServer
    Capybara.server = :webrick
    Capybara.default_max_wait_time = 30

    Capybara.register_driver :selenium do |app|
      options = Selenium::WebDriver::Firefox::Options.new

      # Run the browser in headless mode.
      options.args << '--headless'

      # Tell the browser where to save downloaded files.
      options.profile = Selenium::WebDriver::Firefox::Profile.new
      options.profile['browser.download.dir'] = downloads_dir
      options.profile['browser.download.folderList'] = 2

      # Suppress "open with / save" dialog for FASTA, XML, TSV and PNG file types.
      options.profile['browser.helperApps.neverAsk.saveToDisk'] =
        'text/fasta,text/xml,text/tsv,image/png'
      Capybara::Selenium::Driver.new(app, browser: :firefox, options: options)
    end

    FileUtils.mkdir_p downloads_dir
  end

  config.after :example, type: :feature do
    clear_downloads
  end

  config.after :context, type: :feature do
    FileUtils.rm_rf Dir[SequenceServer::DOTDIR + '/*-*-*-*-*']
  end

  config.after :context do
    SequenceServer::Database.clear
  end
end
