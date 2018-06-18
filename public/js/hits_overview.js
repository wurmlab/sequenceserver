import d3 from 'd3';
import _ from 'underscore';
import Grapher from './grapher';
import * as Helpers from './visualisation_helpers';

class Graph {

  static name() {
    return 'Graphical overview of hits';
  }

  static className() {
    return 'alignment-overview';
  }

  static collapseId(props) {
    return 'alignment_'+props.query.number;
  }

  static dataName(props) {
      return 'Alignment-Overview-'+props.query.id;
  }

  constructor($svgContainer, props) {
      this.svg_container = $svgContainer;
      $queryDiv = $svgContainer.parents('.resultn');
      hits = this.extractData(props.query.hits, props.query.number);
      this.graphIt($queryDiv, $svgContainer, 0, 20, null, hits);
  }

  extractData(query_hits, number) {
    var hits = [];
    query_hits.map(function (hit) {
        var _hsps = [];
        var hsps = hit.hsps;
        _.each(hsps, function (hsp) {
            var _hsp = {};
            _hsp.hspEvalue = hsp.evalue;
            _hsp.hspStart = hsp.qstart;
            _hsp.hspEnd = hsp.qend;
            _hsp.hspFrame = hsp.sframe;
            _hsp.hspId = "Query_"+number+"_hit_"+hit.number+"_hsp_"+hsp.number;
            _hsps.push(_hsp);
        });
        _hsps.hitId = hit.id;
        _hsps.hitDef = "Query_"+number+"_hit_"+hit.number;
        _hsps.hitEvalue = hit.evalue;
        hits.push(_hsps);
    });
    return hits;
  }

  setupTooltip() {
      this.svg_container.find('[data-toggle="tooltip"]').tooltip({
          'placement': 'top', 'container': 'body', 'html': 'true',
          'delay': 0, 'white-space': 'nowrap'
      });
  }

