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

    /**
     * Returns jQuery wrapped element that should hold Kablammo's svg.
     */
    svgContainer() {
        return $(React.findDOMNode(this.refs.svgContainer));
    }

    // Life-cycle methods //

    render() {
        return Grapher_component.grapher_render();
    }

    componentWillUpdate() {
        this.svgContainer().find('svg').remove();
        this._graph._canvas_width = this.svgContainer().width();
        this._graph._canvas_height = this.svgContainer().height();
        this._graph._initiate();
    }

    /**
     * Invokes Graph method defined in graph.js to render kablammo visualization.
     * Also defines event handler for hovering on HSP polygon.
     */
    componentDidMount(event) {
        var svgContainer = this.svgContainer();
        svgContainer.addClass('kablammo');

        this._graph = new Graph(
            Helpers.get_seq_type(this.props.algorithm),
            this.props.query,
            this.props.hit,
            svgContainer,
            Helpers
        );

        // Disable hover handlers and show alignment on selecting hsp.
        var polygons = d3.select(svgContainer[0]).selectAll('polygon');
        var labels = d3.select(svgContainer[0]).selectAll('text');
        polygons
        .on('mouseenter', function (hov_hsp, hov_index) {
            var polygon = polygons[0][hov_index];
            var label = labels[0][hov_index];
            d3.select(polygon).classed('raised', true);
            polygon.parentNode.appendChild(polygon);
            label.parentNode.appendChild(label);
        })
        .on('mouseleave', function (hov_hsp, hov_index) {
            var polygon = polygons[0][hov_index];
            var label = labels[0][hov_index];
            d3.select(polygon).classed('raised', false);
            var firstPolygon = polygon.parentNode.firstChild;
            var firstLabel = label.parentNode.firstChild;
            if (firstPolygon) {
                polygon.parentNode.insertBefore(polygon, firstPolygon)
            }
            if (firstLabel) {
                label.parentNode.insertBefore(label, firstLabel)
            }
        })
    }
}

export class Graph {
  constructor(results, query, hit, svg_container) {
    this._zoom_scale_by = 1.4;
    this._padding_x = 20;
    this._padding_y = 70;

    this._canvas_height = svg_container.height();
    this._canvas_width = svg_container.width();

    this._results = results;
    this._query_id = query.id;
    this._subject_id = hit.id;
    this._query_length = query.length;
    this._subject_length = hit.length;
    this._hsps = hit.hsps;
    this._maxBitScore = query.hits[0].hsps[0].bit_score;

    this.svg_container_d3 = d3.select(svg_container[0]);
    this._svg = {};

    this._svg.jq = $(this._svg.raw);

    this._scales = this._create_scales();

    this._axis_label_visibility = {
      query: 'visible',
      subject: 'visible'
    };
    this._axis_ticks = 10;

    this.use_complement_coords = false;
    this._initiate();
  }

  _initiate() {
      this._svg.d3 =
          this.svg_container_d3.insert('svg', ':first-child')
          .attr('height', this._canvas_height)
          .attr('width', this._canvas_width);
    this._svg.raw = this._svg.d3[0][0];
    this._render_graph();
  }

  _rotate_axis_labels(text, text_anchor, dx, dy) {
    text.style('text-anchor', text_anchor)
        .attr('x', dx)
        .attr('y', dy)
        // When axis orientation is "bottom", d3 automataically applies a 0.71em
        // dy offset to labels. As Inkscape does not seem to properly interpret
        // such values, force them to be zero. When calling this function, then,
        // you must compensate by adding 0.71em worth of offset to the dy value
        // you provide.
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('transform', 'rotate(-90)');
  }

  _create_axis(scale, orientation, height, text_anchor, dx, dy, seq_type) {
    var formatter = Helpers.tick_formatter(scale, seq_type);
    var tvalues = scale.ticks();
    tvalues.pop();
    var axis = d3.svg.axis()
                 .ticks(this._axis_ticks)
                 .scale(scale)
                 .tickValues(tvalues.concat(scale.domain()))
                 .tickFormat(formatter)
                 .orient(orientation);

    var container = this._svg.d3.append('g')
       .attr('class', 'axis')
       .attr('transform', 'translate(0,' + height + ')')
       .call(axis);
    this._rotate_axis_labels(container.selectAll('text'), text_anchor, dx, dy);

    return container;
  }

  _is_domain_within_orig(original_domain, new_domain) {
    return original_domain[0] <= new_domain[0] && original_domain[1] >= new_domain[1];
  }

  _zoom_scale(scale, original_domain, zoom_from, scale_by) {
    var l = scale.domain()[0];
    var r = scale.domain()[1];

    l = zoom_from - (zoom_from - l) / scale_by;
    r = zoom_from + (r - zoom_from) / scale_by;

    l = Math.round(l);
    r = Math.round(r);
    if(r - l < this._axis_ticks)
      return;

    var new_domain = [l, r];
    if(this._is_domain_within_orig(original_domain, new_domain))
      scale.domain(new_domain);
    else
      scale.domain(original_domain);
  }

