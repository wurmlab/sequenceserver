import circosJs from 'nicgirault/circosJs';
import React from 'react';
import _ from 'underscore';

export default class Circos extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // CircosJs(this.props.queries);
    this.graph = new Graph(this.props.queries);
  }

  svgTag() {
    return $(React.findDOMNode(this.refs.svgTag));
  }

  render() {
    return (
      <svg className="circosContainer" ref="svgTag"></svg>
    )
  }
}

export class Graph {
  constructor(queries) {
    this.queries = queries;
    this.initiate();
  }

  initiate() {
    this.query_arr = [];
    this.hit_arr = [];
    this.data = _.map(this.queries, _.bind(function (query) {
      var hit_details = _.map(query.hits, _.bind(function(hit) {
        this.hit_arr.push(hit.id);
        return hit;
      }, this));
      this.query_arr.push(query.id);
      return query;
    }, this));
    this.hit_arr = _.uniq(this.hit_arr);
    this.layout_data();
    this.chords_data();
    this.create_instance();
    this.instance_render();
  }

  layout_data() {
    this.layout_arr = [];
    _.each(this.query_arr, _.bind(function(id) {
      _.each(this.data, _.bind(function (query) {
        if (id == query.id) {
          var item = {'len': query.length, 'color': '#8dd3c7', 'label': query.id, 'id': 'Query_'+query.id};
          this.layout_arr.push(item);
        }
      }, this))
    }, this));

    _.each(this.data, _.bind(function(query) {
      _.each(query.hits, _.bind(function(hit) {
        var index = _.indexOf(this.hit_arr, hit.id);
        if (index >= 0 && index < 10) {
          var item = {'len': hit.length, 'color': '#80b1d3', 'label': hit.id, 'id': 'Hit_'+hit.id};
          this.layout_arr.push(item);
          this.hit_arr[index] = 0;
        }
      }, this))
    }, this));
  }

  chords_data() {
    this.chords_arr = [];
    _.each(this.data, _.bind(function(query) {
      _.each(query.hits, _.bind(function(hit) {
        _.each(hit.hsps, _.bind(function(hsp) {
          if (_.indexOf(this.hit_arr, hit.id) == -1) {
            var item = ['Query_'+query.id, hsp.qstart, hsp.qend, 'Hit_'+hit.id, hsp.sstart, hsp.send, hit.number];
            this.chords_arr.push(item);
          }
        }, this))
      }, this))
    }, this));
  }

  create_instance(container, width, height) {
    this.instance = new circosJs({
      container: '.circosContainer',
      width: 800,
      height: 800
    });
    this.chord_layout();
    this.instance_layout();
  }

  chord_layout() {
    return {
      usePalette: false,
      // colorPaletteSize: 9,
      color: 'rgb(0,0,0)',
      // colorPalette: 'RdBu',
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
        spacing: 20, // the ticks values to display
        labelDenominator: 100, // divide the value by this value
        labelSuffix: 'bp',
      }
    }
  }

  instance_render() {
    this.instance.layout(this.instance_layout(),this.layout_arr);
    this.instance.chord('chord1',this.chord_layout(),this.chords_arr);
    this.instance.render();
  }
}
