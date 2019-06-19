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

  # Fasta files used for testing consist of TP53 and COX41 protein/nucleotide sequences for reproducibility.
  it 'loads BLASTP xml output' do
    access_by_uuid('ea347d79-6397-44e5-9048-c90e58c56200')
  end

  it 'loads BLASTX xml output' do
    access_by_uuid('e39d30a2-304f-4b85-ad1c-a114cc0b383f')
  end

  it 'loads BLASTN xml output' do
    access_by_uuid('85ca3be1-b495-43d3-b267-2e50aced9cc7')
  end

  it 'loads TBLASTN xml output' do
    access_by_uuid('148e0664-4ab8-41af-86cb-127ff19f2d33')
  end

  it 'loads TBLASTX xml output' do
    access_by_uuid('752b6b87-2670-47a0-aa57-d0dc8cdd7667')
  end

  it 'loads diamond_BLASTP xml output' do
    access_by_uuid('043110ae-faf9-4258-8098-3384fb16fbb1')
  end

  it 'loads diamond_BLASTX xml output' do
    access_by_uuid('8e400eed-4ef2-48e6-aee8-a55a45606e77')
  end

  ## Helpers ##

  def access_by_uuid(id)
    visit "/#{id}"
    page.should have_content('Query')
  end
end
