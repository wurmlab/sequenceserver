/* */ 
'use strict';
var performance = require('./performance');
var performanceNow;
if (performance.now) {
  performanceNow = function() {
    return performance.now();
  };
} else {
  performanceNow = function() {
    return Date.now();
  };
}
module.exports = performanceNow;
