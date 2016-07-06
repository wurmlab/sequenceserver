"use strict";

function Graph(grapher, results, query_def, query_id, subject_def, subject_id, query_length, subject_length, hsps, svg_container, visualisation_helpers) {
  this._show_hsp_outlines = true;
  this._zoom_scale_by = 1.4;
  this._padding_x = 20;
  this._padding_y = 70;
  //this._canvas_width = 500;
  this._canvas_height = 330;

  this._grapher = grapher;
  this._results = results;
  this._query_def = query_def;
  this._query_id = query_id;
  this._subject_def = subject_def;
  this._subject_id = subject_id;
  this._query_length = query_length;
  this._subject_length = subject_length;
  this._hsps = hsps;

  this._helpers = visualisation_helpers;

  // Use parents() instead of parent() to (if needed) traverse multiple levels
  // up DOM tree.
  // Note that _subject_container is a jQuery reference.
  this._subject_container = svg_container.parents('.subject');
  this._subject_container[0]._grapher = this;

  var svg_container_d3 = d3.select(svg_container[0]);
  this._svg = {};
  this._svg.d3 = svg_container_d3.insert('svg', ':first-child') // Prepend to svg_container
                                 .attr('width', this._canvas_width)
                                 .attr('height', this._canvas_height);
  this._svg.raw = this._svg.d3[0][0];
  this._svg.jq = $(this._svg.raw);

  // Use key/value structure, where keys are HSP indices and values are the
  // associated HSPs. This duplicates the HSP information, which is stored in
  // this._hsps. Relative to array, however, this allows efficient querying of
  // whether an HSP is selected ("if(index in this._selected..."), and it is a
  // convenient structure to pass to other classes such as AlignmentViewer,
  // which need both index and HSP.
  this._selected = {};

  this._scales = this._create_scales();

  this._axis_label_visibility = {
    query: 'visible',
    subject: 'visible'
  };
  this._axis_ticks = 10;

  this._render_graph();
  // this._configure_panning();
  // this._configure_zooming();
}

Graph.prototype._display_selected_hsp_count = function() {
  var count = this._count_selected_hsps();
  var elem = this._subject_container.find('.selected-count');

  if(count === 1) {
    var first_selected_index = Object.keys(this._selected)[0];
    this._show_subject_params(this._selected[first_selected_index]);
  } else {
    this._hide_subject_params();
  }

  if(count === 0) {
    elem.hide();
    return;
  } else {
    if(count === 1) {
    var first_selected_index = parseInt(Object.keys(this._selected)[0], 10);
      var desc = 'Alignment #' + (first_selected_index + 1) + ' selected';
    } else {
      var desc = count + ' alignments selected';
    }
    elem.show().html(desc);
  }
}

Graph.prototype._show_subject_params = function(hsp) {
  var position_formatter = d3.format(',d');

  var subject_params = [
    ['Bit score', hsp.bit_score],
    ['E value', hsp.evalue],
    ['Query start', position_formatter(hsp.query_start)],
    ['Query end', position_formatter(hsp.query_end)],
    ['Query frame', hsp.query_frame],
    ['Subject start', position_formatter(hsp.subject_start)],
    ['Subject end', position_formatter(hsp.subject_end)],
    ['Alignment length', position_formatter(hsp.alignment_length)],
    ['Subject frame', hsp.subject_frame],
  ];
  var sp_contents = subject_params.map(function(param) {
    var key = param[0];
    var value = param[1];
    return '<li><span class="key">' + key + ':</span> ' + value + '</li>';
  }).join('\n');

  this._subject_container.find('.subject-params').html(sp_contents).show();
}

Graph.prototype._hide_subject_params = function() {
  this._subject_container.find('.subject-params').hide();
}

Graph.prototype._fade_subset = function(predicate, duration) {
  var all_hsps = this._svg.d3.selectAll('.hit');
  var to_make_opaque = [];
  var to_fade = [];

  all_hsps.each(function(d, idx) {
    if(predicate(this, idx)) {
      to_fade.push(this);
    } else {
      to_make_opaque.push(this);
    }
  });

  this._set_hsp_opacity(
    d3.selectAll(to_make_opaque),
    1,
    this._grapher.fade_duration
  );
  this._set_hsp_opacity(
    d3.selectAll(to_fade),
    this._grapher.fade_opacity,
    this._grapher.fade_duration
  );
}

