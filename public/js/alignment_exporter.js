function AlignmentExporter() {
  this._exporter = new Exporter();
  this._wrap_width = 80;
}

AlignmentExporter.prototype._wrap_string = function(str, width) {
  var idx = 0;
  var wrapped = '';
  while(true) {
    wrapped += str.substring(idx, idx + width);
    idx += width;
    if(idx < str.length) {
      wrapped += '\n';
    } else {
      break;
    }
  }
  return wrapped;
}

AlignmentExporter.prototype._generate_fasta = function(hsps, query_def, query_id, subject_def, subject_id) {
  var fasta = '# Sequences exported from Kablammo (www.kablammo.wasmuthlab.org).\n#\n';

  var comment_properties = [
    ['query_def', query_def],
    ['query_id', query_id],
    ['subject_def', subject_def],
    ['subject_id', subject_id],
  ];
  var comments = comment_properties.map(function(pair) {
    return '# ' + pair.join('=');
  });
  fasta += comments.join('\n') + '\n#\n';

  var self = this;
  Object.keys(hsps).forEach(function(idx) {
    idx = parseInt(idx, 10);
    var hsp = hsps[idx];
    var common_props = [
      ['alignment_number', idx + 1],
      ['alignment_length', hsp.alignment_length],
      ['bit_score', hsp.bit_score],
      ['evalue', hsp.evalue],
    ];

    ['query', 'subject'].forEach(function(type) {
      var keys = [
        type + '_start',
        type + '_end',
        type + '_frame'
      ];
      var props = keys.map(function(key) {
        return [key, hsp[key]];
      });

      var combined_props = common_props.concat(props);
      combined_props.splice(1, 0, ['type', type]);
      var prop_strings = combined_props.map(function(pair) {
        return pair.join('=');
      });
      var header = prop_strings.join(' | ');

      fasta += '# ' + header + '\n';
      fasta += self._wrap_string(hsp[type + '_seq'], self._wrap_width) + '\n';
    });
  });

  return fasta;
}

AlignmentExporter.prototype.export_alignments = function(hsps, query_def, query_id, subject_def, subject_id) {
  var fasta = this._generate_fasta(hsps, query_def, query_id, subject_def, subject_id);

  var blob = new Blob([fasta], { type: 'application/fasta' });
  var filename_prefix = query_def + '_' + subject_def;
  var filename = this._exporter.sanitize_filename(filename_prefix) + '.fasta';
  this._exporter.download_blob(blob, filename);
}