  _pan_scale(existing_scale, original_domain, delta) {
    var scale = (existing_scale.domain()[1] - existing_scale.domain()[0]) / (existing_scale.range()[1] - existing_scale.range()[0]);
    var scaled_delta = -delta * scale;

    var domain = existing_scale.domain();
    var l = domain[0] + scaled_delta;
    var r = domain[1] + scaled_delta;
    var new_domain = [l, r];

    if(this._is_domain_within_orig(original_domain, new_domain))
      existing_scale.domain(new_domain);
  }

  _render_polygons() {
    var self = this;

    // Remove all existing child elements.
    this._svg.d3.selectAll('*').remove();

    this._polygons = this._svg.d3.selectAll('polygon')
       .data(this._hsps)
       .enter()
       .append('polygon')
       .attr('class', 'hit')
       .attr('fill', function(hsp) {
         return self.determine_colour(hsp.bit_score / self._maxBitScore);
       }).attr('points', function(hsp) {
         // We create query_x_points such that the 0th element will *always* be
         // on the left of the 1st element, regardless of whether the axis is
         // drawn normally (i.e., ltr) or reversed (i.e., rtl). We do the same
         // for subject_x_points. As our parsing code guarantees start < end, we
         // decide on this ordering based on the reading frame, because it
         // determines whether our axis will be reversed or not.
         console.log('1. '+hsp.qstart+' 2. '+hsp.qend+' 3. '+hsp.sstart+' 4. '+hsp.send);
         var query_x_points = [self._scales.query.scale(hsp.qstart), self._scales.query.scale(hsp.qend)];
         var subject_x_points = [self._scales.subject.scale(hsp.sstart), self._scales.subject.scale(hsp.send)];

         // Axis will be rendered with 5' end on right and 3' end on left, so we
         // must reverse the order of vertices for the polygon we will render to
         // prevent the polygon from "crossing over" itself.
         if(!self.use_complement_coords) {
           if(hsp.qframe < 0)
             query_x_points.reverse();
           if(hsp.sframe < 0)
             subject_x_points.reverse();
         }

         var points = [
           [query_x_points[0],   self._scales.query.height   + 1],
           [subject_x_points[0], self._scales.subject.height - 1],
           [subject_x_points[1], self._scales.subject.height - 1],
           [query_x_points[1],   self._scales.query.height   + 1],
         ];

         return points.map(function(point) {
          return point[0] + ',' + point[1];
         }).join(' ');
       });


   this._labels = this._svg.d3.selectAll('text')
       .data(this._hsps)
       .enter()
       .append('text')
       .attr('x', function(hsp) {
         var query_x_points = [self._scales.query.scale(hsp.qstart), self._scales.query.scale(hsp.qend)];
         var subject_x_points = [self._scales.subject.scale(hsp.sstart), self._scales.subject.scale(hsp.send)];
         var middle1 = (query_x_points[0] + subject_x_points[0]) * 0.5;
         var middle2 = (query_x_points[1] + subject_x_points[1]) * 0.5;
         return (middle2 + middle1) * 0.5;
       })
       .attr('y', self._scales.query.height + 55)
       .attr('class', 'hsp_numbering')
       .text(function(hsp) {
         return String.fromCharCode(96+hsp.number);
       });
  }

  _overlaps(s1, e1, s2, e2) {
    return Math.min(e1, e2) > Math.max(s1, s2);
  }

  _rects_overlap(rect1, rect2, padding) {
    padding = padding || 0;

    return this._overlaps(
      rect1.left - padding,
      rect1.right + padding,
      rect2.left,
      rect2.right
    ) && this._overlaps(
      rect1.top - padding,
      rect1.bottom + padding,
      rect2.top,
      rect2.bottom
    );
  }

  _label_axis(type, axis) {
    var centre = 0.5 * this._svg.d3.attr('width');
    var padding = 1;

    if(type === 'query') {
      var y = 12;
    } else if(type === 'subject') {
      var y = this._svg.d3.attr('height') - 5;
    } else {
      throw 'Unknown axis type: ' + type;
    }

    var capitalized = type.charAt(0).toUpperCase() + type.slice(1);
    var label = this._svg.d3.append('text')
      // Cache the last visible state of the label so that, during
      // zooming/panning operations, you don't see it flickering into existence
      // here as it's created, only to be hidden by the overlap-detection code
      // below.
       .style('visibility', this._axis_label_visibility[type])
       .attr('class', type + ' axis-label')
       .attr('text-anchor', 'end')
       .attr('x', centre)
       .attr('y', y)
       .text(capitalized);

    var self = this;
    setTimeout(function() {
      var label_bb = label[0][0].getBoundingClientRect();
      var ticks = axis.selectAll('.tick');
      var does_label_overlap_ticks = axis.selectAll('.tick')[0].reduce(function(previous_overlap, tick) {
        var tick_bb = tick.getBoundingClientRect();
        var current_overlap = self._rects_overlap(label_bb, tick_bb, padding);
        return previous_overlap || current_overlap;
      }, false);

      if(does_label_overlap_ticks) {
        //self._axis_label_visibility[type] = 'hidden';
        //label.style('visibility', 'hidden');
      } else {
        self._axis_label_visibility[type] = 'visible';
      }
    }, 1);
  }

