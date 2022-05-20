/* */ 
'use strict';
var SyntheticUIEvent = require("./SyntheticUIEvent");
var getEventModifierState = require("./getEventModifierState");
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}
SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);
module.exports = SyntheticTouchEvent;
