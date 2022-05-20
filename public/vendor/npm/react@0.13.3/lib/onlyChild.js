/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var invariant = require("./invariant");
  function onlyChild(children) {
    ("production" !== process.env.NODE_ENV ? invariant(ReactElement.isValidElement(children), 'onlyChild must be passed a children with exactly one child.') : invariant(ReactElement.isValidElement(children)));
    return children;
  }
  module.exports = onlyChild;
})(require("process"));
