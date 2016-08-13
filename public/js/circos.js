import circosJs from 'nicgirault/circosJs';
import React from 'react';
import _ from 'underscore';
import * as Helpers from './visualisation_helpers';

export default class Circos extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // CircosJs(this.props.queries);
    this.graph = new Graph(this.props.queries, this.props.program, this.svgContainer());
  }

  svgContainer() {
    return $(React.findDOMNode(this.refs.svgContainer));
  }

  render() {
    return (
      <div
        className='grapher' ref='grapher'>
        <div
            className="graph-links">
            <a href = "#" className="export-to-svg">
                <i className="fa fa-download"/>
                <span>{"  SVG  "}</span>
            </a>
            <span>{" | "}</span>
            <a href = "#" className="export-to-png">
                <i className="fa fa-download"/>
                <span>{"  PNG  "}</span>
            </a>
        </div>
        <div
          className='svgContainer' ref='svgContainer'>
          <svg className="circosContainer" ref="svgTag"></svg>
        </div>
      </div>
    )
  }
}

export class Graph {
  constructor(queries, algorithm, $svgContainer) {
    this.queries = queries;
    this.svgContainer = $svgContainer;
    this.seq_type = Helpers.get_seq_type(algorithm);
    this.initiate();
  }

  initiate() {
    // this.width = 700;
    this.width = this.svgContainer.width();
    this.height = 600;
    // this.height = this.svgContainer.height();
    this.innerRadius = 200;
    this.outerRadius = 230;
    // console.log('height test '+this.svgContainer.height()+' width '+this.svgContainer.width());
    this.query_arr = [];
    this.hit_arr = [];
    this.layout_arr = [];
    this.chords_arr = [];
    // this.max_length = 0;
    this.hsp_count = 500;
    this.denominator = 100;
    this.spacing = 20;
    this.labelSpacing = 10;
    var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};
    // this.suffix = suffixes[this.seq_type.subject_seq_type];
    this.construct_layout();
    this.iterator_for_edits();
    // this.sweeping_layout_and_chords();
    this.hit_arr = _.uniq(this.hit_arr);
    this.handle_spacing();

