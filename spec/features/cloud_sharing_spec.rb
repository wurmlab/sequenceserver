describe 'Sharing results on cloud', type: :feature, js: true do
  include CapybaraHelpers
  before :all do
    SequenceServer.init(
      database_dir: "#{__dir__}/../database/v5",
      cloud_share_url: 'http://localhost:3000/v1/shared-job'
    )
  end

  let(:protein_query) do
    File.read File.join(__dir__, '..', 'sequences', 'protein_query.fa')
  end

  let(:protein_databases) do
    [
      'Sinvicta 2-2-3 prot subset',
      '2020-11 Swiss-Prot insecta'
    ]
  end

  it 'Allows sharing results to cloud' do
    perform_search(query: protein_query,
                   databases: protein_databases.values_at(0))

    click_on 'Share to cloud'

    within '.modal-content' do
      fill_in 'email', with: 'example@sequenceserver.com'
      expect(page).to have_selector('button:disabled', text: 'Submit')

      check 'tosCheckbox'
      expect(page).to have_selector('button:enabled', text: 'Submit')
    end
  end

  context 'when successful' do
    before do
      allow(RestClient).to receive(:post).and_return(
        double(body: { shareable_url: 'http://share.sequenceserver.com/mock-id' }.to_json,
               headers: { 'Content-Type' => 'application/json' })
      )
    end

    it 'generates a URL and allows copying it' do
      perform_search(query: protein_query,
                     databases: protein_databases.values_at(0))

      click_on 'Share to cloud'

      within '.modal-content' do
        fill_in 'email', with: 'example@sequenceserver.com'
        check 'tosCheckbox'
        click_on 'Submit'

        expect(page).to have_field('shareableUrl', with: 'http://share.sequenceserver.com/mock-id')
        click_on 'Copy to Clipboard'

        expect(page).to have_button('Copied!')
      end
    end
  end

  context 'when the request fails' do
    before do
      allow(RestClient).to receive(:post).and_return(
        double(body: { errors: ['An example error has occured'] }.to_json,
               headers: { 'Content-Type' => 'application/json' }, code: 422)
      )
    end

    it 'generates a URL and allows copying it' do
      perform_search(query: protein_query,
                     databases: protein_databases.values_at(0))

      click_on 'Share to cloud'

      within '.modal-content' do
        fill_in 'email', with: 'example@sequenceserver.com'
        check 'tosCheckbox'
        click_on 'Submit'

        expect(page).to have_content('An example error has occured')
      end
    end
  end
end
