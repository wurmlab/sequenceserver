import circosJs from 'nicgirault/circosJs';
import React from 'react';
import _ from 'underscore';

export default class Circos extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    CircosJs(this.props.queries);
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

export function CircosJs(queries) {
  var query_arr = [];
  var hit_arr = [];
  var data = _.map(queries, _.bind(function (query) {
    var hit_details = _.map(query.hits, _.bind(function (hit) {
      // var hsp_details = _.map(hit.hsps, _.bind(function (hsp) {
      //   return hsp;
      // }));
      hit_arr.push(hit.id);
      return {id: hit.id, length: hit.length, number: hit.number, hsps: hit.hsps};
    }));
    query_arr.push(query.id);
    return {id: query.id, length: query.length, number: query.number, hits: hit_details};
  }, this));

  var layout_arr = [];
  hit_arr = _.uniq(hit_arr);
  console.log('arr test '+query_arr.length+' hit '+hit_arr.length);
  _.each(query_arr, function(query) {
    _.each(data, function (query_details) {
      if(query == query_details.id) {
        var item = {'len': query_details.length, 'color': '#8dd3c7', 'label': query_details.id, 'id': 'Query_'+query_details.id};
        layout_arr.push(item);
      }
    })
  });
  console.log('layout test '+layout_arr.length);

  _.each(data, function(query) {
    _.each(query.hits, function (hit) {
      var index = _.indexOf(hit_arr, hit.id);
      if (index >= 0) {
        var item = {"len": hit.length, "color": "#80b1d3", "label": hit.id, "id": 'Hit_'+hit.id};
        // console.log('test layout '+item.label);
        layout_arr.push(item);
        hit_arr[index] = 0;
      }
    })
  });
  console.log('layout test 2 '+layout_arr.length);

  var chords_arr = [];
  _.each(data, function(query) {
    _.each(query.hits, function(hit) {
      _.each(hit.hsps, function(hsp) {
        if (_.indexOf(hit_arr, hit.id) == -1) {
          var item = ['Query_'+query.id, hsp.qstart, hsp.qend, 'Hit_'+hit.id, hsp.sstart, hsp.send, hit.number];
          console.log('test chords '+hit.number);
          chords_arr.push(item);
        }
      })
    })
  });
  console.log('chords_arr test '+chords_arr.length);

  var instance = new circosJs({
    container: '.circosContainer',
    width: 800,
    height: 800
  });

  var layout_data = [
    { "len": 31, "color": "#8dd3c7", "label": "HIT 1", "id": "hit1" },
    { "len": 28, "color": "#8dd3c7", "label": "HIT 2", "id": "hit2" },
    { "len": 31, "color": "#8dd3c7", "label": "HIT 3", "id": "hit3" },
    { "len": 30, "color": "#80b1d3", "label": "QUERY 1", "id": "query1" },
    { "len": 31, "color": "#80b1d3", "label": "QUERY 2", "id": "query2" },
    { "len": 10, "color": "#80b1d3", "label": "QUERY 3", "id": "query3" },
  ];
  console.log('layout_data test '+layout_data[0].label);

  instance.layout(
    {
      innerRadius: 300,
      outerRadius: 330,
      labels: {
        display: true,
        size: '8px',
        radialOffset: 10
      },
      ticks: {
        display: true,
        spacing: 10,
        labelDenominator: 10,
        labelSuffix: 'bp',
      }
    },
    layout_arr
  );

  var chords_data = [
    ['hit1', 1, 12,'query2', 18, 20],
    ['hit2', 20, 28,'query1', 1, 13],
    ['hit2', 20, 28,'query2', 1, 13],
    ['hit1', 25, 28,'hit3', 10, 13],
    ['query2', 15, 18,'hit3', 20, 23],
    ['query1', 18, 25,'hit2', 2, 11],
    ['query3', 7, 9, 'hit1', 12, 19]
  ];

  instance.chord('chord1',
    {
      usePalette: true,
      colorPaletteSize: 9,
      // colorPalette: 'PuBuGn',
      // color: 'rgb(76,127,115)',
      colorPalette: ['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000'],
      // tooltipContent: 'Hiten'
    },
    chords_arr
  );
  instance.render();
}
