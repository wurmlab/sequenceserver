/* */ 
(function(process) {
  'use strict';
  module.exports = require('./loose-envify')(process.env);
})(require('process'));
