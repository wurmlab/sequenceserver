"use strict"

function LengthVisualisation(query, svg_container) {

  this._svg_container_d3 =  d3.select(svg_container[0]);
  this._svg = {};
  this._query = query;
  this._hits = query.hits;
  this._visualisation_helper = new VisualisationHelpers();

  this._margin = {top: 30, right: 35, bottom: 50, left: 25};
  this._width = 838 - this._margin.left - this._margin.right;
  this._height = 460 - this._margin.top - this._margin.bottom;

  this._data = this._fill_data();
  this._x_scale = d3.scale.linear()
      .domain([
        d3.min([this._round_to_floor(this._query.length),this._round_to_floor(d3.min(this._data))]),
        d3.max(this._data)
      ])
      .range([0, this._width]);
  this._bins = this._create_bins();
  this._data2 = this._fill_data2();
  this._y_scale = d3.scale.linear()
      .domain([0, d3.max(this._bins, function(d) { return d.length })])
      .range([this._height, 0]);
  // console.log("Bin details (length) "+this._bins.length);
  // console.log('new data2 trails (length) '+this._data2.length);
  // this._data2.map(function (d) {
  //   console.log('data2-1 length '+d.length);
  //   console.log('its content '+d.toString());
  // })
  this._axis = this._create_axis();
  this._draw_visualisation();
}

LengthVisualisation.prototype._fill_data = function () {
  var data = [];
  this._hits.map(function (d) {
    data.push(d.length)
  })
  // for (var i in this._hits) {
  //   data.push(hits[i].length);
  // }
  return data;
}

LengthVisualisation.prototype._fill_data2 = function () {
  var data2 = [];
  var eScale = d3.scale.linear()
      .domain(this._hits.map(function(d) { return d.length; }))
      .range(this._hits.map(function (d) { return d.evalue; }));
  this._bins.map(function (d) {
    var inner_data = [];
    d.map(function (e) {
      var item = {length: e, evalue: eScale(e)};
      inner_data.push(item);
    })
    data2.push(inner_data);
  })
  return data2;
}

LengthVisualisation.prototype._get_evalue = function (bin) {
  var evals = [];
  for (var i in bin) {
    for (var j in this._hits) {
      if (this._hits[j].length == bin[i]) {
        evals.push(this._hits[j].evalue);
      }
    }
  }
  return evals.sort();
}

LengthVisualisation.prototype._create_formatter = function () {
  var ticks = this._x_scale.ticks();
  var prefix = d3.formatPrefix(ticks[ticks.length - 1]);
  return function (d) {
    return (prefix.scale(d) + ' ' + prefix.symbol);
  };
}

LengthVisualisation.prototype._round_to_floor = function (d) {
  return Math.floor(d/100)*100;
}

LengthVisualisation.prototype._create_bins = function () {
  var bins = d3.layout.histogram()
      .range(this._x_scale.domain())
      .bins(this._x_scale.ticks(50))
      (this._data);
  return bins;
}

LengthVisualisation.prototype._get_colors_for_evalue = function (evalue) {
  var colors = d3.scale.log()
      .domain([
        d3.min([1e-5, d3.min(this._hits.map(function (d) {
          if (parseFloat(d.evalue) === 0) return undefined;
          return d.evalue;
        }))]),
        d3.max(this._hits.map(function (d) {
          return d.evalue;
        }))
      ])
      .range([40,150]);
  var rgb = colors(evalue);
  return d3.rgb(rgb,rgb,rgb);
}

LengthVisualisation.prototype._set_gradient_data = function (bin) {
  var set = [];
  var eValue = this._get_evalue(bin);
  var offsetScale = d3.scale.linear()
      .domain([0,eValue.length])
      .range([0,100]);
  var color_init = this._visualisation_helper._get_colors_for_evalue(eValue[0],this._hits);
  set.push({offset: '0%', color: color_init});
  for (var i in eValue) {
    var j = parseInt(i)+1;
    var offset = offsetScale(j)+'%';
    var rgb = this._visualisation_helper._get_colors_for_evalue(eValue[i],this._hits);
    var item = { offset: offset , color: rgb };
    set.push(item);
  }
  return set;
}

LengthVisualisation.prototype._draw_visualisation = function () {
  this._svg.d3 = this._svg_container_d3.insert('svg', ':first-child')
      .attr('width', this._width + this._margin.right + this._margin.left)
      .attr('height', this._height + this._margin.top + this._margin.bottom)
      .append('g')
      .attr('transform','translate('+this._margin.left+','+this._margin.top+')');

  this._draw_rectangles();
  this._draw_query_line();
  this._draw_scales();
  this._create_labels();
  this._draw_legend();
}

