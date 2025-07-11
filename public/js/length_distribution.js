import * as d3 from 'd3';
import _ from 'underscore';
import Grapher from 'grapher';
import * as Helpers from './visualisation_helpers';

/**
 * Renders Length Distribution of all hits per query
 */

class Graph {
    static canCollapse() {
        return true;
    }

    static name() {
        return 'Length distribution of matching hit sequences';
    }

    static className() {
        return 'length-distribution';
    }

    static graphId(props) {
        return 'length_'+props.query.number;
    }

    static dataName(props) {
        return 'length-distribution-'+props.query.id;
    }

    constructor($svg_container, props) {
        this.query = props.query;
        this._seq_type = Helpers.get_seq_type(props.algorithm);
        this.svg_container = $svg_container;
        if (props.algorithm == 'blastx') {
            this.query_length = this.query.length / 3;
        } else if (props.algorithm == 'tblastn') {
            this.query_length = this.query.length * 3;
        } else {
            this.query_length = this.query.length;
        }
        this._margin = {top: 30, right: 25, bottom: 55, left: 12.5};
        this.initiate($svg_container.width(), $svg_container.height());
    }

    initiate(width, height) {
        this._width = width - this._margin.left - this._margin.right;
        this._height = height - this._margin.top - this._margin.bottom;
        this.svg = d3.select(this.svg_container[0]).insert('svg', ':first-child')
            .attr('width', this._width + this._margin.right + this._margin.left)
            .attr('height', this._height + this._margin.top + this._margin.bottom)
            .append('g')
            .attr('transform','translate('+this._margin.left+','+this._margin.top+')');
        this.hit_lengths();
        this.define_scale_and_bins();
        this.update_data();
        this.draw();
    }

    draw() {
        this.draw_rectangles();
        this.draw_query_line();
        this.draw_axes();
    }

    define_scale_and_bins() {
        this._scale_x = d3.scaleLinear()
            .domain([
                0,
                (d3.max([this.query_length, d3.max(this._data)]) * 1.01)
            ]).nice()
            .range([0, this._width]);
        this._bins = d3.bin()
            .domain(this._scale_x.domain())
            .thresholds(this._scale_x.ticks(50))(this._data);
        this._scale_y = d3.scaleLinear()
            .domain([0, d3.max(this._bins, function(d) { return d.length; })])
            .range([this._height, 0]).nice();
    }

    hit_lengths() {
        this._data = _.map(this.query.hits, _.iteratee('length'));
    }

    setupResponsiveness() {
        var currentWidth = $(window).width();
        console.log('cureent '+currentWidth);
        var debounced_draw = _.debounce(_.bind(function () {
            if (currentWidth != $(window).width()) {
                console.log('redraw initiated '+this._height);
                this.draw();
                currentWidth = $(window).width();
            }
        }, this), 125);
        $(window).resize(debounced_draw);
    }

    tick_formatter(seq_type) {
        const ticks = this._scale_x.ticks();
        const prefix = d3.format('~s');
        const suffixes = { amino_acid: 'aa', nucleic_acid: 'bp' };

        return (d) => {
            if (d === 0 || !ticks.includes(d)) return;

            if (suffixes[seq_type] === 'aa') {
                return `${d} ${suffixes[seq_type]}`;
            } else {
                const formatted = prefix(d);

                return `${Helpers.formatNumberUnits(formatted)}${suffixes[seq_type]}`;
            }
        };
    }

    update_data() {
        var self = this;
        var data2 = [];
        this._bins.map(function (bin) {
            var inner_data = [];
            bin.reverse();
            var y0 = bin.length;
            bin.map(function (d,i) {
                var y1 = bin.length - (i+1);
                var len_index = _.findIndex(self.query.hits, {length: d});
                var evalue = self.query.hits[len_index].hsps[0].evalue;
                var item = {
                    value: d,
                    id: self.query.hits[len_index].id,
                    evalue: evalue,
                    url: '#Query_'+self.query.number+'_hit_'+self.query.hits[len_index].number,
                    y0: y0,
                    y1: y0 += (y1 - y0),
                    color: Helpers.get_colors_for_evalue(evalue,self.query.hits)
                };
                inner_data.push(item);
            });
            var item = {data: inner_data, x: bin.x0, dx: bin.x1, length: bin.length};
            data2.push(item);
        });
        this._update_data = data2;
    }

    draw_rectangles() {
        var self = this;
        var bar = this.svg.selectAll('.bar')
            .data(this._update_data)
            .enter().append('g')
            .attr('class', 'g')
            .attr('transform', function(d) {
                return 'translate('+(self._scale_x(d.x)+self._margin.left)+',0)';
            });

        bar.selectAll('rect')
            .data(function (d) { return d.data; })
            .enter().append('a')
            .attr('xlink:href', function(i) { return i.url; })
            .append('rect')
            .attr('class','bar')
            .attr('title', function(i) {
                return i.id+' '+'<br>E value: '+Helpers.prettify_evalue(i.evalue)+'<br>Length: '+i.value;
            })
            .attr('x', 1)
            .attr('y', function(i) { return (self._scale_y(i.y0)); })
            .attr('width', self._scale_x(this._bins[1].x0) - self._scale_x(this._bins[0].x0) - 1)
            .attr('height', function (i) { return self._scale_y(i.y1) - self._scale_y(i.y0); })
            .attr('fill', function(i) {
                return i.color;
            });
    }

    draw_query_line() {
        var query_line = this.svg.append('g')
            .attr('class','query_line')
            .attr('transform','translate('+(this._margin.left+this._scale_x(this.query_length))+',0)');

        query_line.append('rect')
            .attr('x',1)
            .attr('class','bar')
            .attr('width',4)
            .attr('height',this._height)
            .style('fill','#c74f14');

        query_line.append('text')
            .attr('dy', '0.75em')
            .attr('y', -10)
            .attr('x', 2)
            .attr('text-anchor','start')
            .text('Query')
            .style('fill','#000')
            .attr('transform','rotate(-45)');
    }

    draw_axes() {
        var space, len;
        len = this._scale_y.ticks().length;
        if (len >= 5) {
            space = 5;
        } else {
            space = len;
        }
        var formatter = this.tick_formatter(this._seq_type.subject_seq_type);
        var x_axis = d3.axisTop(this._scale_x)
            .ticks(50)
            .tickFormat(formatter);
        var y_axis = d3.axisLeft(this._scale_y)
            .tickValues(this._scale_y.ticks(space))
            .tickSizeOuter(0)
            .tickFormat(function (e) {
                if (Math.floor(e) != e) {
                    return ;
                }
                return e;
            });
        var ticks = this._scale_y.ticks();
        for (var i in ticks) {
            if (ticks[i] % 1 != 0) {
                y_axis.tickValues(d3.range(0, d3.max(this._bins, function(d) { return d.length; })+1));
                break;
            }
        }
        var self = this;
        var xContainer = this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate('+this._margin.left+','+this._height+')')
            .call(x_axis);

        xContainer.selectAll('line').attr('y2',function (d) {
            var ticks = self._scale_x.ticks();
            if (_.indexOf(ticks, d) >= 0) {
                return 7;
            } else {
                return 4;
            }
        });

        xContainer.selectAll('text').style('text-anchor','end')
            .attr('x', '-8px')
            .attr('y', '3px')
            .attr('dy', '0')
            .attr('transform','rotate(-90)');

        this.svg.append('g')
            .attr('class','axis axis--y')
            .attr('transform','translate('+this._margin.left+',0)')
            .call(y_axis);
    }
}

var LengthDistribution = Grapher(Graph);
export default LengthDistribution;
