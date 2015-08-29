var CleanCSS = require('clean-css');

// it's bad to do this in general, as code is now heavily environment specific
var fs = System._nodeRequire('fs');

function escape(source) {
  return source
    .replace(/(["\\])/g, '\\$1')
    .replace(/[\f]/g, "\\f")
    .replace(/[\b]/g, "\\b")
    .replace(/[\n]/g, "\\n")
    .replace(/[\t]/g, "\\t")
    .replace(/[\r]/g, "\\r")
    .replace(/[\u2028]/g, "\\u2028")
    .replace(/[\u2029]/g, "\\u2029");
}

var isWin = process.platform.match(/^win/);

function fromFileURL(address) {
  address = address.replace(/^file:(\/+)?/i, '');

  if (!isWin)
    address = '/' + address;
  else
    address = address.replace(/\//g, '\\');

  return address;
}

var cssInject = "(function(c){if (typeof document == 'undefined') return; var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})";

module.exports = function bundle(loads, opts) {

  var loader = this;

  var stubDefines = loads.map(function(load) {
    return "System\.register('" + load.name + "', [], false, function() {});";
  }).join('\n');

  var rootURL = loader.rootURL || fromFileURL(loader.baseURL);

  var cssOptimize = opts.minify && opts.cssOptimize !== false;
  
  var outFile = loader.separateCSS ? opts.outFile.replace(/\.js$/, '.css') : rootURL;

  var cleanCSS = new CleanCSS({
    advanced: cssOptimize,
    agressiveMerging: cssOptimize,
    mediaMerging: cssOptimize,
    restructuring: cssOptimize,
    shorthandCompacting: cssOptimize,

    target: outFile,
    relativeTo: rootURL,
    sourceMap: !!opts.sourceMaps,
    sourceMapInlineSources: opts.sourceMapContents
  }).minify(loads.map(function(load) {
    return fromFileURL(load.address) 
  }));

  if (cleanCSS.errors.length)
    throw new Error('CSS Plugin:\n' + cleanCSS.errors.join('\n'));

  var cssOutput = cleanCSS.styles;

  // write a separate CSS file if necessary
  if (loader.separateCSS) {
    if (opts.sourceMaps) {
      fs.writeFileSync(outFile + '.map', cleanCSS.sourceMap.toString());
      cssOutput += '/*# sourceMappingURL=' + outFile.split(isWin ? '\\' : '/').pop() + '.map*/';
    }

    fs.writeFileSync(outFile, cssOutput);

    return stubDefines;
  }

  return [stubDefines, cssInject, '("' + escape(cssOutput) + '");'].join('\n');
};
