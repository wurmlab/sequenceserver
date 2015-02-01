"use strict";

function Kablammo() {
  // When hit is to complement of nucleotide sequence (whether for query or
  // subject), we will show the HSPs relative to the coordinates of the
  // original (i.e., input or DB) sequence if this value is false, or relative
  // to the coordinates of its complement if this value is true.
  var use_complement_coords = false;

  this._aln_viewer    = new AlignmentViewer();
  this._aln_exporter  = new AlignmentExporter();
  this._grapher       = new Grapher(this._aln_viewer, this._aln_exporter, use_complement_coords);
  this._parser        = new BlastParser(use_complement_coords);
  this._loader        = new BlastResultsLoader(this._parser);
  this._iface         = new Interface(this._grapher, this._loader);
  this._img_exporter  = new ImageExporter('#results-container', '.export-to-svg', '.export-to-png');
}

function main() {
  new Kablammo();
}

main();
