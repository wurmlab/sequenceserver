import React from 'react';
import _ from 'underscore';

import HSPOverview from './kablammo';
import AlignmentExporter from './alignment_exporter'; // to download textual alignment
import Utils from './utils'; // to use as mixin in Hit
import downloadFASTA from './download_fasta';

/**
 * Component for each hit. Receives props from Report. Has no state.
 */
export default React.createClass({
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
    hitLength: function () {
        return this.props.hit.length;
    },

    // Internal helpers. //

    /**
     * Returns id that will be used for the DOM node corresponding to the hit.
     */
    domID: function () {
        return 'Query_' + this.props.query.number + '_hit_' + this.props.hit.number;
    },

    databaseIDs: function () {
        return _.map(this.props.querydb, _.iteratee('id'));
    },

    showSequenceViewer: function () {
        this.props.showSequenceModal(this.viewSequenceLink());
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
        }, this));

        var aln_exporter = new AlignmentExporter();
        aln_exporter.export_alignments(hsps, this.props.query.id+'_'+this.props.hit.id);
    },


    // Life cycle methods //

    // Return JSX for view sequence button.
    viewSequenceButton: function () {
        if (this.hitLength() > 10000) {
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
            <div className="hit" id={this.domID()} data-hit-def={this.props.hit.id}
                data-hit-len={this.props.hit.length} data-hit-evalue={this.props.hit.evalue}>
                { this.headerJSX() } { this.contentJSX() }
            </div>
        );
    },

    // See Query.shouldComponentUpdate. The same applies for hits.
    shouldComponentUpdate: function () {
        return !this.props.hit;
    },

    headerJSX: function () {
        var meta = `length: ${this.hitLength().toLocaleString()}`;

        if (this.props.showQueryCrumbs && this.props.showHitCrumbs) {
            // Multiper queries, multiple hits
            meta = `hit ${this.props.hit.number} of query ${this.props.query.number}, ` + meta;
        }
        else if (this.props.showQueryCrumbs && !this.props.showHitCrumbs) {
            // Multiple queries, single hit
            meta = `the only hit of query ${this.props.query.number}, ` + meta;
        }
        else if (!this.props.showQueryCrumbs && this.props.showHitCrumbs) {
            // Single query, multiple hits
            meta = `hit ${this.props.hit.number}, ` + meta;
        }

        return <div className="section-header">
            <h4 data-hit-number={this.props.hit.number}>
                <i className="fa fa-chevron-down"></i>&nbsp;
                <span>
                    {this.props.hit.id}&nbsp;
                    <small>{this.props.hit.title}</small>
                </span>
            </h4>
            <span className="label label-reset pos-label">{ meta }</span>
        </div>;
    },

    contentJSX: function () {
        return <div className="section-content" data-parent-hit={this.props.hit.number}>
            { this.hitLinks() }
            <HSPOverview key={'kablammo' + this.props.query.id} query={this.props.query}
                hit={this.props.hit} algorithm={this.props.algorithm} />
        </div>;
    },

    hitLinks: function () {
        return (
            <div className="hit-links">
                <label>
                    <input type="checkbox" id={this.domID() + '_checkbox'}
                        value={this.accession()} onChange={function () {
                            this.props.selectHit(this.domID() + '_checkbox');
                        }.bind(this)} data-target={'#' + this.domID()}
                    /> Select
                </label>
                {
                    !this.props.imported_xml && [<span> | </span>, this.viewSequenceButton()]
                }
                {
                    !this.props.imported_xml && [
                        <span> | </span>,
                        <button className='btn btn-link download-fa'
                            onClick={this.downloadFASTA}>
                            <i className="fa fa-download"></i> FASTA
                        </button>
                    ]
                }
                <span> | </span>
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
    }
});