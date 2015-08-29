/* */ 
'use strict';
var shallowEqual = require("./shallowEqual");
var ReactComponentWithPureRenderMixin = {shouldComponentUpdate: function(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }};
module.exports = ReactComponentWithPureRenderMixin;
