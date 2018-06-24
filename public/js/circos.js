import d3 from 'd3';
import _ from 'underscore';
import circosJs from 'nicgirault/circosJs';

import Grapher from './grapher';
import * as Helpers from './visualisation_helpers';

class Graph {
  static name() {
    return 'Circos';
  }

  static className() {
    return 'circos';
  }

  static collapseId(props) {
    return 'circos-collapse';
  }

  static dataName(props) {
      return 'Circos-visualisation';
  }

  constructor($svgContainer, props) {
    this.queries = props.queries;
    this.svgContainer = $svgContainer;
    this.seq_type = Helpers.get_seq_type(props.program);
    this.initiate();
  }

  initiate() {
    // this.width = 700;
    this.width = this.svgContainer.width();
    this.height = 600;
    this.innerRadius = 200;
    this.outerRadius = 230;
    this.query_arr = [];
    this.hit_arr = [];
    this.layout_arr = [];
    this.chords_arr = [];
    // this.max_length = 0;
    this.hsp_count = 50;
    this.denominator = 100;
    this.spacing = 20;
    this.labelSpacing = 10;
    var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};
    this.construct_layout();
    this.iterator_for_edits();
    this.hit_arr = _.uniq(this.hit_arr);
    this.handle_spacing();
    var prefix = d3.formatPrefix(this.max_length);
    this.suffix = ' '+prefix.symbol+suffixes[this.seq_type.subject_seq_type];
    if (prefix.symbol == 'k') {
      this.denominator = 1000;
    } else if (prefix.symbol == 'M') {
      this.denominator = 1000000;
      this.spacing = 1000000;
      this.labelSpacing = 200000;
    } else if (prefix.symbol == 'g') {
      this.denominator = 1000000000;
    }
    d3.select(this.svgContainer[0]).insert('svg',':first-child')
        .attr('class','circosContainer');
    this.create_instance(this.svgContainer, this.width, this.height);
    if (this.chords_arr.length && this.layout_arr.length) {
      this.instance_render();
    } else {
      this.render_error();
    }
    this.setupTooltip();
    // this.drawLegend();
  }

  iterator_for_edits() {
    this.max_length = this.calculate_max_length();
    if (this.hit_arr.length > 10) {
      this.complex_layout_edits();
    }
  }

  // Generate both layout_arr and chords_arr with top hsps set by this.hsp_count
  construct_layout() {
    var hsp_count = 0;
    var query_count = 0;
    var num_karyotype = 32;
    var num_queries = this.queries.length;
    var x = Math.min(num_karyotype / 2, num_queries);
    var num_hits = (num_karyotype - x) / x;
    this.new_layout = [];
    this.data = _.map(this.queries, _.bind(function (query) {
      if (query_count < x) {
        var label = query.id;
        var len = query.length;
        var item1 = {'len': len, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id), 'ori_id': label};
        this.layout_arr.push(item1);
        var hit_details = _.map(query.hits, _.bind(function(hit) {
          if (hit.number < num_hits) {
            var hsp_details = _.map(hit.hsps, _.bind(function (hsp) {

              if (_.indexOf(this.hit_arr, hit.id) == -1) {
                var label = hit.id;
                var len  = hit.length;
                this.hit_arr.push(hit.id);
                var item2 = {'len': len, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id), 'ori_id': label};
                this.layout_arr.push(item2);
              }

              var item3 = ['Query_'+this.clean_id(query.id), hsp.qstart, hsp.qend, 'Hit_'+this.clean_id(hit.id), hsp.sstart, hsp.send, hit.number, hsp];
              this.chords_arr.push(item3);
              return hsp;
            }, this));
            return hit;
          }
        }, this));
      }
      this.query_arr.push(query.id);
      return query;
    }, this));
  }

  // rearraging hit and query karyotypes to have all query in one place
  rearrange_new_layout() {
    _.each(this.new_layout, _.bind(function(obj) {
      var id = (obj.id).slice(0,3);
      if (id == 'Que') {
        this.layout_arr.push(obj);
      }
    }, this));
    _.each(this.new_layout, _.bind(function(obj) {
      var id = (obj.id).slice(0,3);
      if (id == 'Hit') {
        this.layout_arr.push(obj);
      }
    }, this));
  }

  // label edits along with deleting hits which are too small to display
  complex_layout_edits() {
    this.delete_from_layout = [];
    this.delete_from_chords = [];
    _.each(this.layout_arr, _.bind(function (obj, index) {
      var rel_length = (obj.len / this.max_length).toFixed(3);
      var label = obj.label;
      if (rel_length < 0.1 && (obj.id).slice(0,3) != 'Que') {
        this.delete_from_layout.push(obj);
        this.hit_arr.slice(_.indexOf(this.hit_arr, obj.label), 1); // corresponding delete from hit_arr
      }
    }, this));
  }

  // get the chords_arr index based on hit or query id
  check_in_chords_arr(id, type, index) {
    var count = 0;
    _.each(this.chords_arr, _.bind(function (obj) {
      if (type == 'Que') {
        if (obj[0] != id) {
          count++
        }
      }
    }, this))
    if (count == this.chords_arr.length) {
      console.log('no record found '+id);
      this.delete_arr.push(index);
    }
  }

  // get index of hit_arr based on id
  find_index_of_hit(id) {
    var found;
    _.each(this.queries, _.bind(function (query) {
      _.each(query.hits, _.bind(function(hit) {
        var check_id = 'Hit_'+this.clean_id(hit.id)
        if (id == check_id) {
          found = hit.id;
        }
      }, this))
    }, this));
    return _.indexOf(this.layout_arr, found);
  }

  edit_labels() {
    console.log('label edits');
    _.each(this.layout_arr, _.bind(function (obj) {
      var rel_length = (obj.len / this.max_length).toFixed(3);
      var label = obj.label;
      if (rel_length < 0.41) {
        obj.label = '..';
      } else if (label.length > 10) {
        obj.label = label.slice(0,2) + '...';
      } else {
        obj.label = obj.ori_id;
      }
    }, this));
  }

  calculate_multipliers() {
    var sum_query_length = 0;
    var sum_hit_length = 0;
    _.each(this.query_arr, _.bind(function (id) {
      _.each(this.data, _.bind(function (query) {
        if (id == query.id) {
          sum_query_length += query.length;
        }
      }, this));
    }, this));

    _.each(this.data, _.bind(function (query) {
      _.each(query.hits, _.bind(function (hit) {
        var index = _.indexOf(this.hit_arr, hit.id);
        if (index >= 0) {
          sum_hit_length += hit.length;
        }
      }, this));
    }, this));
    var mid_sum = (sum_query_length + sum_hit_length) / 2;
    console.log('mid sum '+mid_sum+' hit_sum '+sum_hit_length+' query_sum '+sum_query_length);
    this.query_multiplier = (mid_sum / sum_query_length).toFixed(3);
    this.hit_multiplier = (mid_sum / sum_hit_length).toFixed(3);
    console.log('query '+this.query_multiplier+' hit '+this.hit_multiplier);
  }

  handle_spacing() {
    if (this.max_length > 16000) {
      this.spacing = 200;
    } else if (this.max_length > 12000) {
      this.spacing = 150;
    } else if (this.max_length > 8000) {
      this.spacing = 100;
    } else if (this.max_length > 4000) {
      this.spacing = 75;
    } else if (this.max_length > 1800) {
      this.spacing = 50;
    }
  }

  calculate_max_length() {
    var max = 0;
    _.each(this.layout_arr, function(obj) {
      if (max < obj.len) {
        max = obj.len;
      }
    })
    return max;
  }

  clean_id(id) {
    return id.replace(/[^a-zA-Z0-9]/g, '');
  }

  create_instance(container, width, height) {
    this.instance = new circosJs({
      container: '.circosContainer',
      width: width,
      height: height
    });
    this.chord_layout();
    this.instance_layout();
  }

  chord_layout() {
    if (this.chords_arr.length > 32) {
      this.paletteSize = 32;
    } else {
      this.paletteSize = this.chords_arr.length;
    }
    return {
      usePalette: true,
      colorPaletteSize: this.paletteSize,
      // color: 'rgb(0,0,0)',
      colorPalette: 'RdYlBu', // colors of chords based on last value in chords
      // tooltipContent: 'Hiten',
      opacity: 0.85 // add opacity to ribbons
    }
  }

  instance_layout() {
    return {
      innerRadius: this.innerRadius,
      outerRadius: this.outerRadius,
      cornerRadius: 1, // rounding at edges of karyotypes
      labels: {
        display: true,
        size: '10px',
        radialOffset: 10
      },
      ticks: {
        display: true,
        spacing: this.spacing, // the ticks values to display
        labelSpacing: this.labelSpacing, // ticks value apper in interval
        labelDenominator: this.denominator, // divide the value by this value
        labelSuffix: this.suffix,
        labelSize: '10px',
        majorSpacing: this.labelSpacing, // major ticks apper in interval
        size: {
          minor: 0, // to remove minor ticks
          major: 4
        }
      }
    }
  }

  instance_render() {
    this.instance.layout(this.instance_layout(),this.layout_arr);
    this.instance.chord('chord1',this.chord_layout(),this.chords_arr);
    this.instance.render();
  }

  render_error() {
    this.svgContainer.find('svg').remove();
    this.svg = d3.select(this.svgContainer[0]).insert('svg',':first-child')
        .attr('width', this.svgContainer.width())
        .attr('height', this.svgContainer.height())
        .append('g')
        .attr('class', 'circos-error')
        .attr('transform','translate('+this.svgContainer.width() / 2+','+this.svgContainer.height()/2+')')
        .append('text')
        .attr('text-anchor','start')
        .attr('dy','-0.25em')
        .attr('x', -175)
        .style("font-size", "14px")
        .text('Circos looks great with less than 16 queries')
  }

  layoutReset() {
    this.layoutHide = [];
    _.each(this.layout_arr, function(obj) {
      $("."+obj.id).css("opacity", 1);
    });
  }

  chordsReset() {
    this.chordsHide = [];
    _.each(this.chords_arr, function (obj) {
      var slen = obj[1] + obj[2];
      var tlen = obj[4] + obj[5];
      $("#"+obj[0]+"_"+slen+"_"+obj[3]+"_"+tlen).show();
    });
  }

  chordsCheck(id, type) {
    _.each(this.chords_arr, _.bind(function (obj, index) {
      if (type == 'Que') {
        if (obj[0] == id) {
          this.chordsHide.push(index);
          this.layoutHide.push(obj[3]);
        }
      }
      if (type == 'Hit') {
        if (obj[3] == id) {
          this.chordsHide.push(index);
          this.layoutHide.push(obj[0]);
        }
      }
    }, this))
  }

  chordsClean() {
    _.each(this.chords_arr, _.bind(function (obj, index) {
      if (_.indexOf(this.chordsHide, index) == -1) {
        var slen = obj[1] + obj[2];
        var tlen = obj[4] + obj[5];
        $("#"+obj[0]+"_"+slen+"_"+obj[3]+"_"+tlen).hide();
      }
    }, this))
  }

  layoutClean() {
    _.each(this.layout_arr, _.bind(function(obj, index) {
      if(_.indexOf(this.layoutHide, obj.id) == -1) {
        $("."+obj.id).css("opacity",0.1);
      }
    }, this))
  }

  setupTooltip() {
      var selected = {};
      $('.circos-distribution').on('click', _.bind(function(event) {
          event.stopPropagation();
          this.layoutReset();
          this.chordsReset();
          selected = {};
      }, this));
    _.each(this.query_arr, _.bind(function (id, index) {
      this.chordsHide = [];
      this.layoutHide = [];
      if (id) {
        $(".circos-distribution .Query_"+this.clean_id(id)).attr('data-toggle','tooltip')
                      .attr('title',id)
                      .on('click', _.bind(function (event) {
                          event.stopPropagation();
                        if (selected[index] != id) {
                          selected[index] = id;
                          var cleaned_id = "Query_"+this.clean_id(id);
                          this.layoutHide.push(cleaned_id);
                          this.chordsCheck(cleaned_id, "Que");
                          this.chordsClean();
                          this.layoutClean();
                        } else {
                          selected[index] = 0;
                          this.layoutReset();
                          this.chordsReset();
                        }
                      }, this));
      }
    }, this))
    _.each(this.hit_arr, _.bind(function(id, index) {
      this.chordsHide = [];
      this.layoutHide = [];
      if (id) {
        $(".circos .Hit_"+this.clean_id(id)).attr('data-toggle','tooltip')
                    .attr('title',id)
                    .on('click', _.bind(function (event) {
                        event.stopPropagation();
                      if (selected[index] != id) {
                        selected[index] = id;
                        var cleaned_id = "Hit_"+this.clean_id(id);
                        this.layoutHide.push(cleaned_id);
                        this.chordsCheck(cleaned_id, "Hit");
                        this.chordsClean();
                        this.layoutClean();
                      } else {
                        selected[index] = 0;
                        this.layoutReset();
                        this.chordsReset();
                      }
                    }, this));
      }
    }, this));
    $('[data-toggle="tooltip"]').tooltip({
      'placement': 'top',
      'container': 'body',
      'html': 'true',
      'delay': 0,
      'white-space': 'nowrap'
    });
  }

  ratioCalculate(value, min, max, scope, reverse, logScale) {
    var fraction, scaleLogBase, x;
    scaleLogBase = logScale ? 2.3 : 1;
    if (min === max || (value === min && !reverse) || (value === max && reverse)) {
      return 0;
    }
    if (value === max || (value === min && reverse)) {
      return scope - 1;
    }
    fraction = (value - min) / (max - min);
    x = Math.exp(1 / scaleLogBase * Math.log(fraction));
    if (reverse) {
      x = 1 - x;
    }
    return Math.floor(scope * x);
  }

  drawLegend() {
    this.ratioHSP = [];
    _.each(this.chords_arr, _.bind(function (obj) {
      var item = {number: obj[6], evalue: obj[7].evalue}
      this.ratioHSP.push(item);
    }, this));
    var min = d3.min(this.ratioHSP, function(d) {
      return d.number;
    });
    var max = d3.max(this.ratioHSP, function(d) {
      return d.number;
    });
    console.log('chords_arr '+this.chords_arr.length);
    console.log('ratioHSP test '+this.ratioHSP.length);
    console.log('paletteSize '+this.paletteSize);
    console.log('min '+min+' max '+max);
    this.legend = d3.select(this.svgContainer[0]).insert('svg', ':first-child')
        .attr('height', 20)
        .attr('width', this.ratioHSP.length * 30)
        .attr('transform','translate(10, 10)')
        .append('g')
        .attr('class','RdYlBu')
        .attr('transform','translate(10, 0)');

    var bar = this.legend.selectAll('.bar')
        .data(this.ratioHSP)
        .enter().append('g')
        .attr('class','g')
        .attr('transform', function(d, i) {
          return 'translate('+i * 30+',0)';
        })
        .append('rect')
        .attr('class',_.bind(function(d,i) {
          var s = this.ratioCalculate(d.number,min,max,this.paletteSize, false, false);
          console.log('calc ratio '+s);
          return 'q'+s+"-"+this.paletteSize;
        }, this))
        .attr('data-toggle','tooltip')
        .attr('title', function (d) {
          return d.evalue;
        })
        .attr('x', 1)
        .attr('width', 30)
        .attr('height', 20);
        // .attr('fill','#43ff21');

    var scale = d3.scale.linear()
        .domain([0, 250])
        .range([0, 100]);

    // this.legend.append('rect')
    //     .attr('x', 7*14)
    //     .attr('width', 2*10)
    //     .attr('height', 10)
    //     .attr('fill','#43ff21');
    //
    // this.legend.append('text')
    //     .attr('class','text-legend')
    //     .attr('transform','translate('+10+',0)')
    //     .attr('x',6*14)
    //     .text('Weaker Hits');
    //
    // this.legend.append('text')
    //     .attr('class','text-legend')
    //     .attr('transform','translate('+10+',0)')
    //     .attr('x',9*14)
    //     .text('Stronger Hits');

    // bar.selectAll('rect')


    // this.legend.append('rect')
    //     .attr('x',1)
    //     .attr('width', 10)
    //     .attr('height', 10)
    //     .attr('fill','#232323');
  }
}

var Circos = Grapher(Graph);
export default Circos;
