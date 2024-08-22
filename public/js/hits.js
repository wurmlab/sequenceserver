/* eslint-disable no-unused-vars */
import { Component } from 'react';
import _ from 'underscore';

import { ReportQuery } from './query';
import Hit from './hit';
import HSP from './hsp';
import AlignmentExporter from './alignment_exporter';
/* eslint-enable no-unused-vars */

class Hits extends Component {
    constructor(props) {
        super(props);
        this.numUpdates = 0;
        this.nextQuery = 0;
        this.nextHit = 0;
        this.nextHSP = 0;
        this.maxHSPs = 3; // max HSPs to render in a cycle
        this.state = props.state;
        this.state.pluginResults = [];
        this.prepareAlignmentOfSelectedHits = this.prepareAlignmentOfSelectedHits.bind(this);
    }

    componentDidMount() {
        this.props.plugins.init(this.onPluginResultsFetched.bind(this));
        this.componentDidUpdate(this.props, this.state);
    }

    onPluginResultsFetched(pluginResults) {
        this.setState({ pluginResults: pluginResults });
    }

    replacePluginResults(pluginResults) {
        if (!pluginResults) return;

        const updatedResults = this.props.plugins.replacePluginResults(this.state.results, pluginResults);
        this.setState({ results: updatedResults, pluginResults: pluginResults });
    }

    /**
    * Called for the first time after as BLAST results have been retrieved from
    * the server and added to this.state by fetchResults. Only summary overview
    * and circos would have been rendered at this point. At this stage we kick
    * start iteratively adding 1 HSP to the page every 25 milli-seconds.
    */
    componentDidUpdate(_prevProps, prevState) {
        // Log to console how long the last update take?
        // console.log((Date.now() - this.lastTimeStamp) / 1000);

        // Lock sidebar in its position on the first update.
        if (this.isFirstUpdate()) {
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

        if (this.state.pluginResults.length > 0 && prevState.pluginResults.length == 0) {
            this.replacePluginResults(this.state.pluginResults);
        }
    }

    isFirstUpdate() {
        return this.nextQuery == 0 && this.nextHit == 0 && this.nextHSP == 0;
    }

    /* eslint complexity: ["error", 6] */
    /* ---------------------
    * Push next slice of results to React for rendering.
    */
    updateState() {
        var results = { items: [], numHSPsProcessed: 0 };
        this.processQueries(results);

        // Push the components to react for rendering.
        this.numUpdates++;
        this.lastTimeStamp = Date.now();
        this.setState({
            results: this.state.results.concat(results.items),
            veryBig: this.numUpdates >= 250,
        });
    }

    processQueries(results) {
        while (this.nextQuery < this.state.queries.length) {
            var query = this.state.queries[this.nextQuery];

            // We may see a query multiple times during rendering because only
            // 3 hsps are rendered in each cycle, but we want to create the
            // corresponding Query component only the first time we see it.
            if (this.nextHit == 0 && this.nextHSP == 0) {
                results.items.push(this.renderReportQuery(query));
                results.items.push(this.props.plugins.queryResult(query, this.state.pluginResults));
            }

            this.processHits(results, query);
            this.iterateLoops(['nextQuery', 'nextHit'], query.hits.length);
            if (results.numHSPsProcessed == this.maxHSPs) break;
        }
    }

    processHits(results, query) {
        while (this.nextHit < query.hits.length) {
            var hit = query.hits[this.nextHit];
            // We may see a hit multiple times during rendering because only
            // 3 hsps are rendered in each cycle, but we want to create the
            // corresponding Hit component only the first time we see it.
            if (this.nextHSP == 0) results.items.push(this.renderHit(query, hit));

            this.processHSPS(results, query, hit);
            this.iterateLoops(['nextHit', 'nextHSP'], hit.hsps.length);
            if (results.numHSPsProcessed == this.maxHSPs) break;
        }
    }

    processHSPS(results, query, hit) {
        while (this.nextHSP < hit.hsps.length) {
            // Get nextHSP and increment the counter.
            var hsp = hit.hsps[this.nextHSP++];
            results.items.push(
                this.renderHsp(query, hit, hsp)
            );
            results.numHSPsProcessed++;
            if (results.numHSPsProcessed == this.maxHSPs) break;
        }
    }

    /*
    *  this function check if 2nd argument is reach end of it
    */
    iterateLoops(args, length) {
        if (this[args[1]] != length) return;

        this[args[0]]++;
        this[args[1]] = 0;
    }

    renderHsp(query, hit, hsp) {
        return (
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
    }

    renderHit(query, hit) {
        return (
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

    renderReportQuery(query) {
        return (
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

    /* eslint complexity: ["error", 6] */
    /* -----------------------------------
    * Event-handler when hit is selected
    * Adds glow to hit component.
    * Updates number of Fasta that can be downloaded
    */
    selectHit(id) {
        var checkbox = $('#' + id);
        var num_checked = $('.hit-links :checkbox:checked').length;

        if (!checkbox || !checkbox.val()) return;

        var $hit = $(checkbox.data('target'));

        // Highlight selected hit and enable 'Download FASTA/Alignment of
        // selected' links.
        if (checkbox.is(':checked')) {
            $hit.addClass('glow');
            $hit.next('.hsp').addClass('glow');
            $('.download-fasta-of-selected').enable();
            $('.download-alignment-of-selected').enable();
        } else {
            $hit.removeClass('glow');
            $hit.next('.hsp').removeClass('glow');
            $('.download-fasta-of-selected').attr('href', '#').removeAttr('download');
        }

        var $a = $('.download-fasta-of-selected');
        var $b = $('.download-alignment-of-selected');

        if (num_checked >= 1) {
            $a.find('.text-bold').html(num_checked);
            $b.find('.text-bold').html(num_checked);
        }

        if (num_checked == 0) {
            $a.addClass('disabled').find('.text-bold').html('');
            $b.addClass('disabled').find('.text-bold').html('');
        }
    }

    prepareAlignmentOfSelectedHits() {
        var sequence_ids = $('.hit-links :checkbox:checked').map(function () {
            return this.value;
        }).get();

        if(!sequence_ids.length){
            // remove attributes from link if sequence_ids array is empty
            $('.download-alignment-of-selected').attr('href', '#').removeAttr('download');
            return;

        }
        if(this.state.alignment_blob_url){
            // always revoke existing url if any because this method will always create a new url
            window.URL.revokeObjectURL(this.state.alignment_blob_url);
        }
        var hsps_arr = [];
        var aln_exporter = new AlignmentExporter();
        const self = this;
        _.each(this.state.queries, _.bind(function (query) {
            _.each(query.hits, function (hit) {
                if (_.indexOf(sequence_ids, hit.id) != -1) {
                    hsps_arr = hsps_arr.concat(self.props.populate_hsp_array(hit, query.id));
                }
            });
        }, this));
        const filename = 'alignment-' + sequence_ids.length + '_hits.txt';
        const blob_url = aln_exporter.prepare_alignments_for_export(hsps_arr, filename);
        // set required download attributes for link
        $('.download-alignment-of-selected').attr('href', blob_url).attr('download', filename);
        // track new url for future removal
        this.setState({alignment_blob_url: blob_url});
    }

    render() {
        return this.state.results;
    }
}

export default Hits;
