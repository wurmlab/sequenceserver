import './jquery_world'; // for custom $.tooltip function
import React from 'react';
import _ from 'underscore';

import Sidebar from './sidebar';
import Circos from './circos';
import Query from './query';
import Hit from './hit';
import HSP from './hsp';

import SequenceModal from './sequence_modal';
import ErrorModal from './error_modal';

/**
 * Base component of report page. This component is later rendered into page's
 * '#view' element.
 */
var Page = React.createClass({
    render: function () {
        return (
            <div>
                {/* Provide bootstrap .container element inside the #view for
                    the Report component to render itself in. */}
                <div className="container">
                    <Report showSequenceModal={ _ => this.showSequenceModal(_) }
                        getCharacterWidth={ () => this.getCharacterWidth() }
                        showErrorModal={ (...args) => this.showErrorModal(...args) } />
                </div>

                {/* Add a hidden span tag containing chars used in HSPs */}
                <pre className="pre-reset hsp-lines" ref="hspChars" hidden>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ +-
                </pre>

                {/* Required by Grapher for SVG and PNG download */}
                <canvas id="png-exporter" hidden></canvas>

                <SequenceModal ref="sequenceModal"
                    showErrorModal={ (...args) => this.showErrorModal(...args) }/>

                <ErrorModal ref="errorModal" />
            </div>
        );
    },

    componentDidMount: function () {
        var job_id = location.pathname.split('/').pop();
        sessionStorage.setItem('job_id', job_id);
    },

    showSequenceModal: function (url) {
        this.refs.sequenceModal.show(url);
    },

    showErrorModal: function (errorData, beforeShow) {
        this.refs.errorModal.show(errorData, beforeShow);
    },

    getCharacterWidth: function () {
        if (!this.characterWidth) {
            var $hspChars = $(React.findDOMNode(this.refs.hspChars));
            this.characterWidth = $hspChars.width() / 29;
        }
        return this.characterWidth;
    }
});

/**
 * Renders entire report.
 *
 * Composed of Query and Sidebar components.
 */
