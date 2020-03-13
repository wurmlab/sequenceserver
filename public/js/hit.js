import React from 'react';
import _ from 'underscore';

import HSPOverview from './kablammo';
import downloadFASTA from './download_fasta';
import AlignmentExporter from './alignment_exporter'; // to download textual alignment

/**
 * Component for each hit. Receives props from Report. Has no state.
 */
export default React.createClass({
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
            <h4>
                <i className="fa fa-minus-square-o"></i>&nbsp;
                <strong>{this.props.hit.id}&nbsp;
                    <small>{this.props.hit.title}</small>
                </strong>
            </h4>
            <span className="label label-reset pos-label">{meta}</span>
        </div>;
    },

    contentJSX: function () {
        return <div className="section-content" data-parent-hit={this.domID()}>
            { this.hitLinks() }
            <HSPOverview key={'kablammo' + this.props.query.id} query={this.props.query}
                hit={this.props.hit} algorithm={this.props.algorithm}
                showHSPCrumbs={this.props.hit.hsps.length > 1}
                collapsed={this.props.veryBig} />
        </div>;
    },

    hitLinks: function () {
        var btns = [];
        if (!this.props.imported_xml) {
            btns = btns.concat([
                this.viewSequenceButton(),
                this.downloadFASTAButton()
            ]);
        }
        btns.push(this.downloadAlignmentButton());

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
                    btns.map((btn) => {
                        return [<span className="line">|</span>, this.button(btn)];
                    })
                }
                {
                    this.props.hit.links.map((link) => {
                        return [<span className="line">|</span>, this.a(link)];
                    })
                }
            </div>
        );
    },

    // Return JSX for view sequence button.
    viewSequenceButton: function () {
        if (this.hitLength() > 10000) {
            return {
                text: 'Sequence',
                icon: 'fa-eye',
                className: 'view-sequence',
                title: 'Sequence too long',
            };
        }
        else {
            return {
                text: 'Sequence',
                icon: 'fa-eye',
                className: 'view-sequence',
                onClick: () => this.showSequenceViewer()
            };

        }
    },

    downloadFASTAButton: function () {
        return {
            text: 'FASTA',
            icon: 'fa-download',
            className: 'download-fa',
            onClick: () => this.downloadFASTA()
        };
    },

    downloadAlignmentButton: function () {
        return {
            text: 'Alignment',
            icon: 'fa-download',
            className: 'download-fa',
            onClick: () => this.downloadAlignment()
        };
    },

    button: function ({text, icon, title, className, onClick}) {
        if (onClick) {
            return <button className={`btn-link ${className}`}
                title={title} onClick={onClick}><i className={`fa ${icon}`}></i> {text}
            </button>;
        }
        else {
            return <button className="btn-link view-sequence disabled"
                title={title} disabled="true">
                <i className={`fa ${icon}`}></i> {text}
            </button>;
        }
    },

    /**
     * Render URL for sequence-viewer.
     */
    a: function (link) {
        if (!link.title || !link.url) return;

        let className = 'btn btn-link';
        if (link.class) className = `${className} ${link.class}`;
        return <a href={link.url} className={className} target='_blank'>
            {link.icon && <i className={'fa ' + link.icon}></i>}
            {' ' + link.title + ' '}
        </a>;
    }
});