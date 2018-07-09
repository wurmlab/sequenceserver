import React from 'react';
import _ from 'underscore';

import Utils from './utils';
import * as Helpers from './visualisation_helpers';

var HSPComponents = {};

/**
 * Alignment viewer.
 */
export default class HSP extends React.Component {

    constructor(props) {
        super(props);
        this.hsp = props.hsp;
    }

    domID() {
        return "Query_" + this.props.queryNumber + "_hit_" +
            this.props.hitNumber + "_" + this.hsp.number;
    }

    // Renders pretty formatted alignment.
    render () {
        return (
            <div className="hsp" id={this.domID()} ref="hsp">
                <pre className="pre-reset hsp-stats">
                    {Helpers.toLetters(this.hsp.number) + "."}&nbsp;{this.hspStats()}
                </pre>
                {this.hspLines()}
            </div>
        );
    }

    componentDidMount () {
        HSPComponents[this.domID()] = this;
        this.draw();
    }

    draw () {
        var $container = $(React.findDOMNode(this.refs.hsp));
        this.chars = Math.floor($container.width() / 7.21);
        this.forceUpdate();
    }

    /**
     * Return prettified stats for the given hsp and based on the BLAST
     * algorithm.
     */
    hspStats () {
        let line = [];

        // Bit score and total score.
        line.push(`Score: ${Utils.inTwoDecimal(this.hsp.bit_score)} (${this.hsp.score}), `);

        // E value
        line.push(`E value: `); line.push(Utils.inExponential(this.hsp.evalue)); line.push(', ');

        // Identity
        line.push([`Identities: ${Utils.inFraction(this.hsp.identity, this.hsp.length)} (${Utils.inPercentage(this.hsp.identity, this.hsp.length)}), `]);

        // Positives (for protein alignment).
        if (this.props.algorithm === 'blastp' ||
            this.props.algorithm === 'blastx' ||
            this.props.algorithm === 'tblastn' ||
            this.props.algorithm === 'tblastx') {
            line.push(`Positives: ${Utils.inFraction(this.hsp.positives, this.hsp.length)} (${Utils.inPercentage(this.hsp.positives, this.hsp.length)}), `)
        }

        // Gaps
        line.push(`Gaps: ${Utils.inFraction(this.hsp.gaps, this.hsp.length)} (${Utils.inPercentage(this.hsp.gaps, this.hsp.length)}), `);

        // Query coverage
        //line.push(`Query coverage: ${this.hsp.qcovhsp}%, `)

        switch (this.props.algorithm) {
            case 'tblastx':
                line.push(`Frame: ${Utils.inFraction(this.hsp.qframe, this.hsp.sframe)}`)
                break;
            case 'blastn':
                line.push(`Strand: ${(this.hsp.qframe > 0 ? '+' : '-')} / ${(this.hsp.sframe > 0 ? '+' : '-')}`)
                break;
            case 'blastx':
                line.push(`Query Frame: ${this.hsp.qframe}`)
                break;
            case 'tblastn':
                line.push(`Hit Frame: ${this.hsp.sframe}`)
                break;
        }

        return line;
    }

    hspLines () {
        // Space reserved for showing coordinates
        var width = this.width();

        // Number of residues we can draw per line is the total number of
        // characters we can have in a line minus space required to show left
        // and right coordinates minus 10 characters reserved for displaying
        // the words Query, Subject and three blank spaces per line.
        var chars = this.chars - 2 * width - 10;

        // Number of lines of pairwise-alignment (i.e., each line consists of 3
        // lines). We draw as many pre tags.
        var lines = Math.ceil(this.hsp.length / chars);

        var pp = [];
        var nqseq = this.nqseq();
        var nsseq = this.nsseq();
        for (let i = 1; i <= lines; i++) {
            let line = [];
            let seq_start_index = chars * (i - 1);
            let seq_stop_index = seq_start_index + chars;

            let lqstart = nqseq;
            let lqseq = this.hsp.qseq.slice(seq_start_index, seq_stop_index);
            let lqend = nqseq + (lqseq.length - lqseq.split('-').length) *
                this.qframe_unit() * this.qframe_sign();
            nqseq = lqend + this.qframe_unit() * this.qframe_sign();

            let lmseq = this.hsp.midline.slice(seq_start_index, seq_stop_index);

            let lsstart = nsseq;
            let lsseq = this.hsp.sseq.slice(seq_start_index, seq_stop_index);
            let lsend = nsseq + (lsseq.length - lsseq.split('-').length) *
                this.sframe_unit() * this.sframe_sign();
            nsseq = lsend + this.sframe_unit() * this.sframe_sign();

            line.push(this.spanCoords('Query   ' + this.formatCoords(lqstart, width) + ' '));
            line.push(lqseq);
            line.push(this.spanCoords(' ' + lqend));
            line.push(<br/>);

            line.push(this.formatCoords('', width + 8) + ' ');
            line.push(lmseq);
            line.push(<br/>);

            line.push(this.spanCoords('Subject ' + this.formatCoords(lsstart, width) + ' '));
            line.push(lsseq);
            line.push(this.spanCoords(' ' + lsend))
            line.push(<br/>);

            pp.push(<pre key={this.hsp.number + ',' + i}
                className="pre-reset hsp-lines">{line}</pre>);
        }

        return pp;
    }

