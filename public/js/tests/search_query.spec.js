/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchQueryWidget } from '../query';
import { Form } from '../form';
import { AMINO_ACID_SEQUENCE, NUCLEOTIDE_SEQUENCE, FASTQ_SEQUENCE, FASTA_OF_FASTQ_SEQUENCE } from './mock_data/sequences';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react/dont-cleanup-after-each';

let container;
let inputEl;

describe('SEARCH COMPONENT', () => {
    beforeEach(() => {
        container  = render(<Form onSequenceTypeChanged={() => { }
        } />).container;
        inputEl = screen.getByRole('textbox', { name: '' });
    });

    test('should render the search component textarea', () => {
        expect(inputEl).toHaveClass('form-control');
    });

    test('clear button should only become visible if textarea is not empty', () => {
        const getButtonWrapper = () => screen.getByRole('button', { name: /clear query sequence\(s\)\./i }).parentElement;
        expect(getButtonWrapper()).toHaveClass('hidden');
        fireEvent.change(inputEl, { target: { value: AMINO_ACID_SEQUENCE } });
        expect(getButtonWrapper()).not.toHaveClass('hidden');
        fireEvent.change(inputEl, { target: { value: '' } });
        expect(getButtonWrapper()).toHaveClass('hidden');
    });

    test('should correctly detect the amino-acid sequence type and show notification', () => {
        // populate search
        fireEvent.change(inputEl, { target: { value: AMINO_ACID_SEQUENCE } });
        const activeNotification = container.querySelector('.notification.active');
        expect(activeNotification.id).toBe('protein-sequence-notification');
        const alertWrapper = activeNotification.children[0];
        expect(alertWrapper).toHaveTextContent('Detected: amino-acid sequence(s).');
    });

    test('should correctly detect the nucleotide sequence type and show notification', () => {
        // populate search
        fireEvent.change(inputEl, { target: { value: NUCLEOTIDE_SEQUENCE } });
        const activeNotification = container.querySelector('.notification.active');
        const alertWrapper = activeNotification.children[0];
        expect(activeNotification.id).toBe('nucleotide-sequence-notification');
        expect(alertWrapper).toHaveTextContent('Detected: nucleotide sequence(s).');
    });

    test('should correctly detect the mixed sequences and show error notification', () => {
        fireEvent.change(inputEl, { target: { value: `${NUCLEOTIDE_SEQUENCE}${AMINO_ACID_SEQUENCE}` } });
        const activeNotification = container.querySelector('.notification.active');
        expect(activeNotification.id).toBe('mixed-sequence-notification');
        const alertWrapper = activeNotification.children[0];
        expect(alertWrapper).toHaveTextContent('Error: mixed nucleotide and amino-acid sequences detected.');
    });

    test('should correctly detect FASTQ and convert it to FASTA', () => {
        fireEvent.change(inputEl, { target: { value: FASTQ_SEQUENCE } });
        const activeNotification = container.querySelector('.notification.active');
        const alertWrapper = activeNotification.children[0];
        expect(activeNotification.id).toBe('fastq-sequence-notification');
        expect(alertWrapper).toHaveTextContent('Detected FASTQ and automatically converted to FASTA.');
        expect(inputEl).toHaveValue(FASTA_OF_FASTQ_SEQUENCE);
    });
});