    console.log('2.max '+this.max_length+' hit '+this.hit_arr.length);
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
    console.log('denominator '+this.denominator+' '+this.suffix+' subject '+suffixes[this.seq_type.query_seq_type]);
    console.log('spacing '+this.spacing);
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
    console.log('chords_arr '+this.chords_arr.length);
    if (this.chords_arr.length > 50) {
      this.filter_chords();
    }
    if (this.hit_arr.length > 10) {
      this.complex_layout_edits();
    } else {
      this.simple_layout_edits();
    }
    this.edit_labels();
  }

  // Generate both layout_arr and chords_arr with top hsps set by this.hsp_count
  construct_layout() {
    var hsp_count = 0;
    this.new_layout = [];
    this.data = _.map(this.queries, _.bind(function (query) {
      // if (this.max_length < query.length) {
      //   this.max_length = query.length;
      // }
      if (hsp_count < this.hsp_count) {
        var label = query.id;
        var len = query.length;
        // if (len/this.max_length < 0.35) {
        //   label = label.slice(0,2) + '...';
        // }
        console.log('q id: '+query.id+' len '+query.length);
        var item1 = {'len': len, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id)};
        // this.new_layout.push(item1);
        this.layout_arr.push(item1);
      }
      // console.log('hits '+query.hits.length+' id '+query.id);
      var hit_details = _.map(query.hits, _.bind(function(hit) {
        // this.hit_arr.push(hit.id);
        // console.log(hit.number+' id '+hit.id+' len '+hit.length);
        var hsp_details = _.map(hit.hsps, _.bind(function (hsp) {
          // console.log('  hsp: '+hsp.evalue);
          if (hsp_count < this.hsp_count && hit.number < 10) {
            if (_.indexOf(this.hit_arr, hit.id) == -1) {
              var label = hit.id;
              var len  = hit.length;
              this.hit_arr.push(hit.id);
              // console.log('h id: '+hit.id);
              var item2 = {'len': len, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
              // this.new_layout.push(item2);
              this.layout_arr.push(item2);
            }

            hsp_count++;

            var item3 = ['Query_'+this.clean_id(query.id), hsp.qstart, hsp.qend, 'Hit_'+this.clean_id(hit.id), hsp.sstart, hsp.send, hsp_count, hsp];
            this.chords_arr.push(item3);

          }
          return hsp;
        }, this));
        return hit;
      }, this));
      this.query_arr.push(query.id);
      return query;
    }, this));
    // this.rearrange_new_layout(); // called to collect all querys at one place
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

  // label edits when hit_arr length is less than 10
  simple_layout_edits() {
    _.each(this.layout_arr, _.bind(function (obj, index) {
      var rel_length = (obj.len / this.max_length).toFixed(3);
      var label = obj.label;
      console.log('rel '+rel_length+' id '+label+' index '+index);
      if (rel_length < 0.3) {
        obj.label = '...';
      }
    }, this))
  }

  // label edits along with deleting hits which are too small to display
  complex_layout_edits() {
    this.delete_from_layout = [];
    this.delete_from_chords = [];
    _.each(this.layout_arr, _.bind(function (obj, index) {
      var rel_length = (obj.len / this.max_length).toFixed(3);
      var label = obj.label;
      // console.log('rel '+rel_length+' id '+label+' index '+index);
      if (rel_length < 0.1 && (obj.id).slice(0,3) != 'Que') {
        this.delete_from_layout.push(obj);
        this.hit_arr.splice(_.indexOf(this.hit_arr, obj.label), 1); // corresponding delete from hit_arr
      }
    }, this));
    if (this.delete_from_layout.length > 0) {
      // this.delete_layout_and_chords();
    }
  }

  delete_layout_and_chords() {
    console.log('delete_layout_and_chords '+this.delete_from_layout.length);
    _.each(this.delete_from_layout, _.bind(function(elem) {
      var layout_index;
      var chords_index = [];
      _.each(this.layout_arr, _.bind(function(obj, index) {
        if (obj.label == elem.label) {
          // console.log('tesss '+obj.label+' index splice '+index);
          layout_index = index;
        }
      }, this));
      _.each(this.chords_arr, _.bind(function(obj, index) {
        if (obj[3] == elem.id) {
          // console.log('chorsds '+obj[3]+' index slice '+index);
          chords_index.push(index);
        }
      }, this));
      // console.log('anon '+this.layout_arr.length+' now '+_.map(this.layout_arr, _.iteratee('label')));
      this.layout_arr.splice(layout_index, 1);
      // this.chords_arr.splice(chords_index, 1);
      _.each(chords_index, _.bind(function (id, index) {
        this.chords_arr.splice((id-index), 1)
      }, this))
    }, this))
    this.iterator_for_edits();
  }

  filter_chords() {
    var chords_index = [];
    _.each(this.chords_arr, function (obj, index) {
      var hsp = obj[7];
      if (hsp.qcovhsp < 10) {
        chords_index.push(index);
      }
    });
    console.log('filtering '+chords_index.length);
    _.each(chords_index, _.bind(function(id, index) {
      this.chords_arr.splice((id-index), 1);
    }, this))
  }

  // sweeping: as in cleaning the unmathced chords and ribbons
  sweeping_layout_and_chords() {
    this.delete_arr = [];
    console.log('sweepers away ');
    _.each(this.layout_arr, _.bind(function(obj, index) {
      this.check_in_chords_arr(obj.id, (obj.id).slice(0,3), index);
    }, this))
    this.delete_layout_arr_index(this.delete_arr)
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
    _.each(this.layout_arr, _.bind(function (obj) {
      var rel_length = (obj.len / this.max_length).toFixed(3);
      var label = obj.label;
      if (rel_length < 0.3) {
        obj.label = '..';
      } else if (rel_length < 0.85) {
        obj.label = label.slice(0,2) + '...';
      } else if (label.length > 10) {
        obj.label = label.slice(0,2) + '...';
      }
    }, this));
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
    if (this.chords_arr.length > 11) {
      this.paletteSize = 11;
    } else {
      this.paletteSize = this.chords_arr.length;
    }
    return {
      usePalette: true,
      colorPaletteSize: this.paletteSize,
      // color: 'rgb(0,0,0)',
      colorPalette: 'RdYlBu', // colors of chords based on last value in chords
      // tooltipContent: 'Hiten',
      opacity: 0.5 // add opacity to ribbons
    }
  }

  instance_layout() {
    return {
      innerRadius: this.innerRadius,
      outerRadius: this.outerRadius,
      cornerRadius: 1, // rounding at edges of karyotypes
      labels: {
        display: true,
        size: '8px',
        radialOffset: 10
      },
      ticks: {
        display: true,
        spacing: this.spacing, // the ticks values to display
        labelSpacing: this.labelSpacing, // ticks value apper in interval
        labelDenominator: this.denominator, // divide the value by this value
        labelSuffix: this.suffix,
        labelSize: '2px',
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
        .attr('class','circos-error')
        .attr('transform','translate('+this.svgContainer.width() / 2+','+this.svgContainer.height()/2+')')
        .append('text')
        .attr('text-anchor','start')
        .attr('dy', '0.75em')
        .attr('x', -50)
        .attr('y', 2)
        .text('Sorry no Circos Generated')
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
    _.each(this.query_arr, _.bind(function (id, index) {
      this.chordsHide = [];
      this.layoutHide = [];
      var selected = {};
      if (id) {
        $(".Query_"+this.clean_id(id)).attr('data-toggle','tooltip')
                      .attr('title',id)
                      .on('click', _.bind(function () {
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
      var selected = {};
      if (id) {
        $(".Hit_"+this.clean_id(id)).attr('data-toggle','tooltip')
                    .attr('title',id)
                    .on('click', _.bind(function () {
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
