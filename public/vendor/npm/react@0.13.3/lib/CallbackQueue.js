/* */ 
(function(process) {
  'use strict';
  var PooledClass = require("./PooledClass");
  var assign = require("./Object.assign");
  var invariant = require("./invariant");
  function CallbackQueue() {
    this._callbacks = null;
    this._contexts = null;
  }
  assign(CallbackQueue.prototype, {
    enqueue: function(callback, context) {
      this._callbacks = this._callbacks || [];
      this._contexts = this._contexts || [];
      this._callbacks.push(callback);
      this._contexts.push(context);
    },
    notifyAll: function() {
      var callbacks = this._callbacks;
      var contexts = this._contexts;
      if (callbacks) {
        ("production" !== process.env.NODE_ENV ? invariant(callbacks.length === contexts.length, 'Mismatched list of contexts in callback queue') : invariant(callbacks.length === contexts.length));
        this._callbacks = null;
        this._contexts = null;
        for (var i = 0,
            l = callbacks.length; i < l; i++) {
          callbacks[i].call(contexts[i]);
        }
        callbacks.length = 0;
        contexts.length = 0;
      }
    },
    reset: function() {
      this._callbacks = null;
      this._contexts = null;
    },
    destructor: function() {
      this.reset();
    }
  });
  PooledClass.addPoolingTo(CallbackQueue);
  module.exports = CallbackQueue;
})(require("process"));
