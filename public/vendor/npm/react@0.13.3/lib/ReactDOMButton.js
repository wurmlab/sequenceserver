/* */ 
'use strict';
var AutoFocusMixin = require("./AutoFocusMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var keyMirror = require("./keyMirror");
var button = ReactElement.createFactory('button');
var mouseListenerNames = keyMirror({
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,
  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true
});
var ReactDOMButton = ReactClass.createClass({
  displayName: 'ReactDOMButton',
  tagName: 'BUTTON',
  mixins: [AutoFocusMixin, ReactBrowserComponentMixin],
  render: function() {
    var props = {};
    for (var key in this.props) {
      if (this.props.hasOwnProperty(key) && (!this.props.disabled || !mouseListenerNames[key])) {
        props[key] = this.props[key];
      }
    }
    return button(props, this.props.children);
  }
});
module.exports = ReactDOMButton;
