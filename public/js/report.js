import './jquery_world'; // for custom $.tooltip function
import React, { Component } from 'react';
import _ from 'underscore';

import Sidebar from './sidebar';
import Circos from './circos';
import { ReportQuery } from './query';
import Hit from './hit';
import HSP from './hsp';
import AlignmentExporter from './alignment_exporter';




/**
 * Renders entire report.
 *
 * Composed of Query and Sidebar components.
 */
class Report extends Component {
    constructor(props) {
        super(props);
        // Properties below are internal state used to render results in small
        // slices (see updateState).
        this.numUpdates = 0;
        this.nextQuery = 0;
        this.nextHit = 0;
        this.nextHSP = 0;
        this.maxHSPs = 3; // max HSPs to render in a cycle
        this.state = {
            search_id: '',
            seqserv_version: '',
            program: '',
            program_version: '',
            submitted_at: '',
            queries: [],
            results: [],
            querydb: [],
            params: [],
            stats: [],
            alignment_blob_url: '',
            allQueriesLoaded: false,
            cloud_sharing_enabled: false,
        };
        this.prepareAlignmentOfSelectedHits = this.prepareAlignmentOfSelectedHits.bind(this);
        this.prepareAlignmentOfAllHits = this.prepareAlignmentOfAllHits.bind(this);
        this.setStateFromJSON = this.setStateFromJSON.bind(this);
    }
    /**
   * Fetch results.
   */
    fetchResults() {
        var intervals = [200, 400, 800, 1200, 2000, 3000, 5000];
        var component = this;

        function poll() {
            $.getJSON(location.pathname + '.json').complete(function (jqXHR) {
                switch (jqXHR.status) {
                case 202:
                    var interval;
                    if (intervals.length === 1) {
                        interval = intervals[0];
                    } else {
                        interval = intervals.shift();
                    }
                    setTimeout(poll, interval);
                    break;
                case 200:
                    component.setStateFromJSON(jqXHR.responseJSON);
                    break;
                case 404:
                case 400:
                case 500:
                    component.props.showErrorModal(jqXHR.responseJSON);
                    break;
                }
            });
        }

        poll();
    }

    /**
   * Calls setState after any required modification to responseJSON.
   */
    setStateFromJSON(responseJSON) {
        this.lastTimeStamp = Date.now();
        // the callback prepares the download link for all alignments
        this.setState(responseJSON, this.prepareAlignmentOfAllHits);
    }
    /**
   * Called as soon as the page has loaded and the user sees the loading spinner.
   * We use this opportunity to setup services that make use of delegated events
   * bound to the window, document, or body.
   */
    componentDidMount() {
        this.fetchResults();
        // This sets up an event handler which enables users to select text from
        // hit header without collapsing the hit.
        this.preventCollapseOnSelection();
        this.toggleTable();
    }

    /**
   * Called for the first time after as BLAST results have been retrieved from
   * the server and added to this.state by fetchResults. Only summary overview
   * and circos would have been rendered at this point. At this stage we kick
   * start iteratively adding 1 HSP to the page every 25 milli-seconds.
   */
    componentDidUpdate() {
    // Log to console how long the last update take?
        console.log((Date.now() - this.lastTimeStamp) / 1000);

        // Lock sidebar in its position on the first update.
        if (this.nextQuery == 0 && this.nextHit == 0 && this.nextHSP == 0) {
            this.affixSidebar();
        }

        // Queue next update if we have not rendered all results yet.
        if (this.nextQuery < this.state.queries.length) {
            // setTimeout is used to clear call stack and space out
            // the updates giving the browser a chance to respond
            // to user interactions.
            setTimeout(() => this.updateState(), 25);
        } else {
            this.componentFinishedUpdating();
        }
    }

