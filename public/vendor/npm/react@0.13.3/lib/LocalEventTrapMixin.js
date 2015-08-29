/* */ 
(function(process) {
  'use strict';
  var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
  var accumulateInto = require("./accumulateInto");
  var forEachAccumulated = require("./forEachAccumulated");
  var invariant = require("./invariant");
  function remove(event) {
    event.remove();
  }
  var LocalEventTrapMixin = {
    trapBubbledEvent: function(topLevelType, handlerBaseName) {
      ("production" !== process.env.NODE_ENV ? invariant(this.isMounted(), 'Must be mounted to trap events') : invariant(this.isMounted()));
      var node = this.getDOMNode();
      ("production" !== process.env.NODE_ENV ? invariant(node, 'LocalEventTrapMixin.trapBubbledEvent(...): Requires node to be rendered.') : invariant(node));
      var listener = ReactBrowserEventEmitter.trapBubbledEvent(topLevelType, handlerBaseName, node);
      this._localEventListeners = accumulateInto(this._localEventListeners, listener);
    },
    componentWillUnmount: function() {
      if (this._localEventListeners) {
        forEachAccumulated(this._localEventListeners, remove);
      }
    }
  };
  module.exports = LocalEventTrapMixin;
})(require("process"));
