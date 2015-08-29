/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var img = ReactElement.createFactory('img');
var ReactDOMImg = ReactClass.createClass({
  displayName: 'ReactDOMImg',
  tagName: 'IMG',
  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],
  render: function() {
    return img(this.props);
  },
  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topError, 'error');
  }
});
module.exports = ReactDOMImg;
