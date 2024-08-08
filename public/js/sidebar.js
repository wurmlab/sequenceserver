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
        const element = document.createElement('input');  
        const url = window.location.href;  
        document.body.appendChild(element);  
        element.value = url;  
        element.select();  
        document.execCommand('copy');  
        document.body.removeChild(element);  
      
        const tooltip = document.getElementById('tooltip');  
        tooltip.classList.remove('hidden');  
      
        setTimeout(() => {  
          tooltip.classList.add('hidden');  
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
        const buttonClasses = 'text-sm text-seqblue hover:text-seqorange hover:bg-gray-200';

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
                        !(this.props.data.imported_xml || this.props.data.non_parse_seqids) && <li className={`${!this.props.atLeastOneHit ? 'cursor-not-allowed' : 'hover:bg-gray-200'}`}>  
                            <a
                                href="#" 
                                className={`text-sm text-seqblue download-fasta-of-all hover:text-seqorange cursor-pointer py-0.5 px-0.5 ${!this.props.atLeastOneHit && 'disabled'}`}   
                                onClick={this.props.atLeastOneHit ? this.downloadFastaOfAll : (e) => e.preventDefault()}>  
                                    FASTA of all hits  
                            </a>  
                        </li>
                    }
                    {
                        !(this.props.data.imported_xml || this.props.data.non_parse_seqids) && <li>
                            <a
                                href="#"
                                className="text-sm text-seqblue download-fasta-of-selected disabled py-0.5 px-0.5"
                                onClick={this.downloadFastaOfSelected}>
                                FASTA of <span className="text-bold"></span> selected hit(s)
                            </a>
                        </li>
                    }
                    <li className={`${!this.props.atLeastOneHit ? 'cursor-not-allowed' : 'hover:bg-gray-200'}`}>
                        <a href="#" className={`text-sm text-seqblue download-alignment-of-all hover:text-seqorange cursor-pointer py-0.5 px-0.5 ${!this.props.atLeastOneHit && 'disabled'}`}>
                            Alignment of all hits
                        </a>
                    </li>
                    <li>
                        <a href="#" className="text-sm text-seqblue download-alignment-of-selected disabled py-0.5 px-0.5">
                            Alignment of <span className="text-bold"></span> selected hit(s)
                        </a>
                    </li>
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a href={'download/' + this.props.data.search_id + '.std_tsv'}>
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center w-full">
                                        <span className="w-full text-sm text-seqblue hover:text-seqorange download cursor-pointer py-0.5 px-0.5">Standard tabular report</span>
                                        <div className="absolute hidden left-full ml-2 items-center  group-hover:flex w-[300px]">
                                            <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                            <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                15 columns: query and subject ID; scientific
                                                name, alignment length, mismatches, gaps, identity,
                                                start and end coordinates, e value, bitscore, query
                                                coverage per subject and per HSP.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a href={'download/' + this.props.data.search_id + '.full_tsv'}>
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center w-full">
                                        <span className="w-full text-sm text-seqblue hover:text-seqorange download cursor-pointer py-0.5 px-0.5">Full tabular report</span>
                                        <div className="absolute hidden left-full ml-2 items-center  group-hover:flex w-[300px]">
                                            <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                            <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                44 columns: query and subject ID, GI,
                                                accessions, and length; alignment details;
                                                taxonomy details of subject sequence(s) and
                                                query coverage per subject and per HSP.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a href={'download/' + this.props.data.search_id + '.xml'}>
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center w-full">
                                        <span className="w-full text-sm text-seqblue hover:text-seqorange download cursor-pointer py-0.5 px-0.5">Full XML report</span>
                                        <div className="absolute hidden left-full ml-2 items-center  group-hover:flex w-[300px]">
                                            <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                            <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                Results in XML format.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li className="hover:bg-gray-200">
                            <a href={'download/' + this.props.data.search_id + '.pairwise'}>
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center w-full">
                                        <span className="w-full text-sm text-seqblue hover:text-seqorange download cursor-pointer py-0.5 px-0.5">Full Text report</span>
                                        <div className="absolute hidden left-full ml-2 items-center  group-hover:flex w-[300px]">
                                            <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                            <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                Results in text format.
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
                            <a id="copyURL" className="flex text-sm text-seqblue hover:text-seqorange copy-URL cursor-pointer py-0.5 px-0.5 w-full" onClick={this.copyURL}>
                                <div className="relative flex gap-2 items-center group w-full">
                                    <i className="fa fa-copy"></i>
                                    <div className="flex items-center">
                                        <span className="w-full">Copy URL to clipboard</span>
                                        <div id="tooltip" className="absolute hidden left-full ml-2 items-center">
                                            <div className="flex items-center">
                                                <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                                <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                    Copied!
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    }
                    {!this.props.cloudSharingEnabled &&
                        <li className="hover:text-seqorange hover:bg-gray-200">
                            <a id="sendEmail" className="text-sm text-seqblue email-URL cursor-pointer py-0.5 px-0.5"
                                href={asMailftoHref(this.props.data.querydb, this.props.data.program, this.props.data.queries.length, window.location.href)}
                                target="_blank" rel="noopener noreferrer">
                                <div className="relative flex gap-2 items-center group w-full">
                                    <i className="fa fa-envelope"></i>
                                    <div className="flex items-center w-full">
                                        <span className="w-full">Send by email</span>
                                        <div className="absolute hidden left-full ml-2 items-center  group-hover:flex w-[300px]">
                                            <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                            <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                Send by email
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    }
                    {this.props.cloudSharingEnabled &&
                        <li className="hover:text-seqorange hover:bg-gray-200">
                            <button className="flex text-sm text-seqblue hover:text-seqorange cloud-Post cursor-pointer py-0.5 px-0.5 w-full" onClick={this.shareCloudInit}>
                                <div className="relative flex gap-2 items-center group w-full">
                                    <i className="fa fa-cloud"></i>
                                    <div className="flex items-center">
                                        <span className="w-full">Share to cloud</span>
                                        <div className="absolute hidden left-full ml-2 items-center  group-hover:flex w-[300px]">
                                            <div className="w-0 h-0 border-t-[8px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                            <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                Results in pairwise format
                                                Upload results to SequenceServer Cloud where it will become accessable
                                                to everyone who has a link.
                                            </span>
                                        </div>
                                    </div>
                                </div>
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

