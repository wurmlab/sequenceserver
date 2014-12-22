require 'spec_helper'
require 'capybara/rspec'
require 'capybara-webkit'

describe "an headless mode with webkit" do
  sequence = "ATCGATCAGCTACGATCAGCATCGACTAGCATCGACTACGA"

  before(:all) do
    Capybara.use_default_driver
    Capybara.javascript_driver = :webkit
    Capybara.app = SequenceServer.init
  end

  it 'runs a simple blast' do
    visit '/'
    fill_in('sequence', :with => sequence)
    within('ul.nucleotide') do
      check(find("input[type='checkbox']"))
    end
    click_button('submit')
    save_and_open_page
  end

end
