import './sequenceserver' // for custom $.tooltip function
import React from 'react';
import _ from 'underscore';

import Circos from './circos';
import HitsOverview from './hits_overview';
import LengthDistribution from './length_distribution'; // length distribution of hits
import HSPOverview from './kablammo';
import AlignmentExporter from './alignment_exporter'; // to download textual alignment
import HSP from './hsp';
import './sequence';

import * as Helpers from './visualisation_helpers'; // for toLetters
import Utils from './utils'; // to use as mixin in Hit and HitsTable
import showErrorModal from './error_modal';

/**
 * Dynamically create form and submit.
 */
var downloadFASTA = function (sequence_ids, database_ids) {
    var form = $('<form/>').attr('method', 'post').attr('action', 'get_sequence');
    addField("sequence_ids", sequence_ids);
    addField("database_ids", database_ids);
    form.appendTo('body').submit().remove();

    function addField(name, val) {
        form.append(
            $('<input>').attr('type', 'hidden').attr('name', name).val(val)
        );
    }
}

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
                <div className="container"><Report ref="report"/></div>

                {/* Required by Grapher for SVG and PNG download */}
                <canvas id="png-exporter" hidden></canvas>
            </div>
        );
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
        this.updateCycle = 0;

        return {
            search_id:       '',
            program:         '',
            program_version: '',
            submitted_at:    '',
            num_queries:     0,
            queries:         [],
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
                            component.updateState(jqXHR.responseJSON);
                            break;
                        case 404:
                        case 400:
                        case 500:
                            showErrorModal(jqXHR.responseJSON);
                            break;
                    }
                });
        }

        poll();
    },

    /**
     * Incrementally update state so that the rendering process is
     * not overwhelemed when there are too many queries.
     */
    updateState: function(responseJSON) {
        var queries = responseJSON.queries;

        // Render results for first 50 queries and set flag if total queries is
        // more than 250.
        var numHits = 0;
        responseJSON.veryBig = queries.length > 250;
        //responseJSON.veryBig = !_.every(queries, (query) => {
            //numHits += query.hits.length;
            //return (numHits <= 500);
        //});
        responseJSON.queries = queries.splice(0, 50);
        responseJSON.num_queries = queries.length;
        this.setState(responseJSON);

        // Render results for remaining queries.
        var update = function () {
            if (queries.length > 0) {
                this.setState({
                    queries: this.state.queries.concat(queries.splice(0, 50))
                });
                setTimeout(update.bind(this), 500);
            }
            else {
                this.componentFinishedUpdating();
            }
        };
        setTimeout(update.bind(this), 500);
    },


    // View //
    render: function () {
        return this.isResultAvailable() ?
            this.resultsJSX() : this.loadingJSX();
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
                        <div
                            className="col-md-3 hidden-sm hidden-xs">
                            <SideBar data={this.state} shouldShowIndex={this.shouldShowIndex()}/>
                        </div>
                    )
                }
                <div className={this.shouldShowSidebar() ?
                    'col-md-9' : 'col-md-12'}>
                    { this.overviewJSX() }
                    { this.isHitsAvailable() 
                    ? <Circos queries={this.state.queries}
                        program={this.state.program} collapsed="true"/> 
                    : <span></span> }
                    {
                        _.map(this.state.queries, _.bind(function (query) {
                            return (
                                <Query key={"Query_"+query.id}
                                    program={this.state.program} querydb={this.state.querydb}
                                    query={query} num_queries={this.state.num_queries}
                                    veryBig={this.state.veryBig} selectHit={this.selectHit}/>
                                );
                        }, this))
                    }
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
                <pre className="pre-reset">
                    {this.state.program_version}{this.state.submitted_at
                            && `; query submitted on ${this.state.submitted_at}`}
                    <br/>
                    Databases ({this.state.stats.nsequences} sequences,&nbsp;
                    {this.state.stats.ncharacters} characters): {
                        this.state.querydb.map((db) => { return db.title }).join(", ")
                    }
                    <br/>
                    Parameters: {
                        _.map(this.state.params, function (val, key) {
                            return key + " " + val;
                        }).join(", ")
                    }
                </pre>
            </div>
        );
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

    isHitsAvailable: function () {
        var cnt = 0;
        _.each(this.state.queries, function (query) {
            if(query.hits.length == 0) cnt++;
        });
        return !(cnt == this.state.queries.length);
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
     * Returns true if index should be shown in the sidebar.
     *
     * Index is not shown in the sidebar if there are more than eight queries
     * in total.
     */
    shouldShowIndex: function () {
        return this.state.queries.length <= 8;
    },

    /**
     * Called after first call to render. The results may not be available at
     * this stage and thus results DOM cannot be scripted here, unless using
     * delegated events bound to the window, document, or body.
     */
    componentDidMount: function () {
        // This sets up an event handler which enables users to select text
        // from hit header without collapsing the hit.
        this.preventCollapseOnSelection();
    },

    /**
     * Called after each state change. Only a part of results DOM may be
     * available after a state change.
     */
    componentDidUpdate: function () {
        // We track the number of updates to the component.
        this.updateCycle += 1;

        // Lock sidebar in its position on first update of
        // results DOM.
        if (this.updateCycle === 1 ) this.affixSidebar();
    },

    /**
     * Prevents folding of hits during text-selection, etc.
     */

    /**
     * Called after all results have been rendered.
     */
    componentFinishedUpdating: function () {
        this.shouldShowIndex() && this.setupScrollSpy();
    },

    /**
     * Prevents folding of hits during text-selection.
     */
    preventCollapseOnSelection: function () {
        $('body').on('mousedown', ".hit > .section-header > h4", function (event) {
            var $this = $(this);
            $this.on('mouseup mousemove', function handler(event) {
                if (event.type === 'mouseup') {
                    // user wants to toggle
                    $this.attr('data-toggle', 'collapse');
                    $this.find('.fa-chevron-down').toggleClass('fa-rotate-270');
                } else {
                    // user wants to select
                    $this.attr('data-toggle', '');
                }
                $this.off('mouseup mousemove', handler);
            });
        });
    },

    /**
     * Affixes the sidebar.
     */
    affixSidebar: function () {
        var $sidebar = $('.sidebar');
        $sidebar.affix({
            offset: {
                top: $sidebar.offset().top
            }
        });
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

        var checkbox = $("#" + id);
        var num_checked  = $('.hit-links :checkbox:checked').length;

        if (!checkbox || !checkbox.val()) {
            return;
        }

        var $hit = $(checkbox.data('target'));

        // Highlight selected hit and enable 'Download FASTA/Alignment of
        // selected' links.
        if (checkbox.is(":checked")) {
            $hit.find('.section-content').addClass('glow');
            $('.download-alignment-of-selected').enable();
            $('.download-fasta-of-selected').enable();
        }
        else {
            $hit.find('.section-content').removeClass('glow');
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

/**
 * Renders report for each query sequence.
 *
 * Composed of graphical overview, tabular summary (HitsTable),
 * and a list of Hits.
 */
var Query = React.createClass({

    // Kind of public API //

    /**
     * Returns the id of query.
     */
    domID: function () {
        return "Query_" + this.props.query.number;
    },

    /**
     * Returns number of hits.
     */
    numhits: function () {
        return this.props.query.hits.length;
    },

    // Life cycle methods //

    render: function () {
        return (
            <div className="resultn" id={this.domID()}
                data-query-len={this.props.query.length}
                data-algorithm={this.props.program}>
                <div className="section-header">
                    <h3>
                        Query= {this.props.query.id}
                        &nbsp;
                        <small>
                            {this.props.query.title}
                        </small>
                    </h3>
                    <span
                        className="label label-reset pos-label"
                        title={"Query" + this.props.query.number + "."}
                        data-toggle="tooltip">
                        {this.props.query.number + "/" + this.props.num_queries}
                    </span>
                </div>
                {this.numhits() &&
                    (
                        <div className="section-content">
                            <HitsOverview key={"GO_"+this.props.query.number} query={this.props.query} program={this.props.program} collapsed={this.props.veryBig}/>
                            <LengthDistribution key={"LD_"+this.props.query.id} query={this.props.query} algorithm={this.props.program} collapsed="true"/>
                            <HitsTable key={"HT_"+this.props.query.number} query={this.props.query}/>
                            <div id="hits">
                                {
                                    _.map(this.props.query.hits, _.bind(function (hit) {
                                        return (
                                            <Hit
                                                hit={hit}
                                                key={"HIT_"+hit.number}
                                                algorithm={this.props.program}
                                                querydb={this.props.querydb}
                                                query={this.props.query}
                                                selectHit={this.props.selectHit}/>
                                        );
                                    }, this))
                                }
                            </div>
                        </div>
                    ) || (
                        <div
                            className="section-content">
                            <p>
                                Query length: {this.props.query.length}
                            </p>
                            <br/>
                            <br/>
                            <p>
                                <strong> ****** No hits found ****** </strong>
                            </p>
                        </div>
                    )
                }
            </div>
        )
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        if (!this.props.query) return true;
    }
});

/**
 * Renders summary of all hits per query in a tabular form.
 */
var HitsTable = React.createClass({
    mixins: [Utils],
    render: function () {
        var count = 0,
          hasName = _.every(this.props.query.hits, function(hit) {
            return hit.sciname !== '';
          });

        return (
            <table
                className="table table-hover table-condensed tabular-view">
                <thead>
                    <th className="text-left">#</th>
                    <th>Similar sequences</th>
                    {hasName && <th className="text-left">Species</th>}
                    <th className="text-right">Query coverage (%)</th>
                    <th className="text-right">Total score</th>
                    <th className="text-right">E value</th>
                    <th className="text-right" data-toggle="tooltip"
                        data-placement="left" title="Total identity of all hsps / total length of all hsps">
                        Identity (%)
                    </th>
                </thead>
                <tbody>
                    {
                        _.map(this.props.query.hits, _.bind(function (hit) {
                            return (
                                <tr key={hit.number}>
                                    <td className="text-left">{hit.number + "."}</td>
                                    <td>
                                        <a href={"#Query_" + this.props.query.number + "_hit_" + hit.number}>
                                            {hit.id}
                                        </a>
                                    </td>
                                    {hasName && <td className="text-left">{hit.sciname}</td>}
                                    <td className="text-right">{hit.qcovs}</td>
                                    <td className="text-right">{hit.score}</td>
                                    <td className="text-right">{this.inExponential(hit.hsps[0].evalue)}</td>
                                    <td className="text-right">{hit.identity}</td>
                                </tr>
                            )
                        }, this))
                    }
                </tbody>
            </table>
        );
    }
});

/**
 * Component for each hit.
 */
var Hit = React.createClass({
    mixins: [Utils],

    /**
     * Returns accession number of the hit sequence.
     */
    accession: function () {
        return this.props.hit.accession;
    },

    /**
     * Returns length of the hit sequence.
     */
    length: function () {
        return this.props.hit.length;
    },

    // Internal helpers. //

    /**
     * Returns id that will be used for the DOM node corresponding to the hit.
     */
    domID: function () {
        return "Query_" + this.props.query.number + "_hit_" + this.props.hit.number;
    },

    databaseIDs: function () {
        return _.map(this.props.querydb, _.iteratee('id'));
    },

    showSequenceViewer: function (event) {
        this.setState({ showSequenceViewer: true });
        event && event.preventDefault();
    },

    hideSequenceViewer: function () {
        this.setState({ showSequenceViewer: false });
    },

    viewSequenceLink: function () {
        return encodeURI(`get_sequence/?sequence_ids=${this.accession()}&database_ids=${this.databaseIDs()}`);
    },

    downloadFASTA: function (event) {
        var accessions = [this.accession()];
        downloadFASTA(accessions, this.databaseIDs());
    },

    // Event-handler for exporting alignments.
    // Calls relevant method on AlignmentExporter defined in alignment_exporter.js.
    downloadAlignment: function (event) {
        var hsps = _.map(this.props.hit.hsps, _.bind(function (hsp) {
            hsp.query_id = this.props.query.id;
            hsp.hit_id = this.props.hit.id;
            return hsp;
        }, this))

        var aln_exporter = new AlignmentExporter();
        aln_exporter.export_alignments(hsps, this.props.query.id+"_"+this.props.hit.id);
    },


    // Life cycle methods //

    getInitialState: function () {
        return { showSequenceViewer: false };
    },

    // Return JSX for view sequence button.
    viewSequenceButton: function () {
        if (this.length() > 10000) {
            return (
                <button
                    className="btn btn-link view-sequence disabled"
                    title="Sequence too long" disabled="true">
                    <i className="fa fa-eye"></i> Sequence
                </button>
            );
        }
        else {
            return (
                <button
                    className="btn btn-link view-sequence"
                    onClick={this.showSequenceViewer}>
                    <i className="fa fa-eye"></i> Sequence
                </button>
            );
        }
    },

    render: function () {
        return (
            <div className="hit" id={this.domID()}
                data-hit-def={this.props.hit.id} data-hit-evalue={this.props.hit.evalue}
                data-hit-len={this.props.hit.length}>
                <div className="section-header">
                    <h4 data-toggle="collapse"
                        data-target={this.domID() + "_content"}>
                        <i className="fa fa-chevron-down"></i>
                        &nbsp;
                        <span>
                            {this.props.hit.id}
                            &nbsp;
                            <small>
                                {this.props.hit.title}
                            </small>
                        </span>
                    </h4>
                    <span className="label label-reset pos-label"
                        title={"Query " + this.props.query.number + ". Hit "
                              + this.props.hit.number + " of "
                              + this.props.query.hits.length + "."}
                      data-toggle="tooltip">
                      {this.props.hit.number + "/" + this.props.query.hits.length}
                    </span>
                </div>
                <div id={this.domID() + "_content"}
                    className="section-content collapse in">
                    { this.hitLinks() }
                    <HSPOverview key={"kablammo"+this.props.query.id}
                        query={this.props.query} hit={this.props.hit}
                        algorithm={this.props.algorithm}/>
                    { this.hspListJSX() }
                </div>
            </div>
        );
    },

    hitLinks: function () {
        return (
            <div className="hit-links">
                <label>
                    <input type="checkbox" id={this.domID() + "_checkbox"}
                        value={this.accession()} onChange={function () {
                            this.props.selectHit(this.domID() + "_checkbox");
                        }.bind(this)} data-target={'#' + this.domID()}
                    /> Select
                </label>
                |
                { this.viewSequenceButton() }
                {
                    this.state.showSequenceViewer && <SequenceViewer
                        url={this.viewSequenceLink()} onHide={this.hideSequenceViewer}/>
                }
                |
                <button className='btn btn-link download-fa'
                    onClick={this.downloadFASTA}>
                    <i className="fa fa-download"></i> FASTA
                </button>
                |
                <button className='btn btn-link download-aln'
                    onClick={this.downloadAlignment}>
                    <i className="fa fa-download"></i> Alignment
                </button>
                {
                    _.map(this.props.hit.links, _.bind(function (link) {
                        return [<span> | </span>, this.a(link)];
                    }, this))
                }
            </div>
        );
    },

    hspListJSX: function () {
        return <div className="hsps">
            {
                this.props.hit.hsps.map((hsp) => {
                    return <HSP key={hsp.number}
                        algorithm={this.props.algorithm}
                        queryNumber={this.props.query.number}
                        hitNumber={this.props.hit.number} hsp={hsp}/>
                }, this)
            }
        </div>
    }
});


/**
 * Component for sequence-viewer links.
 */
var SequenceViewer = (function () {

    var Viewer = React.createClass({

        /**
         * The CSS class name that will be assigned to the widget container. ID
         * assigned to the widget container is derived from the same.
         */
        widgetClass: 'biojs-vis-sequence',

        // Lifecycle methods. //

        render: function () {
            this.widgetID =
                this.widgetClass + '-' + (new Date().getUTCMilliseconds());

            return (
                <div
                    className="fastan">
                    <div
                        className="section-header">
                        <h4>
                            {this.props.sequence.id}
                            <small>
                                &nbsp; {this.props.sequence.title}
                            </small>
                        </h4>
                    </div>
                    <div
                        className="section-content">
                        <div
                            className={this.widgetClass} id={this.widgetID}>
                        </div>
                    </div>
                </div>
            );
        },

        componentDidMount: function () {
            // attach BioJS sequence viewer
            var widget = new Sequence({
                sequence: this.props.sequence.value,
                target: this.widgetID,
                format: 'PRIDE',
                columns: {
                    size: 40,
                    spacedEach: 0
                },
                formatOptions: {
                    title: false,
                    footer: false
                }
            });
            widget.hideFormatSelector();
        }
    });

    return React.createClass({

        // Kind of public API. //

        /**
         * Shows sequence viewer.
         */
        show: function () {
            this.modal().modal('show');
        },


        // Internal helpers. //

        modal: function () {
            return $(React.findDOMNode(this.refs.modal));
        },

        resultsJSX: function () {
            return (
                <div className="modal-body">
                    {
                        _.map(this.state.error_msgs, _.bind(function (error_msg) {
                            return (
                                <div
                                    className="fastan">
                                    <div
                                        className="section-header">
                                        <h4>
                                            {error_msg[0]}
                                        </h4>
                                    </div>
                                    <div
                                        className="section-content">
                                        <pre
                                            className="pre-reset">
                                            {error_msg[1]}
                                        </pre>
                                    </div>
                                </div>
                            );
                        }, this))
                    }
                    {
                        _.map(this.state.sequences, _.bind(function (sequence) {
                            return (<Viewer sequence={sequence}/>);
                        }, this))
                    }
                </div>
            );
        },

        loadingJSX: function () {
            return (
                <div className="modal-body text-center">
                    <i className="fa fa-spinner fa-3x fa-spin"></i>
                </div>
            );
        },


        // Lifecycle methods. //

        getInitialState: function () {
            return {
                error_msgs: [],
                sequences:  [],
                requestCompleted: false
            };
        },

        render: function () {
            return (
                <div
                    className="modal sequence-viewer"
                    ref="modal" tabIndex="-1">
                    <div
                        className="modal-dialog">
                        <div
                            className="modal-content">
                            <div
                                className="modal-header">
                                <h3>View sequence</h3>
                            </div>

                            { this.state.requestCompleted &&
                                    this.resultsJSX() || this.loadingJSX() }
                        </div>
                    </div>
                </div>
            );
        },

        componentDidMount: function () {
            // Display modal with a spinner.
            this.show();

            // Fetch sequence and update state.
            $.getJSON(this.props.url)
                .done(_.bind(function (response) {
                    this.setState({
                        sequences: response.sequences,
                        error_msgs: response.error_msgs,
                        requestCompleted: true
                    })
                }, this))
                .fail(function (jqXHR, status, error) {
                    showErrorModal(jqXHR, function () {
                        this.hide();
                    });
                });

            this.modal().on('hidden.bs.modal', this.props.onHide);
        },
    });
})();

/**
 * Renders links for downloading hit information in different formats.
 * Renders links for navigating to each query.
 */
var SideBar = React.createClass({

    /**
     * Event-handler for downloading fasta of all hits.
     */
    downloadFastaOfAll: function () {
        var sequence_ids = $('.hit-links :checkbox').map(function () {
            return this.value;
        }).get();
        var database_ids = _.map(this.props.data.querydb, _.iteratee('id'));
        downloadFASTA(sequence_ids, database_ids);
    },

    /**
     * Handles downloading fasta of selected hits.
     */
    downloadFastaOfSelected: function () {
        var sequence_ids = $('.hit-links :checkbox:checked').map(function () {
            return this.value;
        }).get();
        var database_ids = _.map(this.props.data.querydb, _.iteratee('id'));
        downloadFASTA(sequence_ids, database_ids);
    },

    downloadAlignmentOfAll: function() {
        var sequence_ids = $('.hit-links :checkbox').map(function () {
            return this.value;
        }).get();
        var hsps_arr = [];
        var aln_exporter = new AlignmentExporter();
        _.each(this.props.data.queries, _.bind(function (query) {
            _.each(query.hits, function (hit) {
                _.each(hit.hsps, function (hsp) {
                    hsp.hit_id = hit.id;
                    hsp.query_id = query.id;
                    hsps_arr.push(hsp);
                })
            })
        }, this));
        console.log('len '+hsps_arr.length);
        aln_exporter.export_alignments(hsps_arr, "alignment-"+sequence_ids.length+"_hits");
    },

    downloadAlignmentOfSelected: function () {
        var sequence_ids = $('.hit-links :checkbox:checked').map(function () {
            return this.value;
        }).get();
        var hsps_arr = [];
        var aln_exporter = new AlignmentExporter();
        console.log('check '+sequence_ids.toString());
        _.each(this.props.data.queries, _.bind(function (query) {
            _.each(query.hits, function (hit) {
                if (_.indexOf(sequence_ids, hit.accession) != -1) {
                    _.each(hit.hsps, function (hsp) {
                        hsp.hit_id = hit.id;
                        hsp.query_id = query.id;
                        hsps_arr.push(hsp);
                    });
                }
            });
        }, this));
        aln_exporter.export_alignments(hsps_arr, "alignment-"+sequence_ids.length+"_hits");
    },


    // JSX //
    render: function () {
        return (
            <div className="sidebar">
                { this.props.shouldShowIndex && this.index() }
                { this.downloads() }
            </div>
        )
    },

    index: function () {
        return (
            <div className="index">
                <div
                  className="section-header">
                  <h4>
                      { this.summary() }
                  </h4>
                </div>
                <ul
                    className="nav hover-reset active-bold">
                    {
                        _.map(this.props.data.queries, _.bind(function (query) {
                            return (
                                <li key={"Side_bar_"+query.id}>
                                    <a
                                        className="nowrap-ellipsis hover-bold"
                                        href={"#Query_" + query.number}
                                        title={"Query= " + query.id + ' ' + query.title}>
                                        {"Query= " + query.id}
                                    </a>
                                </li>
                            );
                        }, this))
                    }
                </ul>
            </div>
        );
    },

    summary: function () {
        var program = this.props.data.program;
        var numqueries = this.props.data.queries.length;
        var numquerydb = this.props.data.querydb.length;

        return (
            program.toUpperCase() + ': ' +
            numqueries + ' ' + (numqueries > 1 ? 'queries' : 'query') + ", " +
            numquerydb + ' ' + (numquerydb > 1 ? 'databases' : 'database')
        );
    },

    downloads: function () {
        return (
            <div className="downloads">
                <div
                    className="section-header">
                    <h4>
                        Download FASTA, XML, TSV
                    </h4>
                </div>
                <ul
                    className="nav">
                    <li>
                        <a
                            className="download-fasta-of-all"
                            onClick={this.downloadFastaOfAll}>
                            FASTA of all hits
                        </a>
                    </li>
                    <li>
                        <a
                            className="download-fasta-of-selected disabled"
                            onClick={this.downloadFastaOfSelected}>
                            FASTA of <span className="text-bold"></span> selected hit(s)
                        </a>
                    </li>
                    <li>
                        <a
                            className="download-alignment-of-all"
                            onClick={this.downloadAlignmentOfAll}>
                            Alignment of all hits
                        </a>
                    </li>
                    <li>
                        <a
                            className="download-alignment-of-selected disabled"
                            onClick={this.downloadAlignmentOfSelected}>
                            Alignment of <span className="text-bold"></span> selected hit(s)
                        </a>
                    </li>
                    <li>
                        <a
                            className="download" data-toggle="tooltip"
                            title="15 columns: query and subject ID; scientific
                            name, alignment length, mismatches, gaps, identity,
                            start and end coordinates, e value, bitscore, query
                            coverage per subject and per HSP."
                            href={"download/" + this.props.data.search_id + ".std_tsv"}>
                            Standard tabular report
                        </a>
                    </li>
                    <li>
                        <a
                            className="download" data-toggle="tooltip"
                            title="44 columns: query and subject ID, GI,
                            accessions, and length; alignment details;
                            taxonomy details of subject sequence(s) and
                            query coverage per subject and per HSP."
                            href={"download/" + this.props.data.search_id + ".full_tsv"}>
                            Full tabular report
                        </a>
                    </li>
                    <li>
                        <a
                            className="download" data-toggle="tooltip"
                            title="Results in XML format."
                            href={"download/" + this.props.data.search_id + ".xml"}>
                            Full XML report
                        </a>
                    </li>
                </ul>
            </div>
        );
    },
});

React.render(<Page/>, document.getElementById('view'));
