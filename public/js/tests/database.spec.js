/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor, findByText, getByText } from '@testing-library/react';
import { Databases } from '../databases';


export const data = { 'query': null, 'database': [{ 'name': '/spec/database/v5/funky_ids/funky_ids.fa', 'title': 'funky ids (v5)', 'type': 'nucleotide', 'nsequences': '8', 'ncharacters': '312', 'updated_on': 'Aug 13, 2020  11:23 AM', 'format': '5', 'categories': ['funky_ids'], 'id': 'b71a337accf1e099aace6c859fba5e99' }, { 'name': '/spec/database/v5/sample/genome/Solenopsis_invicta/Solenopsis_invicta_gnG_subset.fasta', 'title': 'Solenopsis invicta gnG subset', 'type': 'nucleotide', 'nsequences': '8', 'ncharacters': '39185542', 'updated_on': 'Jun 17, 2020  4:51 PM', 'format': '5', 'categories': ['sample', 'genome', 'Solenopsis_invicta'], 'id': 'c0bb1dadfeda93ea1f53732109df0959' }, { 'name': '/spec/database/v5/sample/proteins/Solenopsis_invicta/Sinvicta2-2-3.prot.subset.fasta', 'title': 'Sinvicta 2-2-3 prot subset', 'type': 'protein', 'nsequences': '1189', 'ncharacters': '280047', 'updated_on': 'Jun 17, 2020  4:52 PM', 'format': '5', 'categories': ['sample', 'proteins', 'Solenopsis_invicta'], 'id': '900b87a3e7a4d1f3034b97483231f520' }, { 'name': '/spec/database/v5/sample/proteins/uniprot/2020-11-Swiss-Prot_insecta.fasta', 'title': ' 2020-11 Swiss-Prot insecta', 'type': 'protein', 'nsequences': '9383', 'ncharacters': '4062633', 'updated_on': 'Nov 25, 2020  12:45 PM', 'format': '5', 'categories': ['sample', 'proteins', 'uniprot'], 'id': 'fe5c9f0ac98f8d06e8099327c3d14523' }, { 'name': '/spec/database/v5/sample/transcripts/Solenopsis_invicta/Sinvicta2-2-3.cdna.subset.fasta', 'title': 'Sinvicta 2-2-3 cdna subset', 'type': 'nucleotide', 'nsequences': '473', 'ncharacters': '287752', 'updated_on': 'Jun 17, 2020  4:52 PM', 'format': '5', 'categories': ['sample', 'transcripts', 'Solenopsis_invicta'], 'id': '045f6f2637f2776f95c93ed2f62ebc51' }, { 'name': '/spec/database/v5/using_blastdb_aliastool/2020-11-Swiss-Prot_insecta_subset_taxid_102803', 'title': '2020-11-Swiss-Prot insecta (subset taxid 102803)', 'type': 'protein', 'nsequences': '1', 'ncharacters': '253', 'updated_on': 'Nov 25, 2020  12:45 PM', 'format': '5', 'categories': ['using_blastdb_aliastool'], 'id': '7ad2f50353978114c971d50edf92584e' }, { 'name': '/spec/database/v5/without_parse_seqids/without_parse_seqids.fa', 'title': 'without_parse_seqids.fa', 'type': 'protein', 'nsequences': '2', 'ncharacters': '385', 'updated_on': 'Jun 2, 2021  10:37 AM', 'format': '5', 'categories': ['without_parse_seqids'], 'id': '0bb59948ffac3563fc32b6d0272789bb' }], 'options': { 'blastn': { 'default': ['-task blastn', '-evalue 1e-5'] }, 'blastp': { 'default': ['-evalue 1e-5'] }, 'blastx': { 'default': ['-evalue 1e-5'] }, 'tblastx': { 'default': ['-evalue 1e-5'] }, 'tblastn': { 'default': ['-evalue 1e-5'] } } };

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