  setupClick($graphDiv) {
    $('a', $graphDiv).click(function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        window.location.hash = $(this).attr('href');
    });
  }

  graphControls($queryDiv, $graphDiv, isInit, opts, hits) {
    var MIN_HITS_TO_SHOW = 20;

    var totalHits, shownHits, lessButton, moreButton;

    var countHits = function () {
        totalHits = hits.length;
        shownHits = $queryDiv.find('.ghit > g').length;
    };

    var setupButtons = function($queryDiv, $graphDiv) {
        $graphDiv
        .append(
            $('<button/>')
            .addClass('btn btn-link more')
            .attr('type', 'button')
            .attr('data-parent-query', $queryDiv.attr('id'))
            .html('View More&nbsp;')
            .append(
                $('<i/>')
                .html('&nbsp;&nbsp;')
                .addClass('fa fa-angle-double-down')
            ),
            $('<button/>')
            .addClass('btn btn-link less')
            .attr('type', 'button')
            .attr('data-parent-query', $queryDiv.attr('id'))
            .html('View Less&nbsp;')
            .append(
                $('<i/>')
                .html('&nbsp;&nbsp;')
                .addClass('fa fa-angle-double-up')
            )
        );

        lessButton = $('.less', $graphDiv);
        moreButton = $('.more', $graphDiv);
    };

    var initButtons = function () {
        countHits();
        if (totalHits === MIN_HITS_TO_SHOW ||
            shownHits < MIN_HITS_TO_SHOW) {
            lessButton.hide();
            moreButton.hide();
        }
        else if (shownHits === totalHits) {
            moreButton.hide();
            lessButton.show();
        }
        else if (shownHits === MIN_HITS_TO_SHOW) {
            lessButton.hide();
            moreButton.show();
        }
        else {
            lessButton.show();
            moreButton.show();
        }
    };

    // Setup view buttons' state properly if called for first time.
    if (isInit === true) {
        setupButtons($queryDiv, $graphDiv);
        initButtons();
    }

    moreButton.on('click', _.bind(function (e) {
        countHits();
        this.graphIt($queryDiv, $graphDiv, shownHits, MIN_HITS_TO_SHOW, opts, hits);
        initButtons();
        this.setupTooltip();
        e.stopPropagation();
    },this));

    lessButton.on('click', _.bind(function (e) {
        countHits();
        var diff = shownHits - MIN_HITS_TO_SHOW;

        // Decrease number of shown hits by defined constant.
        if (diff >= MIN_HITS_TO_SHOW) {
            this.graphIt($queryDiv, $graphDiv, shownHits, -MIN_HITS_TO_SHOW, opts, hits);
            initButtons();
        }
        else if (diff !== 0) {
            // Ensure a certain number of hits always stay in graph.
            this.graphIt($queryDiv, $graphDiv, shownHits, MIN_HITS_TO_SHOW - shownHits, opts, hits);
            initButtons();
        }
        this.setupTooltip();
        e.stopPropagation();
    },this));
  }

  drawLegend(svg, options, width, height, hits) {
    var svg_legend = svg.append('g')
        .attr('transform',
            'translate(0,' + (height - 1.88 * options.margin) + ')');

    svg_legend.append('rect')
        .attr('x', 7 * (width - 2 * options.margin) / 10)
        .attr('width', 2 * (width - 4 * options.margin) / 10)
        .attr('height', options.legend)
        .attr('fill', 'url(#legend-grad)');

    svg_legend.append('text')
        .attr('class',' legend-text')
        .attr('transform', 'translate(0, ' +options.legend +')')
        .attr('x', 6 * (width - 2 * options.margin) / 10 - options.margin / 2)
        .text("Weaker hits");
        // .text(function() {
        //   return Helpers.prettify_evalue(hits[hits.length-1].hitEvalue);
        // })

    svg_legend.append('text')
        .attr('class',' legend-text')
        .attr('transform', 'translate(0, ' + options.legend + ')')
        .attr('x', 9 * (width - 2 * options.margin) / 10 + options.margin / 2)
        .text("Stronger hits");
        // .text(function () {
        //   return Helpers.prettify_evalue(hits[0].hitEvalue);
        // })

    svg.append('linearGradient')
        .attr('id', 'legend-grad')
    .selectAll('stop')
    .data([
        {offset: "0%", color: "#ccc"},
        {offset: '50%', color: '#888'},
        {offset: "100%", color: "#000"}
    ])
    .enter()
    .append('stop')
        .attr('offset', function (d) {
            return d.offset;
        })
        .attr('stop-color', function (d) {
            return d.color;
        });
  }

  graphIt($queryDiv, $graphDiv, index, howMany, opts, inhits) {
    /* barHeight: Height of each hit track.
     * legend: Height reserved for the overview legend.
     * margin: Margin around the svg element.
     */
    var defaults = {
        barHeight: 3,
        legend: inhits.length > 1 ? 3 : 0,
        margin: 20
    },
        options = $.extend(defaults, opts);
        var hits = inhits.slice(0 , index + howMany);

    // Don't draw anything when no hits are obtained.
    if (hits.length < 1) return false;

    if (index !== 0) {
        // Currently, we have no good way to extend pre-existing graph
        // and hence, are removing the old one and redrawing.
        $graphDiv.find('svg').remove();
    }

    var queryLen = $queryDiv.data().queryLen;
    var q_i = $queryDiv.attr('id');

    var width = $graphDiv.width();
    var height = hits.length * (options.barHeight) +
        2 * options.legend + 5 * options.margin;
    // var height = $graphDiv.height();

    var SEQ_TYPES = {
        blastn: 'nucleic_acid',
        blastp: 'amino_acid',
        blastx: 'nucleic_acid',
        tblastx: 'nucleic_acid',
        tblastn: 'amino_acid'
    };

    var svg = d3.select($graphDiv[0])
        .selectAll('svg')
        .data([hits])
        .enter()
        .insert('svg', ':first-child')
            .attr('width', width)
            .attr('height', height)
        .append('g')
            .attr('transform', 'translate(' + options.margin / 2 + ', ' + (1.5 * options.margin) + ')');

    var x = d3.scale
        .linear()
        .range([0, width - options.margin]);

    x.domain([1, queryLen]);

    var algorithm = $queryDiv.data().algorithm;
    var formatter = Helpers.tick_formatter(x, SEQ_TYPES[algorithm]);

    var _tValues = x.ticks(11);
    _tValues.pop();

    var xAxis = d3.svg
        .axis()
        .scale(x)
        .orient('top')
        .tickValues(_tValues.concat([1, queryLen]))
        .tickFormat(formatter);

    // Attach the axis to DOM (<svg> element)
    var container = svg.append('g')
        .attr('transform', 'translate(0, ' + options.margin + ')')
        .append('g')
            .attr('class', 'x axis')
            .call(xAxis);

    // Vertical alignment of ticks
    container.selectAll('text')
            .attr('x','25px')
            .attr('y','2px')
            .attr('transform','rotate(-90)');

    var y = d3.scale
        .ordinal()
        .rangeBands([0, height - 3 * options.margin - 2 * options.legend], 0.3);

    y.domain(hits.map(function (d) {
        return d.hitId;
    }));

    var gradScale = d3.scale
        .log()
        .domain([
            d3.min([1e-5, d3.min(hits.map(function (d) {
                if (parseFloat(d.hitEvalue) === 0.0) return undefined;
                return d.hitEvalue;
                }))
            ]),
            d3.max(hits.map(function (d) {
                return d.hitEvalue;
            }))
        ])
        .range([40,150]);

    svg.append('g')
        .attr('class', 'ghit')
        .attr('transform', 'translate(0, ' + 1.65 * (options.margin - options.legend) + ')')
        .selectAll('.hits')
        .data(hits)
        .enter()
        .append('g')
            .each(function (d,i) {
                // TODO: Avoid too many variables and improve naming.

                d3.select(this)
                .selectAll('.hsp')
                .data(d).enter()
                .append('a')
                .each(function (v, j) {
                    // Drawing the HSPs connector line using the same
                    // color as that of the hit track (using lookahead).
                    var yHspline = y(d.hitId) + options.barHeight / 2;
                    var hsplineColor = d3.rgb(gradScale(v.hspEvalue),
                                              gradScale(v.hspEvalue),
                                              gradScale(v.hspEvalue));

                    if (j+1 < d.length) {
                        if (d[j].hspEnd <= d[j+1].hspStart) {
                            d3.select(this.parentNode)
                            .append('line')
                                .attr('x1', x(d[j].hspEnd))
                                .attr('y1', yHspline)
                                .attr('x2', x(d[j+1].hspStart))
                                .attr('y2', yHspline)
                                .attr('stroke', hsplineColor);
                        }
                        else if (d[j].hspStart > d[j+1].hspEnd) {
                            d3.select(this.parentNode)
                            .append('line')
                                .attr('x1', x(d[j+1].hspEnd))
                                .attr('y1', yHspline)
                                .attr('x2', x(d[j].hspStart))
                                .attr('y2', yHspline)
                                .attr('stroke', hsplineColor);
                        }
                    }

                    // Draw the rectangular hit tracks itself.
                    d3.select(this)
                        .attr('xlink:href', '#' + q_i + '_hit_' + (i+1))
                        .append('rect')
                            .attr('data-toggle', 'tooltip')
                            .attr('title', d.hitId + '<br><strong>E value:</strong> '+Helpers.prettify_evalue(v.hspEvalue))
                            .attr('class','bar')
                            .attr('x', function (d) {
                                return x(d.hspStart);
                            })
                            .attr('y', y(d.hitId))
                            .attr('width', function (d) {
                                return x(d.hspEnd - d.hspStart + 1);
                            })
                            .attr('height', options.barHeight)
                            .attr('fill', d3.rgb(hsplineColor));
                });
            });

    // Draw legend only when more than one hit present
    if (hits.length > 1) {
        this.drawLegend(svg, options, width, height, inhits);
    }
    // Bind listener events once all the graphical elements have
    // been drawn for first time.
    if (index === 0) {
        this.graphControls($queryDiv, $graphDiv, true, opts, inhits);
    }
    // Refresh tooltip each time graph is redrawn.
    this.setupTooltip();
    // Ensure clicking on 'rect' takes user to the relevant hit on all
    // browsers.
    this.setupClick($graphDiv);
  }
}

var HitsOverview = Grapher(Graph);
export default HitsOverview;
