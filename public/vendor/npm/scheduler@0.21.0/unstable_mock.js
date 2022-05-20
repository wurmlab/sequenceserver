/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/scheduler-unstable_mock.production.min');
  } else {
    module.exports = require('./cjs/scheduler-unstable_mock.development');
  }
})(require('process'));
