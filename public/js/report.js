import _ from 'underscore';
import React from 'react';
import d3 from 'd3';

import './graphicaloverview';
import './kablammo';
import './sequence';


/**
 * Pretty formats number
 */
var Utils = {

    /**
     * Prettifies numbers and arrays.
     */
    prettify: function (data){
        if (this.isTuple(data)) {
            return this.prettify_tuple(data);
        }
        if (this.isFloat(data)) {
            return this.prettify_float(data);
        }
        return data
    },

    /**
     * Formats float as "a.bc" or "a x b^c". The latter if float is in
     * scientific notation. Former otherwise.
     */
    prettify_float: function (data) {
        var matches = data.toString().split("e");
        var base  = matches[0];
        var power = matches[1];

        if (power)
        {
            var s = parseFloat(base).toFixed(2);
            var element = <span>{s} &times; 10<sup>{power}</sup></span>;
            return element;
        }
        else {
            if(!(base % 1==0))
                return parseFloat(base).toFixed(2);
            else
                return base;
        }
    },

    // Formats an array of two elements as "first (last)".
    prettify_tuple: function (tuple) {
        return (tuple[0] + " (" + tuple[tuple.length - 1] + ")");
    },

    // Checks if data is an array.
    isTuple: function (data) {
        return (Array.isArray(data) && data.length == 2)
    },

    // Checks if data if float.
    isFloat: function (data) {
        return (typeof(data) == 'number' ||
                (typeof(data) == 'string' &&
                    data.match(/(\d*\.\d*)e?([+-]\d+)?/)))
    },

    /**
     * Render URL for sequence-viewer.
     */
    a: function (link , hitlength) {
        if (link.title && link.url)
        {
            return (
                <a href={link.url} className={link.class} target='_blank'>
                    {link.icon && <i className={"fa " + link.icon}></i>}
                    {" " + link.title + " "}
                </a>
            );
        }
    },

    /**
     * Returns fraction as percentage
     */
    inPercentage: function (num , den) {
        return (num * 100.0 / den).toFixed(2);
    },

    /**
     * Returns fractional representation as String.
     */
    inFraction: function (num , den) {
        return num + "/" + den;
    },

    /**
     * Returns given Float as String formatted to two decimal places.
     */
    inTwoDecimal: function (num) {
        return parseFloat(num).toFixed(2)
    },

    /**
     * Formats the given number as "1e-3" if the number is less than 1 or
     * greater than 10.
     */
    inScientificOrTwodecimal: function (num) {
        if(num >= 1 && num < 10)
        {
            return this.inTwoDecimal(num)
        }
        return num.toExponential(2);
    },

};

/**
 * Renders Kablammo visualization
 *
 * JSON received from server side is modified as JSON expected by kablammo's
 * graph.js.  All the relevant information including a SVG container where
 * visual needs to be rendered, is delegated to graph.js. graph.js renders
 * kablammo visualization and has all event handlers for events performed on
 * the visual.
 *
 * Event handlers related to downloading and viewing of alignments and images
 * have been extracted from grapher.js and interface.js and directly included
 * here.
 */
