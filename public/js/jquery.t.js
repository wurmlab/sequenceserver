(function ($) {

    var setupTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip({
            'placement': 'top',
            'container': 'body',
            'html': 'true',
            'white-space': 'nowrap'
        });
    }

    var initialize = function (selector) {
        var selectorId = $(selector).attr('id');

        // FIXME: SS should create the container and pass id of the
        // container to graphit.
        var container = $("<div class='graphical-overview'/>");
        container.append("<div class='graph'/>");
        container.append("<button type='button' data-parent-query="+ selectorId +
                         " class='btn btn-link more'>" +
                         "<i class='fa fa-angle-double-down'></i> View more</button>");
        container.append("<button type='button' data-parent-query="+ selectorId +
                         " class='btn btn-link less'>" +
                         "<i class='fa fa-angle-double-up'></i> View less</button>");

        $(selector).children().eq(1).children().eq(0).after(container);
    }

    var graphControls = function (pId, isInit) {
        // Show/Hide view more or less buttons according to the number of
        // hits already drawn, and yet to be drawn.
        var lessButton = $('.less', pId),
            moreButton = $('.more', pId);

        var initButtons = function (pId) {
                var totalHits = $(pId).data().hitCount,
                    shownHits = $(pId).find('.ghit > g').length;

                if (totalHits === 20 || shownHits < 20) {
                    lessButton.hide();
                    moreButton.hide();
                }
                else if (shownHits === totalHits) {
                    moreButton.hide();
                    lessButton.show();
                }
                else if (shownHits === 20) {
                    lessButton.hide();
                    moreButton.show();
                }
                else {
                    lessButton.show();
                    moreButton.show();
                }
        }

        // To check if drawing for first time, then run initButtons to
        // hide/show accordingly, or otherwise buttons may require a click
        // to show desired behavior.
        if (isInit === true) {
            initButtons(pId);
        }

        // Minimum number of hits in graphical overview that we always
        // want to retain.
        var MIN_HITS_TO_SHOW = 20;

        moreButton.on('click', function (e) {
            var pId = '#'+$(this).data().parentQuery;
            var shownHits = $(pId).find('.ghit > g').length;
            $.graphIt(pId, shownHits, MIN_HITS_TO_SHOW);
            initButtons(pId);
            setupTooltip();
            e.stopPropagation();
        });

        lessButton.on('click', function (e) {
            var pId = '#'+$(this).data().parentQuery;
            var shownHits = $(pId).find('.ghit > g').length;
            var diff = shownHits - MIN_HITS_TO_SHOW;

            // We are drawing less hits than currently shown, and hence
            // negative value has to be passed to graphIt.
            if (diff >= MIN_HITS_TO_SHOW) {
                $.graphIt(pId, shownHits, -MIN_HITS_TO_SHOW);
                initButtons(pId);
            }
            else if (diff !== 0) { // Don't show less than MIN_HITS_TO_SHOW hits.
                $.graphIt(pId, shownHits, MIN_HITS_TO_SHOW - shownHits);
                initButtons(pId);
            }
            setupTooltip();
            e.stopPropagation();
        });
    }

    // Returns an array of all the hits within the given selector
    // element, where the hit data is obtained from the data-attribs.
    // HSPs class name is indicated in data-graphit-target in the
    // selector element.
    var toD3 = function (selector, index, howMany) {
        var hits = []
        hitPanels = $(selector).find('.hitn').slice(0, index + howMany);
        hitPanels.map(function () {
            _hsps = [];
            $(this).find('.hsps').each(function () {
                __hsps = [];
                __hsps = $(this).data();
                __hsps.hspId = $(this).attr('id');
                _hsps.push(__hsps);
            });
            _hsps.hitId = $(this).attr('id');
            _hsps.hitDef = $(this).data().hitDef;
            _hsps.hitEvalue = $(this).data().hitEvalue;
            hits.push(_hsps);
        });
        return hits;
    }

    var drawLegend = function (svg, options, width, height) {
        var svg_legend = svg.append('g')
                .attr('transform',
                    'translate(0,'+(height-options.margin-options.legend*1.25)+')');

        svg_legend.append('rect')
                .attr('x', 7*(width-2*options.margin)/10)
                .attr('width', 2*(width-4*options.margin)/10)
                .attr('height', options.legend)
                .attr('fill', 'url(#legend-grad)');

        svg_legend.append('text')
                .attr('transform', 'translate(0, '+options.legend+')')
                .attr('x', 6*(width-2*options.margin)/10 - options.margin/2)
                .text("Weaker hits");
        svg_legend.append('text')
                .attr('transform', 'translate(0, '+options.legend+')')
                .attr('x', 9*(width-2*options.margin)/10 + options.margin/2)
                .text("Stronger hits");

        svg.append('linearGradient')
            .attr('id', 'legend-grad')
          .selectAll('stop')
            .data([
                {offset: "0%", color: "#ccc"},
                {offset: '50%', color: '#888'},
                {offset: "100%", color: "#000"}
                ])
          .enter().append('stop')
            .attr('offset', function (d) { return d.offset })
            .attr('stop-color', function (d) { return d.color });
    }

    $.extend({
        graphIt: function (selector, index, howMany, opts) {
            // barHeight: Height of each hit track.
            // barPadding: Padding around each hit track.
            // legend: Height reserved for the overview legend.
            // margin: Margin around the svg element.
            var defaults = {
                barHeight: 4,
                barPadding: 5,
                legend: 10,
                margin: 20
            }, options = $.extend(defaults, opts),
               hits = toD3(selector, index, howMany);

            // Don't draw anything when no hits are obtained.
            if (hits.length < 1) return false;

            if (index == 0) {
                initialize(selector);
            }
            else {
                // Currently, we have no good way to extend pre-existing graph
                // and hence, are removing the old one and redrawing.
                d3.select($(selector).find('.graph')[0])
                .selectAll('svg')
                .remove();
            }

            var queryLen = $(selector).data().queryLen;
            var q_i = $(selector).attr('id');

            var width = $('.graph', selector).width();
            var height = hits.length*(options.barHeight + options.barPadding) 
                + 5*options.margin + options.legend*3;

            var svg = d3.select($(selector).find('.graph')[0])
                .selectAll('svg')
                .data([hits]).enter()
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate('+options.margin/4+', '+options.margin/4+')');

            var x = d3.scale.linear().range([0, width-options.margin])
            x.domain([1, queryLen]);

            var _tValues = x.ticks(11);
            _tValues.pop();

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('top')
                .tickValues(_tValues.concat([1, queryLen]));

            // Attach the axis to DOM (<svg> element)
            var scale = svg.append('g')
                        .attr('transform', 'translate(0, '+options.margin+')')
                        .append('g').attr('class', 'x axis')
                        .call(xAxis);

            var y = d3.scale.ordinal()
                .rangeBands([0,height-3*options.margin-2*options.legend], .3);

            y.domain(hits.map(function (d, i) {
                return d.hitId;
            }));

            var gradScale = d3.scale.log()
                .domain([d3.min([1e-5, d3.min(hits.map(function (d) {
                    if (parseFloat(d.hitEvalue) === 0.0) return undefined;
                    return d.hitEvalue;
                }))]), d3.max(hits.map(function (d) {
                    return d.hitEvalue;
                }))])
                .range([40,150]);

            svg.append('g')
                .attr('class', 'ghit')
                .attr('transform', 'translate(0, '+(2*options.margin-options.legend)+')')
                .selectAll('.hits')
                .data(hits)
                .enter()
                .append('g')
                .attr('data-toggle', 'tooltip')
                .attr('title', function(d) {
                    // Pretty print evalue in tooltip.
                    var regex = /(\d*\.\d*)e?([+-]\d*)?/;
                    var parsedVal = regex.exec(d.hitEvalue);
                    var prettyEvalue = +parseFloat(parsedVal[1]).toFixed(3)
                    var returnString = d.hitDef + '<br><strong>Evalue:</strong> ' + prettyEvalue;
                    if (parsedVal[2] != undefined) {
                        returnString +=  ' x 10<sup>' + parsedVal[2] + '</sup>';
                    }
                    return returnString;
                })
                .each(function (d,i) {
                    // Cached parameters to be used later. Perhaps, can be avoided.
                    var h_i = i+1;
                    var p_hsp = d;
                    var p_id = d.hitId;
                    var p_count = d.length;

                    d3.select(this)
                        .selectAll('.hsps')
                        .data(d).enter()
                        .append('a')
                        .each(function (pd, j) {
                            // Drawing the HSPs connector line using the same
                            // color as that of the hit track (using lookahead).
                            var yHspline = y(p_id)+options.barHeight/2;
                            var hsplineColor = d3.rgb(gradScale(p_hsp.hitEvalue),
                                gradScale(p_hsp.hitEvalue),gradScale(p_hsp.hitEvalue));

                            if (j+1 < p_count) {
                                if (p_hsp[j].hspEnd <= p_hsp[j+1].hspStart) {
                                    d3.select(this.parentNode).append('line')
                                        .attr('x1', x(p_hsp[j].hspEnd))
                                        .attr('y1', yHspline)
                                        .attr('x2', x(p_hsp[j+1].hspStart))
                                        .attr('y2', yHspline)
                                        .attr('stroke', hsplineColor);
                                }
                                else if (p_hsp[j].hspStart > p_hsp[j+1].hspEnd) {
                                    d3.select(this.parentNode).append('line')
                                        .attr('x1', x(p_hsp[j+1].hspEnd))
                                        .attr('y1', yHspline)
                                        .attr('x2', x(p_hsp[j].hspStart))
                                        .attr('y2', yHspline)
                                        .attr('stroke', hsplineColor);
                                };
                            };

                            // Draw the rectangular hit tracks itself.
                            d3.select(this)
                            .attr('xlink:href', function (d,i) {return '#'+q_i+'_hit_'+(h_i);})
                            .append('rect')
                            .attr('x', function (d) {
                                    return x(d.hspStart);
                            })
                            .attr('y', y(p_id))
                            .attr('width', function (d) {
                                    return x(d.hspEnd - d.hspStart + 1);
                            })
                            .attr('height', options.barHeight)
                            .attr('fill', d3.rgb(hsplineColor));
                    });
                });

                // Draw legend only when more than one hit present
                if (hits.length > 1) {
                    drawLegend(svg, options, width, height);
                }
                // Bind listener events once all the graphical elements have
                // been drawn for first time.
                if (index === 0) {
                    graphControls(selector, true);
                }
                // Refresh tooltip each time graph is redrawn.
                setupTooltip();
        } 
    });
}(jQuery));
