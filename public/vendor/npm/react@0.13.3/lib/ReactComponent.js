/* */ 
(function(process) {
  'use strict';
  var ReactUpdateQueue = require("./ReactUpdateQueue");
  var invariant = require("./invariant");
  var warning = require("./warning");
  function ReactComponent(props, context) {
    this.props = props;
    this.context = context;
  }
  ReactComponent.prototype.setState = function(partialState, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null, 'setState(...): takes an object of state variables to update or a ' + 'function which returns an object of state variables.') : invariant(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null));
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(partialState != null, 'setState(...): You passed an undefined or null state object; ' + 'instead, use forceUpdate().') : null);
    }
    ReactUpdateQueue.enqueueSetState(this, partialState);
    if (callback) {
      ReactUpdateQueue.enqueueCallback(this, callback);
    }
  };
  ReactComponent.prototype.forceUpdate = function(callback) {
    ReactUpdateQueue.enqueueForceUpdate(this);
    if (callback) {
      ReactUpdateQueue.enqueueCallback(this, callback);
    }
  };
  if ("production" !== process.env.NODE_ENV) {
    var deprecatedAPIs = {
      getDOMNode: ['getDOMNode', 'Use React.findDOMNode(component) instead.'],
      isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
      replaceProps: ['replaceProps', 'Instead, call React.render again at the top level.'],
      replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).'],
      setProps: ['setProps', 'Instead, call React.render again at the top level.']
    };
    var defineDeprecationWarning = function(methodName, info) {
      try {
        Object.defineProperty(ReactComponent.prototype, methodName, {get: function() {
            ("production" !== process.env.NODE_ENV ? warning(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]) : null);
            return undefined;
          }});
      } catch (x) {}
    };
    for (var fnName in deprecatedAPIs) {
      if (deprecatedAPIs.hasOwnProperty(fnName)) {
        defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      }
    }
  }
  module.exports = ReactComponent;
})(require("process"));
