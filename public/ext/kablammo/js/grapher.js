function Grapher(alignment_viewer, alignment_exporter, use_complement_coords) {
  this.alignment_viewer = alignment_viewer;
  this.alignment_exporter = alignment_exporter;
  this.use_complement_coords = use_complement_coords;

  this._min_opacity  = 0.3;
  this.fade_opacity = 0.1;
  this.hover_fade_duration = 200;

  this._graph_colour = { r: 30, g: 139, b: 195 };
  this._matte_colour = { r: 255, g: 255, b: 255 };
}

Grapher.prototype.display_blast_results = function(results, results_container, iface) {
  var self = this;
  this._results = results;

  $(results_container).children().remove();

  var iterations = this._results.filtered_iterations;
  var num_filtered_iterations = iterations.length;
  var num_total_iterations = self._results.iterations.length;
  var num_hidden_iterations = num_total_iterations - num_filtered_iterations;

  if(num_filtered_iterations === 0) {
    var msg = 'No results to display.';
    if(num_hidden_iterations > 0) {
      msg += ' As there are ' + num_hidden_iterations + ' hidden results, you ' +
        'can adjust the filters applied to show these data.';
    }
    Interface.error(msg);
  }

  iterations.forEach(function(iteration, iteration_idx) {
    var hits = iteration.filtered_hits;
    // Do not display iteration if it has no hits (e.g., because they've all
    // been filtered out via subject filter, or they were removed by BLAST
    // parsing code because none of their HSPs passed evalue/bitscore/whatever
    // filter).
    if(hits.length === 0)
      return;

    iface.create_query_header(
      results_container,
      iteration.query_def + ' (' + iteration.query_id + ')',
      iteration_idx + 1,
      num_filtered_iterations,
      num_hidden_iterations
    );

    var hit_idx = 1;
    var num_filtered_hits = hits.length;
    var num_total_hits = iteration.hits.length;
    var num_hidden_hits = num_total_hits - num_filtered_hits;

    hits.forEach(function(hit) {
      var hsps = hit.filtered_hsps;
      if(hsps.length === 0)
        return;

      var subj_header = $('#example-subject-header').clone().removeAttr('id');
      subj_header.find('.subject-name').text(hit.subject_def +
        ' (' + hit.subject_id + ')');
      var subject_label = 'Subject ' + hit_idx++ + ' of ' + hits.length;
      if(num_hidden_hits > 0) {
        subject_label += ' (' + num_hidden_hits + ' hidden)';
      }
      subj_header.find('.subject-index').text(subject_label);

      var subj_result = $('#example-subject-result').clone().removeAttr('id');
      var svg_container = subj_result.find('.subject-plot');

      new Graph(
        self,
        results,
        iteration.query_def,
        iteration.query_id,
        hit.subject_def,
        hit.subject_id,
        iteration.query_length,
        hit.subject_length,
        hsps,
        svg_container
      );

      $(results_container).append(subj_header).append(subj_result);
    });
  });
}

Grapher.prototype._rgba_to_rgb = function(rgba, matte_rgb) {
  // Algorithm taken from http://stackoverflow.com/a/2049362/1691611.
  var normalize = function(colour) {
    return colour.map(function(channel) { return channel / 255; });
  };
  var denormalize = function(colour) {
    return colour.map(function(channel) { return Math.round(Math.min(255, channel * 255)); });
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

Grapher.prototype.determine_colour = function(level) {
  var opacity = ((1 - this._min_opacity) * level) + this._min_opacity;
  var rgb = this._rgba_to_rgb([
    this._graph_colour.r,
    this._graph_colour.g,
    this._graph_colour.b,
    255 * opacity
  ], [
     this._matte_colour.r,
     this._matte_colour.g,
     this._matte_colour.b,
  ]);
  return 'rgb(' + rgb.join(',') + ')';
}

Grapher.prototype.get_graph_colour = function() {
  return this._graph_colour;
}

Grapher.prototype.set_graph_colour = function(graph_colour) {
  this._graph_colour = graph_colour;
}