var Report = React.createClass({

    // Model //

    getInitialState: function () {
        this.fetchResults();

        // Properties below are internal state used to render results in small
        // slices (see updateState).
        this.numUpdates = 0;
        this.nextQuery = 0;
        this.nextHit = 0;
        this.nextHSP = 0;
        this.maxHSPs = 3; // max HSPs to render in a cycle

        return {
            search_id:       '',
            seqserv_version: '',
            program:         '',
            program_version: '',
            submitted_at:    '',
            queries:         [],
            results:         [],
            querydb:         [],
            params:          [],
            stats:           []
        };
    },

    /**
     * Fetch results.
     */
    fetchResults: function () {
        var intervals = [200, 400, 800, 1200, 2000, 3000, 5000];
        var component = this;

        function poll () {
            $.getJSON(location.pathname + '.json')
                .complete(function (jqXHR) {
                    switch (jqXHR.status) {
                    case 202:
                        var interval;
                        if (intervals.length === 1) {
                            interval = intervals[0];
                        }
                        else {
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
    },

    /**
     * Calls setState after any required modification to responseJSON.
     */
    setStateFromJSON: function(responseJSON) {
        this.lastTimeStamp = Date.now();
        this.setState(responseJSON);
    },

    // Life-cycle methods //
    render: function () {
        return this.isResultAvailable() ?
            this.resultsJSX() : this.loadingJSX();
    },

    /**
     * Called as soon as the page has loaded and the user sees the loading spinner.
     * We use this opportunity to setup services that make use of delegated events
     * bound to the window, document, or body.
     */
    componentDidMount: function () {
        // This sets up an event handler which enables users to select text from
        // hit header without collapsing the hit.
        this.preventCollapseOnSelection();
        this.toggleTable();
    },

    /**
     * Called for the first time after as BLAST results have been retrieved from
     * the server and added to this.state by fetchResults. Only summary overview
     * and circos would have been rendered at this point. At this stage we kick
     * start iteratively adding 1 HSP to the page every 25 milli-seconds.
     */
    componentDidUpdate: function () {
        // Log to console how long the last update take?
        console.log((Date.now() - this.lastTimeStamp)/1000);

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
        }
        else {
            this.componentFinishedUpdating();
        }
    },

    /**
     * Push next slice of results to React for rendering.
     */
    updateState: function() {
        var results = [];
        var numHSPsProcessed = 0;
        while (this.nextQuery < this.state.queries.length) {
            var query = this.state.queries[this.nextQuery];
            // We may see a query multiple times during rendering because only
            // 3 hsps or are rendered in each cycle, but we want to create the
            // corresponding Query component only the first time we see it.
            if (this.nextHit == 0 && this.nextHSP == 0) {
                results.push(<Query key={'Query_'+query.number} query={query}
                    program={this.state.program} querydb={this.state.querydb}
                    showQueryCrumbs={this.state.queries.length > 1}
                    imported_xml={this.state.imported_xml}
                    veryBig={this.state.veryBig} />);
            }

            while (this.nextHit < query.hits.length) {
                var hit = query.hits[this.nextHit];
                // We may see a hit multiple times during rendering because only
                // 10 hsps are rendered in each cycle, but we want to create the
                // corresponding Hit component only the first time we see it.
                if (this.nextHSP == 0) {
                    results.push(<Hit key={'Query_'+query.number+'_Hit_'+hit.number} query={query}
                        hit={hit} algorithm={this.state.program} querydb={this.state.querydb}
                        selectHit={this.selectHit} imported_xml={this.state.imported_xml}
                        showQueryCrumbs={this.state.queries.length > 1}
                        showHitCrumbs={query.hits.length > 1}
                        veryBig={this.state.veryBig}
                        {... this.props} />
                    );
                }

                while (this.nextHSP < hit.hsps.length) {
                    // Get nextHSP and increment the counter.
                    var hsp = hit.hsps[this.nextHSP++];
                    results.push(
                        <HSP key={'Query_'+query.number+'_Hit_'+hit.number+'_HSP_'+hsp.number}
                            query={query} hit={hit} hsp={hsp} algorithm={this.state.program}
                            showHSPNumbers={hit.hsps.length > 1} {... this.props} />
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
            veryBig: this.numUpdates >= 250
        });
    },

    /**
     * Called after all results have been rendered.
     */
    componentFinishedUpdating: function () {
        this.shouldShowIndex() && this.setupScrollSpy();
    },

    /**
     * Returns loading message
     */
    loadingJSX: function () {
        return (
            <div
                className="row">
                <div
                    className="col-md-6 col-md-offset-3 text-center">
                    <h1>
                        <i className="fa fa-cog fa-spin"></i>&nbsp; BLAST-ing
                    </h1>
                    <p>
                        <br/>
                        This can take some time depending on the size of your query and
                        database(s). The page will update automatically when BLAST is
                        done.
                        <br/>
                        <br/>
                        You can bookmark the page and come back to it later or share
                        the link with someone.
                    </p>
                </div>
            </div>
        );
    },

    /**
     * Return results JSX.
     */
    resultsJSX: function () {
        return (
            <div className="row">
                { this.shouldShowSidebar() &&
                    (
                        <div className="col-md-3 hidden-sm hidden-xs">
                            <Sidebar data={this.state} shouldShowIndex={this.shouldShowIndex()}/>
                        </div>
                    )
                }
                <div className={this.shouldShowSidebar() ? 'col-md-9' : 'col-md-12'}>
                    { this.overviewJSX() }
                    { this.circosJSX() }
                    { this.state.results }
                </div>
            </div>
        );
    },

    /**
     * Renders report overview.
     */
    overviewJSX: function () {
        return (
            <div className="overview">
                <p>
                    <strong>SequenceServer {this.state.seqserv_version}</strong> using <strong>{this.state.program_version}</strong>
                    {this.state.submitted_at && `, query submitted on ${this.state.submitted_at}`}
                </p>
                <p>
                    <strong> Databases: </strong>{
                        this.state.querydb.map((db) => { return db.title; }).join(', ')
                    } ({this.state.stats.nsequences} sequences,&nbsp;
                    {this.state.stats.ncharacters} characters)
                </p>
                <p>
                    <strong>Parameters: </strong> {
                        _.map(this.state.params, function (val, key) {
                            return key + ' ' + val;
                        }).join(', ')
                    }
                </p>
                <p>
                    Please cite: <a href="https://doi.org/10.1093/molbev/msz185">https://doi.org/10.1093/molbev/msz185</a>
                </p>
            </div>
        );
    },

    /**
     * Return JSX for circos if we have at least one hit.
     */
    circosJSX: function () {
        return this.atLeastTwoHits()
            ? <Circos queries={this.state.queries}
                program={this.state.program} collapsed="true"/>
            : <span></span>;
    },

    // Controller //

    /**
     * Returns true if results have been fetched.
     *
     * A holding message is shown till results are fetched.
     */
    isResultAvailable: function () {
        return this.state.queries.length >= 1;
    },

    /**
     * Returns true if we have at least one hit.
     */
    atLeastOneHit: function () {
        return this.state.queries.some(query => query.hits.length > 0);
    },

    /**
     * Does the report have at least two hits? This is used to determine
     * whether Circos should be enabled or not.
     */
    atLeastTwoHits: function () {
        var hit_num = 0;
        return this.state.queries.some(query => {
            hit_num += query.hits.length;
            return hit_num > 1;
        });
    },

    /**
     * Returns true if sidebar should be shown.
     *
     * Sidebar is not shown if there is only one query and there are no hits
     * corresponding to the query.
     */
    shouldShowSidebar: function () {
        return !(this.state.queries.length == 1 &&
                 this.state.queries[0].hits.length == 0);
    },

    /**
     * Returns true if index should be shown in the sidebar. Index is shown
     * only for 2 and 8 queries.
     */
    shouldShowIndex: function () {
        var num_queries = this.state.queries.length;
        return num_queries >= 2 && num_queries <= 12;
    },

    /**
     * Prevents folding of hits during text-selection.
     */
    preventCollapseOnSelection: function () {
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
    },

    /* Handling the fa icon when Hit Table is collapsed */
    toggleTable: function () {
        $('body').on('mousedown', '.resultn > .section-content > .table-hit-overview > .caption', function (event) {
            var $this = $(this);
            $this.on('mouseup mousemove', function handler(event) {
                $this.find('i').toggleClass('fa-minus-square-o fa-plus-square-o');
                $this.off('mouseup mousemove', handler);
            });
        });
    },



    /**
     * Affixes the sidebar.
     */
    affixSidebar: function () {
        var $sidebar = $('.sidebar');
        var sidebarOffset = $sidebar.offset()
        if (sidebarOffset) {
            $sidebar.affix({
                offset: {
                    top: sidebarOffset.top
                }
            });
        }
    },

    /**
     * For the query in viewport, highlights corresponding entry in the index.
     */
    setupScrollSpy: function () {
        $('body').scrollspy({target: '.sidebar'});
    },

    /**
     * Event-handler when hit is selected
     * Adds glow to hit component.
     * Updates number of Fasta that can be downloaded
     */
    selectHit: function (id) {

        var checkbox = $('#' + id);
        var num_checked  = $('.hit-links :checkbox:checked').length;

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
        }
        else {
            $hit.removeClass('glow');
            $hit.next('.hsp').removeClass('glow');
        }

        if (num_checked >= 1)
        {
            var $a = $('.download-fasta-of-selected');
            var $b = $('.download-alignment-of-selected');
            $a.find('.text-bold').html(num_checked);
            $b.find('.text-bold').html(num_checked);
        }

        if (num_checked == 0) {
            var $a = $('.download-fasta-of-selected');
            var $b = $('.download-alignment-of-selected');
            $a.addClass('disabled').find('.text-bold').html('');
            $b.addClass('disabled').find('.text-bold').html('');
        }
    },
});

React.render(<Page/>, document.getElementById('view'));
