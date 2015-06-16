function Exporter() {
}

Exporter.prototype.download_file = function(url, filename) {
  var a = d3.select('body')
            .append('a')
            .style('display', 'none')
            .attr('download', filename)
            .attr('href', url);
  a.node().click();
  return a;
}

Exporter.prototype.download_blob = function(blob, filename) {
  if(typeof window.navigator.msSaveOrOpenBlob !== 'undefined') {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  var url = window.URL.createObjectURL(blob);
  var a = this.download_file(url, filename);
  // If URL revoked immediately, download doesn't work.
  setTimeout(function() {
    a.remove();
    window.URL.revokeObjectURL(url);
  }, 100);
}

Exporter.prototype.sanitize_filename = function(str) {
  var san = str.replace(/[^a-zA-Z0-9=_\-]/g, '_');
  // Replace runs of underscores with single one.
  san = san.replace(/_{2,}/g, '_');
  // Remove any leading or trailing underscores.
  san = san.replace(/^_/, '').replace(/_$/, '');
  return san;
}

