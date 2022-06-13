import React, { Component, createRef } from 'react';
import _ from 'underscore';

import HitsOverview from './hits_overview';
import LengthDistribution from './length_distribution'; // length distribution of hits
import Utils from './utils';

/**
 * Query component displays query defline, graphical overview, length
 * distribution, and hits table.
 */
export class ReportQuery extends Component {
    // Each update cycle will cause all previous queries to be re-rendered.
    // We avoid that by implementing shouldComponentUpdate life-cycle hook.
    // The trick is to simply check if the components has recieved props
    // before.
    shouldComponentUpdate() {
        // If the component has received props before, query property will
        // be set on it. If it is, we return false so that the component
        // is not re-rendered. If the query property is not set, we return
        // true: this must be the first time react is trying to render the
        // component.
        return !this.props.query;
    }
    // Kind of public API //

    /**
     * Returns the id of query.
     */
    domID() {
        return 'Query_' + this.props.query.number;
    }

    queryLength() {
        return this.props.query.length;
    }

    /**
     * Returns number of hits.
     */
    numhits() {
        return this.props.query.hits.length;
    }
    headerJSX() {
        var meta = `length: ${this.queryLength().toLocaleString()}`;
        if (this.props.showQueryCrumbs) {
            meta = `query ${this.props.query.number}, ` + meta;
        }
        return <div className="section-header">
            <h3>
                <strong>Query=&nbsp;{this.props.query.id}</strong>&nbsp;
                {this.props.query.title}
            </h3>
            <span className="label label-reset pos-label">{meta}</span>
        </div>;
    }

    hitsListJSX() {
        return <div className="section-content">
            <HitsOverview key={'GO_' + this.props.query.number} query={this.props.query} program={this.props.program} collapsed={this.props.veryBig} />
            <LengthDistribution key={'LD_' + this.props.query.id} query={this.props.query} algorithm={this.props.program} collapsed="true" />
            <HitsTable key={'HT_' + this.props.query.number} query={this.props.query} imported_xml={this.props.imported_xml} />
        </div>;
    }

    noHitsJSX() {
        return <div className="section-content">
            <strong> ****** No hits found ****** </strong>
        </div>;
    }
    render() {
        return (
            <div className="resultn" id={this.domID()}
                data-query-len={this.props.query.length}
                data-algorithm={this.props.program}>
                {this.headerJSX()}
                {this.numhits() && this.hitsListJSX() || this.noHitsJSX()}
            </div>
        );
    }
}


/**
 * Query widget for Search component.
 */
