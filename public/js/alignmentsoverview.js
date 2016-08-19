import React from 'react';
import _ from 'underscore';
import * as Helpers from './visualisation_helpers';
import * as Grapher from './grapher.js';

export default class GraphicalOverview extends React.Component {
  constructor(props) {
    super(props);
  }

  svgContainer() {
    return $(React.findDOMNode(this.refs.svgContainer))
  }

  componentDidMount() {
    var hits = this.toGraph(this.props.query.hits, this.props.query.number);
    var svgContainer = this.svgContainer();
    svgContainer.addClass('alignment-overview');
    var query_div = this.svgContainer().parents('.resultn');
    this.graph = new Graph(query_div, svgContainer, 0, 20, null, hits);
  }

  render() {
    return Grapher.grapher_render();
  }

  toGraph(query_hits, number) {
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
            _hsp.subStart = hsp.sstart;
            _hsp.subEnd = hsp.send;
            _hsp.hspId = "Query_"+number+"_hit_"+hit.number+"_hsp_"+hsp.number;
            _hsps.push(_hsp);
        });
        _hsps.hitId = hit.id;
        _hsps.hitDef = "Query_"+number+"_hit_"+hit.number;
        _hsps.hitEvalue = hit.evalue;
        _hsps.hitLen = hit.length;
        _hsps.seqStart = 0;
        _hsps.seqEnd = hit.length;
        hits.push(_hsps);
    });
    return hits;
  }
}

export class Graph {
  constructor($queryDiv, $graphDiv, shownHits, index, opts, hits) {
    this.graphIt($queryDiv, $graphDiv, shownHits, index, opts, hits);
  }

  setupTooltip() {
    $('[data-toggle="tooltip"]').tooltip({
        'placement': 'top',
        'container': 'body',
        'html': 'true',
        'delay': 0,
        'white-space': 'nowrap'
    });
  }

