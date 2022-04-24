/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/react.production.min');
  } else {
    module.exports = require('./cjs/react.development');
  }
})(require('process'));
