require 'spec_helper'
require 'rack/test'

describe 'a browser', type: :feature, js: true do
  before :all do
    SequenceServer.init(database_dir: "#{__dir__}/database/v5")
  end

  it 'sorts databases alphabetically' do
    visit '/'
    fill_in('sequence', with: nucleotide_query)

    prot = page.evaluate_script("$('.protein .database').text().trim()")
    prot.should eq("2020-11 Swiss-Prot insecta 2020-11-Swiss-Prot insecta (subset taxid 102803) Sinvicta 2-2-3 prot subset without_parse_seqids.fa")

    nucl = page.evaluate_script("$('.nucleotide .database').text().trim()")
    nucl.should eq("Sinvicta 2-2-3 cdna subset Solenopsis invicta gnG subset funky ids (v5)")
  end

  it 'properly controls blast button' do
    visit '/'

    fill_in('sequence', with: nucleotide_query)
    page.evaluate_script("$('#method').is(':disabled')").should eq(true)

    check(nucleotide_databases.first)
    page.evaluate_script("$('#method').is(':disabled')").should eq(false)
  end

  it 'properly controls interaction with database listing' do
    visit '/'
    fill_in('sequence', with: nucleotide_query)
    check(nucleotide_databases.first)
    page.evaluate_script("$('.protein .database').first().hasClass('disabled')")
        .should eq(true)
  end

  it 'shows a dropdown menu when other blast methods are available' do
    visit '/'
    fill_in('sequence', with: nucleotide_query)
    check(nucleotide_databases.first)
    page.has_css?('#methods button.dropdown-toggle').should eq(true)
  end

  it 'can run a simple blastn search' do
    perform_search query: nucleotide_query,
                   databases: nucleotide_databases
    page.should have_content('BLASTN')
  end

  it 'can run a simple blastp search' do
    perform_search query: protein_query,
                   databases: protein_databases
    page.should have_content('BLASTP')
  end

  it 'can run a simple blastx search' do
    perform_search query: nucleotide_query,
                   databases: protein_databases
    page.should have_content('BLASTX')
  end

  it 'can run a simple tblastx search' do
    perform_search query: nucleotide_query,
                   databases: nucleotide_databases,
                   method: 'tblastx'
    page.should have_content('TBLASTX')
  end

  it 'can run a simple tblastn search' do
    perform_search query: protein_query,
                   databases: nucleotide_databases
    page.should have_content('TBLASTN')
  end

  ### Test aspects of the generated report.

  it 'can download FASTA of each hit' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click on the first FASTA download button on the page and wait for the
    # download to finish.
    page.execute_script("$('.download-fa:eq(0)').click()")
    wait_for_download

    # Test name and content of the downloaded file.
    expect(File.basename(downloaded_file))
      .to eq('sequenceserver-SI2.2.0_06267.fa')
    expect(File.read(downloaded_file))
      .to eq(File.read("#{__dir__}/sequences/sequenceserver-SI2.2.0_06267.fa"))
  end

  it 'can download FASTA of selected hits' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Select first hit for each query and click 'FASTA of 2 selected hits'.
    page.check('Query_1_hit_1_checkbox')
    page.check('Query_2_hit_1_checkbox')
    page.click_link('FASTA of 2 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('sequenceserver-2_hits.fa')
    expect(File.read(downloaded_file)).to eq(File.read('spec/sequences/sequenceserver-2_hits.fa'))
  end

  it 'can download FASTA of all hits' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click 'FASTA of all hits'.
    page.click_link('FASTA of all hits')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('sequenceserver-2_hits.fa')
    expect(File.read(downloaded_file)).to eq(File.read('spec/sequences/sequenceserver-2_hits.fa'))
  end

  it 'can download FASTA even if the hit ids are funky' do
    perform_search(query: funkyid_query,
                   databases: nucleotide_databases.values_at(2))

    # Click 'FASTA of all hits'. The idea here is that if any of the ids are
    # problematic, 'FASTA of all' will fail.
    page.click_link('FASTA of all hits')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('sequenceserver-8_hits.fa')
    expect(File.read(downloaded_file)).to eq(File.read('spec/sequences/funky_ids_download.fa'))
  end

  it 'can download alignment for each hit' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click on the first Alignment download button on the page and wait for the
    # download to finish.
    page.execute_script("$('.download-aln:eq(0)').click()")
    wait_for_download

    # Test name and content of the downloaded file.
    expect(File.basename(downloaded_file)).to eq('Query_1_SI2_2_0_06267.txt')
    expect(File.read(downloaded_file))
      .to eq(File.read("#{__dir__}/sequences/Query_1_SI2_2_0_06267.txt"))
  end

  it 'can download Alignment of selected hits' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Select first hit for each query and click 'Alignment of 2 selected hits'.
    page.check('Query_1_hit_1_checkbox')
    page.check('Query_2_hit_1_checkbox')
    page.click_link('Alignment of 2 selected hit(s)')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-2_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read('spec/sequences/alignment-2_hits.txt'))
  end

  it 'can download Alignment of all hits' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click 'Alignment of all hits'.
    page.click_link('Alignment of all hits')
    wait_for_download

    expect(File.basename(downloaded_file)).to eq('alignment-2_hits.txt')
    expect(File.read(downloaded_file)).to eq(File.read('spec/sequences/alignment-2_hits.txt'))
  end

  it 'can download BLAST results in XML and tabular formats' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    page.click_link('Standard tabular report')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('sequenceserver-std_tsv_report.tsv')
    clear_downloads

    page.click_link('Full tabular report')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('sequenceserver-full_tsv_report.tsv')
    clear_downloads

    page.click_link('Full XML report')
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('sequenceserver-xml_report.xml')
    clear_downloads
  end

  it 'can copy URL to clipboard' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    find('#copyURL').click
    page.should have_content('Copied!')
  end

  it 'can send the URL by email' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Checks for mailto, URL and databases used in the message.
    href = page.find('#sendEmail')['href']
    expect(href).to include('mailto:?subject=SequenceServer%20BLASTP%20analysis')
    expect(href).to include(page.current_url)
    expect(href).to include(protein_databases.values_at(0).join() && '%20')
  end

  it 'can show hit sequences in a modal' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click on the first sequence viewer link in the report.
    page.execute_script("$('.view-sequence:eq(0)').click()")

    within('.sequence-viewer') do
      page.should have_content('SI2.2.0_06267')
      page.should have_content(<<~SEQ.chomp)
        MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIP
        LAVIFEDPQPISQRLIYEIRTNPSYTLPPPPTKLYSAPIS
        CRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITD
        ITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVIPL
        YMVLALSQFITYLLILIVGEKENKIKEGMKMMGLNDSVF
      SEQ
    end

    # Dismiss the first modal.
    page.execute_script("$('.sequence-viewer').modal('hide')")

    # Click on the second sequence viewer link in the report.
    page.execute_script("$('.view-sequence:eq(1)').click()")

    within('.sequence-viewer') do
      page.should have_content('SI2.2.0_13722')
      page.should have_content(<<~SEQ.chomp)
        MSANRLNVLVTLMLAVALLVTESGNAQVDGYLQFNPKRSA
        VSSPQKYCGKKLSNALQIICDGVYNSMFKKSGQDFPPQNK
        RHIAHRINGNEEESFTTLKSNFLNWCVEVYHRHYRFVFVS
        EMEMADYPLAYDISPYLPPFLSRARARGMLDGRFAGRRYR
        RESRGIHEECCINGCTINELTSYCGP
      SEQ
    end
  end

  it 'disables sequence viewer links if hits are longer than 10kb' do
    # BLASTN transcripts against genome. nucleotide_query refers to two fire
    # ant transcripts and nucleotide_databases[0] is subset of the fire ant
    # genome (few longest scaffolds). We expect sequence viewer links to be
    # disabled for all hits of this search.
    perform_search(query: nucleotide_query,
                   databases: nucleotide_databases.values_at(0))

    # Check that the sequence viewer links are disabled.
    page.evaluate_script("$('.view-sequence').is(':disabled')").should eq(true)
  end

  it 'can download visualisations in svg and png format' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    ## Check that there is a circos vis and unfold it.
    page.should have_content('Queries and their top hits: chord diagram')
    page.execute_script("$('.circos > .grapher-header > h4').click()")
    sleep 1

    page.execute_script("$('.export-to-svg:eq(0)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
    clear_downloads

    page.execute_script("$('.export-to-png:eq(0)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')
    clear_downloads

    ## Check that there is a graphical overview of hits.
    page.should have_content('Graphical overview of hits')

    page.execute_script("$('.export-to-svg:eq(1)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-Query_1.svg')
    clear_downloads

    page.execute_script("$('.export-to-png:eq(1)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Alignment-Overview-Query_1.png')
    clear_downloads

    ## Check that there is a length distribution of matching sequences.
    page.should have_content('Length distribution of matching sequences')
    page.execute_script("$('.length-distribution > .grapher-header > h4').click()")
    sleep 1

    page.execute_script("$('.export-to-svg:eq(2)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-Query_1.svg')
    clear_downloads

    page.execute_script("$('.export-to-png:eq(2)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('length-distribution-Query_1.png')
    clear_downloads

    ## Check that there is a kablammo vis of query vs hit.
    page.should have_content('Graphical overview of aligning region(s)')

    page.execute_script("$('.export-to-svg:eq(3)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-Query_1-SI2_2_0_06267.svg')
    clear_downloads

    page.execute_script("$('.export-to-png:eq(3)').click()")
    wait_for_download
    expect(File.basename(downloaded_file)).to eq('Kablammo-Query_1-SI2_2_0_06267.png')
    clear_downloads
  end

  it 'can send results to cloudshare server' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Clicks 'Share to cloud', fills the prompts.
    accept_prompt(with: 'recipientsEmail@email.com') do
      accept_prompt(with: 'sendersEmail@email.com') do
        click_link('Share to cloud')
      end
    end
    # Check content of page
    page.should have_content('Everything checks out'),\
                'In case of failure, check the receiving app is running.'
  end

  ## Helpers ##

  def perform_search(query:, databases:, method: nil)
    # Load search form.
    visit '/'

    # Fill in query, select databases, submit form.
    fill_in('sequence', with: query)
    databases.each { |db| check db }
    if method == 'tblastx'
      find('#methods .dropdown-toggle').click
      find('#methods .dropdown-menu li').click
    end
    click_button('method')

    # Switch to new window because link opens in new window
    page.driver.browser.switch_to.window(page.driver.browser.window_handles.last)

    # It is important to have this line or the examples end prematurely with a
    # failure.
    page.should have_content('Query')
  end

  def nucleotide_query
    File.read File.join(__dir__, 'sequences', 'nucleotide_query.fa')
  end

  def protein_query
    File.read File.join(__dir__, 'sequences', 'protein_query.fa')
  end

  def funkyid_query
    'GATGAACGCTGGCGGCGTGCCTAATACATGCAAGTCGAG'
  end

  def nucleotide_databases
    [
      'Solenopsis invicta gnG subset',
      'Sinvicta 2-2-3 cdna subset',
      'funky ids (v5)'
    ]
  end

  def protein_databases
    [
      'Sinvicta 2-2-3 prot subset',
      '2020-11 Swiss-Prot insecta'
    ]
  end
end
