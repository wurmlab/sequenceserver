/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  function accumulateInto(current, next) {
    ("production" !== process.env.NODE_ENV ? invariant(next != null, 'accumulateInto(...): Accumulated items must not be null or undefined.') : invariant(next != null));
    if (current == null) {
      return next;
    }
    var currentIsArray = Array.isArray(current);
    var nextIsArray = Array.isArray(next);
    if (currentIsArray && nextIsArray) {
      current.push.apply(current, next);
      return current;
    }
    if (currentIsArray) {
      current.push(next);
      return current;
    }
    if (nextIsArray) {
      return [current].concat(next);
    }
    return [current, next];
  }
  module.exports = accumulateInto;
})(require("process"));
