/* */ 
(function(process) {
  'use strict';
  var warning = require("./warning");
  var warned = false;
  function cx(classNames) {
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(warned, 'React.addons.classSet will be deprecated in a future version. See ' + 'http://fb.me/react-addons-classset') : null);
      warned = true;
    }
    if (typeof classNames == 'object') {
      return Object.keys(classNames).filter(function(className) {
        return classNames[className];
      }).join(' ');
    } else {
      return Array.prototype.join.call(arguments, ' ');
    }
  }
  module.exports = cx;
})(require("process"));
