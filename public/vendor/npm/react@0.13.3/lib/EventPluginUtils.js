/* */ 
(function(process) {
  'use strict';
  var EventConstants = require("./EventConstants");
  var invariant = require("./invariant");
  var injection = {
    Mount: null,
    injectMount: function(InjectedMount) {
      injection.Mount = InjectedMount;
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? invariant(InjectedMount && InjectedMount.getNode, 'EventPluginUtils.injection.injectMount(...): Injected Mount module ' + 'is missing getNode.') : invariant(InjectedMount && InjectedMount.getNode));
      }
    }
  };
  var topLevelTypes = EventConstants.topLevelTypes;
  function isEndish(topLevelType) {
    return topLevelType === topLevelTypes.topMouseUp || topLevelType === topLevelTypes.topTouchEnd || topLevelType === topLevelTypes.topTouchCancel;
  }
  function isMoveish(topLevelType) {
    return topLevelType === topLevelTypes.topMouseMove || topLevelType === topLevelTypes.topTouchMove;
  }
  function isStartish(topLevelType) {
    return topLevelType === topLevelTypes.topMouseDown || topLevelType === topLevelTypes.topTouchStart;
  }
  var validateEventDispatches;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches = function(event) {
      var dispatchListeners = event._dispatchListeners;
      var dispatchIDs = event._dispatchIDs;
      var listenersIsArr = Array.isArray(dispatchListeners);
      var idsIsArr = Array.isArray(dispatchIDs);
      var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
      var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;
      ("production" !== process.env.NODE_ENV ? invariant(idsIsArr === listenersIsArr && IDsLen === listenersLen, 'EventPluginUtils: Invalid `event`.') : invariant(idsIsArr === listenersIsArr && IDsLen === listenersLen));
    };
  }
  function forEachEventDispatch(event, cb) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;
    if ("production" !== process.env.NODE_ENV) {
      validateEventDispatches(event);
    }
    if (Array.isArray(dispatchListeners)) {
      for (var i = 0; i < dispatchListeners.length; i++) {
        if (event.isPropagationStopped()) {
          break;
        }
        cb(event, dispatchListeners[i], dispatchIDs[i]);
      }
    } else if (dispatchListeners) {
      cb(event, dispatchListeners, dispatchIDs);
    }
  }
  function executeDispatch(event, listener, domID) {
    event.currentTarget = injection.Mount.getNode(domID);
    var returnValue = listener(event, domID);
    event.currentTarget = null;
    return returnValue;
  }
  function executeDispatchesInOrder(event, cb) {
    forEachEventDispatch(event, cb);
    event._dispatchListeners = null;
    event._dispatchIDs = null;
  }
  function executeDispatchesInOrderStopAtTrueImpl(event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;
    if ("production" !== process.env.NODE_ENV) {
      validateEventDispatches(event);
    }
    if (Array.isArray(dispatchListeners)) {
      for (var i = 0; i < dispatchListeners.length; i++) {
        if (event.isPropagationStopped()) {
          break;
        }
        if (dispatchListeners[i](event, dispatchIDs[i])) {
          return dispatchIDs[i];
        }
      }
    } else if (dispatchListeners) {
      if (dispatchListeners(event, dispatchIDs)) {
        return dispatchIDs;
      }
    }
    return null;
  }
  function executeDispatchesInOrderStopAtTrue(event) {
    var ret = executeDispatchesInOrderStopAtTrueImpl(event);
    event._dispatchIDs = null;
    event._dispatchListeners = null;
    return ret;
  }
  function executeDirectDispatch(event) {
    if ("production" !== process.env.NODE_ENV) {
      validateEventDispatches(event);
    }
    var dispatchListener = event._dispatchListeners;
    var dispatchID = event._dispatchIDs;
    ("production" !== process.env.NODE_ENV ? invariant(!Array.isArray(dispatchListener), 'executeDirectDispatch(...): Invalid `event`.') : invariant(!Array.isArray(dispatchListener)));
    var res = dispatchListener ? dispatchListener(event, dispatchID) : null;
    event._dispatchListeners = null;
    event._dispatchIDs = null;
    return res;
  }
  function hasDispatches(event) {
    return !!event._dispatchListeners;
  }
  var EventPluginUtils = {
    isEndish: isEndish,
    isMoveish: isMoveish,
    isStartish: isStartish,
    executeDirectDispatch: executeDirectDispatch,
    executeDispatch: executeDispatch,
    executeDispatchesInOrder: executeDispatchesInOrder,
    executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
    hasDispatches: hasDispatches,
    injection: injection,
    useTouchEvents: false
  };
  module.exports = EventPluginUtils;
})(require("process"));
