/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/scheduler.production.min');
  } else {
    module.exports = require('./cjs/scheduler.development');
  }
})(require('process'));
