/* */ 
(function(process) {
  'use strict';
  var assign = require("./Object.assign");
  var emptyObject = require("./emptyObject");
  var warning = require("./warning");
  var didWarn = false;
  var ReactContext = {
    current: emptyObject,
    withContext: function(newContext, scopedCallback) {
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(didWarn, 'withContext is deprecated and will be removed in a future version. ' + 'Use a wrapper component with getChildContext instead.') : null);
        didWarn = true;
      }
      var result;
      var previousContext = ReactContext.current;
      ReactContext.current = assign({}, previousContext, newContext);
      try {
        result = scopedCallback();
      } finally {
        ReactContext.current = previousContext;
      }
      return result;
    }
  };
  module.exports = ReactContext;
})(require("process"));