    /**
   * Push next slice of results to React for rendering.
   */
    updateState() {
        var results = [];
        var numHSPsProcessed = 0;
        while (this.nextQuery < this.state.queries.length) {
            var query = this.state.queries[this.nextQuery];
            // We may see a query multiple times during rendering because only
            // 3 hsps or are rendered in each cycle, but we want to create the
            // corresponding Query component only the first time we see it.
            if (this.nextHit == 0 && this.nextHSP == 0) {
                results.push(
                    <ReportQuery
                        key={'Query_' + query.number}
                        query={query}
                        program={this.state.program}
                        querydb={this.state.querydb}
                        showQueryCrumbs={this.state.queries.length > 1}
                        non_parse_seqids={this.state.non_parse_seqids}
                        imported_xml={this.state.imported_xml}
                        veryBig={this.state.veryBig}
                    />
                );
            }

            while (this.nextHit < query.hits.length) {
                var hit = query.hits[this.nextHit];
                // We may see a hit multiple times during rendering because only
                // 10 hsps are rendered in each cycle, but we want to create the
                // corresponding Hit component only the first time we see it.
                if (this.nextHSP == 0) {
                    results.push(
                        <Hit
                            key={'Query_' + query.number + '_Hit_' + hit.number}
                            query={query}
                            hit={hit}
                            algorithm={this.state.program}
                            querydb={this.state.querydb}
                            selectHit={this.selectHit}
                            imported_xml={this.state.imported_xml}
                            non_parse_seqids={this.state.non_parse_seqids}
                            showQueryCrumbs={this.state.queries.length > 1}
                            showHitCrumbs={query.hits.length > 1}
                            veryBig={this.state.veryBig}
                            onChange={this.prepareAlignmentOfSelectedHits}
                            {...this.props}
                        />
                    );
                }

                while (this.nextHSP < hit.hsps.length) {
                    // Get nextHSP and increment the counter.
                    var hsp = hit.hsps[this.nextHSP++];
                    results.push(
                        <HSP
                            key={
                                'Query_' +
                query.number +
                '_Hit_' +
                hit.number +
                '_HSP_' +
                hsp.number
                            }
                            query={query}
                            hit={hit}
                            hsp={hsp}
                            algorithm={this.state.program}
                            showHSPNumbers={hit.hsps.length > 1}
                            {...this.props}
                        />
                    );
                    numHSPsProcessed++;
                    if (numHSPsProcessed == this.maxHSPs) break;
                }
                // Are we here because we have iterated over all hsps of a hit,
                // or because of the break clause in the inner loop?
                if (this.nextHSP == hit.hsps.length) {
                    this.nextHit = this.nextHit + 1;
                    this.nextHSP = 0;
                }
                if (numHSPsProcessed == this.maxHSPs) break;
            }

            // Are we here because we have iterated over all hits of a query,
            // or because of the break clause in the inner loop?
            if (this.nextHit == query.hits.length) {
                this.nextQuery = this.nextQuery + 1;
                this.nextHit = 0;
            }
            if (numHSPsProcessed == this.maxHSPs) break;
        }

        // Push the components to react for rendering.
        this.numUpdates++;
        this.lastTimeStamp = Date.now();
        this.setState({
            results: this.state.results.concat(results),
            veryBig: this.numUpdates >= 250,
        });
    }

    /**
   * Called after all results have been rendered.
   */
    componentFinishedUpdating() {
        if (this.state.allQueriesLoaded) return;
        this.shouldShowIndex() && this.setupScrollSpy();
        this.setState({ allQueriesLoaded: true });
    }

    /**
   * Returns loading message
   */
    loadingJSX() {
        return (
            <div className="row">
                <div className="col-md-6 col-md-offset-3 text-center">
                    <h1>
                        <i className="fa fa-cog fa-spin"></i>&nbsp; BLAST-ing
                    </h1>
                    <p>
                        <br />
            This can take some time depending on the size of your query and
            database(s). The page will update automatically when BLAST is done.
                        <br />
                        <br />
            You can bookmark the page and come back to it later or share the
            link with someone.
                    </p>
                </div>
            </div>
        );
    }