var Kablammo = (function () {

    var SEQ_TYPES = {
        blastn: {
            query_seq_type:   'nucleic_acid',
            subject_seq_type: 'nucleic_acid'
        },
        blastp: {
            query_seq_type:   'amino_acid',
            subject_seq_type: 'amino_acid'
        },
        blastx: {
            query_seq_type:   'nucleic_acid',
            subject_seq_type: 'amino_acid'
        },
        tblastx: {
            query_seq_type:   'nucleic_acid',
            subject_seq_type: 'nucleic_acid'
        },
        tblastn: {
            query_seq_type:   'amino_acid',
            subject_seq_type: 'nucleic_acid'
        }
    };

    /**
     * Mock Kablammo's grapher.js.
     */
    var grapher = {
        use_complement_coords: false,

        /**
         * Coverts colour from RGBA to RGB.
         *
         * Taken from grapher.js.
         */
        _rgba_to_rgb: function (rgba, matte_rgb) {

            // Algorithm taken from http://stackoverflow.com/a/2049362/1691611.
            var normalize = function (colour) {
                return colour.map(function (channel) { return channel / 255; });
            };

            var denormalize = function (colour) {
                return colour.map(function (channel) { return Math.round(Math.min(255, channel * 255)); });;
            };

            var norm = normalize(rgba.slice(0, 3));
            matte_rgb = normalize(matte_rgb);
            var alpha = rgba[3] / 255;

            var rgb = [
                (alpha * norm[0]) + (1 - alpha) * matte_rgb[0],
                (alpha * norm[1]) + (1 - alpha) * matte_rgb[1],
                (alpha * norm[2]) + (1 - alpha) * matte_rgb[2],
            ];

            return denormalize(rgb);
        },

        /**
         * Determines colour of a hsp based on normalized bit-score.
         *
         * Taken from grapher.js
         */
        determine_colour: function (level) {
            var graph_colour = { r: 30, g: 139, b: 195 };
            var matte_colour = { r: 255, g: 255, b: 255 };
            var min_opacity = 0.3;
            var opacity = ((1 - min_opacity) * level) + min_opacity;
            var rgb = this._rgba_to_rgb([
                graph_colour.r,
                graph_colour.g,
                graph_colour.b,
                255 * opacity
            ], [
                matte_colour.r,
                matte_colour.g,
                matte_colour.b,
            ]);
            return 'rgb(' + rgb.join(',') + ')';
        },
    };

    return React.createClass({
        mixins: [Utils],

        // Internal helpers. //

        /**
         * Adapter to convert server-side JSON into a form expected by Kablammo.
         * This is done by changing keys of JSON.
         */
        toKablammo: function (hsps, query) {
            var maxBitScore = query.hits[0].hsps[0].bit_score;

            var hspKeyMap = {
                'qstart':  'query_start',
                'qend':    'query_end',
                'qframe':  'query_frame' ,
                'sstart':  'subject_start',
                'send':    'subject_end',
                'sframe':  'subject_frame',
                'length':  'alignment_length',
                'qseq':    'query_seq',
                'sseq':    'subject_seq',
                'midline': 'midline_seq'
            };
            return _.map(hsps, function (hsp) {
                var _hsp = {};
                $.each(hsp, function (key, value) {
                    key = hspKeyMap[key] || key;
                    _hsp[key] = value;
                    _hsp.normalized_bit_score = hsp.bit_score / maxBitScore;
                })
                return _hsp;
            });
        },

        /**
         * Returns jQuery wrapped element that should hold Kablammo's svg.
         */
        svgContainer: function () {
            return $(React.findDOMNode(this.refs.svgContainer));
        },

        isHspSelected: function (index , selected) {
            return index in selected
        },

        /**
         * Event-handler for viewing alignments.
         * Calls relevant method on AlignmentViewer defined in alignment_viewer.js.
         */
        showAlignment: function (hsps, query_seq_type, query_def, query_id, subject_seq_type, subject_def, subject_id) {
            event.preventDefault();
            aln_viewer = new AlignmentViewer();
            aln_viewer.view_alignments(hsps, query_seq_type, query_def, query_id, subject_seq_type, subject_def, subject_id);
        },

        // Life-cycle methods //

        render: function () {
            return (
                <div ref="svgContainer">
                </div>
            );
        },

        /**
         * Invokes Graph method defined in graph.js to render kablammo visualization.
         * Also defines event handler for hovering on HSP polygon.
         */
        componentDidMount: function (event) {
            var hsps = this.toKablammo(this.props.hit.hsps, this.props.query);
            var svgContainer = this.svgContainer();

            Graph.prototype._canvas_width = svgContainer.width();

            this._graph = new Graph(
                grapher,
                SEQ_TYPES[this.props.algorithm],
                this.props.query.id + ' ' + this.props.query.title,
                this.props.query.id,
                this.props.hit.id + ' ' + this.props.hit.title,
                this.props.hit.id,
                this.props.query.length,
                this.props.hit.length,
                hsps,
                svgContainer
            );

            // Disable hover handlers and show alignment on selecting hsp.
            var selected = {}
            var polygons = d3.select(svgContainer[0]).selectAll('polygon');
            polygons
            .on('mouseenter', null)
            .on('mouseleave', null)
            .on('click', _.bind(function (clicked_hsp , clicked_index) {
                if(!this.isHspSelected(clicked_index , selected)) {
                    selected[clicked_index] = hsps[clicked_index];
                    var polygon = polygons[0][clicked_index];
                    polygon.parentNode.appendChild(polygon);
                    d3.select(polygon).classed('selected', true);
                    $("#Alignment_Query_" + this.props.query.number + "_hit_" + this.props.hit.number + "_" + (clicked_index + 1)).show();
                }
                else {
                    delete selected[clicked_index];
                    var polygon = polygons[0][clicked_index];
                    var firstChild = polygon.parentNode.firstChild;
                    if (firstChild) {
                        polygon.parentNode.insertBefore(polygon, firstChild);
                    }
                    d3.select(polygon).classed('selected', false);
                    $("#Alignment_Query_" + this.props.query.number + "_hit_" + this.props.hit.number + "_" + (clicked_index + 1)).hide();
                }
            }, this))
        },
    });
})();

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
                        className="page-header">
                        <h4>
                            {this.props.sequence.id}
                            <small>
                                &nbsp; {this.props.sequence.title}
                            </small>
                        </h4>
                    </div>
                    <div
                        className="page-content">
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
                    spacedEach: 5
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

        /**
         * Hides sequence viewer.
         */
        hide: function () {
            this.modal().modal('hide');
        },


        // Internal helpers. //

        modal: function () {
            return $('#sequence-viewer');
        },

        spinner: function () {
            return $(React.findDOMNode(this.refs.spinner));
        },

        renderErrors: function () {
            return (
                _.map(this.state.error_msgs, _.bind(function (error_msg) {
                    return (
                        <div
                            className="fastan">
                            <div
                                className="page-header">
                                <h4>
                                    {error_msg[0]}
                                </h4>
                            </div>
                            <div
                                className="page-content">
                                <pre
                                    className="pre-reset">
                                    {error_msg[1]}
                                </pre>
                            </div>
                        </div>
                    );
                }, this))
            );
        },

        renderSequences: function () {
            return (
                _.map(this.state.sequences, _.bind(function (sequence) {
                    return (<Viewer sequence={sequence}/>);
                }, this))
            );
        },


        // Lifecycle methods. //

        getInitialState: function () {
            return {
                error_msgs: [],
                sequences:  []
            };
        },

        render: function () {
            return (
                <div
                    className="modal-dialog">
                    <div
                        className="modal-content">
                        <div
                            className="modal-header">
                            <h3>View sequence</h3>
                        </div>

                        <div
                            className="modal-body">
                            { this.renderErrors() }
                            { this.renderSequences() }
                        </div>

                        <div
                            className="spinner" ref="spinner">
                            <i className="fa fa-spinner fa-3x fa-spin"></i>
                        </div>
                    </div>
                </div>
            );
        },

        componentDidMount: function () {
            var $anchor = $(event.target).closest('a');

            if (!$anchor.is(':disabled')) {
                this.show();

                var url = $anchor.attr('href');
                $.getJSON(url)
                .done(_.bind(function (response) {
                    this.setState({
                        error_msgs: response.error_msgs,
                        sequences:  response.sequences
                    })
                    this.spinner().hide();
                }, this))
                .fail(function (jqXHR, status, error) {
                    SequenceServer.showErrorModal(jqXHR, function () {
                        this.hide();
                    });
                });
            }
        },
    });
})();

