/* */ 
(function(process) {
  'use strict';
  var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
  var ReactClass = require("./ReactClass");
  var ReactElement = require("./ReactElement");
  var warning = require("./warning");
  var option = ReactElement.createFactory('option');
  var ReactDOMOption = ReactClass.createClass({
    displayName: 'ReactDOMOption',
    tagName: 'OPTION',
    mixins: [ReactBrowserComponentMixin],
    componentWillMount: function() {
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(this.props.selected == null, 'Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.') : null);
      }
    },
    render: function() {
      return option(this.props, this.props.children);
    }
  });
  module.exports = ReactDOMOption;
})(require("process"));
