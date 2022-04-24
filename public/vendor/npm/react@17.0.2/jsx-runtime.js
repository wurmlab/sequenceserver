/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/react-jsx-runtime.production.min');
  } else {
    module.exports = require('./cjs/react-jsx-runtime.development');
  }
})(require('process'));