Graph.prototype._fade_unhovered = function(hovered_idx) {
  var self = this;
  this._fade_subset(function(hsp, idx) {
    return !(idx === hovered_idx || self._is_hsp_selected(idx));
  }, this._grapher.hover_fade_duration);
}

Graph.prototype._fade_unselected = function() {
  // If nothing is selected, everything should be opaque.
  if(this._count_selected_hsps() === 0) {
    var all_hsps = this._svg.d3.selectAll('.hit');
    this._set_hsp_opacity(all_hsps, 1, 200);
    return;
  }

  var self = this;
  this._fade_subset(function(hsp, idx) {
    return !self._is_hsp_selected(idx);
  }, 0);
}

Graph.prototype._set_hsp_opacity = function(hsps, opacity, duration) {
  hsps.transition()
    .duration(duration)
    .style('opacity', opacity);
}

Graph.prototype._rotate_axis_labels = function(text, text_anchor, dx, dy) {
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

Graph.prototype._create_axis = function(scale, orientation, height, text_anchor, dx, dy, seq_type) {
  var formatter = this._helpers.tick_formatter(scale, seq_type);
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

Graph.prototype._is_domain_within_orig = function(original_domain, new_domain) {
  return original_domain[0] <= new_domain[0] && original_domain[1] >= new_domain[1];
}

Graph.prototype._zoom_scale = function(scale, original_domain, zoom_from, scale_by) {
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

Graph.prototype._pan_scale = function(existing_scale, original_domain, delta) {
  var scale = (existing_scale.domain()[1] - existing_scale.domain()[0]) / (existing_scale.range()[1] - existing_scale.range()[0]);
  var scaled_delta = -delta * scale;

  var domain = existing_scale.domain();
  var l = domain[0] + scaled_delta;
  var r = domain[1] + scaled_delta;
  var new_domain = [l, r];

  if(this._is_domain_within_orig(original_domain, new_domain))
    existing_scale.domain(new_domain);
}

Graph.prototype._render_polygons = function() {
  var self = this;

  // Remove all existing child elements.
  this._svg.d3.selectAll('*').remove();

  this._polygons = this._svg.d3.selectAll('polygon')
     .data(this._hsps)
     .enter()
     .append('polygon')
     .attr('class', 'hit')
     .attr('fill', function(hsp) {
       return self._grapher.determine_colour(hsp.normalized_bit_score);
     }).attr('points', function(hsp) {
       // We create query_x_points such that the 0th element will *always* be
       // on the left of the 1st element, regardless of whether the axis is
       // drawn normally (i.e., ltr) or reversed (i.e., rtl). We do the same
       // for subject_x_points. As our parsing code guarantees start < end, we
       // decide on this ordering based on the reading frame, because it
       // determines whether our axis will be reversed or not.
       var query_x_points = [self._scales.query.scale(hsp.query_start), self._scales.query.scale(hsp.query_end)];
       var subject_x_points = [self._scales.subject.scale(hsp.subject_start), self._scales.subject.scale(hsp.subject_end)];

       // Axis will be rendered with 5' end on right and 3' end on left, so we
       // must reverse the order of vertices for the polygon we will render to
       // prevent the polygon from "crossing over" itself.
       if(!self._grapher.use_complement_coords) {
         if(hsp.query_frame < 0)
           query_x_points.reverse();
         if(hsp.subject_frame < 0)
           subject_x_points.reverse();
       }

       var points = [
         [query_x_points[0],   self._scales.query.height   + 2],
         [subject_x_points[0], self._scales.subject.height - 1],
         [subject_x_points[1], self._scales.subject.height - 1],
         [query_x_points[1],   self._scales.query.height   + 2],
       ];

       return points.map(function(point) {
        return point[0] + ',' + point[1];
       }).join(' ');
     });

  this._polygons.on('mouseenter', function(hovered_hsp, hovered_index) {
       if(self._count_selected_hsps() > 0) {
         return;
       }
       self._show_subject_params(hovered_hsp);
       self._fade_unhovered(hovered_index);
     }).on('mouseleave', function(hovered_hsp, hovered_index) {
       // If *any* HSP is selected, do nothing -- we don't want to fade out the
       // subject-params for whatever HSP is selected.
       if(self._count_selected_hsps() > 0) {
         return;
       }
       self._hide_subject_params();
       self._fade_unselected();
     }).on('click', function(clicked_hsp, clicked_index) {
       if(!self._is_hsp_selected(clicked_index)) {
         self._select_hsp(clicked_index);
       } else {
         self._deselect_hsp(clicked_index);
       }
     });

 this._labels = this._svg.d3.selectAll('text')
     .data(this._hsps)
     .enter()
     .append('text')
     .attr('x', function(hsp) {
       var query_x_points = [self._scales.query.scale(hsp.query_start), self._scales.query.scale(hsp.query_end)];
       return (query_x_points[0] + query_x_points[1]) * 0.5;
     })
     .attr('y', self._scales.query.height + 15)
     .attr('class', 'hsp_numbering')
     .text(function(hsp) {
       return hsp.number;
     });

  this._fade_unselected();
  this._add_outline_to_selected();
}

Graph.prototype._change_outline_on_selected = function(use_outline) {
  for(var idx in this._selected) {
    var polygon = this._polygons[0][idx];
    d3.select(polygon).classed('selected', use_outline);
  }
}

Graph.prototype._add_outline_to_selected = function() {
  if(!this._show_hsp_outlines)
    return;
  this._change_outline_on_selected(true);
}

Graph.prototype._remove_outline_from_selected = function() {
  this._change_outline_on_selected(false);
}

Graph.prototype._select_hsp = function(hsp_index) {
  if(this._is_hsp_selected(hsp_index))
    return;
  this._selected[hsp_index] = this._hsps[hsp_index];
  this._display_selected_hsp_count();

  this._fade_unselected();
  this._add_outline_to_selected();

  var count = this._count_selected_hsps();
  if(count === 1) {
    this._subject_container.find('.hsp-selection-controls').slideDown();
  }
}

Graph.prototype._deselect_hsp = function(hsp_index) {
  delete this._selected[hsp_index];
  this._display_selected_hsp_count();
  this._fade_unselected();
  d3.select(this._polygons[0][hsp_index]).classed('selected', false);

  var count = this._count_selected_hsps();
  if(count === 0) {
    this._subject_container.find('.hsp-selection-controls').slideUp();
  }
}

Graph.prototype._is_hsp_selected = function(index) {
  return index in this._selected;
}

Graph.prototype._count_selected_hsps = function() {
  return Object.keys(this._selected).length;
}

// Determines whether interval [s1, e1) overlaps interval [s2, e2).
Graph.prototype._overlaps = function(s1, e1, s2, e2) {
  return Math.min(e1, e2) > Math.max(s1, s2);
}

Graph.prototype._rects_overlap = function(rect1, rect2, padding) {
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

// `type` should be 'query' or 'subject'.
Graph.prototype._label_axis = function(type, axis) {
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

Graph.prototype._render_axes = function() {
  var query_axis = this._create_axis(this._scales.query.scale,   'top',
                    this._scales.query.height,   'start', '9px', '2px',
                    this._results.query_seq_type);
  var subject_axis = this._create_axis(this._scales.subject.scale, 'bottom',
                    this._scales.subject.height, 'end',   '-11px',  '3px',
                    this._results.subject_seq_type);
  this._label_axis('query', query_axis);
  this._label_axis('subject', subject_axis);
}

Graph.prototype._render_graph = function() {
  this._render_polygons();
  this._render_axes();
}

Graph.prototype._find_nearest_scale = function(point) {
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

Graph.prototype._create_scales = function() {
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
  if(!this._grapher.use_complement_coords) {
    if(this._hsps[0].query_frame < 0)
      query_range.reverse();
    if(this._hsps[0].subject_frame < 0)
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

Graph.prototype._configure_panning = function() {
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

Graph.prototype._configure_zooming = function() {
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

Graph.prototype.enable_hsp_outlines = function() {
  this._show_hsp_outlines = true;
  this._add_outline_to_selected();
}

Graph.prototype.disable_hsp_outlines = function() {
  this._show_hsp_outlines = false;
  this._remove_outline_from_selected();
}

Graph.prototype.view_alignments = function() {
  this._grapher.alignment_viewer.view_alignments(
    this._selected,
    this._results.query_seq_type,
    this._query_def,
    this._query_id,
    this._results.subject_seq_type,
    this._subject_def,
    this._subject_id
  );
}

Graph.prototype.export_alignments = function() {
  this._grapher.alignment_exporter.export_alignments(
    this._selected,
    this._query_def,
    this._query_id,
    this._subject_def,
    this._subject_id
  );
}

Graph.prototype.deselect_all_alignments = function() {
  for(var idx in Object.keys(this._selected)) {
    idx = parseInt(idx, 10);
    this._deselect_hsp(idx);
  }
}
