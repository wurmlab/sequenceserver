/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var emptyFunction = require("./emptyFunction");
var topLevelTypes = EventConstants.topLevelTypes;
var MobileSafariClickEventPlugin = {
  eventTypes: null,
  extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent) {
    if (topLevelType === topLevelTypes.topTouchStart) {
      var target = nativeEvent.target;
      if (target && !target.onclick) {
        target.onclick = emptyFunction;
      }
    }
  }
};
module.exports = MobileSafariClickEventPlugin;