/**
 * Component for each hit.
 */
var Hit = React.createClass({
    mixins: [Utils],

    // Internal helpers. //

    /**
     * Returns id that will be used for the DOM node corresponding to the hit.
     */
    domID: function () {
        return "Query_" + this.props.query.number + "_hit_" + this.props.hit.number;
    },

    /**
     * Return prettified stats for the given hsp and based on the BLAST
     * algorithm.
     */
    getStats: function (hsp) {
        var stats = {
            'Score': [
                this.inTwoDecimal(hsp.bit_score),
                hsp.score
            ],

            'E value': this.inScientificOrTwodecimal(hsp.evalue),

            'Identities': [
                this.inFraction(hsp.identity, hsp.length),
                this.inPercentage(hsp.identity, hsp.length)
            ],

            'Gaps': [
                this.inFraction(hsp.gaps, hsp.length),
                this.inPercentage(hsp.gaps, hsp.length)
            ],

            'Coverage': hsp.qcovhsp
        };

        switch (this.props.algorithm) {
        case 'tblastx':
            _.extend(stats, {
                'Frame': in_fraction(hsp.qframe, hsp.sframe)
            });
            // fall-through
        case 'blastp':
            _.extend(stats, {
                'Positives': [
                    this.inFraction(hsp.positives, hsp.length),
                    this.inPercentage(hsp.positives, hsp.length)
                ]
            });
            break;
        case 'blastn':
            _.extend(stats, {
                'Strand': (hsp.qframe > 0 ? '+' : '-') +
                          "/"                          +
                          (hsp.sframe > 0 ? '+' : '-')
            });
            break;
        case 'blastx':
            _.extend(stats, {
                'Query Frame': hsp.qframe
            });
            break;
        case 'tblastn':
            _.extend(stats, {
                'Hit Frame': hsp.sframe
            });
            break;
        }

        return stats;
    },

     // Life cycle methods //


    /**
     * Handles click event for exporting alignments.
     * Disables Sequenece viewer if hit length is greater than 10,000.
     */
    componentDidMount: function () {
        //Disable sequence-viewer link if hit length is greater than 10,000
        if (this.props.hit.length > 10000) {
            $("#" + this.domID()).find(".view-sequence").addClass('disabled');
        }

        // Event-handler for exporting alignments.
        // Calls relevant method on AlignmentExporter defined in alignment_exporter.js.
        $("#" + this.domID()).find('.export-alignment').on('click',_.bind(function () {
            event.preventDefault();

            var hsps = _.map(this.props.hit.hsps, function (hsp) {
                hsp['query_seq'] = hsp.qseq;
                hsp['subject_seq'] = hsp.sseq;
                return hsp;
            })

            var aln_exporter = new AlignmentExporter();
            aln_exporter.export_alignments(hsps, this.props.query.id + this.props.query.title,
                                           this.props.query.id, this.props.hit.id + this.props.hit.title,
                                           this.props.hit.id);
        }, this))
    },

    render: function () {
        // NOTE:
        //   Adding 'subject' class to hit container is important for
        //   Kablammo's ImageExporter to work.
        return (
            <div
                className="hitn subject" id={this.domID()}
                data-hit-def={this.props.hit.id} data-hit-evalue={this.props.hit.evalue}
                data-hit-len={this.props.hit.length}>
                <div
                  className="page-header">
                    <h4
                      data-toggle="collapse"
                      data-target={ "#Query_" + this.props.query.number + "_hit_"
                                     + this.props.hit.number + "_alignment"} >
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
                    <span
                      className="label label-reset pos-label"
                      title={"Query " + this.props.query.number + ". Hit "
                              + this.props.hit.number + " of "
                              + this.props.query.hits.length + "."}
                      data-toggle="tooltip">
                      {this.props.hit.number + "/" + this.props.query.hits.length}
                    </span>
                </div>
                <div
                    className="page-content collapse in"
                    id={"Query_" + this.props.query.number + "_hit_"
                        + this.props.hit.number + "_alignment"}>
                    <div
                        className="hit-links">
                        <label>
                            <input
                                type="checkbox" id={this.domID() + "_checkbox"}
                                value={this.props.hit.id}
                                data-target={"#Query_" + this.props.query.number
                                             + "_hit_" + this.props.hit.number}
                                onChange=
                                {
                                    _.bind(function () {
                                        this.props.selectHit(this.domID() + "_checkbox");
                                    }, this)
                                }
                            />
                            <span>{" Select "}</span>
                            {
                                _.map(this.props.hit.links, _.bind(function (link) {
                                    return [<span> | </span>, this.a(link)];
                                }, this))
                            }
                        </label>
                    </div>
                    <br/>
                    <Kablammo query={this.props.query} hit={this.props.hit} algorithm={this.props.algorithm}/>
                    <table
                      className="table hsps">
                        <tbody>
                            {
                                _.map (this.props.hit.hsps, _.bind( function (hsp) {
                                    stats_returned = this.getStats(hsp);
                                    return (
                                        <tr
                                          id={"Alignment_Query_" + this.props.query.number + "_hit_"
                                                  + this.props.hit.number + "_" + hsp.number}
                                          style={{display:'none'}}>
                                            <td>
                                                {hsp.number + "."}
                                            </td>
                                            <td
                                                style={{width: "100%"}}>
                                                <div
                                                    className="hsp"
                                                    id={"Query_" + this.props.query.number + "_hit_"
                                                         + this.props.hit.number + "_" + hsp.number}
                                                    data-hsp-evalue={hsp.evalue}
                                                    data-hsp-start={hsp.qstart}
                                                    data-hsp-end={hsp.qend}
                                                    data-hsp-frame={hsp.sframe}>
                                                    <table
                                                      className="table table-condensed hsp-stats">
                                                        <thead>
                                                        {
                                                            _.map(stats_returned, function (value , key) {
                                                                return(<th>{key}</th>);
                                                            })
                                                        }
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                {
                                                                    _.map(stats_returned, _.bind(function (value , key) {
                                                                        return(<th>{this.prettify(value)}</th>);
                                                                    }, this))
                                                                }
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <div className="alignment">{hsp.pp}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }, this))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
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
            return hit.sciname !== "-";
          });

        return(
            <table
              className="table table-hover table-condensed tabular-view">
                <thead>
                    <th className="text-left"> Number </th>
                    <th>Sequences producing significant alignments</th>
                     {hasName && <th className="text-left"> Scientific name </th>}
                    <th className="text-right"> Total score </th>
                    <th className="text-right"> E value </th>
                    <th className="text-right"> Coverage </th>
                    <th className="text-right"> Length </th>
                </thead>
                <tbody>
                    {
                        _.map(this.props.query.hits, _.bind(function (hit) {
                            return (
                                <tr>
                                    <td className="text-left">{hit.number + "."}</td>
                                    <td>
                                        <a href={"#Query_" + this.props.query.number + "_hit_" + hit.number}>
                                            {hit.id}
                                        </a>
                                    </td>

                                    {hasName && <td className="text-left">{this.prettify(hit.sciname)}</td>}
                                    <td className="text-right">{this.prettify(hit.score)}</td>
                                    <td className="text-right">{this.prettify(hit.evalue)}</td>
                                    <td className="text-right">{this.prettify(hit.qcovs)}</td>
                                    <td className="text-right">{this.prettify(hit.length)}</td>
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
 * Component for graphical-overview per query.
 */

var GraphicalOverview = React.createClass({

    // Internal helpers. //

    /**
     * Converts data into form accepted by graphical overview.
     */
    toGraph : function (query_hits,number) {
        var hits = [];
        query_hits.map(function (hit) {
            var _hsps = [];
            var hsps = hit.hsps;
            _.each(hsps, function (hsp) {
                var _hsp = {};
                _hsp.hspEvalue = hsp.evalue;
                _hsp.hspStart = hsp.qstart;
                _hsp.hspEnd = hsp.qend;
                _hsp.hspFrame = hsp.sframe;
                _hsp.hspId = "Query_"+number+"_hit_"+hit.number+"_hsp_"+hsp.number;
                _hsps.push(_hsp);
            });
            _hsps.hitId = hit.id;
            _hsps.hitDef = "Query_"+number+"_hit_"+hit.number;
            _hsps.hitEvalue = hit.evalue;
            hits.push(_hsps);
        });
        return hits;
    },

    /**
     * Returns jQuery wrapped element that should hold graphical overview's
     * svg.
     */
    svgContainer: function () {
        return $(React.findDOMNode(this.refs.svgContainer));
    },


    // Life-cycle methods //

    render: function () {
        return (
            <div
                className="graphical-overview"
                ref="svgContainer">
            </div>
        );
    },

    componentDidMount: function () {
        var hits = this.toGraph(this.props.query.hits, this.props.query.number);
        $.graphIt(this.svgContainer().parent().parent(), this.svgContainer(), 0, 20, null, hits);
    }
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
        // NOTE:
        //   Adding 'subject' class to query container is required by
        //   ImageExporter.
        return (
            <div
                className="resultn subject" id={this.domID()}
                data-query-len={this.props.query.length}
                data-algorithm={this.props.data.program}>
                <div
                    className="page-header">
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
                        {this.props.query.number + "/" + this.props.data.queries.length}
                    </span>
                </div>
                {this.numhits() &&
                    (
                        <div
                            className="page-content">
                            <div
                                className="hit-links">
                                <a href = "#" className="export-to-svg">
                                    <i className="fa fa-download"/>
                                    <span>{"  SVG  "}</span>
                                </a>
                                <span>{" | "}</span>
                                <a href = "#" className="export-to-png">
                                    <i className="fa fa-download"/>
                                    <span>{"  PNG  "}</span>
                                </a>
                            </div>
                            <GraphicalOverview query={this.props.query} program={this.props.data.program}/>
                            <HitsTable query={this.props.query}/>
                            <div
                                id="hits">
                                {
                                    _.map(this.props.query.hits, _.bind(function (hit) {
                                        return (
                                            <Hit
                                                hit={hit}
                                                algorithm={this.props.data.program}
                                                query={this.props.query}
                                                selectHit={this.props.selectHit}/>
                                        );
                                    }, this))
                                }
                            </div>
                        </div>
                    ) || (
                        <div
                            className="page-content">
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
});


/**
 * Renders links for downloading hit information in different formats.
 * Renders links for navigating to each query.
 */
var SideBar = React.createClass({

    /**
     * generates URI for downloading fasta of hits.
     */
    generateURI: function (sequence_ids, database_ids) {
         // Encode URIs against strange characters in sequence ids.
        sequence_ids = encodeURIComponent(sequence_ids.join(' '));
        database_ids = encodeURIComponent(database_ids);

        var url = "get_sequence/?sequence_ids=" + sequence_ids +
            "&database_ids=" + database_ids + '&download=fasta';

        return url;
    },

    /**
     * Event-handler for downloading fasta of all hits.
     */
    downloadFastaOfAll: function () {
        var num_hits = $('.hitn').length;

        var $a = $('.download-fasta-of-all');
        if (num_hits >= 1 && num_hits <= 30) {
            var sequence_ids = $('.hit-links :checkbox').map(function () {
                return this.value;
            }).get();
            $a
            .enable()
            .attr('href', this.generateURI(sequence_ids, $a.data().databases))
            .tooltip({
                title: num_hits + " hit(s)."
            });
            return;
        }

        if (num_hits === 0) {
            $a.tooltip({
                title: "No hit to download."
            });
        }

        if (num_hits > 30) {
            $a.tooltip({
                title: "Can't download more than 30 hits."
            });
        }

        $a
        .disable()
        .removeAttr('href');
    },

    /**
     * Handles downloading fasta of selected hits.
     */
    downloadFastaOfSelected: function () {
        var num_checked  = $('.hit-links :checkbox:checked').length;

        var $a = $('.download-fasta-of-selected');
        var $n = $a.find('.text-bold');
        $n.html(num_checked);

        if (num_checked >= 1 && num_checked <= 30) {
            var sequence_ids = $('.hit-links :checkbox:checked').map(function () {
                return this.value;
            }).get();

            $a
            .enable()
            .attr('href', this.generateURI(sequence_ids, $a.data().databases))
            .tooltip({
                title: num_checked + " hit(s) selected."
            });
            return;
        }

        if (num_checked === 0) {
            $n.empty();
            $a.tooltip({
                title: "No hit selected."
            });
        }

        if (num_checked > 30) {
            $a.tooltip({
                title: "Can't download more than 30 hits."
            });
        }

        $a
        .disable()
        .removeAttr('href');
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

    // Life-cycle method. //

    render: function () {
        return (
            <div
                className="sidebar">
                <div
                  className="page-header">
                  <h4>
                      { this.summary() }
                  </h4>
                </div>
                <ul
                    className="nav hover-reset active-bold index">
                    {
                        _.map(this.props.data.queries, _.bind(function (query) {
                            return (
                                <li>
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

                <br/>
                <br/>

                <div
                  className="page-header">
                    <h4>
                        Download FASTA, XML, TSV
                    </h4>
                </div>
                <ul
                  className="downloads list-unstyled list-padded">
                    <li>
                        <a
                          className="download download-fasta-of-all"
                          data-databases=
                          {
                            this.props.data.querydb.map(function (query) {
                                return(query.id)
                            }).join(' ')
                          }
                          onClick={this.downloadFastaOfAll} >
                            FASTA of all hits
                        </a>
                    </li>
                    <li>
                        <a
                          className="download download-fasta-of-selected disabled"
                          data-databases=
                          {
                            this.props.data.querydb.map(function (query) {
                                return(query.id)
                            }).join(' ')
                          }
                          onClick={this.downloadFastaOfSelected}>
                            FASTA of <span className="text-bold"></span> selected hit(s)
                        </a>
                    </li>
                    <li>
                        <a
                          className="download"
                          title="15 columns: query and subject ID; scientific name, alignment length,
                          mismatches, gaps, identity, start and end coordinates,
                          e value, bitscore, query coverage per subject and per HSP."
                          data-toggle="tooltip"
                          href={"download/" + this.props.data.search_id + ".std_tsv"}
                          onClick={this.setupDownloadLinks}>
                            Standard tabular report
                        </a>
                    </li>
                    <li>
                        <a
                          className="download"
                          title="44 columns: query and subject ID, GI, accessions,
                          and length; alignment details; taxonomy details of subject
                          sequence(s) and query coverage per subject and per HSP."
                          data-toggle="tooltip"
                          href={"download/" + this.props.data.search_id + ".full_tsv"}
                          onClick={this.setupDownloadLinks}>
                            Full tabular report
                        </a>
                    </li>
                    <li>
                        <a
                          className="download"
                          title="Results in XML format."
                          data-toggle="tooltip"
                          href={"download/" + this.props.data.search_id + ".xml"}
                          onClick={this.setupDownloadLinks}>
                            Full XML report
                        </a>
                    </li>
                </ul>
            </div>
        )
    }
});

/**
 * Renders entire report.
 *
 * Composed of Query and Sidebar components.
 */
var Report = React.createClass({

    // Kind of public API //

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

        var $hitn = $(checkbox.data('target'));

        // Highlight selected hit and sync checkboxes if sequence viewer is open.
        if (checkbox.is(":checked")) {
            $hitn
            .addClass('glow')
            .find(":checkbox").not(checkbox).check();
            var $a = $('.download-fasta-of-selected');
            var $n = $a.find('span');
            $a
            .enable()
        }

        else {
            $hitn
            .removeClass('glow')
            .find(":checkbox").not(checkbox).uncheck();
        }

        if (num_checked >= 1 && num_checked <= 30)
        {
            var $a = $('.download-fasta-of-selected');
            $a.find('.text-bold').html(num_checked);
        }

        if (num_checked == 0) {
            var $a = $('.download-fasta-of-selected');
            $a.addClass('disabled').find('.text-bold').html('');
        }
    },


    // Internal helpers. //

    /**
     * Fetch results.
     */
    fetch_results: function () {
        $.getJSON(location.href + '.json')
        .complete(_.bind(function (jqXHR) {
            switch (jqXHR.status) {
            case 202:
                setTimeout(fetch_and_show_results, 5000);
                break;
            case 200:
                this.setState(jqXHR.responseJSON);
                break;
            case 500:
                SequenceServer.showErrorModal(jqXHR, function () {});
                break;
            }
        }, this));
    },

    /**
     * Returns true if results have been fetched.
     *
     * A holding message is shown till results are fetched.
     */
    isResultAvailable: function () {
        return this.state.queries.length >= 1;
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

    loading: function () {
        return (
            <div
                className="col-md-6 col-md-offset-3 text-center">
                <h1>
                    <i
                        className="fa fa-cog fa-spin"></i>
                    BLAST-ing
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
        );
    },

    /**
     * Renders report overview.
     */
    overview: function () {
        return (
            <div
                className="overview">
                <h4>
                    {this.state.program_version}
                </h4>
                <table
                    className="table table-condensed">
                    <thead>
                        <tr>
                            <th>
                                Database
                            </th>
                            <th
                                className="text-right">
                                Number of sequences
                            </th>
                            <th
                                className="text-right">
                                Number of characters
                            </th>
                            <th
                                className="text-right">
                                Created or updated on
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            _.map(this.state.querydb, function (db) {
                                return (
                                    <tr>
                                        <td>
                                            { db.title }
                                        </td>
                                        <td
                                            className="text-right">
                                            { db.nsequences }
                                        </td>
                                        <td
                                            className="text-right">
                                            { db.ncharacters }
                                        </td>
                                        <td
                                            className="text-right">
                                            { db.updated_on }
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        <tr>
                            <td
                                className="text-right">
                                Total
                            </td>
                            <td
                                className="text-right">
                                {this.state.stats.nsequences}
                            </td>
                            <td
                                className="text-right">
                                {this.state.stats.ncharacters}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table
                    className="table table-condensed">
                    <thead>
                        <tr>
                            {
                                _.map(_.keys(this.state.params), function (param) {
                                    return (
                                        <th>
                                            { param }
                                        </th>
                                    );
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {
                                _.map(this.state.params, function (param) {
                                    return (
                                        <td>
                                            { param }
                                        </td>
                                    );
                                })
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    },

    /**
     * Renders results per query.
     */
    results: function () {
        return (
            <div
                className={this.shouldShowSidebar() ? 'col-md-9 main' : 'col-md-12'}>
                { this.overview() }
                {
                    _.map(this.state.queries, _.bind(function (query) {
                        return (
                            <Query query={query} data={this.state} selectHit={this.selectHit}/>
                        );
                    }, this))
                }
            </div>
        );
    },

    /**
     * Renders sidebar.
     */
    sidebar: function () {
        return (
            <div
                className="side col-md-3 hidden-xs hidden-sm">
                <SideBar data={this.state}/>
            </div>
        );
    },

    /**
     * Affixes the sidebar.
     *
     * TODO: can't this be done with CSS?
     */
    affixSidebar: function () {
        var $sidebar = $('.sidebar');
        if ($sidebar.length !== 0) {
            $sidebar.affix({
                offset: {
                    top: $sidebar.offset().top
                }
            })
            .width($sidebar.width());
        }
    },

    /**
     * For the query in viewport, highlights corresponding entry in the index.
     */
    setupScrollSpy: function () {
        $('body').scrollspy({target: '.sidebar'});
    },

    /**
     * Prevents folding of hits during text-selection.
     */
    setupHitSelection: function () {
        $('.result').on('mousedown', ".hitn > .page-header > h4", function (event) {
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

    // Download links.
    //
    // Handles downloading files referenced by links with class 'download'.
    setupDownloadLinks: function () {
        $(document).on('click', '.download', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var $anchor = $(this);

            if ($anchor.is(':disabled')) return;

            var url = $anchor.attr('href');

            $.get(url)
            .done(function (data) {
                window.location.href = url;
            })
            .fail(function (jqXHR, status, error) {
                SequenceServer.showErrorModal(jqXHR, function () {});
            });
        });
    },

    // Handles sequence-viewer links.
    setupSequenceViewer: function (event) {
        $(document).on('click', '.view-sequence', function (event) {
            event.preventDefault();
            event.stopPropagation();
            React.render(<SequenceViewer event={event}/>,
                         document.getElementById('sequence-viewer'));
        });
    },

    // SVG and PNG download links.
    setupKablammoImageExporter: function () {
        new ImageExporter('#report', '.export-to-svg', '.export-to-png');
    },

    // Life-cycle methods. //

    getInitialState: function () {
        return {
            search_id:       '',
            program:         '',
            program_version: '',
            queries:         [],
            querydb:         [],
            params:          [],
            stats:           []
        };
    },

    render: function () {
        return (
            <div
                className="row">
                { this.isResultAvailable() && this.results() || this.loading() }
                { this.shouldShowSidebar() && this.sidebar() }
            </div>
        );
    },

    componentDidMount: function () {
        this.fetch_results();
    },

    /**
     * Locks Sidebar in its position.
     * Prevents folding of hits during text-selection
     */
    componentDidUpdate: function () {
        this.affixSidebar();
        this.setupScrollSpy();
        this.setupHitSelection();
        this.setupDownloadLinks();
        this.setupSequenceViewer();
        this.setupKablammoImageExporter();
    }
});

var Page = React.createClass({
    render: function () {
        return (
            <div>
                <div
                    className="container">
                    <Report ref="report"/>
                </div>

                <div
                    id="sequence-viewer" className="modal"
                    tabIndex="-1">
                </div>

                <canvas
                    id="png-exporter" hidden>
                </canvas>
            </div>
        );
    }
});

export {Page};
