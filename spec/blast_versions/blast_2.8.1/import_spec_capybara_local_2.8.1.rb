require 'spec_helper'
require 'sauce_whisk'
require 'capybara/rspec'
require 'selenium-webdriver'

RSpec.configure do |config|
  config.include Capybara::DSL
end

SequenceServer::DOTDIR = File.join(__dir__, '../../imported_xml_reports')

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
    access_by_uuid('9d67d81d-ef72-4be0-a5ca-f33451202ea7')
  end

#  it 'loads BLASTX xml output' do
#    access_by_uuid('d3ba8f27-5a0f-489784fc-4148a4fb43b4')
#  end
#
#  it 'loads BLASTN xml output' do
#    access_by_uuid('9f85347e-2ce1-464b-b1e1-68db29e1d9d8')
#  end
#
#  it 'loads TBLASTN xml output' do
#    access_by_uuid('8829431d-7dd2-4854-a7aa-5b29024592e2')
#  end
#
#  it 'loads TBLASTX xml output' do
#    access_by_uuid('4cfb1f2a-08b6-4d27-b165-c68f78eee2ca')
#  end
#
  ## Helpers ##

  def access_by_uuid(id)
    visit "/#{id}"
    page.should have_content('Query')
    page.execute_script("return $('.view-sequence').is(':disabled')").should eq(false)
  end
end
