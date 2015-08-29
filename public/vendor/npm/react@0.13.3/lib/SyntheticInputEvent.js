/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var InputEventInterface = {data: null};
function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}
SyntheticEvent.augmentClass(SyntheticInputEvent, InputEventInterface);
module.exports = SyntheticInputEvent;