  _render_axes() {
    var query_axis = this._create_axis(this._scales.query.scale,   'top',
                      this._scales.query.height,   'start', '9px', '2px',
                      this._results.query_seq_type);
    var subject_axis = this._create_axis(this._scales.subject.scale, 'bottom',
                      this._scales.subject.height, 'end',   '-11px',  '3px',
                      this._results.subject_seq_type);
    this._label_axis('query', query_axis);
    this._label_axis('subject', subject_axis);
  }

  _render_graph() {
    this._render_polygons();
    this._render_axes();
  }

  _find_nearest_scale(point) {
    var nearest = null;
    var smallest_distance = Number.MAX_VALUE;

    var self = this;
    Object.keys(this._scales).forEach(function(scale_name) {
      var scale        = self._scales[scale_name].scale;
      var scale_height = self._scales[scale_name].height;

      var delta = Math.abs(scale_height - point[1]);
      if(delta < smallest_distance) {
        nearest = scale;
        smallest_distance = delta;
      }
    });

    return nearest;
  }

  _create_scales() {
    var query_range   = [this._padding_x, this._canvas_width - this._padding_x];
    var subject_range = [this._padding_x, this._canvas_width - this._padding_x];

    // If we wish to show the HSPs relative to the original (input or DB)
    // sequence rather than its complement (i.e., use_complement_coords = false),
    // even when the HSPs lie on the complement, then we must display the axis
    // with its 5' end on the right and 3' end on the left. In this case, you can
    // imagine the invisible complementary strand (with its 5' end on left and 3'
    // end on right) floating above the rendered original strand, with the hits
    // actually falling on the complementary strand.
    //
    // If we show the HSPs relative to the complementary strand (i.e.,
    // use_complement_coords = true), then we *always* wish to show the axis with
    // its 5' end on the left and 3' end on the right.
    //
    // Regardless of whether this value is true or falase, the rendered polygons
    // will be precisely the same (meaning down to the pixel -- they will be
    // *identical*). Only the direction of the axis, and the coordinates of
    // points falling along it, change.
    if(!this.use_complement_coords) {
      if(this._hsps[0].qframe < 0)
        query_range.reverse();
      if(this._hsps[0].sframe < 0)
        subject_range.reverse();
    }

    var query_scale = d3.scale.linear()
                           .domain([1, this._query_length])
                           .range(query_range);
    var subject_scale = d3.scale.linear()
                           .domain([1, this._subject_length])
                           .range(subject_range);
    query_scale.original_domain = query_scale.domain();
    subject_scale.original_domain = subject_scale.domain();

    var query_height = this._padding_y;
    var subject_height = this._canvas_height - this._padding_y;

    var scales = {
      subject: { height: subject_height, scale: subject_scale },
      query:   { height: query_height,   scale: query_scale   },
    };
    return scales;
  }

  _configure_panning() {
    var self = this;
    var last_x = null;

    this._svg.d3.on('mousedown',  function() { last_x = d3.event.clientX; });
    this._svg.d3.on('mouseup',    function() { last_x = null;             });
    this._svg.d3.on('mouseleave', function() { last_x = null;             });

    this._svg.d3.on('mousemove',  function() {
      if(last_x === null)
        return;

      var new_x = d3.event.clientX;
      var delta = new_x - last_x;
      last_x = new_x;

      var mouse_coords = d3.mouse(self._svg.raw);
      var target_scale = self._find_nearest_scale(mouse_coords);

      self._pan_scale(target_scale, target_scale.original_domain, delta);
      self._render_graph();
    });
  }

  _configure_zooming() {
    var self = this;

    function handle_mouse_wheel() {
      var evt = d3.event;
      evt.preventDefault();

      var scale_by = self._zoom_scale_by;
      var direction = (evt.deltaY < 0 || evt.wheelDelta > 0) ? 1 : -1;
      if(direction < 0)
        scale_by = 1/scale_by;

      var mouse_coords = d3.mouse(self._svg.raw);
      var target_scale = self._find_nearest_scale(mouse_coords);
      // Take x-coordinate of mouse, figure out where that lies on subject
      // axis, then place that point on centre of new zoomed axis.
      var zoom_from = target_scale.invert(mouse_coords[0]);

      self._zoom_scale(
        target_scale,
        target_scale.original_domain,
        zoom_from,
        scale_by
      );
      self._render_graph();
    }

    this._svg.d3.on('mousewheel', handle_mouse_wheel); // Chrome
    this._svg.d3.on('wheel',      handle_mouse_wheel); // Firefox, IE
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
