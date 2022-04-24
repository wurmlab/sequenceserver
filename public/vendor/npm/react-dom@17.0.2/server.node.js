/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./cjs/react-dom-server.node.production.min');
  } else {
    module.exports = require('./cjs/react-dom-server.node.development');
  }
})(require('process'));
