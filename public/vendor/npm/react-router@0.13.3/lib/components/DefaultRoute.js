/* */ 
'use strict';
var _classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};
var _inherits = function(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    subClass.__proto__ = superClass;
};
var PropTypes = require("../PropTypes");
var RouteHandler = require("./RouteHandler");
var Route = require("./Route");
var DefaultRoute = (function(_Route) {
  function DefaultRoute() {
    _classCallCheck(this, DefaultRoute);
    if (_Route != null) {
      _Route.apply(this, arguments);
    }
  }
  _inherits(DefaultRoute, _Route);
  return DefaultRoute;
})(Route);
DefaultRoute.propTypes = {
  name: PropTypes.string,
  path: PropTypes.falsy,
  children: PropTypes.falsy,
  handler: PropTypes.func.isRequired
};
DefaultRoute.defaultProps = {handler: RouteHandler};
module.exports = DefaultRoute;
