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
    this.width = 600;
    // this.width = this.svgContainer.width();
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
    this.hsp_count = 50;
    this.denominator = 100;
    this.spacing = 20;
    this.labelSpacing = 10;
    var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};
    // this.suffix = suffixes[this.seq_type.subject_seq_type];
    this.construct_layout();
    this.iterator_for_edits();
    // this.sweeping_layout_and_chords();
    this.hit_arr = _.uniq(this.hit_arr);
    this.calculate_threshold();
    // this.generate_tuples();
    // this.max_length = this.calculate_max_length();

    this.apply_threshold();
    // this.max_length = this.calculate_max_length(); // recalculate for difference
    // this.calculate_multipliers(); // for half n half
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
    // this.layout_data();
    // this.chords_data();
    this.create_instance(this.svgContainer, this.height, this.width);
    this.instance_render();
    this.setupTooltip();
  }

  iterator_for_edits() {
    this.max_length = this.calculate_max_length();
    if (this.hit_arr.length > 10) {
      this.complex_layout_edits();
    } else {
      this.simple_layout_edits();
    }
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
        console.log('q id: '+query.id);
        var item1 = {'len': len, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id)};
        this.new_layout.push(item1);
      }
      var hit_details = _.map(query.hits, _.bind(function(hit) {
        // this.hit_arr.push(hit.id);
        var hsp_details = _.map(hit.hsps, _.bind(function (hsp) {

          if (hsp_count < this.hsp_count) {
            if (_.indexOf(this.hit_arr, hit.id) == -1) {
              var label = hit.id;
              var len  = hit.length;
              this.hit_arr.push(hit.id);
              // console.log('h id: '+hit.id);
              var item2 = {'len': len, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
              this.new_layout.push(item2);
            }

            hsp_count++;

            var item3 = ['Query_'+this.clean_id(query.id), hsp.qstart, hsp.qend, 'Hit_'+this.clean_id(hit.id), hsp.sstart, hsp.send, query.number];
            this.chords_arr.push(item3);
          }
          return hsp;
        }, this));
        return hit;
      }, this));
      this.query_arr.push(query.id);
      return query;
    }, this));
    this.rearrange_new_layout();
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
    this.delete_layout_index = [];
    this.delete_chords_index = [];
    _.each(this.layout_arr, _.bind(function (obj, index) {
      var rel_length = (obj.len / this.max_length).toFixed(3);
      var label = obj.label;
      console.log('rel '+rel_length+' id '+label+' index '+index);
      if (rel_length < 0.3) {
        obj.label = '..';
      } else if (rel_length < 0.85) {
        obj.label = label.slice(0,2) + '...';
      } else if (label.length > 10) {
        obj.label = label.slice(0,2) + '...';
      }
      if (rel_length < 0.1 && index >= this.query_arr.length) {
        this.delete_layout_index.push(index);
        this.hit_arr.slice(_.indexOf(this.hit_arr, obj.id), 1);
        this.edit_chord_layout(obj, (obj.id).slice(0,3)); // send obj to be removed and Hit or Que
      }
    }, this));
    if (this.delete_layout_index.length > 0 || this.delete_chords_index.length > 0) {
      // console.log('delete_layout_index'+this.delete_layout_index.length);
      // console.log('delete_chords_index'+this.delete_chords_index.length);
      this.delete_layout_arr_index(this.delete_layout_arr_index);
      this.delete_chords_arr_index(this.delete_chords_arr_index);
      // this.iterator_for_edits(); for multiple iteration till we achive best
    }
  }

  // deleting corresponding ribbons related to hits karyotypes being deleted
  edit_chord_layout(elem, type) {
    _.each(this.chords_arr, _.bind(function(obj, index) {
      // console.log('chords_arr '+obj[1]+'len '+this.chords_arr.length);
      if (type == 'Hit') {
        // console.log('match '+type);
        if (obj[3] == elem.id) {
          console.log('fou '+index);
          this.delete_chords_index.push(index);
        }

      } else if (type == 'Que') {
        // console.log('match '+type);
        if (obj[0] == elem.id) {
          console.log('found '+index);
          // var h_index = this.find_index_of_hit(obj[3]);
          // this.delete_layout_index.push(h_index);
          this.delete_chords_index.push(index);
        }
      }
    }, this));
  }

  // deleting objects from layout_arr based on array provided as arguments
  delete_layout_arr_index(arr) {
    console.log('delete layout '+arr.length);
    _.each(arr, _.bind(function(index) {
      this.layout_arr.splice(index, 1);
    }, this));
  }

  // deleting objects from chords_arr based on array provided as arguments
  delete_chords_arr_index(arr) {
    console.log('delete chords '+arr.length);
    _.each(arr, _.bind(function(index) {
      this.chords_arr.splice(index, 1);
    }, this));
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

  generate_tuples() {
    console.log('tuples entry');
    this.new_data = _.map(this.queries, _.bind(function(query) {
      var hit_details = _.map(query.hits, _.bind(function(hit) {
        var hsp_details = _.map(hit.hsps, _.bind(function(hsp) {
          return {
            qstart: hsp.qstart,
            qend: hsp.qend,
            sstart: hsp.sstart,
            send: hsp.send
          };
        }, this));
        return {
          id: hit.id,
          length: hit.length,
          hsps: hsp_details
        };
      }, this));
      return {
        id: query.id,
        length: query.length,
        hits: hit_details
      };
    }, this));
    _.each(this.new_data, _.bind(function(query) {
      console.log('in for a 5 '+query.hits.length);
    }, this))
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
      this.spacing = 50;
    }
  }

  calculate_threshold() {
    var sum_lengths = this.hit_arr.length + this.query_arr.length
    if (sum_lengths > 20) {
      this.threshold = 0.05;
    } else if (sum_lengths > 10) {
      this.threshold = 0.03;
    } else {
      this.threshold = 0;
    }
    console.log('threshold '+this.threshold);
  }

  apply_threshold() {
    _.each(this.data, _.bind(function (query) {
      var q_index = _.indexOf(this.hit_arr, query.id)
      if (query.length/this.max_length < this.threshold ) {
        this.query_arr[q_index] = 0;
        return
      }
      _.each(query.hits, _.bind(function (hit) {
        var h_index = _.indexOf(this.hit_arr, hit.id)
        if (hit.length/this.max_length < this.threshold) {
          this.hit_arr[h_index] = 0;
        }
      }, this))
    }, this))
  }

  calculate_max_length() {
    var max = 0;
    // _.each(this.data, _.bind(function (query) {
    //   if (max < query.length && _.indexOf(this.query_arr, query.id) >= 0) {
    //     max = query.length;
    //   }
    //   _.each(query.hits, _.bind(function (hit) {
    //     if (max < hit.length && _.indexOf(this.hit_arr, hit.id) >= 0) {
    //       max = hit.length;
    //     }
    //   }, this));
    // }, this));
    _.each(this.layout_arr, function(obj) {
      if (max < obj.len) {
        max = obj.len;
      }
    })
    return max;
  }

  calculte_total_length() {
    var sum = 0
    _.each(this.layout_arr, function(obj) {
      sum += obj.len;
    })
    return sum;
  }

  layout_data() {
    // _.each(this.query_arr, _.bind(function(id) {
    //   _.each(this.data, _.bind(function (query) {
    //     if (id == query.id) {
    //       var index = _.indexOf(this.query_arr,query.id);
    //       // console.log('division query '+query.length/this.max_length);
    //       var label = query.id;
    //       var len = query.length;
    //       // if (len/this.max_length < this.threshold) {
    //       //   this.query_arr[index] = 0;
    //       //   // this.query_arr.splice(index, 1);
    //       //   return
    //       // }
    //       if (len/this.max_length < 0.35) {
    //         label = label.slice(0,2) + '...';
    //       }
    //       console.log('q id: '+query.id+' len '+len/this.max_length+' index '+index);
    //       var item = {'len': len, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id)};
    //       this.layout_arr.push(item);
    //     }
    //   }, this))
    // }, this));

    _.each(this.data, _.bind(function(query) {
      var q_index = _.indexOf(this.query_arr, query.id)
      if (q_index >= 0) {
        var label = query.id;
        var len = query.length;
        if (len/this.max_length < this.threshold) {
          return
        }
        if (len/this.max_length < 0.35) {
          label = label.slice(0,2) + '...';
        }
        console.log('q id: '+query.id+' len '+len/this.max_length+' index '+q_index);
        var item = {'len': len, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id)};
        this.layout_arr.push(item);
      }
      _.each(query.hits, _.bind(function(hit) {
        var h_index = _.indexOf(this.hit_arr, hit.id);
        if (h_index >= 0 ) {
          var label = hit.id;
          var len = hit.length;
          // if (len/this.max_length < this.threshold) {
          //   this.hit_arr[index] = 0;
          //   // this.hit_arr.splice(index, 1);
          //   return
          // }
          if (len/this.max_length < 0.35) {
            label = label.slice(0,2) + '...';
          }
          console.log('h id: '+hit.id+' len '+len/this.max_length+' index '+h_index);
          var item = {'len': len, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
          this.layout_arr.push(item);
          // this.hit_arr[h_index] = 0; // to prevent duplicates in next iteration
        }
      }, this))
    }, this));
  }

  clean_id(id) {
    return id.replace(/[^a-zA-Z0-9]/g, '');
  }

  chords_data() {
    _.each(this.data, _.bind(function(query) {
      _.each(query.hits, _.bind(function(hit) {
        _.each(hit.hsps, _.bind(function(hsp) {
          if (_.indexOf(this.hit_arr, hit.id) >= 0 && _.indexOf(this.query_arr,query.id) >= 0) {
            var item = ['Query_'+this.clean_id(query.id), hsp.qstart, hsp.qend, 'Hit_'+this.clean_id(hit.id), hsp.sstart, hsp.send, query.number];
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
        labelSpacing: this.labelSpacing, // ticks value apper in interval
        labelDenominator: this.denominator, // divide the value by this value
        labelSuffix: this.suffix,
        // labelSize: '2px',
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