  setupClick($graphDiv) {
    $('a', $graphDiv).click(function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        window.location.hash = $(this).attr('href');
    });
  }

  setupResponsiveness($queryDiv, $graphDiv, index, opts, hits) {
    var currentWidth = $(window).width();
    var debounced_draw = _.debounce(_.bind(function () {
        if (currentWidth !== $(window).width()) {
            var shownHits = $queryDiv.find('.ghit > g').length;
            this.graphIt($queryDiv, $graphDiv, shownHits, index, opts, hits);
            currentWidth = $(window).width();
        }
    },this), 125);
    $(window).resize(debounced_draw);
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
                .addClass('fa fa-angle-double-down')
            ),
            $('<button/>')
            .addClass('btn btn-link less')
            .attr('type', 'button')
            .attr('data-parent-query', $queryDiv.attr('id'))
            .html('View Less&nbsp;')
            .append(
                $('<i/>')
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
            'translate(0,' + (height - 2.2 * options.margin) + ')');

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
     * barPadding: Padding around each hit track.
     * legend: Height reserved for the overview legend.
     * margin: Margin around the svg element.
     */
    var defaults = {
        barHeight: 4,
        barPadding: 1,
        legend: 10,
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

    // Calculate the Global Coordination for the given subject sequence
    var maxLeft = 0, maxRight = 0;
    for (var i = 0; i < hits.length; i++) {
      var id = hits[i].hitId;
      var qryStart = hits[i][0].hspStart;
      var qryEnd = hits[i][hits[i].length - 1].hspEnd;
      var subStart = hits[i][0].subStart;
      var subEnd = hits[i][hits[i].length - 1].subEnd;
      var subLen = hits[i].hitLen;

      if(hits[i][0].hspFrame > 0) {
         maxLeft = Math.max(maxLeft, subStart - qryStart);
         hits[i].seqViewStart = subStart - qryStart;
         maxRight = Math.max(maxRight, subLen - (subEnd + queryLen - qryEnd));
         hits[i].seqViewEnd = subLen - (subEnd + queryLen - qryEnd);
      }
      else
      {
         maxLeft = Math.max(maxLeft, subLen - (subStart + qryStart));
         hits[i].seqViewStart = subLen - (subStart + qryStart);
         maxRight = Math.max(maxRight, subEnd - (queryLen - qryEnd));
         hits[i].seqViewEnd = subEnd - (queryLen - qryEnd);
      }
    }

    var qryLeft = maxLeft;

    // Add query hit here
    for (var i = 0; i < hits.length; i++)
    {
       var seqStart = hits[i].seqViewStart;
       hits[i].seqViewStart = qryLeft - seqStart;
       hits[i].seqViewEnd = hits[i].seqViewStart + hits[i].hitLen;

       for( var j = 0; j < hits[i].length; j++)
       {
           var qryStart = hits[i][j].hspStart;
           var qryEnd = hits[i][j].hspEnd;

           hits[i][j].hspViewStart = qryLeft + qryStart;
           hits[i][j].hspViewEnd = qryLeft + qryEnd;
       }
    }

    queryLen = maxLeft + maxRight + queryLen;

    var q_i = $queryDiv.attr('id');

    var width = $graphDiv.width();
    var height = hits.length * (options.barHeight + options.barPadding) +
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

    // ColorScale HKMOON
    var colorScale = function(evalue)
    {
        if(evalue > 1e-10) return '#2415bf';
        else if(evalue > 1e-50) return '#00bebb';
        else if(evalue > 1e-100) return '#00c200';
        else if(evalue > 1e-200) return '#de00bf';
        else if(evalue <= 1e-200) return '#de0007';
    };

    // Marker chooser function HKMOON
    var getMarker = function(evalue)
    {
        if(evalue > 1e-10) return 'url(#Arrow4)';
        else if(evalue > 1e-50) return 'url(#Arrow3)';
        else if(evalue > 1e-100) return 'url(#Arrow2)';
        else if(evalue > 1e-200) return 'url(#Arrow1)';
        else if(evalue <= 1e-200) return 'url(#Arrow0)';
    }
    var seqLen = $queryDiv.data().queryLen;

    svg.append('g')
        .attr('class', 'ghit')
        .attr('transform', 'translate(0, ' + (2 * options.margin - options.legend) + ')')
        .selectAll('.hits')
        .data(hits)
        .enter()
        .append('g')
            // .attr('data-toggle', 'tooltip')
            // .attr('title', function(d) {
            //     // Pretty print evalue in tooltip.
            //     return d.hitId + '<br><strong>E value:</strong> ' + Helpers.prettify_evalue(d.hitEvalue);
            //
            // })
            .each(function (d,i) {
                // TODO: Avoid too many variables and improve naming.
                var h_i = i+1;
                var p_hsp = d;
                var p_id = d.hitId;
                var p_count = d.length;

                var yHeight = y(p_id) + options.barHeight / 4;

                 // draw sequence
                 d3.select(this)
                     .append('line')
                     .attr('x1', x(d.seqViewStart))
                     .attr('y1', yHeight)
                     .attr('x2', x(d.seqViewEnd))
                     .attr('y2', yHeight)
                     .attr('stroke', 'black');

                d3.select(this)
                .selectAll('.hsp')
                .data(d).enter()
                .append('a')
                .each(function (_, j) {
                    // Drawing the HSPs connector line using the same
                    // color as that of the hit track (using lookahead).
                    var yHspline = y(p_id) + options.barHeight / 2;
                    var hsplineColor = d3.rgb(gradScale(p_hsp.hitEvalue),
                                              gradScale(p_hsp.hitEvalue),
                                              gradScale(p_hsp.hitEvalue));

                    if (j+1 < p_count) {
                        if (p_hsp[j].hspEnd <= p_hsp[j+1].hspStart) {
                            d3.select(this.parentNode)
                            .append('line')
                                .attr('x1', x(p_hsp[j].hspViewEnd))
                                .attr('y1', yHspline)
                                .attr('x2', x(p_hsp[j+1].hspViewStart))
                                .attr('y2', yHspline)
                                .attr('stroke', hsplineColor);
                        }
                        else if (p_hsp[j].hspStart > p_hsp[j+1].hspEnd) {
                            d3.select(this.parentNode)
                            .append('line')
                                .attr('x1', x(p_hsp[j+1].hspViewEnd))
                                .attr('y1', yHspline)
                                .attr('x2', x(p_hsp[j].hspViewStart))
                                .attr('y2', yHspline)
                                .attr('stroke', hsplineColor);
                        }
                    }

                    // Draw the rectangular hit tracks itself.
                    d3.select(this)
                        // .attr('xlink:href', '#' + q_i + '_hit_' + h_i)
                        // .append('rect')
                        //     .attr('class','bar')
                        //     .attr('x', function (d) {
                        //         return x(d.hspStart);
                        //     })
                              .attr('data-toggle', 'tooltip')
                              .attr('title', function(d) {
                                  // Pretty print evalue in tooltip.
                                  return p_hsp.hitId + '<br><strong>E value:</strong> ' + Helpers.prettify_evalue(p_hsp.hitEvalue);

                              })
                            // .attr('y', y(p_id))
                            // .attr('width', function (d) {
                            //     return x(d.hspEnd - d.hspStart + 1);
                            // })
                            // .attr('height', options.barHeight)
                            // .attr('fill', d3.rgb(hsplineColor));
                      if (p_hsp[j].hspFrame > 0) {
                        d3.select(this)
                            .append('path')
                            .attr('d', function(d) {
                              // Use -6 for hspViewEnd to adjust the total matched length
                              return 'M ' + x(d.hspViewStart) + ',' + yHeight + ' L ' + (x(d.hspViewEnd) - 4) + ',' + yHeight;
                            })
                            .attr('stroke-width', options.barHeight)
                            .attr('stroke-linecap', 'butt')
                            .attr('stroke', d3.rgb(hsplineColor))
                            .attr('marker-end', function () {
                              return getMarker(p_hsp[j].hspEvalue)
                            });
                      } else {
                        d3.select(this)
                            .append('path')
                            .attr('d', function (d) {
                              // Use +6 for hspViewEnd to adjust the total matched length
                              return 'M ' + x(d.hspViewStart) + ',' + yHeight + ' L ' + (x(d.hspViewEnd) + 4) + ',' + yHeight;
                            })
                            .attr('stroke-width', options.barHeight)
                            .attr('stroke-linecap', 'butt')
                            .attr('stroke', d3.rgb(hsplineColor))
                            .attr('marker-end', function () {
                              return getMarker(p_hsp[j].hspEvalue)
                            });
                      }
                });
            });

    svg.select('g > .ghit')
                .append('g')
                .append('rect')
                .attr('x', x(qryLeft))
                .attr('y', -12)
                .attr('width', x(seqLen))
                .attr('height', options.barHeight)
                .attr('fill', 'red');

    // Draw legend only when more than one hit present
    if (hits.length > 1) {
        this.drawLegend(svg, options, width, height, inhits);
    }
    // Bind listener events once all the graphical elements have
    // been drawn for first time.
    if (index === 0) {
        this.graphControls($queryDiv, $graphDiv, true, opts, inhits);
        // Redraw the SVG on a browser resize...
        this.setupResponsiveness($queryDiv, $graphDiv, index, opts, inhits);
    }
    // Refresh tooltip each time graph is redrawn.
    this.setupTooltip();
    // Ensure clicking on 'rect' takes user to the relevant hit on all
    // browsers.
    this.setupClick($graphDiv);
  }
}
