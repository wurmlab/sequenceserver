/* */ 
(function(process) {
  'use strict';
  var ReactClass = require("./ReactClass");
  var ReactElement = require("./ReactElement");
  var invariant = require("./invariant");
  function createFullPageComponent(tag) {
    var elementFactory = ReactElement.createFactory(tag);
    var FullPageComponent = ReactClass.createClass({
      tagName: tag.toUpperCase(),
      displayName: 'ReactFullPageComponent' + tag,
      componentWillUnmount: function() {
        ("production" !== process.env.NODE_ENV ? invariant(false, '%s tried to unmount. Because of cross-browser quirks it is ' + 'impossible to unmount some top-level components (eg <html>, <head>, ' + 'and <body>) reliably and efficiently. To fix this, have a single ' + 'top-level component that never unmounts render these elements.', this.constructor.displayName) : invariant(false));
      },
      render: function() {
        return elementFactory(this.props);
      }
    });
    return FullPageComponent;
  }
  module.exports = createFullPageComponent;
})(require("process"));
