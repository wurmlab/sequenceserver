/* */ 
'use strict';
var focusNode = require("./focusNode");
var AutoFocusMixin = {componentDidMount: function() {
    if (this.props.autoFocus) {
      focusNode(this.getDOMNode());
    }
  }};
module.exports = AutoFocusMixin;
