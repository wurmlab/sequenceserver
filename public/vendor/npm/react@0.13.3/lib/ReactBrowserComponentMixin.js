/* */ 
'use strict';
var findDOMNode = require("./findDOMNode");
var ReactBrowserComponentMixin = {getDOMNode: function() {
    return findDOMNode(this);
  }};
module.exports = ReactBrowserComponentMixin;
