import { Component } from 'react';
import _ from 'underscore';

import { ReportQuery } from './query';
import Hit from './hit';
import HSP from './hsp';


class Hits extends Component {
    constructor(props) {
        super(props);
        this.numUpdates = 0;
        this.nextQuery = 0;
        this.nextHit = 0;
        this.nextHSP = 0;
        this.maxHSPs = 3; // max HSPs to render in a cycle
        this.state = { ...props.state, results: [] };
    }

    componentDidMount() {
        this.componentDidUpdate(this.props, this.state);
    }

    /**
    * Called for the first time after as BLAST results have been retrieved from
    * the server and added to this.state by fetchResults. Only summary overview
    * and circos would have been rendered at this point. At this stage we kick
    * start iteratively adding 1 HSP to the page every 25 milli-seconds.
    */
    componentDidUpdate(prevProps, prevState) {
        // Log to console how long the last update take?
        // console.log((Date.now() - this.lastTimeStamp) / 1000);

        // Lock sidebar in its position on the first update.
        if (this.nextQuery == 0 && this.nextHit == 0 && this.nextHSP == 0) {
            this.affixSidebar();
        }

        // Queue next update if we have not rendered all results yet.
        if (this.nextQuery < this.state.queries.length) {
            // setTimeout is used to clear call stack and space out
            // the updates giving the browser a chance to respond
            // to user interactions.
            setTimeout(() => this.updateState(), 25);
        } else {
            this.props.componentFinishedUpdating();
        }

        this.props.plugins.componentDidUpdate(prevProps, prevState);
    }

    /**
    * Push next slice of results to React for rendering.
    */
    updateState() {
        var results = [];
        var numHSPsProcessed = 0;
        while (this.nextQuery < this.state.queries.length) {
            var query = this.state.queries[this.nextQuery];

            // We may see a query multiple times during rendering because only
            // 3 hsps are rendered in each cycle, but we want to create the
            // corresponding Query component only the first time we see it.
            if (this.nextHit == 0 && this.nextHSP == 0) {
                results.push(
                    <ReportQuery
                        key={'Query_' + query.id}
                        query={query}
                        program={this.state.program}
                        querydb={this.state.querydb}
                        showQueryCrumbs={this.state.queries.length > 1}
                        non_parse_seqids={this.state.non_parse_seqids}
                        imported_xml={this.state.imported_xml}
                        veryBig={this.state.veryBig}
                    />
                );

                results.push(...this.props.plugins.queryResults(query));
            }

            while (this.nextHit < query.hits.length) {
                var hit = query.hits[this.nextHit];
                // We may see a hit multiple times during rendering because only
                // 10 hsps are rendered in each cycle, but we want to create the
                // corresponding Hit component only the first time we see it.
                if (this.nextHSP == 0) {
                    results.push(
                        <Hit
                            key={'Query_' + query.number + '_Hit_' + hit.number}
                            query={query}
                            hit={hit}
                            algorithm={this.state.program}
                            querydb={this.state.querydb}
                            selectHit={this.selectHit}
                            imported_xml={this.state.imported_xml}
                            non_parse_seqids={this.state.non_parse_seqids}
                            showQueryCrumbs={this.state.queries.length > 1}
                            showHitCrumbs={query.hits.length > 1}
                            veryBig={this.state.veryBig}
                            onChange={this.prepareAlignmentOfSelectedHits}
                            {...this.props}
                        />
                    );
                }

                while (this.nextHSP < hit.hsps.length) {
                    // Get nextHSP and increment the counter.
                    var hsp = hit.hsps[this.nextHSP++];
                    results.push(
                        <HSP
                            key={
                                'Query_' +
                                    query.number +
                                    '_Hit_' +
                                    hit.number +
                                    '_HSP_' +
                                    hsp.number
                            }
                            query={query}
                            hit={hit}
                            hsp={hsp}
                            algorithm={this.state.program}
                            showHSPNumbers={hit.hsps.length > 1}
                            {...this.props}
                        />
                    );
                    numHSPsProcessed++;
                    if (numHSPsProcessed == this.maxHSPs) break;
                }
                // Are we here because we have iterated over all hsps of a hit,
                // or because of the break clause in the inner loop?
                if (this.nextHSP == hit.hsps.length) {
                    this.nextHit = this.nextHit + 1;
                    this.nextHSP = 0;
                }
                if (numHSPsProcessed == this.maxHSPs) break;
            }

            // Are we here because we have iterated over all hits of a query,
            // or because of the break clause in the inner loop?
            if (this.nextHit == query.hits.length) {
                this.nextQuery = this.nextQuery + 1;
                this.nextHit = 0;
            }
            if (numHSPsProcessed == this.maxHSPs) break;
        }

        // Push the components to react for rendering.
        this.numUpdates++;
        this.lastTimeStamp = Date.now();
        this.setState({
            results: this.state.results.concat(results),
            veryBig: this.numUpdates >= 250,
        });
    }

    /**
    * Affixes the sidebar.
    */
    affixSidebar() { 
         var $sidebar = $('.sidebar');
         var sidebarOffset = $sidebar.offset();
         if (sidebarOffset) {
             $sidebar.affix({
                 offset: {
                     top: sidebarOffset.top,
                 },
             });
         }
    }

    render() {
        return this.state.results;
    }
}

export default Hits;