export class SearchQueryWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: $('input#input_sequence').val() || ''
        };
        this.value = this.value.bind(this);
        this.clear = this.clear.bind(this);
        this.focus = this.focus.bind(this);
        this.isEmpty = this.isEmpty.bind(this);
        this.textarea = this.textarea.bind(this);
        this.controls = this.controls.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.hideShowButton = this.hideShowButton.bind(this);
        this.indicateError = this.indicateError.bind(this);
        this.indicateNormal = this.indicateNormal.bind(this);
        this.type = this.type.bind(this);
        this.guessSequenceType = this.guessSequenceType.bind(this);
        this.notify = this.notify.bind(this);

        this.textareaRef = createRef()
        this.controlsRef = createRef()
    }


    // LIFECYCLE Methods

    componentDidMount() {
        $('body').click(function () {
            $('.notifications .active').hide('drop', { direction: 'up' }).removeClass('active');
        });
    }

    componentDidUpdate() {
        this.hideShowButton();
        var type = this.type();
        if (!type || type !== this._type) {
            this._type = type;
            this.notify(type);
            this.props.onSequenceTypeChanged(type);
        }
    }

    // Kind of public API. //

    /**
     * Returns query sequence if no argument is provided (or null or undefined
     * is provided as argument). Otherwise, sets query sequenced to the given
     * value and returns `this`.
     *
     * Default/initial state of query sequence is an empty string. Caller must
     * explicitly provide empty string as argument to "reset" query sequence.
     */
    value(val) {
        if (val == null) {
            // i.e., val is null or undefined
            return this.state.value;
        }
        else {
            this.setState({
                value: val
            });
            return this;
        }
    }

    /**
     * Clears textarea. Returns `this`.
     *
     * Clearing textarea also causes it to be focussed.
     */
    clear() {
        return this.value('').focus();
    }

    /**
     * Focuses textarea. Returns `this`.
     */
    focus() {
        this.textarea().focus();
        return this;
    }

    /**
     * Returns true if query is absent ('', undefined, null), false otherwise.
     */
    isEmpty() {
        return !this.value();
    }


    // Internal helpers. //

    textarea() {
        return $(this.textareaRef.current);
    }

    controls() {
        return $(this.controlsRef.current);
    }

    handleInput(evt) {
        this.value(evt.target.value);
    }

    /**
     * Hides or shows 'clear sequence' button.
     *
     * Rendering the 'clear sequence' button takes into account presence or
     * absence of a scrollbar.
     *
     * Called by `componentDidUpdate`.
     */
    hideShowButton() {
        if (!this.isEmpty()) {
            // Calculation below is based on -
            // http://chris-spittles.co.uk/jquery-calculate-scrollbar-width/
            // FIXME: can reflow be avoided here?
            var textareaNode = this.textarea()[0];
            var sequenceControlsRight = textareaNode.offsetWidth - textareaNode.clientWidth;
            this.controls().css('right', sequenceControlsRight + 17);
            this.controls().removeClass('hidden');
        }
        else {
            // FIXME: what are lines 1, 2, & 3 doing here?
            this.textarea().parent().removeClass('has-error');
            this.$sequenceFile = $('#sequence-file');
            this.$sequenceFile.empty();

            this.controls().addClass('hidden');
        }
    }

    /**
     * Put red border around textarea.
     */
    indicateError() {
        this.textarea().parent().addClass('has-error');
    }

    /**
     * Put normal blue border around textarea.
     */
    indicateNormal() {
        this.textarea().parent().removeClass('has-error');
    }

    /**
     * Returns type of the query sequence (nucleotide, protein, mixed).
     *
     * Query widget supports executing a callback when the query type changes.
     * Components interested in query type should register a callback instead
     * of directly calling this method.
     */
    type() {
        var sequences = this.value().split(/>.*/);

        var type, tmp;

        for (var i = 0; i < sequences.length; i++) {
            tmp = this.guessSequenceType(sequences[i]);

            // could not guess the sequence type; try the next sequence
            if (!tmp) { continue; }

            if (!type) {
                // successfully guessed the type of atleast one sequence
                type = tmp;
            }
            else if (tmp !== type) {
                // user has mixed different type of sequences
                return 'mixed';
            }
        }

        return type;
    }

    /**
     * Guesses and returns the type of the given sequence (nucleotide,
     * protein).
     */
    guessSequenceType(sequence) {
        // remove 'noisy' characters
        sequence = sequence.replace(/[^A-Z]/gi, ''); // non-letter characters
        sequence = sequence.replace(/[NX]/gi, ''); // ambiguous  characters

        // can't determine the type of ultrashort queries
        if (sequence.length < 10) {
            return undefined;
        }

        // count the number of putative NA
        var putative_NA_count = 0;
        for (var i = 0; i < sequence.length; i++) {
            if (sequence[i].match(/[ACGTU]/i)) {
                putative_NA_count += 1;
            }
        }

        var threshold = 0.9 * sequence.length;
        return putative_NA_count > threshold ? 'nucleotide' : 'protein';
    }

    notify(type) {
        clearTimeout(this.notification_timeout);
        this.indicateNormal();
        $('.notifications .active').hide().removeClass('active');

        if (type) {
            $('#' + type + '-sequence-notification').show('drop', { direction: 'up' }).addClass('active');

            this.notification_timeout = setTimeout(function () {
                $('.notifications .active').hide('drop', { direction: 'up' }).removeClass('active');
            }, 5000);

            if (type === 'mixed') {
                this.indicateError();
            }
        }
    }

    render() {
        return (
            <div
                className="col-md-12">
                <div
                    className="sequence">
                    <textarea
                        id="sequence" ref={this.textareaRef}
                        className="form-control text-monospace"
                        name="sequence" value={this.state.value}
                        placeholder="Paste query sequence(s) or drag file
                        containing query sequence(s) in FASTA format here ..."
                        spellCheck="false" autoFocus
                        onChange={this.handleInput}>
                    </textarea>
                </div>
                <div
                    className="hidden"
                    style={{ position: 'absolute', top: '4px', right: '19px' }}
                    ref={this.controlsRef}>
                    <button
                        type="button"
                        className="btn btn-sm btn-default" id="btn-sequence-clear"
                        title="Clear query sequence(s)."
                        onClick={this.clear}>
                        <span id="sequence-file"></span>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            </div>
        );
    }
}


