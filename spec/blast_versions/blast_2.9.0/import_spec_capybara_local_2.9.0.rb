require 'spec_helper'

describe 'report generated from imported XML',type: :feature, js: true do

  before(:all) { SequenceServer.init }
  # Test suite to test features of imported XML report. Fasta files used for
  # testing consist of TP53 and COX41 protein/nucleotide sequences for
  # reproducibility. Each query was limited to 20 hits to not to overload the
  # test suite.

  # BLASTP test scenarios
  it 'loads BLASTP XML and tests hit alignment and sidebar Alignment download' do
    access_by_uuid('blast_2.9.0/blastp')

    # Click on the first hit Alignment download button on the page and wait for
    # the download to finish.

    page.first('.download-aln').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('sp_P04637_P53_HUMAN_gi_1099170394_ref_XP_018868681_1.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/sp_P04637_P53_HUMAN_gi_1099170394_ref_XP_018868681_1.txt"))

    clear_downloads

    # Click on the Alignment of all hits download and compare the downloaded
    # content

    page.click_link('Alignment of all hits')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('alignment-40_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-40_hits_blastp.txt"))

    clear_downloads

    # Check the cheboxes of indicted hits and click on the download of Alignment
    # of selected hits and compare the downloaded content

    page.check('Query_1_hit_1_checkbox')
    page.check('Query_1_hit_2_checkbox')
    page.check('Query_2_hit_1_checkbox')
    page.check('Query_2_hit_2_checkbox')
    page.click_link('Alignment of 4 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-4_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-4_hits_blastp.txt"))
  end

  it 'loads BLASTP XML and tests alignment overview and hit PNG/SVG download' do
    access_by_uuid('blast_2.9.0/blastp')

    # Click on the PNG/SVG download button of the alignment overview and compare
    # the downloaded content.

    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-sp_P04637_P53_HUMAN.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-sp_P04637_P53_HUMAN.svg')

    clear_downloads

    # Click on the PNG/SVG download button of the first hit available and
    # compare the downloaded content.

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-sp_P04637_P53_HUMAN-gi_1099170394_ref_XP_018868681_1.png')

    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-sp_P04637_P53_HUMAN-gi_1099170394_ref_XP_018868681_1.svg')
    page.should have_content('BLASTP')
  end

  it 'loads BLASTP XML and tests Circos download' do
    access_by_uuid('blast_2.9.0/blastp')

    # Click on the Circos expanding button, wait for animation, click on the
    # download of PNG/SVG file and test that it initiated a file download in a
    # right format.

    page.should have_content('Chord diagram of queries and their top hits')
    page.execute_script("$('.circos > .grapher-header > h4').click()")
    sleep 1

    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
  end

  it 'loads BLASTP XML and tests Length distribution download' do
    access_by_uuid('blast_2.9.0/blastp')

    # Click on the Length distribution expanding button, wait for animation,
    # click on the download of PNG/SVG file and test that it initiated a file
    # download in a right format.

    page.should have_content('Length distribution of matching hit sequences')
    page.execute_script("$('.length-distribution > .grapher-header > h4').click()")
    sleep 1

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-sp_P04637_P53_HUMAN.png')

    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-sp_P04637_P53_HUMAN.svg')
  end

  # BLASTX test scenarios

  it 'loads BLASTX XML and tests hit alignment and sidebar Alignment download' do
    access_by_uuid('blast_2.9.0/blastx')

    # Click on the first Alignment download button on the page and wait for the
    # download to finish.

    page.first('.download-aln').click
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('MH011443_1_gi_1486783307_gb_AYF55702_1.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/MH011443_1_gi_1486783307_gb_AYF55702_1.txt"))

    clear_downloads

    # Click on the Alignment of all hits download and compare the downloaded
    # content

    page.click_link('Alignment of all hits')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('alignment-40_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-40_hits_blastx.txt"))

    clear_downloads

    # Select four hit checkboxes and click on the Alignment of selected hits.
    # Compare the downloaded content.

    page.check('Query_1_hit_3_checkbox')
    page.check('Query_1_hit_4_checkbox')
    page.check('Query_2_hit_3_checkbox')
    page.check('Query_2_hit_4_checkbox')
    page.click_link('Alignment of 4 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-4_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-4_hits_blastx.txt"))

    page.should have_content('BLASTX')
  end

  it 'loads BLASTX XML and tests hit PNG/SVG download' do
    access_by_uuid('blast_2.9.0/blastx')

    # Click on the PNG/SVG download button of the alignment overview and compare
    # the downloaded content.
    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-MH011443_1.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-MH011443_1.svg')

    clear_downloads

    # Click on the PNG/SVG download button of the first hit available and
    # compare the downloaded content.
    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-MH011443_1-gi_1486783307_gb_AYF55702_1.png')

    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-MH011443_1-gi_1486783307_gb_AYF55702_1.svg')
    page.should have_content('BLASTX')
  end

  it 'loads BLASTX XML and tests Circos download' do
    access_by_uuid('blast_2.9.0/blastx')
    # Click on the Circos expanding button, wait for animation, click on the
    # download of PNG/SVG file and test that it initiated a file download in a
    # right format.

    page.should have_content('Chord diagram of queries and their top hits')
    page.execute_script("$('.circos > .grapher-header > h4').click()")
    sleep 1

    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')
    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
  end

  it 'loads BLASTX XML and tests Length distribution download' do
    access_by_uuid('blast_2.9.0/blastx')
    # Click on the Length distribution expanding button, wait for animation,
    # click on the download of PNG/SVG file and test that it initiated a file
    # download in a right format.

    page.should have_content('Length distribution of matching hit sequences')
    page.execute_script("$('.length-distribution > .grapher-header > h4').click()")
    sleep 1

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-MH011443_1.png')

    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-MH011443_1.svg')
  end

  # BLASTN Test scenarios

  it 'loads BLASTN XML and tests hit alignment and sidebar Alignment download' do
    access_by_uuid('blast_2.9.0/blastn')
    # Click on the first Alignment download button on the page and wait for the
    # download to finish.

    page.first('.download-aln').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('MH011443_1_gi_1486783306_gb_MH011443_1.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/MH011443_1_gi_1486783306_gb_MH011443_1.txt"))

    clear_downloads

    # Click on the Alignment of all hits download and compare the downloaded
    # content

    page.click_link('Alignment of all hits')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('alignment-40_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-40_hits_blastn.txt"))

    clear_downloads

    # Select four hit checkboxes and click on the Alignment of selected hits.
    # Compare the downloaded content.
    page.check('Query_1_hit_5_checkbox')
    page.check('Query_1_hit_6_checkbox')
    page.check('Query_2_hit_5_checkbox')
    page.check('Query_2_hit_6_checkbox')
    page.click_link('Alignment of 4 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-4_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-4_hits_blastn.txt"))
    page.should have_content('BLASTN')
  end

  it 'loads BLASTN XML and tests hit PNG/SVG download' do
    access_by_uuid('blast_2.9.0/blastn')

    # Click on the PNG/SVG download button of the alignment overview and compare
    # the downloaded content.
    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-MH011443_1.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-MH011443_1.svg')

    clear_downloads
    # Click on the PNG download button of the first hit available and compare
    # the downloaded content.

    page.find_all(".export-to-png")[2].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-MH011443_1-gi_1528997474_gb_MH447967_1.png')

    clear_downloads

    # Click on the SVG download button of the first hit available and compare
    # the downloaded content.

    page.find_all(".export-to-svg")[2].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-MH011443_1-gi_1528997474_gb_MH447967_1.svg')
    page.should have_content('BLASTN')
  end

  it 'loads BLASTN XML and tests Circos download' do
    access_by_uuid('blast_2.9.0/blastn')

    # Click on the Circos expanding button, wait for animation, click on the
    # download of PNG/SVG file and test that it initiated a file download in a
    # right format.

    page.should have_content('Chord diagram of queries and their top hits')
    page.execute_script("$('.circos > .grapher-header > h4').click()")
    sleep 1

    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')
    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
  end

  it 'loads BLASTN XML and tests Length distribution download' do
    access_by_uuid('blast_2.9.0/blastn')
    # Click on the Length distribution expanding button, wait for animation,
    # click on the download of PNG/SVG file and test that it initiated a file
    # download in a right format.

    page.should have_content('Length distribution of matching hit sequences')
    page.execute_script("$('.length-distribution > .grapher-header > h4').click()")
    sleep 1

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-MH011443_1.png')
    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-MH011443_1.svg')
  end

  #TBLASTN Test scenarios

  it 'loads TBLASTN XML and tests hit alignment and sidebar Alignment download' do
    access_by_uuid('blast_2.9.0/tblastn')
    # Click on the first Alignment download button on the page and wait for the
    # download to finish.

    page.first('.download-aln').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('sp_P04637_P53_HUMAN_gi_395440626_gb_JQ694049_1.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/sp_P04637_P53_HUMAN_gi_395440626_gb_JQ694049_1.txt"))

    clear_downloads

    # Click on the Alignment of all hits download and compare the downloaded
    # content

    page.click_link('Alignment of all hits')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('alignment-40_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-40_hits_tblastn.txt"))

    clear_downloads

    # Select four hit checkboxes and click on the Alignment of selected hits.
    # Compare the downloaded content.
    page.check('Query_1_hit_7_checkbox')
    page.check('Query_1_hit_8_checkbox')
    page.check('Query_2_hit_7_checkbox')
    page.check('Query_2_hit_8_checkbox')
    page.click_link('Alignment of 4 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-4_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-4_hits_tblastn.txt"))
    page.should have_content('TBLASTN')
  end

  it 'loads TBLASTN XML and tests hit PNG/SVG download' do
    access_by_uuid('blast_2.9.0/tblastn')

    # Click on the PNG/SVG download button of the alignment overview and compare
    # the downloaded content.
    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-sp_P04637_P53_HUMAN.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-sp_P04637_P53_HUMAN.svg')
    clear_downloads
    # Click on the PNG download button of the first hit available and compare
    # the downloaded content.

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-sp_P04637_P53_HUMAN-gi_395440626_gb_JQ694049_1.png')

    clear_downloads

    # Click on the SVG download button of the first hit available and compare
    # the downloaded content.

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-sp_P04637_P53_HUMAN-gi_395440626_gb_JQ694049_1.svg')
    page.should have_content('TBLASTN')
  end

  it 'loads TBLASTN XML and tests Circos download' do
    access_by_uuid('blast_2.9.0/tblastn')
    # Click on the Circos expanding button, wait for animation, click on the
    # download of PNG/SVG file and test that it initiated a file download in a
    # right format.

    page.should have_content('Chord diagram of queries and their top hits')
    page.execute_script("$('.circos > .grapher-header > h4').click()")
    sleep 1

    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
  end

  it 'loads TBLASTN XML and tests Length distribution download' do
    access_by_uuid('blast_2.9.0/tblastn')
    # Click on the Length distribution expanding button, wait for animation,
    # click on the download of PNG/SVG file and test that it initiated a file
    # download in a right format.

    page.should have_content('Length distribution of matching hit sequences')
    page.execute_script("$('.length-distribution > .grapher-header > h4').click()")
    sleep 1

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-sp_P04637_P53_HUMAN.png')

    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-sp_P04637_P53_HUMAN.svg')
  end

  #TBLASTX Test scenarios

  it 'loads TBLASTX XML and tests hit alignment and sidebar Alignment download' do
    access_by_uuid('blast_2.9.0/tblastx')
    # Click on the first Alignment download button on the page and wait for the
    # download to finish.

    expect(page).to have_selector('.download-aln', minimum: 30) # Wait for react to render all alignments
    page.find_all(".download-aln")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('MH011443_1_gi_1528997474_gb_MH447967_1.txt')
    expect(File.read(downloaded_file)). to eq(File.read("spec/sequences/MH011443_1_gi_1528997474_gb_MH447967_1.txt"))

    clear_downloads

    # Click on the Alignment of all hits download and compare the downloaded
    # content

    page.click_link('Alignment of all hits')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('alignment-40_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-40_hits_tblastx.txt"))

    clear_downloads

    # Select four hit checkboxes and click on the Alignment of selected hits.
    # Compare the downloaded content.
    page.check('Query_1_hit_9_checkbox')
    page.check('Query_1_hit_10_checkbox')
    page.check('Query_2_hit_9_checkbox')
    page.check('Query_2_hit_10_checkbox')
    page.click_link('Alignment of 4 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-4_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read("spec/sequences/alignment-4_hits_tblastx.txt"))
    page.should have_content('TBLASTX')
  end

  it 'loads TBLASTX XML and tests hit PNG/SVG download' do
    access_by_uuid('blast_2.9.0/tblastx')

    # Click on the PNG/SVG download button of the alignment overview and compare
    # the downloaded content.
    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-MH011443_1.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-MH011443_1.svg')

    clear_downloads
    # Click on the PNG download button of the first hit available and compare
    # the downloaded content.

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-MH011443_1-gi_1486783306_gb_MH011443_1.png')

    clear_downloads

    # Click on the SVG download button of the first hit available and compare
    # the downloaded content.

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-MH011443_1-gi_1486783306_gb_MH011443_1.svg')
    page.should have_content('TBLASTX')
  end

  it 'loads TBLASTX XML and tests Circos download' do
    access_by_uuid('blast_2.9.0/tblastx')
    # Click on the Circos expanding button, wait for animation, click on the
    # download of PNG/SVG file and test that it initiated a file download in a
    # right format.

    page.should have_content('Chord diagram of queries and their top hits')
    page.execute_script("$('.circos > .grapher-header > h4').click()")
    sleep 1

    page.first('.export-to-png').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')

    clear_downloads

    page.first('.export-to-svg').click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
  end

  it 'loads TBLASTX XML and tests Length distribution download' do
    access_by_uuid('blast_2.9.0/tblastx')
    # Click on the Length distribution expanding button, wait for animation,
    # click on the download of PNG/SVG file and test that it initiated a file
    # download in a right format.

    page.should have_content('Length distribution of matching hit sequences')
    page.execute_script("$('.length-distribution > .grapher-header > h4').click()")
    sleep 1

    page.find_all(".export-to-png")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-MH011443_1.png')

    clear_downloads

    page.find_all(".export-to-svg")[1].click
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-MH011443_1.svg')
  end

  ## Helpers ##

  def access_by_uuid(id)
    # Method to access the XML report in the browser
    url = url_encode(id)
    visit "/#{url}"
    page.should have_content('Query')
  end
end