    /**
   * Return results JSX.
   */
    resultsJSX() {
        return (
            <div className="row" id="results">
                <div className="col-md-3 hidden-sm hidden-xs">
                    <Sidebar
                        data={this.state}
                        atLeastOneHit={this.atLeastOneHit()}
                        shouldShowIndex={this.shouldShowIndex()}
                        allQueriesLoaded={this.state.allQueriesLoaded}
                        cloudSharingEnabled={this.state.cloud_sharing_enabled}
                    />
                </div>
                <div className="col-md-9">
                    {this.overviewJSX()}
                    {this.circosJSX()}
                    {this.state.results}
                </div>
            </div>
        );
    }

    /**
   * Renders report overview.
   */
    overviewJSX() {
        return (
            <div className="overview">
                <p>
                    <strong>SequenceServer {this.state.seqserv_version}</strong> using{' '}
                    <strong>{this.state.program_version}</strong>
                    {this.state.submitted_at &&
            `, query submitted on ${this.state.submitted_at}`}
                </p>
                <p>
                    <strong> Databases: </strong>
                    {this.state.querydb
                        .map((db) => {
                            return db.title;
                        })
                        .join(', ')}{' '}
          ({this.state.stats.nsequences} sequences,&nbsp;
                    {this.state.stats.ncharacters} characters)
                </p>
                <p>
                    <strong>Parameters: </strong>{' '}
                    {_.map(this.state.params, function (val, key) {
                        return key + ' ' + val;
                    }).join(', ')}
                </p>
                <p>
          Please cite:{' '}
                    <a href="https://doi.org/10.1093/molbev/msz185">
            https://doi.org/10.1093/molbev/msz185
                    </a>
                </p>
            </div>
        );
    }

    /**
   * Return JSX for circos if we have at least one hit.
   */
    circosJSX() {
        return this.atLeastTwoHits() ? (
            <Circos
                queries={this.state.queries}
                program={this.state.program}
                collapsed="true"
            />
        ) : (
            <span></span>
        );
    }

    // Controller //

    /**
   * Returns true if results have been fetched.
   *
   * A holding message is shown till results are fetched.
   */
    isResultAvailable() {
        return this.state.queries.length >= 1;
    }

    /**
   * Returns true if we have at least one hit.
   */
    atLeastOneHit() {
        return this.state.queries.some((query) => query.hits.length > 0);
    }

    /**
   * Does the report have at least two hits? This is used to determine
   * whether Circos should be enabled or not.
   */
    atLeastTwoHits() {
        var hit_num = 0;
        return this.state.queries.some((query) => {
            hit_num += query.hits.length;
            return hit_num > 1;
        });
    }

    /**
   * Returns true if index should be shown in the sidebar. Index is shown
   * only for 2 and 8 queries.
   */
    shouldShowIndex() {
        var num_queries = this.state.queries.length;
        return num_queries >= 2 && num_queries <= 12;
    }

    /**
   * Prevents folding of hits during text-selection.
   */
    preventCollapseOnSelection() {
        $('body').on('mousedown', '.hit > .section-header > h4', function (event) {
            var $this = $(this);
            $this.on('mouseup mousemove', function handler(event) {
                if (event.type === 'mouseup') {
                    // user wants to toggle
                    var hitID = $this.parents('.hit').attr('id');
                    $(`div[data-parent-hit=${hitID}]`).toggle();
                    $this.find('i').toggleClass('fa-minus-square-o fa-plus-square-o');
                } else {
                    // user wants to select
                    $this.attr('data-toggle', '');
                }
                $this.off('mouseup mousemove', handler);
            });
        });
    }

    /* Handling the fa icon when Hit Table is collapsed */
    toggleTable() {
        $('body').on(
            'mousedown',
            '.resultn > .section-content > .table-hit-overview > .caption',
            function (event) {
                var $this = $(this);
                $this.on('mouseup mousemove', function handler(event) {
                    $this.find('i').toggleClass('fa-minus-square-o fa-plus-square-o');
                    $this.off('mouseup mousemove', handler);
                });
            }
        );
    }

