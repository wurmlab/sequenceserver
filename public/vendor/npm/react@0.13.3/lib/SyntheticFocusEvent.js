/* */ 
'use strict';
var SyntheticUIEvent = require("./SyntheticUIEvent");
var FocusEventInterface = {relatedTarget: null};
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}
SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);
module.exports = SyntheticFocusEvent;
