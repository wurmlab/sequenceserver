"use strict";

function BlastResultsLoader(parser) {
  this._parser = parser;
}

// TODO: refactor into class to obviate global variable.
var _blast_results_cache = {};

BlastResultsLoader.prototype._fetch_remote_results = function(blast_results_name, on_fetched) {
  var self = this;
  if(typeof _blast_results_cache[blast_results_name] !== 'undefined') {
    var results = _blast_results_cache[blast_results_name];
    on_fetched(results);
    return;
  }

  $.get('data/' + blast_results_name, function(xml_doc) {
    var blast_results = self._parser.parse_blast_results(xml_doc);
    _blast_results_cache[blast_results_name] = blast_results;
    on_fetched(blast_results);
  }).fail(function(jqxhr, text_status, error) {
    Interface.error('Failed to retrieve ' + blast_results_name + ': ' + error);
  });
}

BlastResultsLoader.prototype._munge_results = function(results) {
  this._parser.slice_and_dice(results);
}

BlastResultsLoader.prototype.load_local_file = function(file, on_done) {
  var self = this;
  var reader = new FileReader();
  reader.onload = function(loaded_file) {
    var xml = loaded_file.target.result;
    try {
      var parsed_xml = $($.parseXML(xml));
    } catch(e) {
      if(e.message.indexOf('Invalid XML') === 0) {
        Interface.error(file.name + ' is not valid XML.');
        return;
      } else {
        throw e;
      }
    }

    var results = self._parser.parse_blast_results(parsed_xml);
    self._munge_results(results);
    on_done(results);
  };
  reader.readAsText(file);
}

BlastResultsLoader.prototype.load_from_server = function(blast_results_name, on_done) {
  var self = this;
  this._fetch_remote_results(blast_results_name, function(blast_results) {
    // Don't munge earlier, as we don't want to cache the sliced-and-diced
    // version.
    self._munge_results(blast_results);
    on_done(blast_results);
  });
}
