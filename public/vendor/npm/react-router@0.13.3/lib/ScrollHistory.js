/* */ 
'use strict';
var invariant = require("react/lib/invariant");
var canUseDOM = require("react/lib/ExecutionEnvironment").canUseDOM;
var getWindowScrollPosition = require("./getWindowScrollPosition");
function shouldUpdateScroll(state, prevState) {
  if (!prevState) {
    return true;
  }
  if (state.pathname === prevState.pathname) {
    return false;
  }
  var routes = state.routes;
  var prevRoutes = prevState.routes;
  var sharedAncestorRoutes = routes.filter(function(route) {
    return prevRoutes.indexOf(route) !== -1;
  });
  return !sharedAncestorRoutes.some(function(route) {
    return route.ignoreScrollBehavior;
  });
}
var ScrollHistory = {
  statics: {
    recordScrollPosition: function recordScrollPosition(path) {
      if (!this.scrollHistory)
        this.scrollHistory = {};
      this.scrollHistory[path] = getWindowScrollPosition();
    },
    getScrollPosition: function getScrollPosition(path) {
      if (!this.scrollHistory)
        this.scrollHistory = {};
      return this.scrollHistory[path] || null;
    }
  },
  componentWillMount: function componentWillMount() {
    invariant(this.constructor.getScrollBehavior() == null || canUseDOM, 'Cannot use scroll behavior without a DOM');
  },
  componentDidMount: function componentDidMount() {
    this._updateScroll();
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    this._updateScroll(prevState);
  },
  _updateScroll: function _updateScroll(prevState) {
    if (!shouldUpdateScroll(this.state, prevState)) {
      return;
    }
    var scrollBehavior = this.constructor.getScrollBehavior();
    if (scrollBehavior)
      scrollBehavior.updateScrollPosition(this.constructor.getScrollPosition(this.state.path), this.state.action);
  }
};
module.exports = ScrollHistory;