LengthVisualisation.prototype._draw_rectangles = function () {
  var self = this;
  var getEvalue = function(bin) {
    for (var i in self._hits) {
      if (self._hits[i].length == d3.min(bin)) {
        return self._hits[i].evalue;
      }
    }
  }
  var bar = this._svg.d3.selectAll('.bar')
      .data(this._bins)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('data-toggle','tooltip')
      .attr('title', function (d) {
        return '['+d.toString()+']'+'('+self._y_scale(d.length)+')';
      })
      .attr('transform', function(d) {
        return 'translate('+(self._x_scale(d.x)+self._margin.left)+','+self._y_scale(d.length)+')';
      });

  // bar.selectAll('rect')
  //     .data(function (d) { return d; })
  //     .enter().append('rect')
  //     .attr('x', 1)
  //     .attr('y', function(i) { return self._y_scale(d.length); })
  //     .attr('width', self._x_scale(this._bins[1].x) - self._x_scale(this._bins[0].x) - 1)
  //     .attr('height', function (i) { return self._height - self._y_scale(d.length); })
  //     .attr('fill', self._get_colors_for_evalue(getEvalue(d)));

  bar.append('rect')
      .attr('x', 1)
      .attr('width', self._x_scale(this._bins[1].x) - self._x_scale(this._bins[0].x) - 1)
      .attr('height', function(d) { return self._height - self._y_scale(d.length); })
      .style('fill',function (d) {
        // return self._get_colors_for_evalue(getEvalue(d));
        return 'url(#gradient'+d[0]+')';
      });

  this._bins.map(function (bin) {
    if (bin.length != 0) {
      var grad = self._svg.d3.append('linearGradient')
          .attr('id','gradient'+bin[0])
          .attr('x1','0%').attr('y1','0%')
          .attr('x2','0%').attr('y2','100%')
          .selectAll('stop')
          .data(self._set_gradient_data(bin))
          .enter().append('stop')
          .attr('offset', function (e) { return e.offset; })
          .attr('stop-color', function (e) { return e.color; });
    }
  });
}

LengthVisualisation.prototype._draw_query_line = function () {
  var self = this;
  var query_line = this._svg.d3.append('g')
      .attr('class','query_line')
      .attr('transform','translate('+(this._margin.left+this._x_scale(this._query.length))+',0)');

  query_line.append('rect')
      .attr('x',1)
      .attr('width',4)
      .attr('height',self._height)
      .style('fill','rgb(102,102,102)');

  query_line.append('text')
      .attr('dy', '0.75em')
      .attr('y', -5)
      .attr('x', 5)
      .attr('text-anchor','start')
      .text('Query')
      .style('fill','#000')
      .attr('transform','rotate(-45)');
}

LengthVisualisation.prototype._create_axis = function () {
  var formatter = this._create_formatter()
  var format = d3.format('.0g');
  var x_axis = d3.svg.axis()
      .scale(this._x_scale)
      .orient('bottom')
      .ticks(50)
      .tickFormat(formatter);

  var y_axis = d3.svg.axis()
      .scale(this._y_scale)
      .orient('left')
      // .ticks(20)
      // .tickFormat(format);

  return {x: x_axis, y: y_axis};
}

LengthVisualisation.prototype._draw_scales = function () {
  var self = this;
  var xContainer = this._svg.d3.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate('+self._margin.left+','+self._height+')')
      .call(this._axis.x);

  xContainer.selectAll('text').style('text-anchor','end')
      .attr('x', '-8px')
      .attr('y', '-2px')
      .attr('transform','rotate(-90)');

  var yContainer = this._svg.d3.append('g')
      .attr('class','axis axis--y')
      .attr('transform','translate('+self._margin.left+',0)')
      .call(this._axis.y);
}

LengthVisualisation.prototype._create_labels = function () {
  var self = this;
  this._svg.d3.append('text')
      .attr('class','xaxis-label')
      .attr('x',0.35 * self._width)
      .attr('y',self._height + 45)
      .text('Sequence Length');

  this._svg.d3.append('text')
      .attr('class', 'yaxis-label')
      .attr('x',-255)
      .attr('y',-15)
      .attr('transform','rotate(-90)')
      .text('Number of Sequences');
}

LengthVisualisation.prototype._draw_legend = function () {
    var svg_legend = this._svg.d3.append('g')
        .attr('transform','translate(190,416)');

    svg_legend.append('rect')
        .attr('x', 390)
        .attr('width',150)
        .attr('height',10)
        .attr('fill','url(#legend-grad)');

    svg_legend.append('text')
        .attr('class','legend-text')
        .attr('transform','translate(0,10)')
        .attr('x', 320)
        .text('Weaker Hits');

    svg_legend.append('text')
        .attr('class','legend-text')
        .attr('transform','translate(0,10)')
        .attr('x', 550)
        .text('Stronger Hits');

    this._svg.d3.append('linearGradient')
        .attr('id','legend-evalue')
        .selectAll('stop')
        .data([
          {offset: '0%', color: '#ccc'},
          {offset: '50%', color: '#888'},
          {offset: '100%', color: '#000'}
        ])
        .enter()
        .append('stop')
        .attr('offset', function (d) { return d.offset; })
        .attr('stop-color', function (d) { return d.color; });
}
