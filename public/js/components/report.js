import React, { Component } from 'react';

import LoadingBlast from './report/loading_blast';
import WarningBlast from './report/warning_blast';
import fetchResults from '../services/fetchResults';

import ReportPlugins from 'report_plugins';
import RunSummary from './report/run_summary';
import GraphicalOverview from './report/graphical_overview';
import AlignmentResults from './report/alignment_results';
import Sidebar from './report/sidebar';

import {
    preventCollapseOnSelection,
    populate_hsp_array,
    setupScrollSpy,
    prepareAlignmentOfAllHits
} from '../utils/report.utils';

const DEFAULT_STATE = {
    user_warning: null,
    eownload_links: [],
    search_id: '',
    seqserv_version: '',
    program: '',
    program_version: '',
    submitted_at: '',
    results: [],
    queries: [],
    querydb: [],
    params: [],
    stats: [],
    alignment_blob_url: '',
    allQueriesLoaded: false,
    cloud_sharing_enabled: false,
}

class Report extends Component {
    constructor(props) {
        super(props);
        this.state = DEFAULT_STATE;
        this.setStateFromJSON = this.setStateFromJSON.bind(this);
        this.plugins = new ReportPlugins(this);
    }

    componentDidMount() {
        fetchResults(this.setStateFromJSON, this.props.showErrorModal)
        preventCollapseOnSelection();
    }

    componentFinishedUpdating() {
        if (this.state.allQueriesLoaded) return;
        this.shouldShowIndex() && this.setupScrollSpy();
        this.setState({ allQueriesLoaded: true });
    }

    shouldShowIndex() {
        var num_queries = this.state.queries.length;
        return num_queries >= 2 && num_queries <= 12;
    }

    /**
    * Returns true if we have at least one hit.
    */
    atLeastOneHit() {
        return this.state.queries.some((query) => query.hits.length > 0);
    }

    /*
    * Calls setState after any required modification to responseJSON.
    */
    setStateFromJSON(responseJSON) {
        this.lastTimeStamp = Date.now();
        // the callback prepares the download link for all alignments
        if (responseJSON.user_warning == 'LARGE_RESULT') {
            this.setState({user_warning: responseJSON.user_warning, download_links: responseJSON.download_links});
        } else {
            console.log('prepareAlignmentOfAllHits', prepareAlignmentOfAllHits);
            this.setState(responseJSON, () => prepareAlignmentOfAllHits(this.state.queries));
        }
    }

    render() {
        if (this.state.user_warning) {
            return (<WarningBlast downloadLinks={this.state.download_links} />);
        } else if (this.state.queries.length >= 1) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-1" id="results">
                    <div className="hidden md:col-span-1 md:block print:hidden">
                        <Sidebar
                            data={this.state}
                            atLeastOneHit={this.atLeastOneHit()}
                            shouldShowIndex={this.shouldShowIndex()}
                            allQueriesLoaded={this.state.allQueriesLoaded}
                            cloudSharingEnabled={this.state.cloud_sharing_enabled}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-3 print:col-span-1">
                        <RunSummary
                            seqserv_version={this.state.seqserv_version}
                            program_version={this.state.program_version}
                            submitted_at={this.state.submitted_at}
                            querydb={this.state.querydb}
                            stats={this.state.stats}
                            params={this.state.params}
                        />
                        <GraphicalOverview
                            queries={this.state.queries}
                            prorgam={this.state.program}
                            plugins={this.plugins}
                        />
                        <AlignmentResults
                            state={this.state}
                            populate_hsp_array={populate_hsp_array}
                            componentFinishedUpdating={(_) => this.componentFinishedUpdating(_)}
                            plugins={this.plugins}
                            {...this.props}
                        />
                    </div>
                </div>
            );
        } else {
            return (<LoadingBlast />);
        }
    }
}

export default Report;
