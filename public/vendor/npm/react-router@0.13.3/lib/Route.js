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
var assign = require("react/lib/Object.assign");
var invariant = require("react/lib/invariant");
var warning = require("react/lib/warning");
var PathUtils = require("./PathUtils");
var _currentRoute;
var Route = (function() {
  function Route(name, path, ignoreScrollBehavior, isDefault, isNotFound, onEnter, onLeave, handler) {
    _classCallCheck(this, Route);
    this.name = name;
    this.path = path;
    this.paramNames = PathUtils.extractParamNames(this.path);
    this.ignoreScrollBehavior = !!ignoreScrollBehavior;
    this.isDefault = !!isDefault;
    this.isNotFound = !!isNotFound;
    this.onEnter = onEnter;
    this.onLeave = onLeave;
    this.handler = handler;
  }
  _createClass(Route, [{
    key: 'appendChild',
    value: function appendChild(route) {
      invariant(route instanceof Route, 'route.appendChild must use a valid Route');
      if (!this.childRoutes)
        this.childRoutes = [];
      this.childRoutes.push(route);
    }
  }, {
    key: 'toString',
    value: function toString() {
      var string = '<Route';
      if (this.name)
        string += ' name="' + this.name + '"';
      string += ' path="' + this.path + '">';
      return string;
    }
  }], [{
    key: 'createRoute',
    value: function createRoute(options, callback) {
      options = options || {};
      if (typeof options === 'string')
        options = {path: options};
      var parentRoute = _currentRoute;
      if (parentRoute) {
        warning(options.parentRoute == null || options.parentRoute === parentRoute, 'You should not use parentRoute with createRoute inside another route\'s child callback; it is ignored');
      } else {
        parentRoute = options.parentRoute;
      }
      var name = options.name;
      var path = options.path || name;
      if (path && !(options.isDefault || options.isNotFound)) {
        if (PathUtils.isAbsolute(path)) {
          if (parentRoute) {
            invariant(path === parentRoute.path || parentRoute.paramNames.length === 0, 'You cannot nest path "%s" inside "%s"; the parent requires URL parameters', path, parentRoute.path);
          }
        } else if (parentRoute) {
          path = PathUtils.join(parentRoute.path, path);
        } else {
          path = '/' + path;
        }
      } else {
        path = parentRoute ? parentRoute.path : '/';
      }
      if (options.isNotFound && !/\*$/.test(path))
        path += '*';
      var route = new Route(name, path, options.ignoreScrollBehavior, options.isDefault, options.isNotFound, options.onEnter, options.onLeave, options.handler);
      if (parentRoute) {
        if (route.isDefault) {
          invariant(parentRoute.defaultRoute == null, '%s may not have more than one default route', parentRoute);
          parentRoute.defaultRoute = route;
        } else if (route.isNotFound) {
          invariant(parentRoute.notFoundRoute == null, '%s may not have more than one not found route', parentRoute);
          parentRoute.notFoundRoute = route;
        }
        parentRoute.appendChild(route);
      }
      if (typeof callback === 'function') {
        var currentRoute = _currentRoute;
        _currentRoute = route;
        callback.call(route, route);
        _currentRoute = currentRoute;
      }
      return route;
    }
  }, {
    key: 'createDefaultRoute',
    value: function createDefaultRoute(options) {
      return Route.createRoute(assign({}, options, {isDefault: true}));
    }
  }, {
    key: 'createNotFoundRoute',
    value: function createNotFoundRoute(options) {
      return Route.createRoute(assign({}, options, {isNotFound: true}));
    }
  }, {
    key: 'createRedirect',
    value: function createRedirect(options) {
      return Route.createRoute(assign({}, options, {
        path: options.path || options.from || '*',
        onEnter: function onEnter(transition, params, query) {
          transition.redirect(options.to, options.params || params, options.query || query);
        }
      }));
    }
  }]);
  return Route;
})();
module.exports = Route;
