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
    Capybara.default_max_wait_time = 60

   Capybara.register_driver :selenium do |app|
     options = ::Selenium::WebDriver::Firefox::Options.new
     options.args << '--headless'
          Capybara::Selenium::Driver.new(app, browser: :firefox, options: options)
    end
  end

  # Fasta files used for testing consist of TP53 and COX41 protein/nucleotide sequences for reproducibility.
  it 'loads Diamond blastp xml report' do
    access_by_uuid('diamond_0.9.24/blastp')
  end

  it 'loads Diamond blastx xml report' do
    access_by_uuid('diamond_0.9.24/blastx')
  end
  ## Helpers ##

  def access_by_uuid(id)
    url = url_encode(id)
    visit "/#{url}"
    page.should have_content('Query')
  end
end
