/* */ 
'use strict';
var LocationActions = require("../actions/LocationActions");
var History = require("../History");
var _listeners = [];
var _isListening = false;
var _actionType;
function notifyChange(type) {
  if (type === LocationActions.PUSH)
    History.length += 1;
  var change = {
    path: HashLocation.getCurrentPath(),
    type: type
  };
  _listeners.forEach(function(listener) {
    listener.call(HashLocation, change);
  });
}
function ensureSlash() {
  var path = HashLocation.getCurrentPath();
  if (path.charAt(0) === '/') {
    return true;
  }
  HashLocation.replace('/' + path);
  return false;
}
function onHashChange() {
  if (ensureSlash()) {
    var curActionType = _actionType;
    _actionType = null;
    notifyChange(curActionType || LocationActions.POP);
  }
}
var HashLocation = {
  addChangeListener: function addChangeListener(listener) {
    _listeners.push(listener);
    ensureSlash();
    if (!_isListening) {
      if (window.addEventListener) {
        window.addEventListener('hashchange', onHashChange, false);
      } else {
        window.attachEvent('onhashchange', onHashChange);
      }
      _isListening = true;
    }
  },
  removeChangeListener: function removeChangeListener(listener) {
    _listeners = _listeners.filter(function(l) {
      return l !== listener;
    });
    if (_listeners.length === 0) {
      if (window.removeEventListener) {
        window.removeEventListener('hashchange', onHashChange, false);
      } else {
        window.removeEvent('onhashchange', onHashChange);
      }
      _isListening = false;
    }
  },
  push: function push(path) {
    _actionType = LocationActions.PUSH;
    window.location.hash = path;
  },
  replace: function replace(path) {
    _actionType = LocationActions.REPLACE;
    window.location.replace(window.location.pathname + window.location.search + '#' + path);
  },
  pop: function pop() {
    _actionType = LocationActions.POP;
    History.back();
  },
  getCurrentPath: function getCurrentPath() {
    return decodeURI(window.location.href.split('#')[1] || '');
  },
  toString: function toString() {
    return '<HashLocation>';
  }
};
module.exports = HashLocation;
