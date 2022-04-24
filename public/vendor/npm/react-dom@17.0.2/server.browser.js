/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/react-dom-server.browser.production.min');
  } else {
    module.exports = require('./cjs/react-dom-server.browser.development');
  }
})(require('process'));
