/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var iframe = ReactElement.createFactory('iframe');
var ReactDOMIframe = ReactClass.createClass({
  displayName: 'ReactDOMIframe',
  tagName: 'IFRAME',
  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],
  render: function() {
    return iframe(this.props);
  },
  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load');
  }
});
module.exports = ReactDOMIframe;
