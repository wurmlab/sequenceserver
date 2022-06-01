/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchButton } from '../search_button';
import '@testing-library/jest-dom/extend-expect';

describe('SEARCH BUTTON', () => {
    test('should be disabled on initial load', () => {
        render(<SearchButton />);
        expect(screen.getByRole('button', { name: /blast/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /blast/i })).toBeDisabled();
    });
});

