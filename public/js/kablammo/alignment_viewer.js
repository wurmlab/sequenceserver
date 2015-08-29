function AlignmentViewer() {
  this._configure_index_tooltips();
  this._selector = '#alignment-viewer';
  this._configure_export();
}

AlignmentViewer.prototype._configure_export = function() {
  var exporter = new AlignmentExporter();
  var self = this;
  // Reference to .export_alignments isn't valid if I select it at
  // initialization -- even though the element exists, (later) showing the
  // modal dialogue for it doesn't work. Thus, I must select it anew when the
  // user begins interacting with the alignment viewer.
  $('body').on('click', this._selector + ' .export-alignments', function() {
    exporter.export_alignments(self._hsps, self._query_def, self._query_id, self._subject_def, self._subject_id);
  });
}

AlignmentViewer.prototype._configure_index_tooltips = function() {
  var _determine_type = function(trigger) {
    if($(trigger).parents('.query-seq').length > 0) {
      return 'query';
    } else {
      return 'subject';
    }
  };

  var formatter = d3.format(',d');
  $('body').tooltip({
    selector: '.query-seq span:not(.gap), .subject-seq span:not(.gap)',
    container: '#alignment-viewer',
    trigger: 'hover focus click',
    title: function() {
      var trigger = $(this);
      var hsp = trigger.parents('.alignment').data().hsp;
      var type = _determine_type(trigger);
      var frame = hsp[type + '_frame'];

      var idx = parseInt(trigger.attr('data-idx'), 10);
      if(frame >= 0) {
        var position = hsp[type + '_start'] + (idx - 1);
      } else {
        var position = hsp[type + '_end'] - (idx - 1);
      }

      return 'Position ' + formatter(position);
    },
    placement: function(tooltip, trigger) {
      if(_determine_type(trigger) === 'query') {
        // Is query seq
        return 'top';
      } else {
        // Is subject seq
        return 'bottom';
      }
    }
  });
}

AlignmentViewer.prototype._colour_midline = function(midline) {
  return midline.split('').map(function(chr) {
    if(chr === ' ') {
      var cls = 'ml-diff';
    } else if(chr === '+') {
      var cls = 'ml-similar';
    } else {
      var cls = 'ml-match';
    }
    return '<span class="' + cls + '">&nbsp;</span>';
  }).join('');
}

AlignmentViewer.prototype._color_seq = function(seq, seq_type) {
  var letters = seq.split('');
  var prefix = (seq_type === 'nucleic_acid' ? 'na' : 'aa') + '-';

  var position = 0;
  var coloured = letters.map(function(letter) {
    var html = '<span';
    if(letter !== '-') {
      position++;
      html += ' data-idx="' + position + '"';
      html += ' class="' + prefix + letter.toLowerCase() + '"';
    } else {
      html += ' class="gap"';
    }
    html += '">' + letter + '</span>';
    return html;
  });
  return coloured.join('');
}

AlignmentViewer.prototype.view_alignments = function(hsps, query_seq_type, query_def, query_id, subject_seq_type, subject_def, subject_id) {
  this._hsps = hsps;
  this._query_def = query_def;
  this._query_id = query_id;
  this._subject_def = subject_def;
  this._subject_id = subject_id;

  var viewer = $(this._selector);
  viewer.find('.subject-title').text(this._subject_def + ' (' + this._subject_id + ')');
  viewer.find('.query-title').text(this._query_def + ' (' + this._query_id + ')');

  var container = viewer.find('.alignments');
  container.empty();
  var self = this;

  Object.keys(hsps).forEach(function(idx) {
    var hsp = hsps[idx];
    var alignment = $('#example-alignment').clone().removeAttr('id');
    // Reset horizontal scroll position from previous viewed alignments.
    alignment.find('.alignment-seqs').scrollLeft(0);
    alignment.data('hsp', hsp);
    alignment.find('.alignment-name').html('Alignment #' + (parseInt(idx, 10) + 1));

    alignment.find('.query-seq').html(  '  Query: ' + self._color_seq(hsp.query_seq, query_seq_type));
    alignment.find('.midline-seq').html('         ' + self._colour_midline(hsp.midline_seq));
    alignment.find('.subject-seq').html('Subject: ' + self._color_seq(hsp.subject_seq, subject_seq_type));
    container.append(alignment);
    viewer.modal('show');
  });
}
