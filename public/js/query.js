import React from 'react';
import _ from 'underscore';

import HitsOverview from './hits_overview';
import LengthDistribution from './length_distribution'; // length distribution of hits
import Utils from './utils'; // to use as mixin in HitsTable

/**
 * Query component displays query defline, graphical overview, length
 * distribution, and hits table.
 */
export default React.createClass({

    // Kind of public API //

    /**
     * Returns the id of query.
     */
    domID: function () {
        return 'Query_' + this.props.query.number;
    },

    queryLength: function () {
        return this.props.query.length;
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
                { this.headerJSX() }
                { this.numhits() && this.hitsListJSX() || this.noHitsJSX() }
            </div>
        );
    },

    headerJSX: function () {
        var meta = `length: ${this.queryLength().toLocaleString()}`;
        if (this.props.showQueryCrumbs) {
            meta = `query ${this.props.query.number}, ` + meta;
        }
        return <div className="section-header">
            <h3>
                <strong>
                Query= {this.props.query.id}&nbsp;
                    <small>{this.props.query.title}</small>
                </strong>
            </h3>
            <span className="label label-reset pos-label">{ meta }</span>
        </div>;
    },

    hitsListJSX: function () {
        return <div className="section-content">
            <HitsOverview key={'GO_' + this.props.query.number} query={this.props.query} program={this.props.program} collapsed={this.props.veryBig} />
            <LengthDistribution key={'LD_' + this.props.query.id} query={this.props.query} algorithm={this.props.program} collapsed="true" />
            <HitsTable key={'HT_' + this.props.query.number} query={this.props.query} imported_xml={this.props.imported_xml} />
        </div>;
    },

    noHitsJSX: function () {
        return <div className="section-content">
            <p>
                <strong> ****** No hits found ****** </strong>
            </p>
        </div>;
    },

    // Each update cycle will cause all previous queries to be re-rendered.
    // We avoid that by implementing shouldComponentUpdate life-cycle hook.
    // The trick is to simply check if the components has recieved props
    // before.
    shouldComponentUpdate: function () {
        // If the component has received props before, query property will
        // be set on it. If it is, we return false so that the component
        // is not re-rendered. If the query property is not set, we return
        // true: this must be the first time react is trying to render the
        // component.
        return !this.props.query;
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
                    {!this.props.imported_xml && <th className="text-right">Query coverage (%)</th>}
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
                                    <td className="text-left">{hit.number + '.'}</td>
                                    <td>
                                        <a href={'#Query_' + this.props.query.number + '_hit_' + hit.number}>
                                            {hit.id}
                                        </a>
                                    </td>
                                    {hasName && <td className="text-left">{hit.sciname}</td>}
                                    {!this.props.imported_xml && <td className="text-right">{hit.qcovs}</td>}
                                    <td className="text-right">{hit.score}</td>
                                    <td className="text-right">{this.inExponential(hit.hsps[0].evalue)}</td>
                                    <td className="text-right">{hit.identity}</td>
                                </tr>
                            );
                        }, this))
                    }
                </tbody>
            </table>
        );
    }
});
