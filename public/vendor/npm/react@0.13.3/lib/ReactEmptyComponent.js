/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var ReactInstanceMap = require("./ReactInstanceMap");
  var invariant = require("./invariant");
  var component;
  var nullComponentIDsRegistry = {};
  var ReactEmptyComponentInjection = {injectEmptyComponent: function(emptyComponent) {
      component = ReactElement.createFactory(emptyComponent);
    }};
  var ReactEmptyComponentType = function() {};
  ReactEmptyComponentType.prototype.componentDidMount = function() {
    var internalInstance = ReactInstanceMap.get(this);
    if (!internalInstance) {
      return;
    }
    registerNullComponentID(internalInstance._rootNodeID);
  };
  ReactEmptyComponentType.prototype.componentWillUnmount = function() {
    var internalInstance = ReactInstanceMap.get(this);
    if (!internalInstance) {
      return;
    }
    deregisterNullComponentID(internalInstance._rootNodeID);
  };
  ReactEmptyComponentType.prototype.render = function() {
    ("production" !== process.env.NODE_ENV ? invariant(component, 'Trying to return null from a render, but no null placeholder component ' + 'was injected.') : invariant(component));
    return component();
  };
  var emptyElement = ReactElement.createElement(ReactEmptyComponentType);
  function registerNullComponentID(id) {
    nullComponentIDsRegistry[id] = true;
  }
  function deregisterNullComponentID(id) {
    delete nullComponentIDsRegistry[id];
  }
  function isNullComponentID(id) {
    return !!nullComponentIDsRegistry[id];
  }
  var ReactEmptyComponent = {
    emptyElement: emptyElement,
    injection: ReactEmptyComponentInjection,
    isNullComponentID: isNullComponentID
  };
  module.exports = ReactEmptyComponent;
})(require("process"));
