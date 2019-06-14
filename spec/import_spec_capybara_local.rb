require 'spec_helper'
require 'sauce_whisk'
require 'capybara/rspec'
require 'selenium-webdriver'

RSpec.configure do |config|
  config.include Capybara::DSL
end

SequenceServer::DOTDIR = File.join(__dir__, 'imported_xml_reports')

describe 'report generated from imported XML', :js => true do
  before do |scenario|
    Capybara.app = SequenceServer.init
    Capybara.server = :webrick
    Capybara.javascript_driver = :selenium
    Capybara.default_max_wait_time = 10

    options = ::Selenium::WebDriver::Firefox::Options.new
    options.args << '--headless'
    Capybara.register_driver :selenium do |app|
      Capybara::Selenium::Driver.new(app, browser: :firefox, options: options)
    end
  end


  it 'loads BLASTP xml output' do
    access_by_uuid('41355446-14d6-4dc8-b7c8-44e6277f236b')
   # page.evaluate_script("$(':btn btn-link download-fa')").should eq(true)
  end

  it 'loads BLASTX xml output' do
    access_by_uuid('ba1fb30d-570d-4c91-8c03-eb0b293142e8')
  end

  it 'loads BLASTN xml output' do
    access_by_uuid('511fc8c9-fb8c-4e4b-8c94-1adfe331d177')
  end

  it 'loads TBLASTN xml output' do
    access_by_uuid('ae8c9ee5-27e3-4459-a581-656af62b6a62')
  end

  it 'loads TBLASTX xml output' do
    access_by_uuid('59fa0278-6c33-4f79-8542-a29682993c97')
  end

  it 'loads diamond_BLASTP xml output' do
    access_by_uuid('813b1a82-b1c5-4c16-9f11-3cf80f062a46')
  end

  it 'loads diamond_BLASTX xml output' do
    access_by_uuid('5411a2df-4e56-4c01-9236-5ee2bd12ae64')
  end

  ## Helpers ##

  def access_by_uuid(id)
    visit "/#{id}"
    page.should have_content('Query')
  end
end
