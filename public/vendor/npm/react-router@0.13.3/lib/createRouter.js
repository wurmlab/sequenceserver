/* */ 
(function(process) {
  'use strict';
  var React = require("react");
  var warning = require("react/lib/warning");
  var invariant = require("react/lib/invariant");
  var canUseDOM = require("react/lib/ExecutionEnvironment").canUseDOM;
  var LocationActions = require("./actions/LocationActions");
  var ImitateBrowserBehavior = require("./behaviors/ImitateBrowserBehavior");
  var HashLocation = require("./locations/HashLocation");
  var HistoryLocation = require("./locations/HistoryLocation");
  var RefreshLocation = require("./locations/RefreshLocation");
  var StaticLocation = require("./locations/StaticLocation");
  var ScrollHistory = require("./ScrollHistory");
  var createRoutesFromReactChildren = require("./createRoutesFromReactChildren");
  var isReactChildren = require("./isReactChildren");
  var Transition = require("./Transition");
  var PropTypes = require("./PropTypes");
  var Redirect = require("./Redirect");
  var History = require("./History");
  var Cancellation = require("./Cancellation");
  var Match = require("./Match");
  var Route = require("./Route");
  var supportsHistory = require("./supportsHistory");
  var PathUtils = require("./PathUtils");
  var DEFAULT_LOCATION = canUseDOM ? HashLocation : '/';
  var DEFAULT_SCROLL_BEHAVIOR = canUseDOM ? ImitateBrowserBehavior : null;
  function hasProperties(object, properties) {
    for (var propertyName in properties)
      if (properties.hasOwnProperty(propertyName) && object[propertyName] !== properties[propertyName]) {
        return false;
      }
    return true;
  }
  function hasMatch(routes, route, prevParams, nextParams, prevQuery, nextQuery) {
    return routes.some(function(r) {
      if (r !== route)
        return false;
      var paramNames = route.paramNames;
      var paramName;
      for (var i = 0,
          len = paramNames.length; i < len; ++i) {
        paramName = paramNames[i];
        if (nextParams[paramName] !== prevParams[paramName])
          return false;
      }
      return hasProperties(prevQuery, nextQuery) && hasProperties(nextQuery, prevQuery);
    });
  }
  function addRoutesToNamedRoutes(routes, namedRoutes) {
    var route;
    for (var i = 0,
        len = routes.length; i < len; ++i) {
      route = routes[i];
      if (route.name) {
        invariant(namedRoutes[route.name] == null, 'You may not have more than one route named "%s"', route.name);
        namedRoutes[route.name] = route;
      }
      if (route.childRoutes)
        addRoutesToNamedRoutes(route.childRoutes, namedRoutes);
    }
  }
  function routeIsActive(activeRoutes, routeName) {
    return activeRoutes.some(function(route) {
      return route.name === routeName;
    });
  }
  function paramsAreActive(activeParams, params) {
    for (var property in params)
      if (String(activeParams[property]) !== String(params[property])) {
        return false;
      }
    return true;
  }
  function queryIsActive(activeQuery, query) {
    for (var property in query)
      if (String(activeQuery[property]) !== String(query[property])) {
        return false;
      }
    return true;
  }
  function createRouter(options) {
    options = options || {};
    if (isReactChildren(options))
      options = {routes: options};
    var mountedComponents = [];
    var location = options.location || DEFAULT_LOCATION;
    var scrollBehavior = options.scrollBehavior || DEFAULT_SCROLL_BEHAVIOR;
    var state = {};
    var nextState = {};
    var pendingTransition = null;
    var dispatchHandler = null;
    if (typeof location === 'string')
      location = new StaticLocation(location);
    if (location instanceof StaticLocation) {
      warning(!canUseDOM || process.env.NODE_ENV === 'test', 'You should not use a static location in a DOM environment because ' + 'the router will not be kept in sync with the current URL');
    } else {
      invariant(canUseDOM || location.needsDOM === false, 'You cannot use %s without a DOM', location);
    }
    if (location === HistoryLocation && !supportsHistory())
      location = RefreshLocation;
    var Router = React.createClass({
      displayName: 'Router',
      statics: {
        isRunning: false,
        cancelPendingTransition: function cancelPendingTransition() {
          if (pendingTransition) {
            pendingTransition.cancel();
            pendingTransition = null;
          }
        },
        clearAllRoutes: function clearAllRoutes() {
          Router.cancelPendingTransition();
          Router.namedRoutes = {};
          Router.routes = [];
        },
        addRoutes: function addRoutes(routes) {
          if (isReactChildren(routes))
            routes = createRoutesFromReactChildren(routes);
          addRoutesToNamedRoutes(routes, Router.namedRoutes);
          Router.routes.push.apply(Router.routes, routes);
        },
        replaceRoutes: function replaceRoutes(routes) {
          Router.clearAllRoutes();
          Router.addRoutes(routes);
          Router.refresh();
        },
        match: function match(path) {
          return Match.findMatch(Router.routes, path);
        },
        makePath: function makePath(to, params, query) {
          var path;
          if (PathUtils.isAbsolute(to)) {
            path = to;
          } else {
            var route = to instanceof Route ? to : Router.namedRoutes[to];
            invariant(route instanceof Route, 'Cannot find a route named "%s"', to);
            path = route.path;
          }
          return PathUtils.withQuery(PathUtils.injectParams(path, params), query);
        },
        makeHref: function makeHref(to, params, query) {
          var path = Router.makePath(to, params, query);
          return location === HashLocation ? '#' + path : path;
        },
        transitionTo: function transitionTo(to, params, query) {
          var path = Router.makePath(to, params, query);
          if (pendingTransition) {
            location.replace(path);
          } else {
            location.push(path);
          }
        },
        replaceWith: function replaceWith(to, params, query) {
          location.replace(Router.makePath(to, params, query));
        },
        goBack: function goBack() {
          if (History.length > 1 || location === RefreshLocation) {
            location.pop();
            return true;
          }
          warning(false, 'goBack() was ignored because there is no router history');
          return false;
        },
        handleAbort: options.onAbort || function(abortReason) {
          if (location instanceof StaticLocation)
            throw new Error('Unhandled aborted transition! Reason: ' + abortReason);
          if (abortReason instanceof Cancellation) {
            return;
          } else if (abortReason instanceof Redirect) {
            location.replace(Router.makePath(abortReason.to, abortReason.params, abortReason.query));
          } else {
            location.pop();
          }
        },
        handleError: options.onError || function(error) {
          throw error;
        },
        handleLocationChange: function handleLocationChange(change) {
          Router.dispatch(change.path, change.type);
        },
        dispatch: function dispatch(path, action) {
          Router.cancelPendingTransition();
          var prevPath = state.path;
          var isRefreshing = action == null;
          if (prevPath === path && !isRefreshing) {
            return;
          }
          if (prevPath && action === LocationActions.PUSH)
            Router.recordScrollPosition(prevPath);
          var match = Router.match(path);
          warning(match != null, 'No route matches path "%s". Make sure you have <Route path="%s"> somewhere in your routes', path, path);
          if (match == null)
            match = {};
          var prevRoutes = state.routes || [];
          var prevParams = state.params || {};
          var prevQuery = state.query || {};
          var nextRoutes = match.routes || [];
          var nextParams = match.params || {};
          var nextQuery = match.query || {};
          var fromRoutes,
              toRoutes;
          if (prevRoutes.length) {
            fromRoutes = prevRoutes.filter(function(route) {
              return !hasMatch(nextRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
            });
            toRoutes = nextRoutes.filter(function(route) {
              return !hasMatch(prevRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
            });
          } else {
            fromRoutes = [];
            toRoutes = nextRoutes;
          }
          var transition = new Transition(path, Router.replaceWith.bind(Router, path));
          pendingTransition = transition;
          var fromComponents = mountedComponents.slice(prevRoutes.length - fromRoutes.length);
          Transition.from(transition, fromRoutes, fromComponents, function(error) {
            if (error || transition.abortReason)
              return dispatchHandler.call(Router, error, transition);
            Transition.to(transition, toRoutes, nextParams, nextQuery, function(error) {
              dispatchHandler.call(Router, error, transition, {
                path: path,
                action: action,
                pathname: match.pathname,
                routes: nextRoutes,
                params: nextParams,
                query: nextQuery
              });
            });
          });
        },
        run: function run(callback) {
          invariant(!Router.isRunning, 'Router is already running');
          dispatchHandler = function(error, transition, newState) {
            if (error)
              Router.handleError(error);
            if (pendingTransition !== transition)
              return;
            pendingTransition = null;
            if (transition.abortReason) {
              Router.handleAbort(transition.abortReason);
            } else {
              callback.call(Router, Router, nextState = newState);
            }
          };
          if (!(location instanceof StaticLocation)) {
            if (location.addChangeListener)
              location.addChangeListener(Router.handleLocationChange);
            Router.isRunning = true;
          }
          Router.refresh();
        },
        refresh: function refresh() {
          Router.dispatch(location.getCurrentPath(), null);
        },
        stop: function stop() {
          Router.cancelPendingTransition();
          if (location.removeChangeListener)
            location.removeChangeListener(Router.handleLocationChange);
          Router.isRunning = false;
        },
        getLocation: function getLocation() {
          return location;
        },
        getScrollBehavior: function getScrollBehavior() {
          return scrollBehavior;
        },
        getRouteAtDepth: function getRouteAtDepth(routeDepth) {
          var routes = state.routes;
          return routes && routes[routeDepth];
        },
        setRouteComponentAtDepth: function setRouteComponentAtDepth(routeDepth, component) {
          mountedComponents[routeDepth] = component;
        },
        getCurrentPath: function getCurrentPath() {
          return state.path;
        },
        getCurrentPathname: function getCurrentPathname() {
          return state.pathname;
        },
        getCurrentParams: function getCurrentParams() {
          return state.params;
        },
        getCurrentQuery: function getCurrentQuery() {
          return state.query;
        },
        getCurrentRoutes: function getCurrentRoutes() {
          return state.routes;
        },
        isActive: function isActive(to, params, query) {
          if (PathUtils.isAbsolute(to)) {
            return to === state.path;
          }
          return routeIsActive(state.routes, to) && paramsAreActive(state.params, params) && (query == null || queryIsActive(state.query, query));
        }
      },
      mixins: [ScrollHistory],
      propTypes: {children: PropTypes.falsy},
      childContextTypes: {
        routeDepth: PropTypes.number.isRequired,
        router: PropTypes.router.isRequired
      },
      getChildContext: function getChildContext() {
        return {
          routeDepth: 1,
          router: Router
        };
      },
      getInitialState: function getInitialState() {
        return state = nextState;
      },
      componentWillReceiveProps: function componentWillReceiveProps() {
        this.setState(state = nextState);
      },
      componentWillUnmount: function componentWillUnmount() {
        Router.stop();
      },
      render: function render() {
        var route = Router.getRouteAtDepth(0);
        return route ? React.createElement(route.handler, this.props) : null;
      }
    });
    Router.clearAllRoutes();
    if (options.routes)
      Router.addRoutes(options.routes);
    return Router;
  }
  module.exports = createRouter;
})(require("process"));
