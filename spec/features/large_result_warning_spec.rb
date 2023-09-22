describe 'Large result warning', type: :feature, js: true do
  include CapybaraHelpers

  before :all do
    SequenceServer.init(
      database_dir: "#{__dir__}/../database/v5",
      cloud_share_url: 'disabled',
      large_result_warning_threshold: 1 # very small
    )
  end

  def nucleotide_query
    File.read File.join(__dir__, '..', 'sequences', 'nucleotide_query.fa')
  end

  let(:nucleotide_databases) do
    [
      'Solenopsis invicta gnG subset',
      'Sinvicta 2-2-3 cdna subset',
      'funky ids (v5)'
    ]
  end

  it 'displays a warning, allows downloading tabular results and bypassing the warning' do
    perform_search query: nucleotide_query,
                   databases: nucleotide_databases,
                   wait_for_results: false
    expect(page).to have_content('Warning')

    click_link("Standard Tabular Report")
    wait_for_download
    expect(File.basename(downloaded_file))
      .to eq('sequenceserver-std_tsv_report.tsv')

    click_link("Full Tabular Report")
    wait_for_download
    expect(File.basename(downloaded_file))
      .to eq('sequenceserver-full_tsv_report.tsv')

    click_link("Results in XML")
    wait_for_download
    expect(File.basename(downloaded_file))
      .to eq('sequenceserver-xml_report.xml')

    click_link("View results in browser anyway")
    expect(page).to have_content('Query')
  end
end
