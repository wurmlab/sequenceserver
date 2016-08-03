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
        className='svgContainer' ref='svgContainer'>
        <svg className="circosContainer" ref="svgTag"></svg>
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
    this.width = 600;
    // this.width = this.svgContainer.width();
    this.height = 600;
    // this.height = this.svgContainer.height();
    this.innerRadius = 200;
    this.outerRadius = 230;
    // console.log('height test '+this.svgContainer.height()+' width '+this.svgContainer.width());
    this.query_arr = [];
    this.hit_arr = [];
    // this.max_length = 0;
    this.denominator = 100;
    this.spacing = 20;
    this.labelSpacing = 10;
    var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};
    // this.suffix = suffixes[this.seq_type.subject_seq_type];
    var hsp_count = 0;
    this.data = _.map(this.queries, _.bind(function (query) {
      if (hsp_count > 25) {
        console.log('break '+hsp_count);
      }
      // if (this.max_length < query.length) {
      //   this.max_length = query.length;
      // }
      var hit_details = _.map(query.hits, _.bind(function(hit) {
        // this.hit_arr.push(hit.id);
        // if (hit.number <= 3) {
        //   this.hit_arr.push(hit.id);
        //   if (this.max_length < hit.length) {
        //     this.max_length = hit.length;
        //   }
        // }
        var hsp_details = _.map(hit.hsps, _.bind(function (hsp) {
          if (hsp.evalue) {
            this.hit_arr.push(hit.id);
            hsp_count++;
            // if (this.max_length < hit.length) {
            //   this.max_length = hit.length;
            // }
          }
          return hsp;
        }, this));
        return hit;
      }, this));
      this.query_arr.push(query.id);
      return query;
    }, this));

    this.hit_arr = _.uniq(this.hit_arr);
    this.max_length = this.calculate_max_length();
    this.calculate_multipliers();

    console.log('max '+this.max_length+' hit '+this.hit_arr.length);
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
    if (this.max_length > 10000) {
      this.spacing = 50;
    }
    console.log('check '+this.denominator+' '+this.suffix+' subject '+suffixes[this.seq_type.query_seq_type]);
    if ((this.hit_arr.length + this.query_arr.length) > 20) {
      this.threshold = 0.05;
    } else if ((this.hit_arr.length + this.query_arr.length) > 10) {
      this.threshold = 0.03;
    } else {
      this.threshold = 0;
    }
    console.log('threshold '+this.threshold);
    this.layout_data();
    this.chords_data();
    this.create_instance(this.svgContainer, this.height, this.width);
    this.instance_render();
    this.setupTooltip();
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

  calculate_max_length() {
    var max = 0;
    _.each(this.data, _.bind(function (query) {
      if (max < query.length) {
        max = query.length
      }
      _.each(query.hits, _.bind(function (hit) {
        if (max < hit.length) {
          max = hit.length;
        }
      }, this));
    }, this));
    return max;
  }

  layout_data() {
    this.layout_arr = [];
    _.each(this.query_arr, _.bind(function(id) {
      _.each(this.data, _.bind(function (query) {
        if (id == query.id) {
          var index = _.indexOf(this.query_arr,query.id);
          // console.log('division query '+query.length/this.max_length);
          var label = query.id;
          var len = query.length*this.query_multiplier;
          if (len/this.max_length < this.threshold) {
            this.query_arr[index] = 0;
            return
          }
          if (len/this.max_length < 0.35) {
            label = label.slice(0,2) + '...';
          }
          console.log('q id: '+query.id+' len '+len/this.max_length);
          var item = {'len': len, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id)};
          this.layout_arr.push(item);
        }
      }, this))
    }, this));

    _.each(this.data, _.bind(function(query) {
      _.each(query.hits, _.bind(function(hit) {
        var index = _.indexOf(this.hit_arr, hit.id);
        if (index >= 0 ) {
          var label = hit.id;
          var len = hit.length*this.hit_multiplier;
          if (len/this.max_length < this.threshold) {
            this.hit_arr[index] = 0;
            return
          }
          if (len/this.max_length < 0.35) {
            label = label.slice(0,2) + '...';
          }
          console.log('h id: '+hit.id+' len '+len/this.max_length);
          var item = {'len': len, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
          this.layout_arr.push(item);
          // this.hit_arr[index] = 0;
        }
      }, this))
    }, this));
  }

  clean_id(id) {
    return id.replace(/[^a-zA-Z0-9]/g, '');
  }

  chords_data() {
    this.chords_arr = [];
    _.each(this.data, _.bind(function(query) {
      _.each(query.hits, _.bind(function(hit) {
        _.each(hit.hsps, _.bind(function(hsp) {
          if (_.indexOf(this.hit_arr, hit.id) >= 0) {
            var q = this.query_multiplier;
            var h = this.hit_multiplier;
            var item = ['Query_'+this.clean_id(query.id), hsp.qstart*q, hsp.qend*q, 'Hit_'+this.clean_id(hit.id), hsp.sstart*h, hsp.send*h, query.number];
            this.chords_arr.push(item);
            this.hit_arr.push(hit.id);
          }
        }, this))
      }, this))
    }, this));
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
    return {
      usePalette: true,
      // colorPaletteSize: 9,
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
        labelSpacing: this.labelSpacing,
        labelDenominator: this.denominator, // divide the value by this value
        labelSuffix: this.suffix,
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

  setupTooltip() {
    _.each(this.query_arr, _.bind(function (id) {
      if (id) {
        $(".Query_"+this.clean_id(id)).attr('data-toggle','tooltip')
                      .attr('title',id);
      }
    }, this))
    _.each(this.hit_arr, _.bind(function(id) {
      if (id) {
        $(".Hit_"+this.clean_id(id)).attr('data-toggle','tooltip')
                    .attr('title',id);
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
}