    // Width of each line of alignment.
    width() {
        return _.max(_.map([this.hsp.qstart, this.hsp.qend,
                                this.hsp.sstart, this.hsp.send],
                                (n) => { return n.toString().length }));
    }

    // Alignment start coordinate for query sequence.
    //
    // This will be qstart or qend depending on the direction in which the
    // (translated) query sequence aligned.
    nqseq () {
        switch (this.props.algorithm) {
            case 'blastp':
            case 'blastx':
            case 'tblastn':
            case 'tblastx':
                return this.hsp.qframe >= 0 ? this.hsp.qstart : this.hsp.qend;
            case 'blastn':
                // BLASTN is a bit weird in that, no matter which direction the query
                // sequence aligned in, qstart is taken as alignment start coordinate
                // for query.
                return this.hsp.qstart;
        }
    }

    // Alignment start coordinate for subject sequence.
    //
    // This will be sstart or send depending on the direction in which the
    // (translated) subject sequence aligned.
    nsseq () {
        switch (this.props.algorithm) {
            case 'blastp':
            case 'blastx':
            case 'tblastn':
            case 'tblastx':
                return this.hsp.sframe >= 0 ? this.hsp.sstart : this.hsp.send;
            case 'blastn':
                // BLASTN is a bit weird in that, no matter which direction the
                // subject sequence aligned in, sstart is taken as alignment
                // start coordinate for subject.
                return this.hsp.sstart
        }
    }

    // Jump in query coordinate.
    //
    // Roughly,
    //
    //   qend = qstart + n * qframe_unit
    //
    // This will be 1 or 3 depending on whether the query sequence was
    // translated or not.
    qframe_unit () {
        switch (this.props.algorithm) {
            case 'blastp':
            case 'blastn':
            case 'tblastn':
                return 1;
            case 'blastx':
                // _Translated_ nucleotide query against protein database.
            case 'tblastx':
                // _Translated_ nucleotide query against translated
                // nucleotide database.
                return 3;
        }
    }

    // Jump in subject coordinate.
    //
    // Roughly,
    //
    //   send = sstart + n * sframe_unit
    //
    // This will be 1 or 3 depending on whether the subject sequence was
    // translated or not.
    sframe_unit () {
        switch (this.props.algorithm) {
            case 'blastp':
            case 'blastx':
            case 'blastn':
                return 1;
            case 'tblastn':
                // Protein query against _translated_ nucleotide database.
                return 3;
            case 'tblastx':
                // Translated nucleotide query against _translated_
                // nucleotide database.
                return 3;
        }
    }

    // If we should add or subtract qframe_unit from qstart to arrive at qend.
    //
    // Roughly,
    //
    //   qend = qstart + (qframe_sign) * n * qframe_unit
    //
    // This will be +1 or -1, depending on the direction in which the
    // (translated) query sequence aligned.
    qframe_sign () {
        return this.hsp.qframe >= 0 ? 1 : -1;
    }

    // If we should add or subtract sframe_unit from sstart to arrive at send.
    //
    // Roughly,
    //
    //   send = sstart + (sframe_sign) * n * sframe_unit
    //
    // This will be +1 or -1, depending on the direction in which the
    // (translated) subject sequence aligned.
    sframe_sign () {
        return this.hsp.sframe >= 0 ? 1 : -1;
    }


    /**
     * Pad given coord with ' ' till its length == width. Returns undefined if
     * width is not supplied.
     */
    formatCoords (coord, width) {
        if (width) {
            let padding = width - coord.toString().length;
            return Array(padding + 1).join(' ').concat([coord]);
        }
    }

    spanCoords (text) {
        return <span className="hsp-coords">{text}</span>
    }
}

// Redraw if window resized.
$(window).resize(_.debounce(function () {
    _.each(HSPComponents, (comp) => {
        comp.draw();
    });
}, 100));