    /**
   * Affixes the sidebar.
   */
    affixSidebar() {
        var $sidebar = $('.sidebar');
        var sidebarOffset = $sidebar.offset();
        if (sidebarOffset) {
            $sidebar.affix({
                offset: {
                    top: sidebarOffset.top,
                },
            });
        }
    }

    /**
   * For the query in viewport, highlights corresponding entry in the index.
   */
    setupScrollSpy() {
        $('body').scrollspy({ target: '.sidebar' });
    }

    /**
   * Event-handler when hit is selected
   * Adds glow to hit component.
   * Updates number of Fasta that can be downloaded
   */
    selectHit(id) {
        var checkbox = $('#' + id);
        var num_checked = $('.hit-links :checkbox:checked').length;

        if (!checkbox || !checkbox.val()) {
            return;
        }

        var $hit = $(checkbox.data('target'));

        // Highlight selected hit and enable 'Download FASTA/Alignment of
        // selected' links.
        if (checkbox.is(':checked')) {
            $hit.addClass('glow');
            $hit.next('.hsp').addClass('glow');
            $('.download-fasta-of-selected').enable();
            $('.download-alignment-of-selected').enable();
        } else {
            $hit.removeClass('glow');
            $hit.next('.hsp').removeClass('glow');
        }

        var $a = $('.download-fasta-of-selected');
        var $b = $('.download-alignment-of-selected');

        if (num_checked >= 1) {
            $a.find('.text-bold').html(num_checked);
            $b.find('.text-bold').html(num_checked);
        }

        if (num_checked == 0) {
            $a.addClass('disabled').find('.text-bold').html('');
            $b.addClass('disabled').find('.text-bold').html('');
        }
    }
    populate_hsp_array(hit, query_id){
        return hit.hsps.map(hsp => Object.assign(hsp, {hit_id: hit.id, query_id}));
    }

    prepareAlignmentOfSelectedHits() {
        var sequence_ids = $('.hit-links :checkbox:checked').map(function () {
            return this.value;
        }).get();

        if(!sequence_ids.length){
            // remove attributes from link if sequence_ids array is empty
            $('.download-alignment-of-selected').attr('href', '#').removeAttr('download');
            return;

        }
        if(this.state.alignment_blob_url){
            // always revoke existing url if any because this method will always create a new url
            window.URL.revokeObjectURL(this.state.alignment_blob_url);
        }
        var hsps_arr = [];
        var aln_exporter = new AlignmentExporter();
        const self = this;
        _.each(this.state.queries, _.bind(function (query) {
            _.each(query.hits, function (hit) {
                if (_.indexOf(sequence_ids, hit.id) != -1) {
                    hsps_arr = hsps_arr.concat(self.populate_hsp_array(hit, query.id));
                }
            });
        }, this));
        const filename = 'alignment-' + sequence_ids.length + '_hits.txt';
        const blob_url = aln_exporter.prepare_alignments_for_export(hsps_arr, filename);
        // set required download attributes for link
        $('.download-alignment-of-selected').attr('href', blob_url).attr('download', filename);
        // track new url for future removal
        this.setState({alignment_blob_url: blob_url});
    }

    prepareAlignmentOfAllHits() {
        // Get number of hits and array of all hsps.
        var num_hits = 0;
        var hsps_arr = [];
        if(!this.state.queries.length){
            return;
        }
        this.state.queries.forEach(
            (query) => query.hits.forEach(
                (hit) => {
                    num_hits++;
                    hsps_arr = hsps_arr.concat(this.populate_hsp_array(hit, query.id));
                }
            )
        );

        var aln_exporter = new AlignmentExporter();
        var file_name = `alignment-${num_hits}_hits.txt`;
        const blob_url = aln_exporter.prepare_alignments_for_export(hsps_arr, file_name);
        $('.download-alignment-of-all')
            .attr('href', blob_url)
            .attr('download', file_name);
        return false;
    }

    render() {
        return this.isResultAvailable() ? this.resultsJSX() : this.loadingJSX();
    }
}

export default Report;
