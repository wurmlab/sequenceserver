/* */ 
'use strict';
var PooledClass = require("./PooledClass");
var CallbackQueue = require("./CallbackQueue");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");
var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");
var ON_DOM_READY_QUEUEING = {
  initialize: function() {
    this.reactMountReady.reset();
  },
  close: emptyFunction
};
var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },
  close: emptyFunction
};
var TRANSACTION_WRAPPERS = [PUT_LISTENER_QUEUEING, ON_DOM_READY_QUEUEING];
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}
var Mixin = {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },
  getReactMountReady: function() {
    return this.reactMountReady;
  },
  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};
assign(ReactServerRenderingTransaction.prototype, Transaction.Mixin, Mixin);
PooledClass.addPoolingTo(ReactServerRenderingTransaction);
module.exports = ReactServerRenderingTransaction;
