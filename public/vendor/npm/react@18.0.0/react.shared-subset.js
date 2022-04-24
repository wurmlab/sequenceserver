/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/react.shared-subset.production.min');
  } else {
    module.exports = require('./cjs/react.shared-subset.development');
  }
})(require('process'));
