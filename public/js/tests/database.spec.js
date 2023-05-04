/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor, findByText, getByText } from '@testing-library/react';
import { Databases } from '../databases';
import data from './mock_data/databases.json';



describe('DATABASES COMPONENT', () => {
    test('should render unique database categories', () => {
        render(<Databases databases={data.database} />);
        expect(screen.getByRole('heading', { name: /nucleotide databases/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /protein databases/i })).toBeInTheDocument();
    });

    test('should list databases under respective categories', () => {
        const { container } = render(<Databases databases={data.database} />);
        expect(container.querySelector('.databases.nucleotide').children).toHaveLength(3);
        expect(container.querySelector('.databases.protein').children).toHaveLength(4);

    });

    test('clicking select all on a database should select all its children', () => {
        const { container } = render(<Databases databases={data.database} onDatabaseTypeChanged={() => { }} />);
        
        // select all nucleotide databases
        const nucleotideSelectAllBtn = screen.getByRole('heading', { name: /nucleotide databases/i }).parentElement.querySelector('button');
        fireEvent.click(nucleotideSelectAllBtn);
        const nucleotideCheckboxes = container.querySelector('.databases.nucleotide').querySelectorAll('input[type=checkbox]');
        
        // all nucleotide databases should be checked
        nucleotideCheckboxes.forEach((checkbox) => {
            expect(checkbox).toBeChecked();
        });

        // select all protein databases
        const proteinSelectAllBtn = screen.getByRole('heading', { name: /protein databases/i }).parentElement.querySelector('button');
        fireEvent.click(proteinSelectAllBtn);
        const proteinCheckboxes = container.querySelector('.databases.nucleotide').querySelectorAll('input[type=checkbox]');
        // all protein databases should be checked
        proteinCheckboxes.forEach((checkbox) => {
            expect(checkbox).toBeChecked();
        });
    });

    test('checking any item of a database type should disable other database type', () => {
        const mockFunction = jest.fn(() => { });
        const { container } = render(<Databases databases={data.database} onDatabaseTypeChanged={mockFunction} />);

        //select a proteinn database
        fireEvent.click(screen.getByRole('checkbox', { name: /2020-11 Swiss-Prot insecta/i }));
        // function has to be called when database has been selected
        expect(mockFunction).toHaveBeenCalled();
        // all nucleotide databses should be disabled
        const nucleotideCheckboxes = container.querySelector('.databases.nucleotide').querySelectorAll('input[type=checkbox]');
        nucleotideCheckboxes.forEach(checkbox => {
            expect(checkbox).toBeDisabled();
        });
    });
});