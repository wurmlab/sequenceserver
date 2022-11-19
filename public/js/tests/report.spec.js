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

describe('REPORT PAGE', () => {
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
        const { container } = render(<Report />);
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

            it('should not show navigation links for long queries', () => {
                const { container } = render(<TestSidebar long />);
                expect(container.querySelectorAll('a[href^="#Query_"]').length).toBe(0);
            });
            it('should show only next button if on first query ', () => {
                render(<TestSidebar long />);
                expect(nextQueryButton()).toBeInTheDocument();
                expect(previousQueryButton()).not.toBeInTheDocument();
            });
            it('should show both previous and next buttons if not on first query', () => {
                render(<TestSidebar long />);
                const nextBtn = nextQueryButton();
                expect(nextBtn).toBeInTheDocument();
                fireEvent.click(nextBtn);

                const previousBtn = previousQueryButton();
                expect(previousBtn).toBeInTheDocument();
            });
            it('should show only previous button if on last query', () => {
                const { queries } = longResponseJSON;
                render(<TestSidebar long />);
                expect(nextQueryButton()).toBeInTheDocument();
                expect(previousQueryButton()).not.toBeInTheDocument();

                for (let i = 1; i < queries.length; i++) {
                    fireEvent.click(nextQueryButton());
                }
                expect(nextQueryButton()).not.toBeInTheDocument();
                expect(previousQueryButton()).toBeInTheDocument();
            });
        });
    });
});
