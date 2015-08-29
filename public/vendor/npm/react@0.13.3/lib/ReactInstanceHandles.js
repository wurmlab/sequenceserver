/* */ 
(function(process) {
  'use strict';
  var ReactRootIndex = require("./ReactRootIndex");
  var invariant = require("./invariant");
  var SEPARATOR = '.';
  var SEPARATOR_LENGTH = SEPARATOR.length;
  var MAX_TREE_DEPTH = 100;
  function getReactRootIDString(index) {
    return SEPARATOR + index.toString(36);
  }
  function isBoundary(id, index) {
    return id.charAt(index) === SEPARATOR || index === id.length;
  }
  function isValidID(id) {
    return id === '' || (id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR);
  }
  function isAncestorIDOf(ancestorID, descendantID) {
    return (descendantID.indexOf(ancestorID) === 0 && isBoundary(descendantID, ancestorID.length));
  }
  function getParentID(id) {
    return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
  }
  function getNextDescendantID(ancestorID, destinationID) {
    ("production" !== process.env.NODE_ENV ? invariant(isValidID(ancestorID) && isValidID(destinationID), 'getNextDescendantID(%s, %s): Received an invalid React DOM ID.', ancestorID, destinationID) : invariant(isValidID(ancestorID) && isValidID(destinationID)));
    ("production" !== process.env.NODE_ENV ? invariant(isAncestorIDOf(ancestorID, destinationID), 'getNextDescendantID(...): React has made an invalid assumption about ' + 'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.', ancestorID, destinationID) : invariant(isAncestorIDOf(ancestorID, destinationID)));
    if (ancestorID === destinationID) {
      return ancestorID;
    }
    var start = ancestorID.length + SEPARATOR_LENGTH;
    var i;
    for (i = start; i < destinationID.length; i++) {
      if (isBoundary(destinationID, i)) {
        break;
      }
    }
    return destinationID.substr(0, i);
  }
  function getFirstCommonAncestorID(oneID, twoID) {
    var minLength = Math.min(oneID.length, twoID.length);
    if (minLength === 0) {
      return '';
    }
    var lastCommonMarkerIndex = 0;
    for (var i = 0; i <= minLength; i++) {
      if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
        lastCommonMarkerIndex = i;
      } else if (oneID.charAt(i) !== twoID.charAt(i)) {
        break;
      }
    }
    var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
    ("production" !== process.env.NODE_ENV ? invariant(isValidID(longestCommonID), 'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s', oneID, twoID, longestCommonID) : invariant(isValidID(longestCommonID)));
    return longestCommonID;
  }
  function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
    start = start || '';
    stop = stop || '';
    ("production" !== process.env.NODE_ENV ? invariant(start !== stop, 'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.', start) : invariant(start !== stop));
    var traverseUp = isAncestorIDOf(stop, start);
    ("production" !== process.env.NODE_ENV ? invariant(traverseUp || isAncestorIDOf(start, stop), 'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' + 'not have a parent path.', start, stop) : invariant(traverseUp || isAncestorIDOf(start, stop)));
    var depth = 0;
    var traverse = traverseUp ? getParentID : getNextDescendantID;
    for (var id = start; ; id = traverse(id, stop)) {
      var ret;
      if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
        ret = cb(id, traverseUp, arg);
      }
      if (ret === false || id === stop) {
        break;
      }
      ("production" !== process.env.NODE_ENV ? invariant(depth++ < MAX_TREE_DEPTH, 'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' + 'traversing the React DOM ID tree. This may be due to malformed IDs: %s', start, stop) : invariant(depth++ < MAX_TREE_DEPTH));
    }
  }
  var ReactInstanceHandles = {
    createReactRootID: function() {
      return getReactRootIDString(ReactRootIndex.createReactRootIndex());
    },
    createReactID: function(rootID, name) {
      return rootID + name;
    },
    getReactRootIDFromNodeID: function(id) {
      if (id && id.charAt(0) === SEPARATOR && id.length > 1) {
        var index = id.indexOf(SEPARATOR, 1);
        return index > -1 ? id.substr(0, index) : id;
      }
      return null;
    },
    traverseEnterLeave: function(leaveID, enterID, cb, upArg, downArg) {
      var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
      if (ancestorID !== leaveID) {
        traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
      }
      if (ancestorID !== enterID) {
        traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
      }
    },
    traverseTwoPhase: function(targetID, cb, arg) {
      if (targetID) {
        traverseParentPath('', targetID, cb, arg, true, false);
        traverseParentPath(targetID, '', cb, arg, false, true);
      }
    },
    traverseAncestors: function(targetID, cb, arg) {
      traverseParentPath('', targetID, cb, arg, true, false);
    },
    _getFirstCommonAncestorID: getFirstCommonAncestorID,
    _getNextDescendantID: getNextDescendantID,
    isAncestorIDOf: isAncestorIDOf,
    SEPARATOR: SEPARATOR
  };
  module.exports = ReactInstanceHandles;
})(require("process"));
