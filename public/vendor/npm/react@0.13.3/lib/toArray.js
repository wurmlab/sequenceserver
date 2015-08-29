/* */ 
(function(process) {
  var invariant = require("./invariant");
  function toArray(obj) {
    var length = obj.length;
    ("production" !== process.env.NODE_ENV ? invariant(!Array.isArray(obj) && (typeof obj === 'object' || typeof obj === 'function'), 'toArray: Array-like object expected') : invariant(!Array.isArray(obj) && (typeof obj === 'object' || typeof obj === 'function')));
    ("production" !== process.env.NODE_ENV ? invariant(typeof length === 'number', 'toArray: Object needs a length property') : invariant(typeof length === 'number'));
    ("production" !== process.env.NODE_ENV ? invariant(length === 0 || (length - 1) in obj, 'toArray: Object should have keys for indices') : invariant(length === 0 || (length - 1) in obj));
    if (obj.hasOwnProperty) {
      try {
        return Array.prototype.slice.call(obj);
      } catch (e) {}
    }
    var ret = Array(length);
    for (var ii = 0; ii < length; ii++) {
      ret[ii] = obj[ii];
    }
    return ret;
  }
  module.exports = toArray;
})(require("process"));
