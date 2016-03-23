require 'spec_helper'
require 'capybara/rspec'
require 'capybara-webkit'

describe 'a browser', :js => true do
  sequence = 'ATCGATCAGCTACGATCAGCATCGACTAGCATCGACTACGA'
  sample_nucl_db = 'Sinvicta 2-2-3 cdna subset'
  # sample_prot_db = 'Sinvicta2-2-3.prot'

  before(:all) do
    Capybara.javascript_driver = :webkit
    Capybara.default_wait_time = 5

    options = { :database_dir => File.join(SequenceServer.root, 'spec/database/sample/') }
    Capybara.app = SequenceServer.init(options)
  end

  it 'runs a simple blastn search' do
    visit '/'
    fill_in('sequence', :with => sequence)
    check(sample_nucl_db)
    click_button('method')
    # switch to new window because link opens in new window
    page.driver.browser.switch_to.window(page.driver.browser.window_handles.last)
    page.should have_content('Query')
  end

  it 'properly controls blast button' do
    visit '/'

    fill_in('sequence', :with => sequence)
    page.evaluate_script("$('#method').is(':disabled')").should eq(true)

    check(sample_nucl_db)
    page.evaluate_script("$('#method').is(':disabled')").should eq(false)
  end

  it 'properly controls interaction with database listing' do
    visit '/'
    fill_in('sequence', :with => sequence)
    check(sample_nucl_db)
    page.evaluate_script("$('.protein .checkbox').first().hasClass('disabled')")
      .should eq(true)
  end

  it 'shows a dropdown menu when other blast methods are available' do
    visit '/'
    fill_in('sequence', :with => sequence)
    check(sample_nucl_db)
    page.save_screenshot('screenshot.png')
    page.has_css?('button.dropdown-toggle').should eq(true)
  end
end
