(function ($) {
    var setupTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip({
            'placement': 'top',
            'container': 'body',
            'html': 'true',
            'white-space': 'nowrap'
        });
    };

    var setupClick = function ($graphDiv) {
        $('a', $graphDiv).click(function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            window.location.hash = $(this).attr('href');
        });
    };

    var setupResponsiveness = function ($queryDiv, $graphDiv, index, opts)  {
        var currentWidth = $(window).width();
        var debounced_draw = _.debounce(function () {
            if (currentWidth !== $(window).width()) {
                var shownHits = $queryDiv.find('.ghit > g').length;
                $.graphIt($queryDiv, $graphDiv, shownHits, index, opts);
                currentWidth = $(window).width();
            }
        }, 125);
        $(window).resize(debounced_draw);
    };

    var graphControls = function ($queryDiv, $graphDiv, isInit) {
        var MIN_HITS_TO_SHOW = 20;

        var totalHits, shownHits, lessButton, moreButton;

        var countHits = function () {
            totalHits = $queryDiv.data().hitCount;
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

        moreButton.on('click', function (e) {
            countHits();
            $.graphIt($queryDiv, $graphDiv, shownHits, MIN_HITS_TO_SHOW);
            initButtons();
            setupTooltip();
            e.stopPropagation();
        });

        lessButton.on('click', function (e) {
            countHits();
            var diff = shownHits - MIN_HITS_TO_SHOW;

            // Decrease number of shown hits by defined constant.
            if (diff >= MIN_HITS_TO_SHOW) {
                $.graphIt($queryDiv, $graphDiv, shownHits, -MIN_HITS_TO_SHOW);
                initButtons();
            }
            else if (diff !== 0) {
                // Ensure a certain number of hits always stay in graph.
                $.graphIt($queryDiv, $graphDiv, shownHits, MIN_HITS_TO_SHOW - shownHits);
                initButtons();
            }
            setupTooltip();
            e.stopPropagation();
        });
    };

    /* Extracts data from document data-attribs are returns in
     * suitable object.
     */
    var extractData = function ($queryDiv, index, howMany) {
        var hitPanels, hits = [];
        hitPanels = $queryDiv.find('.hitn').slice(0, index + howMany);
        hitPanels.map(function () {
            var $this = $(this);
            var _hsps = [];
            $this.find('.hsp').each(function () {
                var __hsps = [];
                __hsps = $(this).data();
                __hsps.hspId = this.id;
                _hsps.push(__hsps);
            });
            _hsps.hitId = $this.attr('id');
            _hsps.hitDef = $this.data().hitDef;
            _hsps.hitEvalue = $this.data().hitEvalue;
            _hsps.hitLen = $this.data().hitLen;
            _hsps.seqStart = 0;
            _hsps.seqEnd = $this.data().hitLen;
            hits.push(_hsps);
        });
        return hits;
    };

    var drawLegend = function (svg, options, width, height) {
        var svg_legend = svg.append('g')
            .attr('transform',
                'translate(0,' + (height - options.margin - options.legend * 1.25) + ')');

        svg_legend.append('rect')
            .attr('x', 7 * (width - 2 * options.margin) / 10)
            .attr('width', 2 * (width - 4 * options.margin) / 10)
            .attr('height', options.legend)
            .attr('fill', 'url(#legend-grad)');

        svg_legend.append('text')
            .attr('transform', 'translate(0, ' +options.legend +')')
            .attr('x', 6 * (width - 2 * options.margin) / 10 - options.margin / 2)
            .text("Weaker hits");

        svg_legend.append('text')
            .attr('transform', 'translate(0, ' + options.legend + ')')
            .attr('x', 9 * (width - 2 * options.margin) / 10 + options.margin / 2)
            .text("Stronger hits");

        svg.append('linearGradient')
            .attr('id', 'legend-grad')
        .selectAll('stop')
        .data([
            {offset: "0%", color: "#2415bf"},
            {offset: "19%", color: "#2415bf"},
            {offset: '20%', color: '#00bebb'},
            {offset: '39%', color: '#00bebb'},
            {offset: "40%", color: "#00c200"},
            {offset: "59%", color: "#00c200"},
            {offset: '60%', color: '#de00bf'},
            {offset: '79%', color: '#de00bf'},
            {offset: "80%", color: "#de0007"},
            {offset: "100%", color: "#de0007"}
        ])
        .enter()
        .append('stop')
            .attr('offset', function (d) {
                return d.offset;
            })
            .attr('stop-color', function (d) {
                return d.color;
            });
    };

    /* Main method responsible for drawing the graphical overview.
     * Query div and target div element along with suitable options
     * are provided by the calling function.
     */
    $.extend({
        graphIt: function ($queryDiv, $graphDiv, index, howMany, opts) {
            /* barHeight: Height of each hit track.
             * barPadding: Padding around each hit track.
             * legend: Height reserved for the overview legend.
             * margin: Margin around the svg element.
             */
            var defaults = {
                barHeight: 4,
                barPadding: 5,
                legend: 10,
                margin: 20
            },
                options = $.extend(defaults, opts),
                hits = extractData($queryDiv, index, howMany);

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

            for(var i = 0; i < hits.length; i++)
            {
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
            for(var i = 0; i < hits.length; i++)
            {
                var seqStart = hits[i].seqViewStart;
                hits[i].seqViewStart = qryLeft - seqStart;
                hits[i].seqViewEnd = hits[i].seqViewStart + hits[i].hitLen;

                for(var j = 0; j < hits[i].length; j++)
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
                5 * options.margin + options.legend * 3;

            var svg = d3.select($graphDiv[0])
                .selectAll('svg')
                .data([hits])
                .enter()
                .insert('svg', ':first-child')
                    .attr('width', width)
                    .attr('height', height)
                .append('g')
                    .attr('transform', 'translate(' + options.margin / 4 + ', ' + options.margin / 4 + ')');

            var x = d3.scale
                .linear()
                .range([0, width - options.margin]);

            x.domain([1, queryLen]);

            var _tValues = x.ticks(11);
            _tValues.pop();

            var xAxis = d3.svg
                .axis()
                .scale(x)
                .orient('top')
                .tickValues(_tValues.concat([1, queryLen]));

            // Attach the axis to DOM (<svg> element)
            svg.append('g')
                .attr('transform', 'translate(0, ' + options.margin + ')')
                .append('g')
                    .attr('class', 'x axis')
                    .call(xAxis);

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


            var defs = svg.append('defs');

            var markerData = [
                { id: 0, name: 'Arrow0', path: 'M 1,3 l-1,-3 l6,3 l-6,3 Z', viewbox: '0 0 6 6', fill: '#de0007' },
                { id: 1, name: 'Arrow1', path: 'M 1,3 l-1,-3 l6,3 l-6,3 Z', viewbox: '0 0 6 6', fill: '#de00bf' },
                { id: 2, name: 'Arrow2', path: 'M 1,3 l-1,-3 l6,3 l-6,3 Z', viewbox: '0 0 6 6', fill: '#00c200' },
                { id: 3, name: 'Arrow3', path: 'M 1,3 l-1,-3 l6,3 l-6,3 Z', viewbox: '0 0 6 6', fill: '#00bebb' },
                { id: 4, name: 'Arrow4', path: 'M 1,3 l-1,-3 l6,3 l-6,3 Z', viewbox: '0 0 6 6', fill: '#2415bf' }
            ];


            var marker = defs.selectAll('marker')
                .data(markerData)
                .enter()
                .append('svg:marker')
                .attr('id', function(d){ return d.name})
                .attr('markerHeight', 2)
                .attr('markerWidth', 2)
                .attr('markerUnits', 'strokeWidth')
                .attr('orient', 'auto')
                .attr('refX', 2) // For the adjustment of matched length
                .attr('refY', 3) // The height is adjusted
                .attr('viewBox', function(d){ return d.viewbox })
                    .append('svg:path')
                    .attr('d', function(d){ return d.path })
                    .attr('fill', function(d) { return d.fill });

            // ColorScale
            var colorScale = function(evalue)
            {
                if(evalue > 1e-10) return '#2415bf';
                else if(evalue > 1e-50) return '#00bebb';
                else if(evalue > 1e-100) return '#00c200';
                else if(evalue > 1e-200) return '#de00bf';
                else if(evalue <= 1e-200) return '#de0007';
            };

            // Marker chooser function
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
                    .attr('data-toggle', 'tooltip')
                    .attr('title', function(d) {
                        // Pretty print evalue in tooltip.
                        var regex = /(\d*\.\d*)e?([+-]\d*)?/;
                        var parsedVal = regex.exec(d.hitEvalue);
                        var prettyEvalue = parseFloat(parsedVal[1]).toFixed(3);
                        var returnString = d.hitDef + '<br><strong>E value:</strong> ' + prettyEvalue;
                        if (parsedVal[2] !== undefined) {
                            returnString +=  ' &times; 10<sup>' + parsedVal[2] + '</sup>';
                        }
                        return returnString;
                    })
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
                            var hsplineColor = d3.rgb(colorScale(p_hsp.hitEvalue));

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

                            if(p_hsp[j].hspFrame > 0)
                            {
                                d3.select(this)
                                    .attr('xlink:href', '#' + q_i + '_hit_' + h_i)
                                    .append('path')
                                    .attr('d', function (d) {
                                        // Use -6 for hspViewEnd to adjust the total matched length
                                        return 'M ' + x(d.hspViewStart) + ',' + yHeight + ' L ' + (x(d.hspViewEnd) - 4) + ',' + yHeight;
                                    })
                                    .attr('stroke-width', options.barHeight)
                                    .attr('stroke-linecap', 'butt')
                                    .attr('stroke', d3.rgb(hsplineColor))
                                    .attr('marker-mid', function() {
                                        return getMarker( p_hsp.hitEvalue )
                                    })
                                    .attr('marker-end', function() {
                                        return getMarker( p_hsp.hitEvalue )
                                    });
                            }
                            else
                            {
                                d3.select(this)
                                    .attr('xlink:href', '#' + q_i + '_hit_' + h_i)
                                    .append('path')
                                    .attr('d', function (d) {
                                        // Use +6 for hspViewStart to adjust the total matched length
                                        return 'M ' + x(d.hspViewEnd) + ',' + yHeight + ' L ' + (x(d.hspViewStart) + 4) + ',' + yHeight;
                                    })
                                    .attr('stroke-width', options.barHeight)
                                    .attr('stroke-linecap', 'butt')
                                    .attr('stroke', d3.rgb(hsplineColor))
                                    .attr('marker-mid', function() {
                                        return getMarker( p_hsp.hitEvalue )
                                    })
                                    .attr('marker-end', function() {
                                        return getMarker( p_hsp.hitEvalue )
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
                drawLegend(svg, options, width, height);
            }
            // Bind listener events once all the graphical elements have
            // been drawn for first time.
            if (index === 0) {
                graphControls($queryDiv, $graphDiv, true);
                // Redraw the SVG on a browser resize...
                setupResponsiveness($queryDiv, $graphDiv, index, opts);
            }
            // Refresh tooltip each time graph is redrawn.
            setupTooltip();
            // Ensure clicking on 'rect' takes user to the relevant hit on all
            // browsers.
            setupClick($graphDiv);
        }
    });
}(jQuery));
