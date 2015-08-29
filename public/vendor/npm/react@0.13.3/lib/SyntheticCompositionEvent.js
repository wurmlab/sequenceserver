/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var CompositionEventInterface = {data: null};
function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}
SyntheticEvent.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);
module.exports = SyntheticCompositionEvent;
