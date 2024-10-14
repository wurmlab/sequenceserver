require 'simplecov'
require 'capybara/rspec'
require 'selenium-webdriver'
require 'capybara-screenshot/rspec'

Dir[File.expand_path('spec/support/**/*.rb')].sort.each { |file| require file }

# Start SimpleCov.
SimpleCov.start

# Load SequenceServer in testing mode.
ENV['RACK_ENV'] = 'test'
require 'sequenceserver'

# For the purpose of testing, set DOTDIR to spec/dotdir.
SequenceServer::DOTDIR = File.join(__dir__, 'dotdir')

Capybara.app = SequenceServer
Capybara.server = :webrick
Capybara.default_max_wait_time = 15

chrome_options = Selenium::WebDriver::Chrome::Options.new
chrome_options.add_preference('download.default_directory', DownloadHelpers::DOWNLOADS_DIR)
chrome_options.add_preference('profile.default_content_setting_values.automatic_downloads', 1)
chrome_options.add_argument('--window-size=1920,1200')

Capybara.register_driver :chrome do |app|
  Capybara::Selenium::Driver.new(
    app,
    browser: :chrome,
    options: chrome_options
  )
end

Capybara.register_driver :headless_chrome do |app|
  options = chrome_options.dup
  options.add_argument('--headless')

  Capybara::Selenium::Driver.new(
    app,
    browser: :chrome,
    options: options
  )
end

Capybara.default_driver = ENV['BROWSER_DEBUG'] ? :chrome : :headless_chrome
Capybara.javascript_driver = ENV['BROWSER_DEBUG'] ? :chrome : :headless_chrome

Capybara::Screenshot.instance_variable_set :@capybara_root, File.join(__dir__, 'tmp')
Capybara::Screenshot.register_driver :headless_chrome do |driver, path|
  driver.browser.save_screenshot(path)
end

RSpec.configure do |config|
  # Explicitly enable should syntax of rspec.
  config.expect_with :rspec do |expectations|
    expectations.syntax = %i[should expect]
  end

  # To use url_encode function in import_spec.
  config.include ERB::Util, type: :feature

  # For file downloading.
  config.include DownloadHelpers, type: :feature

  # Setup capybara tests.
  config.before :context, type: :feature do |_context|
    FileUtils.mkdir_p DownloadHelpers::DOWNLOADS_DIR
  end

  config.after :example, type: :feature do
    clear_downloads
  end

  config.after :context, type: :feature do
    FileUtils.rm_rf Dir[File.join(SequenceServer::DOTDIR, '*-*-*-*-*')]
  end

  config.after :context do
    SequenceServer::Database.clear
  end
end
