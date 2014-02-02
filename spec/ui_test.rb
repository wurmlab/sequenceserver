require 'rspec'
require 'watir-webdriver'
require 'headless'

# These shared examples should work for
shared_examples_for 'a browser' do
  let(:seqserv_url){'http://localhost:4567'}

  it 'should simply go the seqserv webpage' do
    b.goto seqserv_url
    b.url.gsub(/\/$/,'').should eq(seqserv_url)
    b.ready_state.should eq('complete')
  end

  it 'should do a simple blastp' do
    b.goto seqserv_url

    # Nucleotide database should be available
    b.checkbox(:value => 'ed4250adc44601256f6bbbd4ab5cc80c').enabled?.should eq(true)

    # First up the blast button should be disabled
    b.button(:id => 'method').text.should eq('BLAST')
    b.button(:id => 'method').enabled?.should eq(false)

    # Pick a protein blast database
    b.checkbox(:value => 'b9a05001b93ca2587b447dacb9906f2a').set
    b.checkbox(:value => 'b9a05001b93ca2587b447dacb9906f2a').checked?.should eq(true)

    # nuc dbs now disabled
    b.checkbox(:value => 'ed4250adc44601256f6bbbd4ab5cc80c').enabled?.should eq(false)

    # The blast button should still be disabled
    b.button(:id => 'method').text.should eq('BLAST')
    b.button(:id => 'method').enabled?.should eq(false)

    # Give a sequence we know should hit
    b.textarea(:name => 'sequence').set 'YTLPPPPTKLYSAPISCRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLA'

    #blast butn now active
    b.button(:id => 'method').text.should eq('BLASTP')
    b.button(:id => 'method').enabled?.should eq(true)

    # Run the blast
    b.button(:id => 'method').click

    while b.div(:id => 'result').text.include?('Waiting for BLAST to be run')
    end

    # blast should have worked
    b.div(:id => 'result').text.include?('FASTA of 11 retrievable').should eq(true)
  end
end

#####################################################################################
#+++++++++++ Below is admin code, hopefully not necessary to mess around with to test new UI specs

# NOT thread-safe, at least because of the interaction with headless
class BrowserAdmin
  def self.setup_browser(type)
    case type
    when :firefox then
      Watir::Browser.new :firefox
    when :chrome then
      Watir::Browser.new :chrome
    when :headless_firefox then
      @headless = Headless.new
      @headless.start
      Watir::Browser.new :firefox
    when :headless_chrome then
      @headless = Headless.new
      @headless.start
      Watir::Browser.new :chrome
    else
      raise "Unknown browser type asked for: #{type.inspect}"
    end
  end

  def self.teardown_browser(browser)
    browser.close

    # Re-head again, but maybe this makes no difference
    @headless.destroy unless @headless.nil?
    @headless = nil
  end
end


describe 'ui' do
  [:firefox, :chrome, :headless_firefox, :headless_chrome].each do |bro|
    context bro.to_s do
      it_behaves_like 'a browser' do
        browser = nil
        before do
          browser = BrowserAdmin.setup_browser bro
        end
        after do
          BrowserAdmin.teardown_browser browser
        end
        let(:b){browser}
      end
    end
  end
end

