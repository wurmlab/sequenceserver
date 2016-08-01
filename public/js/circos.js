import circosJs from 'nicgirault/circosJs';
import React from 'react';
import _ from 'underscore';
import * as Helpers from './visualisation_helpers';
import * as Grapher from './grapher';

export default class Circos extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // CircosJs(this.props.queries);
    this.graph = new Graph(this.props.queries, this.props.program, this.svgContainer(), this.props.hitArray);
    this.graph_links = Grapher.graph_links($(React.findDOMNode(this.refs.grapher)));
  }

  svgContainer() {
    return $(React.findDOMNode(this.refs.svgContainer));
  }

  render() {
    return (
      <div
        className="grapher" ref="grapher">
        <div
            className="graph-links" style={{display:"none"}}>
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
  constructor(queries, algorithm, $svgContainer, hit_arr) {
    this.queries = queries;
    this.svgContainer = $svgContainer;
    this.seq_type = Helpers.get_seq_type(algorithm);
    this.max_length = 0;
    this.query_arr = [];
    this.hit_arr = [];
    this.data = _.map(this.queries, _.bind(function (query) {
      if (this.max_length < query.length) {
        this.max_length = query.length;
      }
      var hit_details = _.map(query.hits, _.bind(function(hit) {
        // this.hit_arr.push(hit.id);
        if (hit.number <= 3) {
          this.hit_arr.push(hit.id);
          if (this.max_length < hit.length) {
            this.max_length = hit.length;
          }
        }
        return hit;
      }, this));
      this.query_arr.push(query.id);
      return query;
    }, this));
    if (hit_arr) {
      this.hit_arr = _.uniq(hit_arr);
      console.log('using hit_arr '+hit_arr.length);
    } else {
      console.log('using normal');
      this.hit_arr = _.uniq(this.hit_arr);
    }
    this.initiate();
  }

  initiate() {
    this.width = 800;
    // this.width = this.svgContainer.width();
    this.height = 800;
    // this.height = this.svgContainer.height();
    console.log('height test '+this.svgContainer.height()+' width '+this.svgContainer.width());


    this.denominator = 100;
    this.spacing = 20;
    var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};
    // this.suffix = suffixes[this.seq_type.subject_seq_type];


    var prefix = d3.formatPrefix(this.max_length);
    this.suffix = ' '+prefix.symbol+suffixes[this.seq_type.subject_seq_type];
    if (prefix.symbol == 'k') {
      this.denominator = 1000;
    }
    if (this.max_length > 10000) {
      this.spacing = 50;
    }
    console.log('check '+this.denominator+' '+this.suffix+' subject '+suffixes[this.seq_type.query_seq_type]);
    console.log('max '+this.max_length+' hit '+this.hit_arr.length);

    this.layout_data();
    this.chords_data();
    this.create_instance(this.svgContainer, this.height, this.width);
    this.instance_render();
    this.setupTooltip();
  }

  layout_data() {
    this.layout_arr = [];
    _.each(this.query_arr, _.bind(function(id) {
      _.each(this.data, _.bind(function (query) {
        if (id == query.id) {
          console.log('division query '+query.length/this.max_length);
          var label = query.id;
          console.log('regex test '+label);
          if (query.length/this.max_length < 0.35) {
            label = label.slice(0,2) + '...';
          }
          var item = {'len': query.length, 'color': '#8dd3c7', 'label': label, 'id': 'Query_'+this.clean_id(query.id)};
          this.layout_arr.push(item);
        }
      }, this))
    }, this));

    _.each(this.data, _.bind(function(query) {
      _.each(query.hits, _.bind(function(hit) {
        console.log('inn layout '+this.hit_arr.length+' '+query.id);
        var index = _.indexOf(this.hit_arr, hit.id);
        if (index >= 0 ) {
          console.log('test');
          var label = hit.id;
          // console.log('division hit '+hit.length/this.max_length);
          if (hit.length/this.max_length < 0.35) {
            label = label.slice(0,2) + '...';
          }
          // _.each(this.layout_arr, function(arr) {
          //   _.findKey(arr)
          // })
          // if (hit.id != _.property('id')(arr)) {
          //   var item = {'len': hit.length, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
          //   this.layout_arr.push(item);
          // }
          var item = {'len': hit.length, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
          this.layout_arr.push(item);
          // this.hit_arr[index] = 0;
        }
      }, this))
    }, this));

    // _.each(this.data, _.bind(function(query) {
    //   _.each(this.hit_arr, _.bind(function(hit_id) {
    //     _.each(query.hits, _.bind(function (hit) {
    //       if(hit.id == hit_id) {
    //         var label = hit.id;
    //         // console.log('division hit '+hit.length/this.max_length);
    //         if (hit.length/this.max_length < 0.35) {
    //           label = label.slice(0,2) + '...';
    //         }
    //         var item = {'len': hit.length, 'color': '#80b1d3', 'label': label, 'id': 'Hit_'+this.clean_id(hit.id)};
    //         this.layout_arr.push(item);
    //       }
    //     }, this))
    //   }, this))
    // }, this));
    console.log('lst '+this.layout_arr.length);
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
      usePalette: false,
      // colorPaletteSize: 9,
      color: 'rgb(0,0,0)',
      // colorPalette: 'RdYlBu', // colors of chords based on last value in chords
      // tooltipContent: 'Hiten'
    }
  }

  instance_layout() {
    return {
      innerRadius: 300,
      outerRadius: 330,
      labels: {
        display: true,
        size: '8px',
        radialOffset: 10
      },
      ticks: {
        display: true,
        spacing: this.spacing, // the ticks values to display
        labelDenominator: this.denominator, // divide the value by this value
        labelSuffix: this.suffix,
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
      $(".Query_"+this.clean_id(id)).attr('data-toggle','tooltip')
                    .attr('title',id)
    }, this))
    _.each(this.hit_arr, _.bind(function(id) {
      $(".Hit_"+this.clean_id(id)).attr('data-toggle','tooltip')
                  .attr('title',id);
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
