/**
 * svgExporter.js
 *
 * Exports <svg> as .svg or .png.
 *
 * Borrowed and modified from Kablammo which in turn is based on
 * https://github.com/NYTimes/svg-crowbar.
 *
 */
import * as Exporter from './exporter';

/**
 * Exports the given <svg> DOM node as a .svg file.
 */
var export_as_svg = function (svg, filename) {
    var blob = new Blob([serialize_svg(svg)], { type: 'text/xml' });
    filename = Exporter.sanitize_filename(filename) + '.svg';
    Exporter.download_blob(blob, filename);
}

/**
 * Exports the given <svg> DOM node as a .png file.
 */
var export_as_png = function (svg, filename) {
    if (typeof window.navigator.msSaveOrOpenBlob !== 'undefined') {
        alert('Exporting PNG images is not supported in Internet Explorer. Please use Chrome or Firefox.');
        return;
    }

    var raster_scale_factor = 5;

    var canvas = document.getElementById('png-exporter');
    var $svg = $(svg);

    canvas.height = $svg.height() * raster_scale_factor;
    canvas.width = $svg.width() * raster_scale_factor;

    var img = new Image();
    img.onload = function() {
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        filename = Exporter.sanitize_filename(filename) + '.png';
        Exporter.download_url(canvas.toDataURL('image/png'), filename);
    };

    img.src = 'data:image/svg+xml;base64,' + window.btoa(serialize_svg(svg));
}

var serialize_svg = function(svg) {
    // Clone svg first so that none of our changes to affect the actual SVG.
    svg = svg.cloneNode(true);

    d3.select(svg).attr('version', '1.1')
    .insert('defs', ':first-child')
    .append('style')
    .attr('class', 'exported-css')
    .attr('type', 'text/css')
    .node()
    .textContent = get_styles();

    svg.removeAttribute('xmlns');
    svg.removeAttribute('xlink');
    svg.setAttributeNS(d3.ns.prefix.xmlns, 'xmlns', d3.ns.prefix.svg);
    svg.setAttributeNS(d3.ns.prefix.xmlns, 'xmlns:xlink', d3.ns.prefix.xlink);

    var source = (new XMLSerializer()).serializeToString(svg);
    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC ' +
        '"-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        return doctype + source;
}

var get_styles = function () {
    var styles = '';

    for (var i = 0; i < document.styleSheets.length; i++) {
        (function process_ss(ss) {
            // See if we can access ss.cssRules. Note that cssRules respects
            // same-origin policy, as per
            // https://code.google.com/p/chromium/issues/detail?id=49001#c10.
            try {
                // In IE and Chrome, if stylesheet originates from a different
                // domain, ss.cssRules simply won't exist. In Firefox, if
                // stylesheet originates from a different domain, trying
                // to access ss.cssRules will throw a SecurityError.
                // Hence, we must use // try/catch to detect this
                // condition in Firefox.
                if (!ss.cssRules)
                    return;
            } catch (e) {
                // Rethrow exception if it's not a SecurityError.
                if (e.name !== 'SecurityError')
                    throw e;
                return;
            }

            // Stylesheet should be included in SVG and has accessible cssRules, so
            // serialize rules into string.
            for (var i = 0; i < ss.cssRules.length; i++) {
                let rule = ss.cssRules[i];
                if (rule.type === CSSRule.IMPORT_RULE) {
                    process_ss(rule.styleSheet);
                } else {
                    // TODO: Illustrator will crash on descendant selectors. To
                    // circumvent this, we should ignore such selectors.

                    let selectorText = rule.selectorText;
                    if (selectorText && selectorText.indexOf('svg') !== -1)
                        styles += '\n' + rule.cssText;
                }
            }
        })(document.styleSheets[i]);
    }

    return styles;
}

var handle_click = function (export_callback) {
    return function () {
        var $svg = $(this).parents('.grapher').find('svg');
        export_callback($svg[0], $svg.attr('data-name'));
        return false;
    }
};

var $body = $('body');
$body.on('click', '.export-to-svg', handle_click(export_as_svg));
$body.on('click', '.export-to-png', handle_click(export_as_png));
