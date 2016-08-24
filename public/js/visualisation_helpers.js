import _ from 'underscore';

export function get_colors_for_evalue(evalue, hits) {
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
  return d3.rgb(rgb, rgb , rgb);
}

export function toLetters(num) {
    var mod = num % 26,
        pow = num / 26 | 0,
        out = mod ? String.fromCharCode(96 + mod) : (--pow, 'z');
    return pow ? toLetters(pow) + out : out;
}

/**
 * Defines how ticks will be formatted.
 *
 * Examples: 200 aa, 2.4 kbp, 7.6 Mbp.
 *
 * Borrowed from Kablammo. Modified by Priyam based on https://github.com/mbostock/d3/issues/1722.
 */
export function tick_formatter(scale, seq_type) {
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
      if (_ticks.length === _.uniq(_ticks).length) {
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

export function get_seq_type(algorithm) {
  var SEQ_TYPES = {
      blastn: {
          query_seq_type:   'nucleic_acid',
          subject_seq_type: 'nucleic_acid'
      },
      blastp: {
          query_seq_type:   'amino_acid',
          subject_seq_type: 'amino_acid'
      },
      blastx: {
          query_seq_type:   'nucleic_acid',
          subject_seq_type: 'amino_acid'
      },
      tblastx: {
          query_seq_type:   'nucleic_acid',
          subject_seq_type: 'nucleic_acid'
      },
      tblastn: {
          query_seq_type:   'amino_acid',
          subject_seq_type: 'nucleic_acid'
      }
  };
  return SEQ_TYPES[algorithm];
}

export function prettify_evalue(evalue) {
  var matches = evalue.toString().split("e");
  var base  = matches[0];
  var power = matches[1];

  if (power)
  {
      var s = parseFloat(base).toFixed(2);
      var element = '<span>'+s+' &times; 10<sup>'+power+'</sup></span>';
      return element;
  }
  else {
      if (!(base % 1==0))
          return parseFloat(base).toFixed(2);
      else
          return base;
  }
}