/**
 * Renders summary of all hits per query in a tabular form.
 */

class HitsTable extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        var hasName = _.every(this.props.query.hits, function (hit) {
            return hit.sciname !== '';
        });

        // Width of sequence column is 55% when species name is not shown and
        // query coverage is.
        var seqwidth = 55;
        // If we are going to show species name, then reduce the width of
        // sequence column by the width of species column.
        if (hasName) seqwidth -= 15;
        // If we are not going to show query coverage (i.e. for imported XML),
        // then increase the width of sequence column by the width of coverage
        // column.
        if (this.props.imported_xml) seqwidth += 15;

        return (
            <div className="table-hit-overview">
                <h4 className="caption" data-toggle="collapse" data-target={'#Query_' + this.props.query.number + 'HT_' + this.props.query.number}>
                    <i className="fa fa-minus-square-o"></i>&nbsp;
                    <span>Sequences producing significant alignments</span>
                </h4>
                <div className="collapsed in" id={'Query_' + this.props.query.number + 'HT_' + this.props.query.number}>
                    <table
                        className="table table-hover table-condensed tabular-view ">
                        <thead>
                            <tr>
                                <th className="text-left">#</th>
                                <th width={`${seqwidth}%`}>Similar sequences</th>
                                {hasName && <th width="15%" className="text-left">Species</th>}
                                {!this.props.imported_xml && <th width="15%" className="text-right">Query coverage (%)</th>}
                                <th width="10%" className="text-right">Total score</th>
                                <th width="10%" className="text-right">E value</th>
                                <th width="10%" className="text-right">Identity (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                _.map(this.props.query.hits, _.bind(function (hit) {
                                    return (
                                        <tr key={hit.number}>
                                            <td className="text-left">{hit.number + '.'}</td>
                                            <td className="nowrap-ellipsis"
                                                title={`${hit.id} ${hit.title}`}
                                                data-toggle="tooltip" data-placement="left">
                                                <a href={'#Query_' + this.props.query.number + '_hit_' + hit.number}
                                                    className="btn-link">{hit.id} {hit.title}</a>
                                            </td>
                                            {hasName &&
                                                <td className="nowrap-ellipsis" title={hit.sciname}
                                                    data-toggle="tooltip" data-placement="top">
                                                    {hit.sciname}
                                                </td>
                                            }
                                            {!this.props.imported_xml && <td className="text-right">{hit.qcovs}</td>}
                                            <td className="text-right">{hit.total_score}</td>
                                            <td className="text-right">{Utils.inExponential(hit.hsps[0].evalue)}</td>
                                            <td className="text-right">{Utils.inPercentage(hit.hsps[0].identity, hit.hsps[0].length)}</td>
                                        </tr>
                                    );
                                }, this))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
