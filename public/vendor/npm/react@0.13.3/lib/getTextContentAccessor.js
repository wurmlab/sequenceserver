/* */ 
'use strict';
var ExecutionEnvironment = require("./ExecutionEnvironment");
var contentKey = null;
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    contentKey = 'textContent' in document.documentElement ? 'textContent' : 'innerText';
  }
  return contentKey;
}
module.exports = getTextContentAccessor;
