/* */ 
(function(process) {
  'use strict';
  var warning = require("./warning");
  function shouldUpdateReactComponent(prevElement, nextElement) {
    if (prevElement != null && nextElement != null) {
      var prevType = typeof prevElement;
      var nextType = typeof nextElement;
      if (prevType === 'string' || prevType === 'number') {
        return (nextType === 'string' || nextType === 'number');
      } else {
        if (nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key) {
          var ownersMatch = prevElement._owner === nextElement._owner;
          var prevName = null;
          var nextName = null;
          var nextDisplayName = null;
          if ("production" !== process.env.NODE_ENV) {
            if (!ownersMatch) {
              if (prevElement._owner != null && prevElement._owner.getPublicInstance() != null && prevElement._owner.getPublicInstance().constructor != null) {
                prevName = prevElement._owner.getPublicInstance().constructor.displayName;
              }
              if (nextElement._owner != null && nextElement._owner.getPublicInstance() != null && nextElement._owner.getPublicInstance().constructor != null) {
                nextName = nextElement._owner.getPublicInstance().constructor.displayName;
              }
              if (nextElement.type != null && nextElement.type.displayName != null) {
                nextDisplayName = nextElement.type.displayName;
              }
              if (nextElement.type != null && typeof nextElement.type === 'string') {
                nextDisplayName = nextElement.type;
              }
              if (typeof nextElement.type !== 'string' || nextElement.type === 'input' || nextElement.type === 'textarea') {
                if ((prevElement._owner != null && prevElement._owner._isOwnerNecessary === false) || (nextElement._owner != null && nextElement._owner._isOwnerNecessary === false)) {
                  if (prevElement._owner != null) {
                    prevElement._owner._isOwnerNecessary = true;
                  }
                  if (nextElement._owner != null) {
                    nextElement._owner._isOwnerNecessary = true;
                  }
                  ("production" !== process.env.NODE_ENV ? warning(false, '<%s /> is being rendered by both %s and %s using the same ' + 'key (%s) in the same place. Currently, this means that ' + 'they don\'t preserve state. This behavior should be very ' + 'rare so we\'re considering deprecating it. Please contact ' + 'the React team and explain your use case so that we can ' + 'take that into consideration.', nextDisplayName || 'Unknown Component', prevName || '[Unknown]', nextName || '[Unknown]', prevElement.key) : null);
                }
              }
            }
          }
          return ownersMatch;
        }
      }
    }
    return false;
  }
  module.exports = shouldUpdateReactComponent;
})(require("process"));
