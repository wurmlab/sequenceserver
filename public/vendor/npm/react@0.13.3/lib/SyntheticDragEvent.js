/* */ 
'use strict';
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var DragEventInterface = {dataTransfer: null};
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}
SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);
module.exports = SyntheticDragEvent;
