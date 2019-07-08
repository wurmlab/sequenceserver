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
    Capybara.default_max_wait_time = 10

    options = ::Selenium::WebDriver::Firefox::Options.new
    options.args << '--headless'
    Capybara.register_driver :selenium do |app|
      Capybara::Selenium::Driver.new(app, browser: :firefox, options: options)
    end
  end

  # Fasta files used for testing consist of TP53 and COX41 protein/nucleotide sequences for reproducibility.
  it 'loads BLASTP xml output' do
    access_by_uuid('blast_2.9.0/blastp')
  end

  it 'loads BLASTX xml output' do
    access_by_uuid('blast_2.9.0/blastx')
  end

  it 'loads BLASTN xml output' do
    access_by_uuid('blast_2.9.0/blastn')
  end

  it 'loads TBLASTN xml output' do
    access_by_uuid('blast_2.9.0/tblastn')
  end

  it 'loads TBLASTX xml output' do
    access_by_uuid('blast_2.9.0/tblastx')
  end

  ## Helpers ##

  def access_by_uuid(id)
    visit "/#{id}"
    page.should have_content('Query')
  end
end
