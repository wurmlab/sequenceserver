export function download_url(url, filename) {
    var a = d3.select('body').append('a')
    .attr('download', filename)
    .style('display', 'none')
    .attr('href', url);

    a.node().click();
    setTimeout(function() {
        a.remove();
    }, 100);
}

export function download_blob(blob, filename) {
    if (typeof window.navigator.msSaveOrOpenBlob !== 'undefined') {
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return;
    }

    download_url(window.URL.createObjectURL(blob), filename);
}

export function sanitize_filename(str) {
    var san = str.replace(/[^a-zA-Z0-9=_\-]/g, '_');
    // Replace runs of underscores with single one.
    san = san.replace(/_{2,}/g, '_');
    // Remove any leading or trailing underscores.
    san = san.replace(/^_/, '').replace(/_$/, '');
    return san;
}
