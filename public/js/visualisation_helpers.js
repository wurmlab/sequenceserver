function VisualisationHelpers() {
}

VisualisationHelpers.prototype._get_colors_for_evalue = function (evalue,hits) {
  var colors = d3.scale
      .log()
      .domain([
        d3.min([1e-5, d3.min(hits.map(function (d) {
          if (parseFloat(d.evalue) === 0.0) return undefined;
          return d.evalue;
        }))]),
        d3.max(hits.map(function (d) {
          return d.evalue;
        }))
      ])
      .range([40,150]);
  var rgb = colors(evalue);
  return d3.rgb(rgb,rgb,rgb);
}

// Returns copy of `arr` containing only unique values. Assumes duplicate
// values always occur consecutively (which they will if `arr` is sorted).
VisualisationHelpers.prototype._uniq = function (arr) {
  var uniq = [];
  for(var i = 0; i < arr.length; i++) {
    while(i < (arr.length - 1) && arr[i] === arr[i + 1]) { i++; }
    uniq.push(arr[i]);
  }
  return uniq;
}

/**
 * Defines how ticks will be formatted.
 *
 * Modified by Priyam based on https://github.com/mbostock/d3/issues/1722.
 */
VisualisationHelpers.prototype._create_formatter  = function (scale, seq_type) {
  var ticks = scale.ticks();
  var prefix = d3.formatPrefix(ticks[ticks.length - 1]);
  var suffixes = {amino_acid: 'aa', nucleic_acid: 'bp'};

  var digits = 0;
  var format;
  var _ticks;
  while (true) {
      format = d3.format('.' + digits + 'f');
      _ticks = scale.ticks().map(function (d) {
          return format(prefix.scale(d));
      });
      if (_ticks.length === this._uniq(_ticks).length) {
          break;
      }
      digits++;
  }

  return function (d) {
      if (!prefix.symbol || d === scale.domain()[0]) {
          return (d + ' ' + suffixes[seq_type]);
      }
      else {
          return (format(prefix.scale(d)) +
                  ' ' + prefix.symbol + suffixes[seq_type]);
      }
  };
}
