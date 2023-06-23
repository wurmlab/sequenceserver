/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchQueryWidget } from '../query';
import { Form } from '../form';
import { AMINO_ACID_SEQUENCE, NUCLEOTIDE_SEQUENCE } from './mock_data/sequences';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react/dont-cleanup-after-each';


describe('SEARCH COMPONENT', () => {
    const getInputElement = () => screen.getByRole('textbox', { name: '' });
    test('should render the search component textarea', () => {
        render(<SearchQueryWidget onSequenceTypeChanged={() => { }
        } />);
        const el = getInputElement();
        expect(el).toHaveClass('form-control');
    });

    test('clear button should only become visible if textarea is not empty', () => {
        render(<SearchQueryWidget onSequenceTypeChanged={() => { }
        } />);
        const getButtonWrapper = () => screen.getByRole('button', { name: /clear query sequence\(s\)\./i }).parentElement;
        expect(getButtonWrapper()).toHaveClass('hidden');
        const inputEl = getInputElement();
        fireEvent.change(inputEl, { target: { value: AMINO_ACID_SEQUENCE } });
        expect(getButtonWrapper()).not.toHaveClass('hidden');
        fireEvent.change(inputEl, { target: { value: '' } });
        expect(getButtonWrapper()).toHaveClass('hidden');

    });

    test('should correctly detect the amino-acid sequence type and show notification', () => {
        const { container }  = render(<Form onSequenceTypeChanged={() => { }
        } />);
        const inputEl = getInputElement();
        // populate search
        fireEvent.change(inputEl, { target: { value: AMINO_ACID_SEQUENCE } });
        const activeNotification = container.querySelector('.notification.active');
        expect(activeNotification.id).toBe('protein-sequence-notification');
        const alertWrapper = activeNotification.children[0];
        expect(alertWrapper).toHaveTextContent('Detected: amino-acid sequence(s).');
    });

    test('should correctly detect the nucleotide sequence type and show notification', () => {
        const { container }  = render(<Form onSequenceTypeChanged={() => { }
        } />);
        const inputEl = getInputElement();
        // populate search
        fireEvent.change(inputEl, { target: { value: NUCLEOTIDE_SEQUENCE } });
        const activeNotification = container.querySelector('.notification.active');
        expect(activeNotification.id).toBe('nucleotide-sequence-notification');
        const alertWrapper = activeNotification.children[0];
        expect(alertWrapper).toHaveTextContent('Detected: nucleotide sequence(s).');
    });
    
    test('should correctly detect the mixed sequences and show error notification', () => {
        const { container }  = render(<Form onSequenceTypeChanged={() => { }
        } />);
        const inputEl = getInputElement();
        // populate search
        fireEvent.change(inputEl, { target: { value: `${NUCLEOTIDE_SEQUENCE}${AMINO_ACID_SEQUENCE}` } });
        const activeNotification = container.querySelector('.notification.active');
        expect(activeNotification.id).toBe('mixed-sequence-notification');
        const alertWrapper = activeNotification.children[0];
        expect(alertWrapper).toHaveTextContent('Error: mixed nucleotide and amino-acid sequences detected.');
    });
});
