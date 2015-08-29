/* */ 
'use strict';
var keyMirror = require("./keyMirror");
var ReactMultiChildUpdateTypes = keyMirror({
  INSERT_MARKUP: null,
  MOVE_EXISTING: null,
  REMOVE_NODE: null,
  TEXT_CONTENT: null
});
module.exports = ReactMultiChildUpdateTypes;
