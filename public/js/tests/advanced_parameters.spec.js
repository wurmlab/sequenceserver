/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from '../form';
import { AMINO_ACID_SEQUENCE } from './mock_data/sequences';
import data from './mock_data/databases.json';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react/dont-cleanup-after-each';

export const setMockJSONResult = (result) => {
    global.$.getJSON = (_, cb) => cb(result);
};
describe('ADVANCED PARAMETERS', () => {
    const getInputElement = () => screen.getByRole('textbox', { name: '' });
    test('should not render the link to advanced parameters modal if blast algorithm is unknown', () => {
        setMockJSONResult(data);
        const {container } =render(<Form onSequenceTypeChanged={() => { }
        } />);
        const modalButton = container.querySelector('[data-target="#help"]');
        expect(modalButton).toBeNull();
    });
    test('should render the link to advanced parameters modal if blast algorithm is known', () => {
        setMockJSONResult(data);
        const {container } =render(<Form onSequenceTypeChanged={() => { }
        } />);
        
        const inputEl = getInputElement();
        // populate search and select dbs to determine blast algorithm
        fireEvent.change(inputEl, { target: { value: AMINO_ACID_SEQUENCE } });
        const proteinSelectAllBtn = screen.getByRole('heading', { name: /protein databases/i }).parentElement.querySelector('button');
        fireEvent.click(proteinSelectAllBtn);
        const modalButton = container.querySelector('[data-target="#help"]');
        expect(modalButton).not.toBeNull();
    });
});
