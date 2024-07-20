import { render, fireEvent, waitFor } from '@testing-library/react';
import CloudShareModal, { handleSubmit } from '../cloud_share_modal';

describe('CloudShareModal', () => {
    let component;

    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ shareable_url: 'http://test.com' }),
                ok: true
            })
        );
        component = render(<CloudShareModal querydb="" program="" queryLength="0" />);
    });

    it('renders without crashing', () => {
        expect(component).toBeTruthy();
    });

    it('initial state is correct', () => {
        const { getByLabelText } = component;
        const emailInput = getByLabelText('Your Email Address');
        const tosCheckbox = getByLabelText('I agree to the Terms and Conditions of Service');

        expect(emailInput.value).toBe('');
        expect(tosCheckbox.checked).toBe(false);
    });

    it('handles form submission', async () => {
        const { getByLabelText, getByText, getByDisplayValue } = component;

        // Fill out the form
        fireEvent.change(getByLabelText(/Your Email Address/i), { target: { value: 'test@test.com' } });
        fireEvent.click(getByLabelText(/I agree to the/i));

        // Submit the form
        fireEvent.click(getByText('Submit'));

       // Wait for the loading state to finish
        await waitFor(() => getByText('Uploading the job to SequenceServer Cloud, please wait...'));

        // Check that the results are displayed
        await waitFor(() => getByText('Copy to Clipboard'));

        expect(getByDisplayValue(/http:\/\/test.com/i)).toBeTruthy()
    });

    it('handles form submission errors', async () => {
        // Override the fetch mock to simulate a server error
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ errors: ['Test error'] }),
                ok: false
            })
        );

        const { getByLabelText, getByText } = component;

        // Fill out the form
        fireEvent.change(getByLabelText(/Your Email Address/i), { target: { value: 'test@test.com' } });
        fireEvent.click(getByLabelText(/I agree to the/i));

        // Submit the form
        fireEvent.click(getByText('Submit'));

        // Wait for the loading state to finish
        await waitFor(() => getByText('Uploading the job to SequenceServer Cloud, please wait...'));

        // Check that the results are displayed
        await waitFor(() => getByText('Network response was not ok'));

        expect(getByText(/Network response was not ok/i)).toBeTruthy();
    });
});
