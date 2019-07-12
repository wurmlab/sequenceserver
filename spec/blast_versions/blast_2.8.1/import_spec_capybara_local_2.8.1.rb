require 'spec_helper'
require 'sauce_whisk'
require 'capybara/rspec'
require 'selenium-webdriver'

RSpec.configure do |config|
  config.include Capybara::DSL
end

describe 'report generated from imported XML', :js => true do
  before do |scenario|
    Capybara.app = SequenceServer.init
    Capybara.server = :webrick
    Capybara.javascript_driver = :selenium
    Capybara.default_max_wait_time = 45

   Capybara.register_driver :selenium do |app|
    options = ::Selenium::WebDriver::Firefox::Options.new
    options.args << '--headless'
       Capybara::Selenium::Driver.new(app, browser: :firefox, options: options)
    end
  end

  # Fasta files used for testing consist of TP53 and COX41 protein/nucleotide sequences for reproducibility.
  it 'loads BLASTP xml output' do
    access_by_uuid('blast_2.8.1/blastp')
    page.save_screenshot('abc.png')
  end

  it 'loads BLASTX xml output' do
    access_by_uuid('blast_2.8.1/blastx')
  end

  it 'loads BLASTN xml output' do
    access_by_uuid('blast_2.8.1/blastn')
  end

  it 'loads TBLASTN xml output' do
    access_by_uuid('blast_2.8.1/tblastn')
  end

  it 'loads TBLASTX xml output' do
    access_by_uuid('blast_2.8.1/tblastx')
    page.save_screenshot('screen.png')
  end

  ## Helpers ##

  def access_by_uuid(id)
    url = url_encode(id)
    visit "/#{url}"
    page.should have_content('Query')
    page.execute_script("return $('.view-sequence').is(':disabled')").should eq(false)
  end
end
