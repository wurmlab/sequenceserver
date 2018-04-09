require 'spec_helper'
require 'sauce_whisk'
require 'capybara/rspec'
require 'selenium-webdriver'

RSpec.configure do |config|
  config.include Capybara::DSL
end

describe 'a browser', :js => true do
  before do |scenario|
    Capybara.app = SequenceServer.init
    Capybara.javascript_driver = :selenium

    Capybara.register_driver :selenium do |app|
      capabilities = {
        name: scenario.full_description,
        platform: ENV['platform'],
        browserName: ENV['browserName'],
        browserVersion: ENV['browserVersion'],
        build: ENV['TRAVIS_BUILD_NUMBER'],
        'tunnel-identifier': ENV['TRAVIS_JOB_NUMBER']
      }
      url = "https://#{ENV['SAUCE_USERNAME']}:#{ENV['SAUCE_ACCESS_KEY']}" \
        "@ondemand.saucelabs.com:443/wd/hub".strip

      Capybara::Selenium::Driver.new(app, browser: :remote, url: url,
                                     desired_capabilities: capabilities)
    end
  end

  before :each do |scenario|
    jobname = scenario.full_description
    Capybara.session_name = "#{jobname} - #{ENV['platform']} - " +
      "#{ENV['browserName']} - #{ENV['browserVersion']}"

      @driver = Capybara.current_session.driver

      # Output sessionId and jobname to std out for Sauce OnDemand Plugin to
      # display embeded results
      @session_id = @driver.browser.session_id
      puts "SauceOnDemandSessionID=#{@session_id} job-name=#{jobname}"
  end

  it 'properly controls blast button' do
    visit '/'

    fill_in('sequence', with: nucleotide_query, wait: 5)
    page.evaluate_script("$('#method').is(':disabled')").should eq(true)

    check(nucleotide_databases.first)
    page.evaluate_script("$('#method').is(':disabled')").should eq(false)
  end

  it 'properly controls interaction with database listing' do
    visit '/'
    fill_in('sequence', with: nucleotide_query, wait: 5)
    check(nucleotide_databases.first)
    page.evaluate_script("$('.protein .database').first().hasClass('disabled')")
      .should eq(true)
  end

  it 'shows a dropdown menu when other blast methods are available' do
    visit '/'
    fill_in('sequence', with: nucleotide_query, wait: 5)
    check(nucleotide_databases.first)
    page.save_screenshot('screenshot.png')
    page.has_css?('button.dropdown-toggle').should eq(true)
  end

  it 'can run a simple blastn search' do
    perform_search query: nucleotide_query,
      databases: nucleotide_databases
  end

  it 'can run a simple blastp search' do
    perform_search query: protein_query,
      databases: protein_databases
  end

  it 'can run a simple blastx search' do
    perform_search query: nucleotide_query,
      databases: protein_databases
  end

  it 'can run a simple tblastx search' do
    perform_search query: nucleotide_query,
      databases: nucleotide_databases,
      method: 'tblastx'
  end

  it 'can run a simple tblastn search' do
    perform_search query: protein_query,
      databases: nucleotide_databases
  end

  after :each do |scenario|
    @driver.quit
    Capybara.use_default_driver
    if scenario.exception
      SauceWhisk::Jobs.fail_job @session_id
    else
      SauceWhisk::Jobs.pass_job @session_id
    end
  end

  ## Helpers ##

  def perform_search(query: , databases: , method: nil)
    # Load search form.
    visit '/'

    # Fill in query, select databases, submit form.
    fill_in('sequence', with: query, wait: 5)
    databases.each { |db| check db }
    if method == 'tblastx'
      find('.dropdown-toggle').click
      find('.dropdown-menu li').click
    end
    click_button('method')

    # switch to new window because link opens in new window
    page.driver.browser.switch_to.window(page.driver.browser.window_handles.last)

    # Check that results loaded.
    page.should have_content('Query', wait: 10)
  end

  def nucleotide_query
    File.read File.join __dir__, 'nucleotide_query.fa'
  end

  def protein_query
    File.read File.join __dir__, 'protein_query.fa'
  end

  def nucleotide_databases
    [
      'Solenopsis invicta gnG subset',
      'Sinvicta 2-2-3 cdna subset'
    ]
  end

  def protein_databases
    [
      'Sinvicta 2-2-3 prot subset',
      '2018-04 Swiss-Prot insecta'
    ]
  end
end
