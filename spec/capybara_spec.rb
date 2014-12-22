require 'spec_helper'
require 'capybara/rspec'
require 'capybara-webkit'

describe "an headless mode with webkit" do
  sequence = "ATCGATCAGCTACGATCAGCATCGACTAGCATCGACTACGA"
  sample_nucl_db = "Sinvicta2-2-3.cdna"
  sample_prot_db = "Sinvicta2-2-3.prot"

  before(:all) do
    Capybara.current_driver = :webkit
    Capybara.app = SequenceServer
  end

  it 'runs a simple blast' do
    visit '/'
    fill_in('sequence', :with => sequence)
    check(sample_nucl_db)
    click_button('method')
    page.should have_content('Query')
  end

end
