import React, { Component } from 'react';
import _ from 'underscore';

import HSPOverview from './kablammo';
import downloadFASTA from './download_fasta';
import AlignmentExporter from './alignment_exporter'; // to download textual alignment

/**
 * Component for each hit. Receives props from Report. Has no state.
 */
export default class extends Component {
    constructor(props) {
        super(props);
        this.accession = this.accession.bind(this);
        this.sequenceID = this.sequenceID.bind(this);
        this.hitLength = this.hitLength.bind(this);
        this.numHSPs = this.numHSPs.bind(this);
        this.domID = this.domID.bind(this);
        this.databaseIDs = this.databaseIDs.bind(this);
        this.showSequenceViewer = this.showSequenceViewer.bind(this);
        this.viewSequenceLink = this.viewSequenceLink.bind(this);
        this.downloadFASTA = this.downloadFASTA.bind(this);
        this.downloadAlignment = this.downloadAlignment.bind(this);
        this.headerJSX = this.headerJSX.bind(this);
        this.contentJSX = this.contentJSX.bind(this);
        this.hitLinks = this.hitLinks.bind(this);
        this.viewSequenceButton = this.viewSequenceButton.bind(this);
        this.downloadFASTAButton = this.downloadFASTAButton.bind(this);
    }
    shouldComponentUpdate() {
        return !this.props.hit;
    }
    /**
         * Returns accession number of the hit sequence.
         */
    accession() {
        return this.props.hit.accession;
    }

    /**
     * Returns id of the hit sequence.
     */
    sequenceID() {
        return this.props.hit.id;
    }

    /**
     * Returns length of the hit sequence.
     */
    hitLength() {
        return this.props.hit.length;
    }

    numHSPs() {
        return this.props.hit.hsps.length;
    }

    // Internal helpers. //

    /**
     * Returns id that will be used for the DOM node corresponding to the hit.
     */
    domID() {
        return 'Query_' + this.props.query.number + '_hit_' + this.props.hit.number;
    }

    databaseIDs() {
        return _.map(this.props.querydb, _.iteratee('id'));
    }

    showSequenceViewer() {
        this.props.showSequenceModal(this.viewSequenceLink());
    }

    viewSequenceLink() {
        var sequenceIDs = encodeURIComponent(this.sequenceID());
        var databaseIDs = encodeURIComponent(this.databaseIDs());
        return `get_sequence/?sequence_ids=${sequenceIDs}&database_ids=${databaseIDs}`;
    }

    downloadFASTA(event) {
        var sequenceIDs = [this.sequenceID()];
        downloadFASTA(sequenceIDs, this.databaseIDs());
    }

    // Event-handler for exporting alignments.
    // Calls relevant method on AlignmentExporter defined in alignment_exporter.js.
    downloadAlignment(event) {
        var hsps = _.map(this.props.hit.hsps, _.bind(function (hsp) {
            hsp.query_id = this.props.query.id;
            hsp.hit_id = this.props.hit.id;
            return hsp;
        }, this));

        var aln_exporter = new AlignmentExporter();
        aln_exporter.export_alignments(hsps, this.props.query.id + '_' + this.props.hit.id);
    }

    headerJSX() {
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
                <strong>{this.props.hit.id}</strong>&nbsp;
                {this.props.hit.title}
            </h4>
            <span className="label label-reset pos-label">{meta}</span>
        </div>;
    }

    contentJSX() {
        return <div className="section-content" data-parent-hit={this.domID()}>
            {this.hitLinks()}
            <HSPOverview key={'kablammo' + this.props.query.id} query={this.props.query}
                hit={this.props.hit} algorithm={this.props.algorithm}
                showHSPCrumbs={this.numHSPs() > 1 && this.numHSPs() < 27}
                collapsed={this.props.veryBig} />
        </div>;
    }

    hitLinks() {
        var btns = [];
        if (!(this.props.imported_xml || this.props.non_parse_seqids)) {
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
                        value={this.sequenceID()} onChange={function () {
                            this.props.selectHit(this.domID() + '_checkbox');
                            this.props.onChange();
                        }.bind(this)} data-target={'#' + this.domID()}
                    /> Select
                </label>
                {
                    btns.map((btn, index) => {
                        return [<span className="line" key={`btn-${index}`}>|</span>, this.button(Object.assign(btn, { key: index }))];
                    })
                }
                {
                    this.props.hit.links.map((link, index) => {
                        return [<span className="line" key={`link-${index}`}>|</span>, this.a(link, index)];
                    })
                }
            </div>
        );
    }

    // Return JSX for view sequence button.
    viewSequenceButton() {
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
    }

    downloadFASTAButton() {
        return {
            text: 'FASTA',
            icon: 'fa-download',
            className: 'download-fa',
            onClick: () => this.downloadFASTA()
        };
    }

    downloadAlignmentButton() {
        return {
            text: 'Alignment',
            icon: 'fa-download',
            className: 'download-aln',
            onClick: () => this.downloadAlignment()
        };
    }

    button({ text, icon, title, className, onClick, key }) {
        if (onClick) {
            return <button key={key} className={`btn-link ${className}`}
                title={title} onClick={onClick}><i className={`fa ${icon}`}></i> {text}
            </button>;
        }
        else {
            return <button key={key} className="btn-link view-sequence disabled"
                title={title} disabled={true}>
                <i className={`fa ${icon}`}></i> {text}
            </button>;
        }
    }

    /**
     * Render URL for sequence-viewer.
     */
    a(link, key) {
        if (!link.title || !link.url) return;

        let className = 'btn btn-link';
        if (link.class) className = `${className} ${link.class}`;
        return <a href={link.url} key={`${link.url}-${key}`} className={className} target='_blank'>
            {link.icon && <i className={'fa ' + link.icon}></i>}
            {' ' + link.title + ' '}
        </a>;
    }
    render() {
        return (
            <div className="hit" id={this.domID()} data-hit-def={this.props.hit.id}
                data-hit-len={this.props.hit.length} data-hit-evalue={this.props.hit.evalue}>
                {this.headerJSX()} {this.contentJSX()}
            </div>
        );
    }
}