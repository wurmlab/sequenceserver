import React, { Component } from 'react';
import _ from 'underscore';

import downloadFASTA from './download_fasta';
import asMailtoHref from './mailto';
import CloudShareModal from './cloud_share_modal';
import DownloadLinks from 'download_links';
/**
 * checks whether code is being run by jest
 */
// eslint-disable-next-line no-undef
const isTestMode = () => process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';
/**
 * Renders links for downloading hit information in different formats.
 * Renders links for navigating to each query.
 */
export default class extends Component {

    constructor(props) {
        super(props);
        this.downloadFastaOfAll = this.downloadFastaOfAll.bind(this);
        this.downloadFastaOfSelected = this.downloadFastaOfSelected.bind(this);
        this.topPanelJSX = this.topPanelJSX.bind(this);
        this.summaryString = this.summaryString.bind(this);
        this.indexJSX = this.indexJSX.bind(this);
        this.downloadsPanelJSX = this.downloadsPanelJSX.bind(this);
        this.handleQueryIndexChange = this.handleQueryIndexChange.bind(this);
        this.isElementInViewPort = this.isElementInViewPort.bind(this);
        this.setVisibleQueryIndex = this.setVisibleQueryIndex.bind(this);
        this.debounceScrolling = this.debounceScrolling.bind(this);
        this.scrollListener = this.scrollListener.bind(this);
        this.copyURL = this.copyURL.bind(this);
        this.shareCloudInit = this.shareCloudInit.bind(this);
        this.sharingPanelJSX = this.sharingPanelJSX.bind(this);
        this.cloudShareModal = React.createRef();
        this.timeout = null;
        this.queryElems = [];
        this.state = {
            queryIndex: 1
        };
    }

    componentDidMount() {
        /**
         * Fixes tooltips in the sidebar, allows tooltip display on click
         */
        $(function () {
            $('.sidebar [data-toggle="tooltip"]').tooltip({ placement: 'right' });
            $('#copyURL').tooltip({ title: 'Copied!', trigger: 'click', placement: 'right', delay: 0 });
        });

        //keep track of the current queryIndex so it doesn't get lost on page reload
        const urlMatch = window.location.href.match(/#Query_(\d+)/);
        if (urlMatch && urlMatch.length > 1) {
            const queryNumber = +urlMatch[1];
            const index = this.props.data.queries.findIndex(query => query.number === queryNumber);
            this.setState({ queryIndex: index + 1 });
        }
        window.addEventListener('scroll', this.scrollListener);
        $('a[href^="#Query_"]').on('click', this.animateAnchorElements);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollListener);
    }
    componentDidUpdate(prevProps) {
        if (this.props.allQueriesLoaded && !prevProps.allQueriesLoaded) {
            /**
             * storing all query elements in this variable once they all become available so we don't have to fetch them all over again
             */
            this.queryElems = Array.from(document.querySelectorAll('.resultn'));
        }
    }


    /**
     * to avoid unnecessary computations, we debounce the scroll listener so it only fires after user has stopped scrolling for some milliseconds
     */
    scrollListener() {
        this.debounceScrolling(this.setVisibleQueryIndex, 500);
    }

