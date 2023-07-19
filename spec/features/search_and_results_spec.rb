describe 'Search and results', type: :feature, js: true do
  include CapybaraHelpers

  before :all do
    SequenceServer.init(
      database_dir: "#{__dir__}/../database/v5",
      cloud_share_url: 'disabled'
    )
  end

  def nucleotide_query
    File.read File.join(__dir__, '..', 'sequences', 'nucleotide_query.fa')
  end

  let(:protein_query) do
    File.read File.join(__dir__, '..', 'sequences', 'protein_query.fa')
  end

  let(:funkyid_query) do
    'GATGAACGCTGGCGGCGTGCCTAATACATGCAAGTCGAG'
  end

  let(:nucleotide_databases) do
    [
      'Solenopsis invicta gnG subset',
      'Sinvicta 2-2-3 cdna subset',
      'funky ids (v5)'
    ]
  end

  let(:protein_databases) do
    [
      'Sinvicta 2-2-3 prot subset',
      '2020-11 Swiss-Prot insecta'
    ]
  end

  it 'sorts databases alphabetically' do
    visit '/'
    fill_in('sequence', with: nucleotide_query)

    expect(page).to have_selector('.protein .database', text: /\A2020-11 Swiss-Prot insecta\z/)
    expect(page).to have_selector('.protein .database', text: '2020-11-Swiss-Prot insecta (subset taxid 102803)')
    expect(page).to have_selector('.protein .database', text: 'Sinvicta 2-2-3 prot subset')
    expect(page).to have_selector('.protein .database', text: 'without_parse_seqids.fa')

    expect(page).to have_selector('.nucleotide .database', text: 'Sinvicta 2-2-3 cdna subset')
    expect(page).to have_selector('.nucleotide .database', text: 'Solenopsis invicta gnG subset')
    expect(page).to have_selector('.nucleotide .database', text: 'funky ids (v5)')
  end

  it 'keeps the CTA disabled until a sequence is provided and database selected' do
    visit '/'

    fill_in('sequence', with: nucleotide_query)
    expect(page).to have_selector('#method:disabled')

    check(nucleotide_databases.first)
    expect(page).to have_selector('#method:enabled')
  end

  it 'disables protein DB selection if a nucleotide DB is already selected' do
    visit '/'
    fill_in('sequence', with: nucleotide_query)
    check(nucleotide_databases.first)

    expect(page).to have_no_selector('.protein .database:enabled')
  end

  it 'shows a dropdown menu when other blast methods are available' do
    visit '/'
    fill_in('sequence', with: nucleotide_query)
    check(nucleotide_databases.first)
    expect(page).to have_selector('#methods button.dropdown-toggle')
  end

  it 'can run a simple blastn search' do
    perform_search query: nucleotide_query,
                   databases: nucleotide_databases
    expect(page).to have_content('BLASTN')
  end

  it 'can run a simple blastp search' do
    perform_search query: protein_query,
                   databases: protein_databases
    expect(page).to have_content('BLASTP')
  end

  it 'can run a simple blastx search' do
    perform_search query: nucleotide_query,
                   databases: protein_databases
    expect(page).to have_content('BLASTX')
  end

  it 'can run a simple tblastx search' do
    perform_search query: nucleotide_query,
                   databases: nucleotide_databases,
                   method: 'tblastx'
    expect(page).to have_content('TBLASTX')
  end

  it 'can run a simple tblastn search' do
    perform_search query: protein_query,
                   databases: nucleotide_databases
    expect(page).to have_content('TBLASTN')
  end

  ### Test aspects of the generated report.

  it 'can download FASTA of each hit' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click on the first FASTA download button on the page and wait for the
    # download to finish.
    page.first('.download-fa').click
    wait_for_download

    # Test name and content of the downloaded file.
    expect(File.basename(downloaded_file))
      .to eq('sequenceserver-SI2.2.0_06267.fa')
    expect(File.read(downloaded_file))
      .to eq(File.read("#{__dir__}/../sequences/sequenceserver-SI2.2.0_06267.fa"))
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
    page.first('.download-aln').click
    wait_for_download

    # Test name and content of the downloaded file.
    expect(File.basename(downloaded_file)).to eq('Query_1_SI2_2_0_06267.txt')
    expect(File.read(downloaded_file))
      .to eq(File.read("#{__dir__}/../sequences/Query_1_SI2_2_0_06267.txt"))
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
    expect(page).to have_content('Copied!')
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
    expect(href).to include(protein_databases.values_at(0).join && '%20')
  end

  it 'can show hit sequences in a modal' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    # Click on the first sequence viewer link in the report.
    page.first('.view-sequence').click

    within('.sequence-viewer') do
      expect(page).to have_content('SI2.2.0_06267')
      expect(page).to have_content(<<~SEQ.chomp)
        MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIP
        LAVIFEDPQPISQRLIYEIRTNPSYTLPPPPTKLYSAPIS
        CRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITD
        ITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVIPL
        YMVLALSQFITYLLILIVGEKENKIKEGMKMMGLNDSVF
      SEQ
    end

    # Dismiss the modal.
    page.find('.sequence-viewer').send_keys(:escape)
    expect(page).to have_no_css('.sequence-viewer')

    # Click on the second sequence viewer link in the report.
    page.find_all('.view-sequence')[1].click

    within('.sequence-viewer') do
      expect(page).to have_content('SI2.2.0_13722')
      expect(page).to have_content(<<~SEQ.chomp)
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
    expect(page).to have_selector('.view-sequence:disabled')
  end

  it 'can download visualisations in svg and png format' do
    # Do a BLASTP search. protein_query refers to the first two sequence in
    # protein_databases[0], so the top hits are the query sequences themselves.
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    ## Check that there is a circos vis and unfold it.
    page.find('.circos > .grapher-header > h4', text: 'Queries and their top hits: chord diagram').click

    within('.circos.grapher') do
      page.click_on('SVG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('Circos-visualisation.svg')
      clear_downloads

      page.click_on('PNG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('Circos-visualisation.png')
    end
    clear_downloads

    ## Check that there is a graphical overview of hits.
    expect(page).to have_content('Graphical overview of hits')

    within('#Query_1 .alignment-overview.grapher') do
      page.click_on('SVG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('Alignment-Overview-Query_1.svg')
      clear_downloads

      page.click_on('PNG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('Alignment-Overview-Query_1.png')
      clear_downloads
    end

    ## Check that there is a length distribution of matching sequences.
    expect(page).to have_content('Length distribution of matching sequences')
    page.find('#Query_1 .length-distribution > .grapher-header > h4',
              text: 'Length distribution of matching sequences').click

    within('#Query_1 .length-distribution.grapher') do
      page.click_on('SVG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('length-distribution-Query_1.svg')
      clear_downloads

      page.click_on('PNG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('length-distribution-Query_1.png')
      clear_downloads
    end

    ## Check that there is a kablammo vis of query vs hit.
    expect(page).to have_content('Graphical overview of aligning region(s)')

    within('#Query_1_hit_1 .kablammo.grapher') do
      page.click_on('SVG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('Kablammo-Query_1-SI2_2_0_06267.svg')
      clear_downloads

      page.click_on('PNG')
      wait_for_download
      expect(File.basename(downloaded_file)).to eq('Kablammo-Query_1-SI2_2_0_06267.png')
      clear_downloads
    end
  end
end
