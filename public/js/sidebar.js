import React from 'react';
import _ from 'underscore';

import downloadFASTA from './download_fasta';
import AlignmentExporter from './alignment_exporter'; // to download textual alignment

/**
 * Renders links for downloading hit information in different formats.
 * Renders links for navigating to each query.
 */
export default React.createClass({
    /**
     * Event-handler for downloading fasta of all hits.
     */
    downloadFastaOfAll: function () {
        var sequence_ids = [];
        this.props.data.queries.forEach(
            (query) => query.hits.forEach(
                (hit) => sequence_ids.push(hit.id)));
        var database_ids = this.props.data.querydb.map((querydb) => querydb.id);
        downloadFASTA(sequence_ids, database_ids);
        return false;
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
        return false;
    },

    downloadAlignmentOfAll: function() {
        // Get number of hits and array of all hsps.
        var num_hits = 0;
        var hsps_arr = [];
        this.props.data.queries.forEach(
            (query) => query.hits.forEach(
                (hit) => {
                    num_hits++;
                    hit.hsps.forEach((hsp) => {
                        hsp.query_id = query.id;
                        hsp.hit_id = hit.id;
                        hsps_arr.push(hsp);
                    });
                }
            )
        );

        var aln_exporter = new AlignmentExporter();
        var file_name = `alignment-${num_hits}_hits`;
        aln_exporter.export_alignments(hsps_arr, file_name);
        return false;
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
                if (_.indexOf(sequence_ids, hit.id) != -1) {
                    _.each(hit.hsps, function (hsp) {
                        hsp.hit_id = hit.id;
                        hsp.query_id = query.id;
                        hsps_arr.push(hsp);
                    });
                }
            });
        }, this));
        aln_exporter.export_alignments(hsps_arr, 'alignment-'+sequence_ids.length+'_hits');
        return false;
    },


    // JSX //
    render: function () {
        return (
            <div className="sidebar">
                { this.props.shouldShowIndex && this.index() }
                { this.downloads() }
            </div>
        );
    },

    index: function () {
        return (
            <div className="index">
                <div
                    className="section-header-sidebar">
                    <h4>
                        { this.summary() }
                    </h4>
                </div>
                <ul
                    className="nav hover-reset active-bold">
                    {
                        _.map(this.props.data.queries, _.bind(function (query) {
                            return (
                                <li key={'Side_bar_'+query.id}>
                                    <a
                                        className="btn-link nowrap-ellipsis hover-bold"
                                        href={'#Query_' + query.number}
                                        title={'Query= ' + query.id + ' ' + query.title}>
                                        {'Query= ' + query.id}
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
            numqueries + ' ' + (numqueries > 1 ? 'queries' : 'query') + ', ' +
            numquerydb + ' ' + (numquerydb > 1 ? 'databases' : 'database')
        );
    },

    downloads: function () {
        return (
            <div className="downloads">
                <div className="section-header-sidebar">
                    <h4>
                        Download FASTA, XML, TSV
                    </h4>
                </div>
                <ul className="nav">
                    {
                        !this.props.data.imported_xml && <li>
                            <a href="#" className="btn-link download-fasta-of-all"
                                onClick={this.downloadFastaOfAll}>
                                FASTA of all hits
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li>
                            <a href="#" className="btn-link download-fasta-of-selected disabled"
                                onClick={this.downloadFastaOfSelected}>
                                FASTA of <span className="text-bold"></span> selected hit(s)
                            </a>
                        </li>
                    }
                    <li>
                        <a href="#" className="btn-link download-alignment-of-all"
                            onClick={this.downloadAlignmentOfAll}>
                            Alignment of all hits
                        </a>
                    </li>
                    <li>
                        <a href="#" className="btn-link download-alignment-of-selected disabled"
                            onClick={this.downloadAlignmentOfSelected}>
                            Alignment of <span className="text-bold"></span> selected hit(s)
                        </a>
                    </li>
                    {
                        !this.props.data.imported_xml && <li>
                            <a className="btn-link download" data-toggle="tooltip"
                                title="15 columns: query and subject ID; scientific
                                name, alignment length, mismatches, gaps, identity,
                                start and end coordinates, e value, bitscore, query
                                coverage per subject and per HSP."
                                href={'download/' + this.props.data.search_id + '.std_tsv'}>
                                Standard tabular report
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li>
                            <a className="btn-link download" data-toggle="tooltip"
                                title="44 columns: query and subject ID, GI,
                                accessions, and length; alignment details;
                                taxonomy details of subject sequence(s) and
                                query coverage per subject and per HSP."
                                href={'download/' + this.props.data.search_id + '.full_tsv'}>
                                Full tabular report
                            </a>
                        </li>
                    }
                    {
                        !this.props.data.imported_xml && <li>
                            <a className="btn-link download" data-toggle="tooltip"
                                title="Results in XML format."
                                href={'download/' + this.props.data.search_id + '.xml'}>
                                Full XML report
                            </a>
                        </li>
                    }
                </ul>
            </div>
        );
    },
});

