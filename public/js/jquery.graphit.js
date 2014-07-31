(function ( $ ) {
    $.extend({
        draw: function() {
            var margin = 20;
            var barheight = 8, barpadding = 5, legend = 10;

            $("[data-graphit='overview']").each( function(i) {
                var hits = []
                hit_panels = $(this).find('.hitn')
                hit_panels.each( function(index) {
                    _hits = $(this).data();
                    _hits['hitId'] = $(this).attr('id');
                    hits.push(_hits);
                });
                
                // Sort according to evalues
                hits.sort(function(a,b) { return a.hitEvalue - b.hitEvalue; });

                // DEBUG
                console.log(hits);

                query_len = $(this).data().queryLen;
                width = $(this).width();
                height = hits.length*(barheight + barpadding) + 4*margin + legend*2;
                var graph_dom = $(this).children().eq(1).children().eq(0).after("<div class='graph'/>");

                var svg = d3.select($(this).find('.graph')[0])
                            .data([hits])
                            .append('svg')
                            .attr('width', width)
                            .attr('height', height).append('g')
                            .attr('transform', 'translate('+margin+', '+margin+')');
                // DEBUG
                console.log(svg);

                var x = d3.scale.linear().range([0, width-margin*2])
                x.domain([0, query_len]);
                var xAxis = d3.svg.axis().scale(x).orient('top').ticks(6);

                // Attach the axis to DOM (<svg> element)
                var scale = svg.append('g')
                            .attr('transform', 'translate(0, '+margin+')')
                            .append('g').attr('class', 'x axis')
                            .call(xAxis);

                var y = d3.scale.ordinal().rangeBands([0,height-2*margin-2*legend], .5);
                y.domain(hits.map( function(d) { return d.hitId; } ));

                /* Kept for future.
                var color = d3.scale.linear()
                            .domain((hits.map( function(d) { return d.hitId; } )).reverse())
                            .range(["red", "yellow", "green"]);
                */
                var color2 = d3.scale.ordinal()
                                .domain((hits.map( function(d) { return d.hitId; } )).reverse())
                                .rangeBands([10,180], 0.5);

                svg.append('g').attr('transform', 'translate(0, '+(2*margin-legend)+')')
                    .selectAll('.hits')
                    .data(hits).enter()
                    .append('a')
                    .attr('xlink:href', function(d,i) {return '#'+(d.hitId);})
                    .append('rect')
                    .attr('class', 'hits')
                    .attr('x', function(d,i) { return d.hitStart;})
                    .attr('y', function(d,i) { return y(d.hitId);})
                    .attr('width', function(d,i) { return x(d.hitEnd - d.hitStart); })
                    .attr('height', barheight)
                    .attr('fill', function(d) {
                        return d3.rgb(0,0,color2(d.hitId));
                    });
                var svg_legend = svg.append('g')
                                .attr('transform', 'translate(0,'+(height-margin-legend*1.25)+')');

                svg_legend.append('rect')
                        .attr('x', 7*(width-2*margin)/10)
                        .attr('width', 2*(width-4*margin)/10)
                        .attr('height', legend)
                        .attr('fill', 'url(#legend-grad)');

                svg_legend.append('text')
                        .attr('transform', 'translate(0, '+legend+')')
                        .attr('x', 6*(width-2*margin)/10 - margin/2)
                        .text("Low evalue");
                svg_legend.append('text')
                        .attr('transform', 'translate(0, '+legend+')')
                        .attr('x', 9*(width-2*margin)/10 + margin/2)
                        .text("High evalue");

                svg.append('linearGradient')
                    .attr('id', 'legend-grad')
                  .selectAll('stop')
                    .data([
                        {offset: "0%", color: "black"},
                        {offset: "100%", color: "blue"}
                        ])
                  .enter().append('stop')
                    .attr('offset', function(d) { return d.offset })
                    .attr('stop-color', function(d) { return d.color });
            });
        }
    });
}( jQuery ));


$('#blast').submit($.draw());
