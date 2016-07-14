import './kablammo/graph';
import './kablammo/exporter';
import './kablammo/image_exporter';
import './kablammo/alignment_viewer';
import './kablammo/alignment_exporter';
import * as Helpers from './visualisation_helpers';
import React from 'react';
import _ from 'underscore';
import d3 from 'd3';
import * as Grapher_component from './grapher';

/**
 * Renders Kablammo visualization
 *
 * JSON received from server side is modified as JSON expected by kablammo's
 * graph.js.  All the relevant information including a SVG container where
 * visual needs to be rendered, is delegated to graph.js. graph.js renders
 * kablammo visualization and has all event handlers for events performed on
 * the visual.
 *
 * Event handlers related to downloading and viewing of alignments and images
 * have been extracted from grapher.js and interface.js and directly included
 * here.
 */
export default class Kablammo extends React.Component {
 constructor(props) {
   super(props);
 }

 toKablammo(hsps, query) {
   var maxBitScore = query.hits[0].hsps[0].bit_score;

   var hspKeyMap = {
       'qstart':  'query_start',
       'qend':    'query_end',
       'qframe':  'query_frame' ,
       'sstart':  'subject_start',
       'send':    'subject_end',
       'sframe':  'subject_frame',
       'length':  'alignment_length',
       'qseq':    'query_seq',
       'sseq':    'subject_seq',
       'midline': 'midline_seq'
   };

   return _.map(hsps, function (hsp) {
     var _hsp = {};
     $.each(hsp, function(key, value) {
       key = hspKeyMap[key] || key;
       _hsp[key] = value;
       _hsp.normalized_bit_score = hsp.bit_score / maxBitScore;
     })
     return _hsp;
   })
 }

 /**
  * Returns jQuery wrapped element that should hold Kablammo's svg.
  */
 svgContainer() {
   return $(React.findDOMNode(this.refs.svgContainer));
 }

 isHspSelected(index, selected) {
   return index in selected;
 }

 /**
  * Event-handler for viewing alignments.
  * Calls relevant method on AlignmentViewer defined in alignment_viewer.js.
  */
 showAlignment(hsps, query_seq_type, query_def, query_id, subject_seq_type, subject_def, subject_id) {
     event.preventDefault();
     aln_viewer = new AlignmentViewer();
     aln_viewer.view_alignments(hsps, query_seq_type, query_def, query_id, subject_seq_type, subject_def, subject_id);
 }

 // Life-cycle methods //

 render() {
    return Grapher_component.grapher_render();
 }

 /**
  * Invokes Graph method defined in graph.js to render kablammo visualization.
  * Also defines event handler for hovering on HSP polygon.
  */
 componentDidMount(event) {
     var hsps = this.toKablammo(this.props.hit.hsps, this.props.query);
     var svgContainer = this.svgContainer();
     var grapher = new Grapher();
     this.graph_links = Grapher_component.graph_links($(React.findDOMNode(this.refs.grapher)));

     Graph.prototype._canvas_width = svgContainer.width();

     this._graph = new Graph(
         grapher,
         Helpers.get_seq_type(this.props.algorithm),
         this.props.query.id + ' ' + this.props.query.title,
         this.props.query.id,
         this.props.hit.id + ' ' + this.props.hit.title,
         this.props.hit.id,
         this.props.query.length,
         this.props.hit.length,
         hsps,
         svgContainer,
         Helpers
     );

     // Disable hover handlers and show alignment on selecting hsp.
     var selected = {}
     var polygons = d3.select(svgContainer[0]).selectAll('polygon');
     var labels = d3.select(svgContainer[0]).selectAll('text');
     polygons
     .on('mouseenter', null)
     .on('mouseleave', null)
     .on('click', _.bind(function (clicked_hsp , clicked_index) {
       if (!this.isHspSelected(clicked_index, selected)) {
         selected[clicked_index] = hsps[clicked_index];
         var polygon = polygons[0][clicked_index];
         polygon.parentNode.appendChild(polygon);
         d3.select(polygon).classed('selected', true);
         var label = labels[0][clicked_index];
         label.parentNode.appendChild(label);
         $("#Alignment_Query_" + this.props.query.number + "_hit_" + this.props.hit.number + "_" + (clicked_index + 1)).addClass('alignment-selected');
       } else {
         delete selected[clicked_index];
         var polygon = polygons[0][clicked_index];
         var firstChild = polygon.parentNode.firstChild;
         if (firstChild) {
           polygon.parentNode.insertBefore(polygon, firstChild)
         }
         d3.select(polygon).classed('selected', false);
         $("#Alignment_Query_" + this.props.query.number + "_hit_" + this.props.hit.number + "_" + (clicked_index + 1)).removeClass('alignment-selected');
       }
     }, this))
 }
}

/**
 * Mock Kablammo's grapher.js.
 */
class Grapher {
  constructor() {
    this.use_complement_coords = false;
  }

  _rgba_to_rgb(rgba, matte_rgb) {
    // Algorithm taken from http://stackoverflow.com/a/2049362/1691611.
    var normalize = function (colour) {
        return colour.map(function (channel) { return channel / 255; });
    };

    var denormalize = function (colour) {
        return colour.map(function (channel) { return Math.round(Math.min(255, channel * 255)); });;
    };

    var norm = normalize(rgba.slice(0, 3));
    matte_rgb = normalize(matte_rgb);
    var alpha = rgba[3] / 255;

    var rgb = [
        (alpha * norm[0]) + (1 - alpha) * matte_rgb[0],
        (alpha * norm[1]) + (1 - alpha) * matte_rgb[1],
        (alpha * norm[2]) + (1 - alpha) * matte_rgb[2],
    ];

    return denormalize(rgb);
  }

  /**
   * Determines colour of a hsp based on normalized bit-score.
   *
   * Taken from grapher.js
   */
  determine_colour(level) {
      var graph_colour = { r: 30, g: 139, b: 195 };
      var matte_colour = { r: 255, g: 255, b: 255 };
      var min_opacity = 0.3;
      var opacity = ((1 - min_opacity) * level) + min_opacity;
      var rgb = this._rgba_to_rgb([
          graph_colour.r,
          graph_colour.g,
          graph_colour.b,
          255 * opacity
      ], [
          matte_colour.r,
          matte_colour.g,
          matte_colour.b,
      ]);
      return 'rgb(' + rgb.join(',') + ')';
  }
}
