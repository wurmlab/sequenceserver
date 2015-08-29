/* */ 
'use strict';
var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var assign = require("./Object.assign");
function ReactPutListenerQueue() {
  this.listenersToPut = [];
}
assign(ReactPutListenerQueue.prototype, {
  enqueuePutListener: function(rootNodeID, propKey, propValue) {
    this.listenersToPut.push({
      rootNodeID: rootNodeID,
      propKey: propKey,
      propValue: propValue
    });
  },
  putListeners: function() {
    for (var i = 0; i < this.listenersToPut.length; i++) {
      var listenerToPut = this.listenersToPut[i];
      ReactBrowserEventEmitter.putListener(listenerToPut.rootNodeID, listenerToPut.propKey, listenerToPut.propValue);
    }
  },
  reset: function() {
    this.listenersToPut.length = 0;
  },
  destructor: function() {
    this.reset();
  }
});
PooledClass.addPoolingTo(ReactPutListenerQueue);
module.exports = ReactPutListenerQueue;
