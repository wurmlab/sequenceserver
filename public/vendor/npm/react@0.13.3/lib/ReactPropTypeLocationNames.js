/* */ 
(function(process) {
  'use strict';
  var ReactPropTypeLocationNames = {};
  if ("production" !== process.env.NODE_ENV) {
    ReactPropTypeLocationNames = {
      prop: 'prop',
      context: 'context',
      childContext: 'child context'
    };
  }
  module.exports = ReactPropTypeLocationNames;
})(require("process"));
