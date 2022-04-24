/* */ 
(function(process) {
  'use strict';
  var caughtError = null;
  function invokeGuardedCallback(name, func, a, b) {
    try {
      return func(a, b);
    } catch (x) {
      if (caughtError === null) {
        caughtError = x;
      }
      return undefined;
    }
  }
  var ReactErrorUtils = {
    invokeGuardedCallback: invokeGuardedCallback,
    invokeGuardedCallbackWithCatch: invokeGuardedCallback,
    rethrowCaughtError: function() {
      if (caughtError) {
        var error = caughtError;
        caughtError = null;
        throw error;
      }
    }
  };
  if (process.env.NODE_ENV !== 'production') {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
      var fakeNode = document.createElement('react');
      ReactErrorUtils.invokeGuardedCallback = function(name, func, a, b) {
        var boundFunc = func.bind(null, a, b);
        var evtType = 'react-' + name;
        fakeNode.addEventListener(evtType, boundFunc, false);
        var evt = document.createEvent('Event');
        evt.initEvent(evtType, false, false);
        fakeNode.dispatchEvent(evt);
        fakeNode.removeEventListener(evtType, boundFunc, false);
      };
    }
  }
  module.exports = ReactErrorUtils;
})(require('process'));
