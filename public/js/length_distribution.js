import d3 from 'd3';
import _ from 'underscore';
import Grapher from './grapher';
import * as Helpers from './visualisation_helpers';

/**
 * Renders Length Distribution of all hits per query
 */

class Graph {
  static name() {
    return 'Length distribution of hits';
  }

  static className() {
    return 'length-distribution';
  }

  static collapseId(props) {
    return 'length_'+props.query.number;
  }

  static dataName(props) {
      return 'length-distribution-'+props.query.id
  }

  constructor($svg_container, props) {
    this.query = props.query;
    this._seq_type = Helpers.get_seq_type(props.algorithm);
    this.svg_container = $svg_container

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
    this.setupTooltip();
  }

  define_scale_and_bins() {
    this._scale_x = d3.scale.linear()
        .domain([
          0,
          (d3.max([this.query.length,d3.max(this._data)]) * 1.05)
        ])
        .range([0, this._width]);
    this._bins = d3.layout.histogram()
        .range(this._scale_x.domain())
        .bins(this._scale_x.ticks(50))
        (this._data);
    this._scale_y = d3.scale.linear()
        .domain([0, d3.max(this._bins, function(d) { return d.length })])
        .range([this._height, 0]);
  }

  hit_lengths() {
    this._data = _.map(this.query.hits, _.iteratee('length'))
  }

  setupTooltip() {
      this.svg_container.find('[data-toggle="tooltip"]').tooltip({
          'placement': 'top', 'container': 'body', 'html': 'true',
          'delay': 0, 'white-space': 'nowrap'
      });
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
    var ticks = this._scale_x.ticks();
    var format = d3.format('.1f');
    var prefix = d3.formatPrefix(ticks[ticks.length - 1]);
    var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};
    return function (d) {
      if (d === 0) { return ; }
      if (_.indexOf(ticks,d) >= 0) {
        if (suffixes[seq_type] == 'aa') {
          return (d + ' ' + suffixes[seq_type])
        } else {
          return (format(prefix.scale(d)) + ' ' + prefix.symbol + suffixes[seq_type]);
        }
      } else {
        return ;
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
        var item = {
          value: d,
          id: self.query.hits[len_index].id,
          evalue: self.query.hits[len_index].evalue,
          url: '#Query_'+self.query.number+'_hit_'+self.query.hits[len_index].number,
          y0: y0,
          y1: y0 += (y1 - y0),
          color: Helpers.get_colors_for_evalue(self.query.hits[len_index].evalue,self.query.hits)
        };
        inner_data.push(item);
      })
      var item = {data: inner_data, x: bin.x, dx: bin.dx, length: bin.length};
      data2.push(item);
    })
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
        .attr('xlink:href', function(i) { return i.url })
        .append('rect')
        .attr('class','bar')
        .attr('data-toggle','tooltip')
        .attr('title', function(i) {
          return i.id+' '+'<br>E Value: '+Helpers.prettify_evalue(i.evalue)+'<br>Length: '+i.value;
        })
        .attr('x', 1)
        .attr('y', function(i) { return (self._scale_y(i.y0)); })
        .attr('width', self._scale_x(this._bins[1].x) - self._scale_x(this._bins[0].x) - 1)
        .attr('height', function (i) { return self._scale_y(i.y1) - self._scale_y(i.y0); })
        .attr('fill', function(i) {
          return i.color;
        });
  }

  draw_query_line() {
    var query_line = this.svg.append('g')
        .attr('class','query_line')
        .attr('transform','translate('+(this._margin.left+this._scale_x(this.query.length))+',0)');

    query_line.append('rect')
        .attr('x',1)
        .attr('class','bar')
        .attr('width',4)
        .attr('height',this._height)
        .style('fill','rgb(95,122,183)');

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
    if (len >= 8) {
      space = 8;
    } else {
      space = len;
    }
    var formatter = this.tick_formatter(this._seq_type.subject_seq_type);
    var x_axis = d3.svg.axis()
        .scale(this._scale_x)
        .orient('bottom')
        .ticks(50)
        .tickFormat(formatter);
    var y_axis = d3.svg.axis()
        .scale(this._scale_y)
        .orient('left')
        .tickValues(this._scale_y.ticks(space))
        .tickFormat(function (e) {
          if (Math.floor(e) != e) {
            return ;
          }
          return e;
        });
    var ticks = this._scale_y.ticks();
    for (var i in ticks) {
      if (ticks[i] % 1 != 0) {
        y_axis.tickValues(d3.range(0, d3.max(this._bins, function(d) { return d.length })+1));
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

    var yContainer = this.svg.append('g')
        .attr('class','axis axis--y')
        .attr('transform','translate('+this._margin.left+',0)')
        .call(y_axis);
  }
}

var LengthDistribution = Grapher(Graph);
export default LengthDistribution;
