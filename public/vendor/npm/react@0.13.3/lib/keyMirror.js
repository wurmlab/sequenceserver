/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  var keyMirror = function(obj) {
    var ret = {};
    var key;
    ("production" !== process.env.NODE_ENV ? invariant(obj instanceof Object && !Array.isArray(obj), 'keyMirror(...): Argument must be an object.') : invariant(obj instanceof Object && !Array.isArray(obj)));
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      ret[key] = key;
    }
    return ret;
  };
  module.exports = keyMirror;
})(require("process"));
