module CapybaraHelpers
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
    expect(page).to have_content('Query')
  end
end