    debounceScrolling(callback, timer) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(callback, timer);
    }

    /**
     * This method makes the page aware of what query is visible so that clicking previous / next button at any point
     * navigates to the proper query
     */
    setVisibleQueryIndex() {
        const queryElems = this.queryElems.length ? this.queryElems : Array.from(document.querySelectorAll('.resultn'));
        const hits = Array.from(document.querySelectorAll('.hit[id^=Query_]'));
        // get the first visible element and marks it as the current query
        const topmostEl = queryElems.find(this.isElementInViewPort) || hits.find(this.isElementInViewPort);
        if (topmostEl) {
            const queryIndex = Number(topmostEl.id.match(/Query_(\d+)/)[1]);
            let hash = `#Query_${queryIndex}`;
            // if we can guarantee that the browser can handle change in url hash without the page jumping,
            // then we update the url hash after scroll. else, hash is only updated on click of next or prev button
            if (window.history.pushState) {
                window.history.pushState(null, null, hash);
            }
            this.setState({ queryIndex });
        }
    }
    animateAnchorElements(e) {
        // allow normal behavior in test mode to prevent warnings or errors from jquery
        if (isTestMode()) return;
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $(this.hash).offset().top
        }, 300);
        if (window.history.pushState) {
            window.history.pushState(null, null, this.hash);
        } else {
            window.location.hash = this.hash;
        }
    }
    isElementInViewPort(elem) {
        const { top, left, right, bottom } = elem.getBoundingClientRect();
        return (
            top >= 0 &&
            left >= 0 &&
            bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    /**
         * Clear sessionStorage - useful to initiate a new search in the same tab.
         * Passing sessionStorage.clear directly as onclick callback didn't work
         * (on macOS Chrome).
        */
    clearSession() {
        sessionStorage.clear();
    }
    /**
     *
     * handle next and previous query button clicks
     */
    handleQueryIndexChange(nextQuery) {
        if (nextQuery < 1 || nextQuery > this.props.data.queries.length) return;
        const anchorEl = document.createElement('a');
        //indexing at [nextQuery - 1] because array is 0-indexed
        anchorEl.setAttribute('href', '#Query_' + this.props.data.queries[nextQuery - 1].number);
        anchorEl.setAttribute('hidden', true);
        document.body.appendChild(anchorEl);
        // add smooth scrolling animation with jquery
        $(anchorEl).on('click', this.animateAnchorElements);
        anchorEl.click();
        document.body.removeChild(anchorEl);
        this.setState({ queryIndex: nextQuery });
    }
    /**
     * Event-handler for downloading fasta of all hits.
     */
    downloadFastaOfAll() {
        var sequence_ids = [];
        this.props.data.queries.forEach(
            (query) => query.hits.forEach(
                (hit) => sequence_ids.push(hit.id)));
        var database_ids = this.props.data.querydb.map((querydb) => querydb.id);
        downloadFASTA(sequence_ids, database_ids);
        return false;
    }

    /**
     * Handles downloading fasta of selected hits.
     */
    downloadFastaOfSelected() {
        var sequence_ids = $('.hit-links :checkbox:checked').map(function () {
            return this.value;
        }).get();
        if (sequence_ids.length === 0) {
            return false;
        }
        var database_ids = _.map(this.props.data.querydb, _.iteratee('id'));
        downloadFASTA(sequence_ids, database_ids);
        return false;
    }




    /**
     * Handles copying the URL into the user's clipboard. Modified from: https://stackoverflow.com/a/49618964/18117380
     * Hides the 'Copied!' tooltip after 3 seconds
     */

    copyURL() {
        var element = document.createElement('input');
        var url = window.location.href;
        document.body.appendChild(element);
        element.value = url;
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);

        setTimeout(function () {
            $('#copyURL')._tooltip('hide');
        }, 3000);
    }

    shareCloudInit() {
        this.cloudShareModal.current.show();
    }

    topPanelJSX() {
        var path = location.pathname.split('/');
        // Get job id.
        var job_id = path.pop();
        // Deriving rootURL this way is required for subURI deployments
        // - we cannot just send to '/'.
        var rootURL = path.join('/');
        return (
            <div className="sidebar-top-panel">
                <div className="pl-px table w-full">
                    <h4 className="text-sm font-bold mb-0">
                        {this.summaryString()}
                    </h4>
                </div>
                {this.props.data.queries.length > 12 && this.queryIndexButtons()}
                <div>
                    <a href={`${rootURL}/?job_id=${job_id}`} className="text-sm text-seqblue hover:text-seqorange cursor-pointer">
                        <i className="fa fa-pencil"></i> Edit search
                    </a>
                    <span className="text-seqorange px-1">|</span>
                    <a href={`${rootURL}/`}
                        onClick={this.clearSession} className="text-sm text-seqblue hover:text-seqorange cursor-pointer">
                        <i className="fa-regular fa-file"></i> New search
                    </a>
                </div>
                {this.props.shouldShowIndex && this.indexJSX()}
            </div>
        );
    }

    summaryString() {
        var program = this.props.data.program;
        var numqueries = this.props.data.queries.length;
        var numquerydb = this.props.data.querydb.length;

        return (
            program.toUpperCase() + ': ' +
            numqueries + ' ' + (numqueries > 1 ? 'queries' : 'query') + ', ' +
            numquerydb + ' ' + (numquerydb > 1 ? 'databases' : 'database')
        );
    }

    queryIndexButtons() {
        const buttonStyle = {
            outline: 'none', border: 'none', background: 'none'
        };
        const buttonClasses = 'text-sm text-seqblue hover:text-seqorange nowrap-ellipsis hover-bold';

        const handlePreviousBtnClick = () => this.handleQueryIndexChange(this.state.queryIndex - 1);
        const handleNextBtnClick = () => this.handleQueryIndexChange(this.state.queryIndex + 1);

        // eslint-disable-next-line no-unused-vars
        const NavButton = ({ text, onClick }) => (
            <button className={buttonClasses} onClick={onClick} style={buttonStyle}>{text}</button>
        );
        return <div style={{ display: 'flex', width: '100%', margin: '7px 0' }}>
            {this.state.queryIndex > 1 && <NavButton text="Previous Query" onClick={handlePreviousBtnClick} />}
            {this.state.queryIndex > 1 && this.state.queryIndex < this.props.data.queries.length && <span className="text-seqorange px-1">|</span>}
            {this.state.queryIndex < this.props.data.queries.length && <NavButton onClick={handleNextBtnClick} text="Next Query" />}
        </div>;
    }
    indexJSX() {
        return <ul> {
            _.map(this.props.data.queries, (query) => {
                return <li key={'Side_bar_' + query.id}>
                    <a className="text-sm text-seqblue hover:text-seqorange focus:text-seqorange active: text-seqorange cursor-pointer nowrap-ellipsis hover-bold"
                        title={'Query= ' + query.id + ' ' + query.title}
                        href={'#Query_' + query.number}>
                        {'Query= ' + query.id}
                    </a>
                </li>;
            })
        }
        </ul>;
    }

    downloadsPanelJSX() {
        return (
            <div className="downloads">
                <div className="pl-px table w-full">
                    <h4 className="text-sm font-bold mb-0">
                        Download FASTA, XML, TSV
                    </h4>
                </div>
                <ul>
                    {
                        !(this.props.data.imported_xml || this.props.data.non_parse_seqids) && <li>
                            <a href="#" className={`text-sm text-seqblue download-fasta-of-all hover:text-seqorange cursor-pointer ${!this.props.atLeastOneHit && 'disabled'}`}
                                onClick={this.downloadFastaOfAll}>
                                FASTA of all hits
                            </a>
                        </li>
                    }
                    {
                        !(this.props.data.imported_xml || this.props.data.non_parse_seqids) && <li>
                            <a href="#" className="text-sm text-seqblue download-fasta-of-selected disabled"
                                onClick={this.downloadFastaOfSelected}>
                                FASTA of <span className="text-bold"></span> selected hit(s)
                            </a>
                        </li>
                    }
                    <li>
                        <a href="#" className={`text-sm text-seqblue download-alignment-of-all hover:text-seqorange cursor-pointer ${!this.props.atLeastOneHit && 'disabled'}`}>
                            Alignment of all hits
                        </a>
                    </li>
                    <li>
                        <a href="#" className="text-sm text-seqblue download-alignment-of-selected disabled">
                            Alignment of <span className="text-bold"></span> selected hit(s)
                        </a>
                    </li>
                    {
                        !this.props.data.imported_xml && <li className="hover:text-seqorange hover:bg-gray-200">
                            <a className="text-sm text-seqblue hover:text-seqorange download cursor-pointer w-full" data-toggle="tooltip"
                                title="15 columns: query and subject ID; scientific
                                name, alignment length, mismatches, gaps, identity,
                                start and end coordinates, e value, bitscore, query
                                coverage per subject and per HSP."
                                href={'download/' + this.props.data.search_id + '.std_tsv'}>
                                Standard tabular report
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a className="text-sm text-seqblue download hover:text-seqorange cursor-pointer w-full" data-toggle="tooltip"
                                title="44 columns: query and subject ID, GI,
                                accessions, and length; alignment details;
                                taxonomy details of subject sequence(s) and
                                query coverage per subject and per HSP."
                                href={'download/' + this.props.data.search_id + '.full_tsv'}>
                                Full tabular report
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a className="text-sm text-seqblue hover:text-seqorange download cursor-pointer" data-toggle="tooltip"
                                title="Results in XML format."
                                href={'download/' + this.props.data.search_id + '.xml'}>
                                Full XML report
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a className="text-sm text-seqblue hover:text-seqorange download cursor-pointer" data-toggle="tooltip"
                                title="Results in text format."
                                href={'download/' + this.props.data.search_id + '.pairwise'}>
                                Full Text report
                            </a>
                        </li>
                    }
                    <DownloadLinks imported_xml={this.props.data.imported_xml} search_id={this.props.data.search_id} />
                </ul>
            </div>
        );
    }

    sharingPanelJSX() {
        return (
            <div className="sharing-panel">
                <div className="pl-px table w-full">
                    <h4 className="text-sm font-bold mb-0">
                        Share results
                    </h4>
                </div>
                <ul>
                    {!this.props.cloudSharingEnabled &&
                        <li className="hover:text-seqorange hover:bg-gray-200">
                            <a id="copyURL" className="text-sm text-seqblue copy-URL cursor-pointer" data-toggle="tooltip"
                                onClick={this.copyURL}>
                                <i className="fa fa-copy"></i> Copy URL to clipboard
                            </a>
                        </li>
                    }
                    {!this.props.cloudSharingEnabled &&
                        <li className="hover:text-seqorange hover:bg-gray-200">
                            <a id="sendEmail" className="text-sm text-seqblue email-URL cursor-pointer" data-toggle="tooltip"
                                title="Send by email" href={asMailftoHref(this.props.data.querydb, this.props.data.program, this.props.data.queries.length, window.location.href)}
                                target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-envelope"></i> Send by email
                            </a>
                        </li>
                    }
                    {this.props.cloudSharingEnabled &&
                        <li>
                            <button className="text-sm text-seqblue hover:text-seqorange cloud-Post cursor-pointer" data-toggle="tooltip"
                                title="Upload results to SequenceServer Cloud where it will become accessable
                                to everyone who has a link." onClick={this.shareCloudInit}>
                                <i className="fa fa-cloud"></i> Share to cloud
                            </button>
                        </li>
                    }
                </ul>
                {
                    <CloudShareModal
                        ref={this.cloudShareModal}
                        querydb={this.props.data.querydb}
                        program={this.props.data.program}
                        queryLength={this.props.data.queries.length}
                    />
                }
            </div>
        );
    }

    render() {
        return (
            <div className="sidebar">
                {this.topPanelJSX()}
                {this.downloadsPanelJSX()}
                {this.sharingPanelJSX()}
                <div className="referral-panel">
                    <div className="pl-px table w-full text-sm">
                        <h4 className="font-bold mb-0">Recommend SequenceServer</h4>
                        <p><a href="https://sequenceserver.com/referral-program" target="_blank" className="text-seqblue hover:text-seqorange">Earn up to $400 per signup</a></p>
                    </div>
                </div>
            </div>
        );
    }
}

