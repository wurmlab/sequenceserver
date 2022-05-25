/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/react-jsx-dev-runtime.production.min');
  } else {
    module.exports = require('./cjs/react-jsx-dev-runtime.development');
  }
})(require('process'));
