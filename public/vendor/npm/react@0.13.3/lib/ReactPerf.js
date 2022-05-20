/* */ 
(function(process) {
  'use strict';
  var ReactPerf = {
    enableMeasure: false,
    storedMeasure: _noMeasure,
    measureMethods: function(object, objectName, methodNames) {
      if ("production" !== process.env.NODE_ENV) {
        for (var key in methodNames) {
          if (!methodNames.hasOwnProperty(key)) {
            continue;
          }
          object[key] = ReactPerf.measure(objectName, methodNames[key], object[key]);
        }
      }
    },
    measure: function(objName, fnName, func) {
      if ("production" !== process.env.NODE_ENV) {
        var measuredFunc = null;
        var wrapper = function() {
          if (ReactPerf.enableMeasure) {
            if (!measuredFunc) {
              measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
            }
            return measuredFunc.apply(this, arguments);
          }
          return func.apply(this, arguments);
        };
        wrapper.displayName = objName + '_' + fnName;
        return wrapper;
      }
      return func;
    },
    injection: {injectMeasure: function(measure) {
        ReactPerf.storedMeasure = measure;
      }}
  };
  function _noMeasure(objName, fnName, func) {
    return func;
  }
  module.exports = ReactPerf;
})(require("process"));
