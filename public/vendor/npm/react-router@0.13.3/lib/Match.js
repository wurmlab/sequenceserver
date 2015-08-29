/* */ 
'use strict';
var _classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
var PathUtils = require("./PathUtils");
function deepSearch(route, pathname, query) {
  var childRoutes = route.childRoutes;
  if (childRoutes) {
    var match,
        childRoute;
    for (var i = 0,
        len = childRoutes.length; i < len; ++i) {
      childRoute = childRoutes[i];
      if (childRoute.isDefault || childRoute.isNotFound)
        continue;
      if (match = deepSearch(childRoute, pathname, query)) {
        match.routes.unshift(route);
        return match;
      }
    }
  }
  var defaultRoute = route.defaultRoute;
  if (defaultRoute && (params = PathUtils.extractParams(defaultRoute.path, pathname))) {
    return new Match(pathname, params, query, [route, defaultRoute]);
  }
  var notFoundRoute = route.notFoundRoute;
  if (notFoundRoute && (params = PathUtils.extractParams(notFoundRoute.path, pathname))) {
    return new Match(pathname, params, query, [route, notFoundRoute]);
  }
  var params = PathUtils.extractParams(route.path, pathname);
  if (params) {
    return new Match(pathname, params, query, [route]);
  }
  return null;
}
var Match = (function() {
  function Match(pathname, params, query, routes) {
    _classCallCheck(this, Match);
    this.pathname = pathname;
    this.params = params;
    this.query = query;
    this.routes = routes;
  }
  _createClass(Match, null, [{
    key: 'findMatch',
    value: function findMatch(routes, path) {
      var pathname = PathUtils.withoutQuery(path);
      var query = PathUtils.extractQuery(path);
      var match = null;
      for (var i = 0,
          len = routes.length; match == null && i < len; ++i)
        match = deepSearch(routes[i], pathname, query);
      return match;
    }
  }]);
  return Match;
})();
module.exports = Match;
