/* */ 
(function(process) {
  'use strict';
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var ReactInstanceMap = require("./ReactInstanceMap");
  var ReactMount = require("./ReactMount");
  var invariant = require("./invariant");
  var isNode = require("./isNode");
  var warning = require("./warning");
  function findDOMNode(componentOrElement) {
    if ("production" !== process.env.NODE_ENV) {
      var owner = ReactCurrentOwner.current;
      if (owner !== null) {
        ("production" !== process.env.NODE_ENV ? warning(owner._warnedAboutRefsInRender, '%s is accessing getDOMNode or findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component') : null);
        owner._warnedAboutRefsInRender = true;
      }
    }
    if (componentOrElement == null) {
      return null;
    }
    if (isNode(componentOrElement)) {
      return componentOrElement;
    }
    if (ReactInstanceMap.has(componentOrElement)) {
      return ReactMount.getNodeFromInstance(componentOrElement);
    }
    ("production" !== process.env.NODE_ENV ? invariant(componentOrElement.render == null || typeof componentOrElement.render !== 'function', 'Component (with keys: %s) contains `render` method ' + 'but is not mounted in the DOM', Object.keys(componentOrElement)) : invariant(componentOrElement.render == null || typeof componentOrElement.render !== 'function'));
    ("production" !== process.env.NODE_ENV ? invariant(false, 'Element appears to be neither ReactComponent nor DOMNode (keys: %s)', Object.keys(componentOrElement)) : invariant(false));
  }
  module.exports = findDOMNode;
})(require("process"));
