import React, { Component, createRef } from 'react';
import _ from 'underscore';

import HitsOverview from './hits_overview';
import LengthDistribution from './length_distribution'; // length distribution of hits
import Utils from './utils';
import { fastqToFasta } from './fastq_to_fasta';
import CollapsePreferences from './collapse_preferences';
import './jquery_world';

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
        return <div className="section-header border-b border-seqorange justify-between w-full flex flex-col sm:flex-row gap-4">
            <h3 className="text-base cursor-pointer flex flex-col sm:flex-row items-start">
                <strong>Query=<span className="ml-1">{this.props.query.id}</span></strong>
                <span className="ml-1">{this.props.query.title}</span>
            </h3>
            <span className="label text-sm text-right font-normal text-inherit pt-0 px-0">{meta}</span>
        </div>;
    }

    hitsListJSX() {
        return <div className="pt-0 px-0 pb-px">
            <HitsOverview key={'GO_' + this.props.query.number} query={this.props.query} program={this.props.program} collapsed={this.props.veryBig} />
            <LengthDistribution key={'LD_' + this.props.query.id} query={this.props.query} algorithm={this.props.program} />
            <HitsTable key={'HT_' + this.props.query.number} query={this.props.query} imported_xml={this.props.imported_xml} />
        </div>;
    }

    noHitsJSX() {
        return <div className="pt-0 px-0 pb-px">
            <strong> ****** No BLAST hits found ****** </strong>
        </div>;
    }

    render() {
        return (
            <div className="resultn mt-1.5" id={this.domID()}
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
        this.preProcessSequence = this.preProcessSequence.bind(this);
        this.notify = this.notify.bind(this);

        this.textareaRef = createRef();
        this.controlsRef = createRef();
    }


    // LIFECYCLE Methods

    componentDidMount() {
        $('body').click(function () {
            $('[data-notifications] [data-role=notification].active').hide('drop', { direction: 'up' }).removeClass('active');
        });
    }

    componentDidUpdate() {
        this.hideShowButton();
        this.preProcessSequence();
        this.props.onSequenceChanged(this.residuesCount());

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
     * is provided as argument). Otherwise, sets query sequence to the given
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

    residuesCount() {
        const sequence = this.value();
        const lines = sequence.split('\n');
        const residuesCount = lines.reduce((count, line) => {
            if (!line.startsWith('>')) {
                return count + line.length;
            }
            return count;
        }, 0);

        return residuesCount;
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
        let sequence = this.value().trim();
        // FASTQ detected, but we don't know if conversion has succeeded yet
        // will notify separately if it does
        if (sequence.startsWith('@') ) { return undefined; }

        var sequences = sequence.split(/>.*/);

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

    preProcessSequence() {
        var sequence = this.value();
        var updatedSequence = fastqToFasta(sequence);

        if (sequence !== updatedSequence) {
            this.value(updatedSequence);
            this.notify('fastq');
        }
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
        this.indicateNormal();
        clearTimeout(this.notification_timeout);
        // $('[data-notifications] [data-role=notification].active').hide().removeClass('active');

        if (type) {
            $('#' + type + '-sequence-notification').show('drop', { direction: 'up' }).addClass('active');

            this.notification_timeout = setTimeout(function () {
                $('[data-notifications] [data-role=notification].active').hide('drop', { direction: 'up' }).removeClass('active');
            }, 5000);

            if (type === 'mixed') {
                this.indicateError();
            }
        }
    }

    render() {
        return (
            <div className="relative">
                <div
                    className="sequence">
                    <textarea
                        id="sequence" ref={this.textareaRef}
                        className="block w-full p-4 text-gray-900 border border-gray-300 rounded-l-lg rounded-tr-lg bg-gray-50 text-base font-mono min-h-[214px] resize-y"
                        name="sequence" value={this.state.value}
                        rows="6"
                        required="required"
                        placeholder="Paste query sequence(s) or drag file
                        containing query sequence(s) in FASTA format here ..."
                        spellCheck="false" autoFocus
                        onChange={this.handleInput}>
                    </textarea>
                </div>
                <div
                    className="hidden absolute top-2 right-2"
                    ref={this.controlsRef}>
                    <button
                        type="button"
                        className="border border-gray-300 rounded bg-white hover:bg-gray-200" id="btn-sequence-clear"
                        title="Clear query sequence(s)."
                        onClick={this.clear}>
                        <span id="sequence-file"></span>
                        <i className="fa fa-times w-6 h-6 p-1"></i>
                        <span className="sr-only">Clear query sequence(s).</span>
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
        this.name = 'Hit sequences producing significant alignments';
        this.collapsePreferences = new CollapsePreferences(this);
        this.state = {
            collapsed: this.collapsePreferences.preferenceStoredAsCollapsed()
        };
    }

    tableJSX() {
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

        return <table
            className="table table-hover table-condensed tabular-view text-sm min-w-full mb-0">
            <thead>
                <tr className="text-neutral-500">
                    <th className="text-left px-2 py-1 font-normal">#</th>
                    <th style={{ width: `${seqwidth}%` }} className="text-left px-2 font-normal py-1">Similar sequences</th>
                    {hasName && <th className="text-left px-2 py-1 font-normal w-1/6">Species</th>}
                    {!this.props.imported_xml && <th className="text-right px-2 py-1 font-normal w-1/6">Query coverage (%)</th>}
                    <th className="text-right px-2 py-1 font-normal w-1/10">Total score</th>
                    <th className="text-right px-2 py-1 font-normal w-1/10">E value</th>
                    <th className="text-right px-2 py-1 font-normal w-1/10">Identity (%)</th>
                </tr>
            </thead>
            <tbody>
                {
                    _.map(this.props.query.hits, _.bind(function (hit) {
                        return (
                            <tr key={hit.number}>
                                <td className="text-left px-2 py-1">{hit.number + '.'}</td>
                                <td className="text-ellipsis px-2 py-1">
                                    <div className="flex flex-col items-center group">
                                        <div className="flex items-center w-full">
                                            <span className="w-full text-sm text-seqblue hover:text-seqorange download cursor-pointer py-0.5 px-0.5">
                                                <a href={'#Query_' + this.props.query.number + '_hit_' + hit.number}
                                                    className="text-sm text-seqblue hover:text-seqorange cursor-pointer">{hit.id} {hit.title}</a>
                                            </span>
                                            <div className="absolute hidden bottom-5 items-center flex-col-reverse group-hover:flex w-[300px]">
                                                <div className="w-0 h-0 border-t-[8px] border-b-[7px] rotate-[270deg] border-r-[7px] -mt-1 border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                                <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                    {`${hit.id} ${hit.title}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {hasName &&
                                    <td className="text-ellipsis px-2 py-1"  data-placement="top">
                                        <div className="relative flex flex-col items-center group">
                                            <div className="flex items-center w-full">
                                                <span className="w-full text-sm text-seqblue hover:text-seqorange download cursor-pointer py-0.5 px-0.5">
                                                    {hit.sciname}
                                                </span>
                                                <div className="absolute hidden bottom-5 items-center flex-col-reverse group-hover:flex w-[300px]">
                                                    <div className="w-0 h-0 border-t-[8px] border-b-[7px] rotate-[270deg] -mt-1 border-r-[7px] border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                                    <span className="relative z-10 p-2 text-xs leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                                        {hit.sciname}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                }
                                {!this.props.imported_xml && <td className="text-right px-2 py-1">{hit.qcovs}</td>}
                                <td className="text-right px-2 py-1">{hit.total_score}</td>
                                <td className="text-right px-2 py-1">{Utils.inExponential(hit.hsps[0].evalue)}</td>
                                <td className="text-right px-2 py-1">{Utils.inPercentage(hit.hsps[0].identity, hit.hsps[0].length)}</td>
                            </tr>
                        );
                    }, this))
                }
            </tbody>
        </table>;
    }

    render() {
        return (
            <div className="table-hit-overview">
                <h4 className="caption text-sm" onClick={() => this.collapsePreferences.toggleCollapse()}>
                    {this.collapsePreferences.renderCollapseIcon()}
                    <span> {this.name}</span>
                </h4>
                <div id={'Query_' + this.props.query.number + 'HT_' + this.props.query.number}>
                    {!this.state.collapsed && this.tableJSX()}
                </div>
            </div>
        );
    }
}
