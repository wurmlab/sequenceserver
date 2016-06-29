import _ from 'underscore';
import * as Helpers from './visualisation_helpers';

export default class LengthVisualisation {
  constructor(query, $svg_container, algorithm) {
    this._svg_container_d3 =  d3.select($svg_container[0]);
    this.query = query;
    this._seq_type = Helpers.get_seq_type(algorithm);

    this._margin = {top: 30, right: 60, bottom: 70, left: 25};
    this._width = $svg_container.width() - this._margin.left - this._margin.right;
    this._height = 400 - this._margin.top - this._margin.bottom;

    this._data = this.fill_data();
    this._x_scale = d3.scale.linear()
        .domain([
          0,
          (d3.max([this.query.length,d3.max(this._data)]) * 1.05)
        ])
        .range([0, this._width]);
    this._bins = this.create_bins();
    this._update_data = this.update_data();
    this._y_scale = d3.scale.linear()
        .domain([0, d3.max(this._bins, function(d) { return d.length })])
        .range([this._height, 0]);
    this._axis = this.create_axes();
    this.svg = this._svg_container_d3.insert('svg', ':first-child')
        .attr('width', this._width + this._margin.right + this._margin.left)
        .attr('height', this._height + this._margin.top + this._margin.bottom)
        .append('g')
        .attr('transform','translate('+this._margin.left+','+this._margin.top+')');
    this.setupTooltip();
    this.draw_visualisation();
  }

  fill_data() {
    // var data = [];
    // this.query.hits.map(function (d) {
    //   data.push(d.length)
    // })
    // return data;
    return _.map(this.query.hits, _.iteratee('length'))
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

  tick_formatter(seq_type) {
    var ticks = this._x_scale.ticks();
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

  create_bins() {
    var bins = d3.layout.histogram()
        .range(this._x_scale.domain())
        .bins(this._x_scale.ticks(50))
        (this._data);
    return bins;
  }

  prettify_evalue(evalue) {
    var regex = /(\d+)\.?(\d+)?e?([+-]\d+)?/;
    var match = regex.exec(evalue);
    var base  = match[1] + '.' + match[2];
    var power = match[3];
    var prettyEvalue = parseFloat(base).toFixed(2);
    var returnString = '<br>E value: ' + prettyEvalue;
    if (power !== undefined) {
        returnString +=  ' &times; 10<sup>' + power + '</sup>';
    }
    return returnString;
  }

  update_data() {
    var self = this;
    var data2 = [];
    var set_index = function(length) {
      for (var i in self.query.hits) {
        if (self.query.hits[i].length === length)
          return i;
      };
    }
    this._bins.map(function (d) {
      var inner_data = [];
      d.reverse();
      var y0 = d.length;
      d.map(function (e,i) {
        var y1 = d.length - (i+1);
        var len_index = set_index(e);
        var item = {
          value: e,
          id: self.query.hits[len_index].id,
          evalue: self.query.hits[len_index].evalue,
          y0: y0,
          y1: y0 += (y1 - y0),
          color: Helpers.get_colors_for_evalue(self.query.hits[len_index].evalue,self.query.hits)
        };
        inner_data.push(item);
      })
      var item = {data: inner_data, x: d.x, dx: d.dx, length: d.length};
      data2.push(item);
    })
    return data2;
  }

  draw_rectangles() {
    var self = this;
    var bar = this.svg.selectAll('.bar')
        .data(this._update_data)
        .enter().append('g')
        .attr('class', 'g')
        .attr('transform', function(d) {
          return 'translate('+(self._x_scale(d.x)+self._margin.left)+',0)';
        });

    bar.selectAll('rect')
        .data(function (d) { return d.data; })
        .enter().append('rect')
        .attr('class','bar')
        .attr('data-toggle','tooltip')
        .attr('title', function(i) {
          return i.id+' '+self.prettify_evalue(i.evalue)+'<br>Length: '+i.value;
        })
        .attr('x', 1)
        .attr('y', function(i) { return (self._y_scale(i.y0)); })
        .attr('width', self._x_scale(this._bins[1].x) - self._x_scale(this._bins[0].x) - 1)
        .attr('height', function (i) { return self._y_scale(i.y1) - self._y_scale(i.y0); })
        .attr('fill', function(i) {
          return i.color;
        });
  }

  draw_query_line() {
    var self = this;
    var query_line = this.svg.append('g')
        .attr('class','query_line')
        .attr('transform','translate('+(this._margin.left+this._x_scale(this.query.length))+',0)');

    query_line.append('rect')
        .attr('x',1)
        .attr('width',4)
        .attr('height',self._height)
        .style('fill','rgb(55,0,232)');

    query_line.append('text')
        .attr('dy', '0.75em')
        .attr('y', -5)
        .attr('x', 5)
        .attr('text-anchor','start')
        .text('Query')
        .style('fill','#000')
        .attr('transform','rotate(-45)');
  }

  create_axes() {
    var formatter = this.tick_formatter(this._seq_type.subject_seq_type);
    // var formatter = this.visualisation_helpers.tick_formatter(this._x_scale,this._seq_type.subject_seq_type);
    var x_axis = d3.svg.axis()
        .scale(this._x_scale)
        .orient('bottom')
        .ticks(50)
        .tickFormat(formatter);

    var y_axis = d3.svg.axis()
        .scale(this._y_scale)
        .orient('left')
        .tickFormat(function (e) {
          if (Math.floor(e) != e) {
            return ;
          }
          return e;
        });

    var ticks = this._y_scale.ticks();
    for (var i in ticks) {
      if (ticks[i] % 1 != 0) {
        y_axis.tickValues(d3.range(0, d3.max(this._bins, function(d) { return d.length })+1));
        break;
      }
    }

    return {x: x_axis, y: y_axis};
  }

  draw_scales() {
    var self = this;
    var xContainer = this.svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate('+self._margin.left+','+self._height+')')
        .call(this._axis.x);

    xContainer.selectAll('text').style('text-anchor','end')
        .attr('x', '-8px')
        .attr('y', '3px')
        .attr('dy', '0')
        .attr('transform','rotate(-90)');

    var yContainer = this.svg.append('g')
        .attr('class','axis axis--y')
        .attr('transform','translate('+self._margin.left+',0)')
        .call(this._axis.y);
  }

  create_labels() {
    var self = this;
    this.svg.append('text')
        .attr('class','xaxis-label')
        .attr('x',0.35 * self._width)
        .attr('y',self._height + 65)
        .text('Sequence Length');

    this.svg.append('text')
        .attr('class', 'yaxis-label')
        .attr('x',-255)
        .attr('y',-15)
        .attr('transform','rotate(-90)')
        .text('Number of Sequences');
  }

  draw_visualisation() {
    this.draw_rectangles();
    this.draw_query_line();
    this.draw_scales();
    this.create_labels();
  }
}
