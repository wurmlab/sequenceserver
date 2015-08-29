/* */ 
'use strict';
var EventPluginHub = require("./EventPluginHub");
function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue();
}
var ReactEventEmitterMixin = {handleTopLevel: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent) {
    var events = EventPluginHub.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent);
    runEventQueueInBatch(events);
  }};
module.exports = ReactEventEmitterMixin;
