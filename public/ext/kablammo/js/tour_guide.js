"use strict";

function TourGuide(iface) {
  this._iface = iface;
  this._create_tour();
}

TourGuide.prototype._create_tour = function() {
  var self = this;

  this._tour = new Tour({
    storage: false,
    onStart: function() {
      $('.nav > li').addClass('disabled-nav');
    },
    onEnd: function() {
      self._iface.deactivate_active_panel();
      // Ensure that nav is no longer disabled (which it may be if used
      // ended tour early).
      $('.nav > li').removeClass('disabled-nav');
    },
    steps: [
      {
        element: '.query-name:first',
        placement: 'bottom',
        title: 'Queries',
        content: "<strong>Query</strong> sequences are nucleotide or amino acid seqquences for which you are searching (e.g., the nucleotide sequence corresponding to a certain organism's gene).",
      },

      {
        element: '.subject-name:first',
        placement: 'bottom',
        title: 'Subjects',
        content: "Each query sequence will have hits to one or more <strong>subject</strong> sequences from BLAST's database (e.g., listings of all genes in all organisms that BLAST knows about).",
      },

      {
        element: '.subject:first svg',
        placement: 'top',
        title: 'Alignments',
        content: "For each query-subject pairing, you will have one or more <strong>alignments</strong>, in which BLAST deemed a portion of the query sequence to align to a portion of the subject sequence. For this query-subject combination, you see two alignments.",
      },

      {
        element: '.subject:first svg',
        placement: 'top',
        title: 'Viewing alignments',
        content: "Mouse over an alignment to see details such as its position, score, and reading frame. Click on an alignment to select it. After selecting, you can view or export the alignment by clicking the associated buttons.",
      },

      {
        element: '.subject:first svg',
        placement: 'top',
        title: 'Zooming and panning',
        content: "To zoom and pan the query sequence, move your mouse cursor near the Query (top) axis, then scroll up using your mouse wheel. After zooming in, click the left mouse button and drag left or right to pan. To zoom back out, scroll the mouse wheel down. You can zoom and pan the subject sequence by performing the same manipulations with your mouse cursor near the Subject (bottom) axis.",
      },

      {
        element: '.export-image:first',
        placement: 'left',
        title: 'Exporting images',
        content: 'Click the <strong>Export image</strong> button to export your alignment image to SVG (vector) or high-resolution PNG (bitmap) formats. SVGs can be easily edited in applications such as Inkscape or Adobe Illustrator, allowing you to delete certain alignments, change axis labels, and make whatever other modifications you please.',
      },

      {
        element: '#load-results',
        placement: 'bottom',
        title: 'Loading your own data',
        onShown: function() {
          var load_nav = $('#load-results');
          load_nav.removeClass('disabled-nav');
          self._iface.activate_panel(load_nav);
          // This does not persist across different tour steps, so no need to
          // manually save original value and reset it.
          $('.tour-tour').css('position', 'fixed');
        },
        onPrev: function() {
          var load_nav = $('#load-results');
          load_nav.addClass('disabled-nav');
          self._iface.deactivate_active_panel();
        },
        content: 'Click <strong>Load results</strong> to load your own data. You can load BLAST results stored at a central location (e.g., from a repository containing all of your lab\'s BLAST results), or ones that are stored on your own computer.'
      },

      {
        element: '#display-params',
        placement: 'left',
        title: 'Filtering data',
        onShown: function() {
          $('.tour-tour').css('position', 'fixed');
        },
        content: 'You can limit the number of results shown to make generating graphs faster, show only queries or subjects that have certain text in their names, or hide alignments whose E values, scores, or lengths are below defined values. You can also change the colour used for generating images.'
      },

      {
        orphan: true,
        title: 'Enjoy!',
        content: 'If you have any issues with or suggestions for Kablammo, please let us know. Otherwise, have fun!'
      },
    ]
  });
}

TourGuide.prototype.start = function() {
  this._tour.init();
  this._tour.start();
  // When testing, can skip to certain step.
  //this._tour.goTo(5);
}
