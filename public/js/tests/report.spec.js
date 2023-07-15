/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { render, screen, fireEvent } from '@testing-library/react';
import Report from '../report';
import Sidebar from '../sidebar';
import shortResponseJSON from './mock_data/short_response.json';
import longResponseJSON from './mock_data/long_response.json';

const setMockJSONResult = (result) => {
    global.$.getJSON = () => ({ complete: jest.fn((callback) => callback(result)) });
};

const nextQueryButton = () => screen.queryByRole('button', { name: /next query/i });

const previousQueryButton = () => screen.queryByRole('button', { name: /previous query/i });

const TestSidebar = ({ long }) => {
    const data = long ? longResponseJSON : shortResponseJSON;
    const { queries } = data;
    return <Sidebar
        atLeastOneHit
        data={data}
        allQueriesLoaded
        shouldShowIndex={queries.length >= 2 && queries.length <= 12}
    />;
};

const clickCheckboxes = (checkboxes, count) => {
    Array.from(checkboxes).slice(0, count).forEach((checkbox) => {
        fireEvent.click(checkbox);
    });
};
describe('REPORT PAGE', () => {
    global.URL.createObjectURL = jest.fn();//.mockReturnValue('xyz.test');
    global.setTimeout = (cb) => cb();
    it('should render the report component with initial loading state', () => {
        render(<Report />);
        expect(screen.getByRole('heading', { name: 'BLAST-ing' })).toBeInTheDocument();
    });

    it('should show error modal if error occurs while fetching queries', () => {
        const showErrorModal = jest.fn();
        setMockJSONResult({ status: 500 });
        render(<Report showErrorModal={showErrorModal} />);
        expect(showErrorModal).toHaveBeenCalledTimes(1);
    });
    it('it should render the report page correctly if there\'s a response provided', () => {
        setMockJSONResult({ status: 200, responseJSON: shortResponseJSON });
        const { container } = render(<Report getCharacterWidth={jest.fn()} />);
        expect(container.querySelector('#results')).toBeInTheDocument();

    });
    describe('SIDEBAR', () => {
        it('should render the sidebar component with correct heading', () => {
            setMockJSONResult({ status: 200, responseJSON: shortResponseJSON });
            const { queries, program, querydb } = shortResponseJSON;
            const { container } = render(<TestSidebar />);
            expect(container.querySelector('.sidebar')).toBeInTheDocument();
            const sidebar_heading_text = `${program.toUpperCase()}: ${queries.length} queries, ${querydb.length} databases`;
            expect(screen.getByRole('heading', { name: sidebar_heading_text })).toBeInTheDocument();

        });
        describe('SHORT QUERIES (<=12)', () => {
            it('should show navigation links for short queries', () => {
                const { queries } = shortResponseJSON;
                const { container } = render(<TestSidebar />);
                expect(container.querySelectorAll('a[href^="#Query_"]').length).toEqual(queries.length);

            });
        });

        describe('LONG QUERIES (>12)', () => {
            let container;
            beforeEach(() => {
                container = render(<TestSidebar long />).container;
            });
            it('should not show navigation links for long queries', () => {
                expect(container.querySelectorAll('a[href^="#Query_"]').length).toBe(0);
            });
            it('should show only next button if on first query ', () => {
                expect(nextQueryButton()).toBeInTheDocument();
                expect(previousQueryButton()).not.toBeInTheDocument();
            });
            it('should show both previous and next buttons if not on first query', () => {
                const nextBtn = nextQueryButton();
                expect(nextBtn).toBeInTheDocument();
                fireEvent.click(nextBtn);

                const previousBtn = previousQueryButton();
                expect(previousBtn).toBeInTheDocument();
            });
            it('should show only previous button if on last query', () => {
                const { queries } = longResponseJSON;
                expect(nextQueryButton()).toBeInTheDocument();
                expect(previousQueryButton()).not.toBeInTheDocument();

                for (let i = 1; i < queries.length; i++) {
                    fireEvent.click(nextQueryButton());
                }
                expect(nextQueryButton()).not.toBeInTheDocument();
                expect(previousQueryButton()).toBeInTheDocument();
            });
        });

        describe('DOWNLOAD LINKS', () => {
            let container;
            beforeEach(() => {
                setMockJSONResult({ status: 200, responseJSON: shortResponseJSON });
                container = render(<Report getCharacterWidth={jest.fn()}  />).container;
            });
            describe('ALIGNMENT DOWNLOAD', () => {
                it('should generate a blob url and filename for downloading alignment of all hits on render', () => {
                    const alignment_download_link = container.querySelector('.download-alignment-of-all');
                    const expected_num_hits = container.querySelectorAll('.hit-links input[type="checkbox"]').length;
                    const file_name = `alignment-${expected_num_hits}_hits.txt`;
                    expect(alignment_download_link.download).toEqual(file_name);
                    expect(alignment_download_link.hred).not.toEqual('#');
                });
                it('link for downloading alignment of specific number of selected hits should be disabled on initial load', () => {
                    const alignment_download_link = container.querySelector('.download-alignment-of-selected');
                    expect(alignment_download_link.classList.contains('disabled')).toBeTruthy();
    
                });
                it('should generate a blob url and filename for downloading alignment of specific number of selected hits', () => {
                    const alignment_download_link = container.querySelector('.download-alignment-of-selected');
                    // QUERY ALL HIT LINKS CHECKBOXES
                    const checkboxes = container.querySelectorAll('.hit-links input[type="checkbox"]');
                    // SELECT 4 CHECKBOXES
                    clickCheckboxes(checkboxes, 4);
                    const file_name = 'alignment-4_hits.txt';
                    expect(alignment_download_link.textContent).toEqual('Alignment of 4 selected hit(s)');
                    expect(alignment_download_link.download).toEqual(file_name);
                });
            });
    
            describe('FASTA DOWNLOAD', () => {
                let fasta_download_link;
                beforeEach(() => {
                    fasta_download_link = container.querySelector('.download-fasta-of-selected');
                });
                it('link for downloading fasta of selected number of hits should be disabled on initial load', () => {
                    expect(fasta_download_link.classList.contains('disabled')).toBeTruthy();
                });
    
                it('link for downloading fasta of specific number of selected hits should be active after selection', () => {
                    const checkboxes = container.querySelectorAll('.hit-links input[type="checkbox"]');
                    // SELECT 5 CHECKBOXES
                    clickCheckboxes(checkboxes, 5);
                    expect(fasta_download_link.textContent).toEqual('FASTA of 5 selected hit(s)');
                });
            });
        });
    });

});
