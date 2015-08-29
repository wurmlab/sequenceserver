/* */ 
var performance = require("./performance");
if (!performance || !performance.now) {
  performance = Date;
}
var performanceNow = performance.now.bind(performance);
module.exports = performanceNow;
