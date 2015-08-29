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
var NotFoundRoute = (function(_Route) {
  function NotFoundRoute() {
    _classCallCheck(this, NotFoundRoute);
    if (_Route != null) {
      _Route.apply(this, arguments);
    }
  }
  _inherits(NotFoundRoute, _Route);
  return NotFoundRoute;
})(Route);
NotFoundRoute.propTypes = {
  name: PropTypes.string,
  path: PropTypes.falsy,
  children: PropTypes.falsy,
  handler: PropTypes.func.isRequired
};
NotFoundRoute.defaultProps = {handler: RouteHandler};
module.exports = NotFoundRoute;
