/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var warning = require("./warning");
  if ("production" !== process.env.NODE_ENV) {
    var fragmentKey = '_reactFragment';
    var didWarnKey = '_reactDidWarn';
    var canWarnForReactFragment = false;
    try {
      var dummy = function() {
        return 1;
      };
      Object.defineProperty({}, fragmentKey, {
        enumerable: false,
        value: true
      });
      Object.defineProperty({}, 'key', {
        enumerable: true,
        get: dummy
      });
      canWarnForReactFragment = true;
    } catch (x) {}
    var proxyPropertyAccessWithWarning = function(obj, key) {
      Object.defineProperty(obj, key, {
        enumerable: true,
        get: function() {
          ("production" !== process.env.NODE_ENV ? warning(this[didWarnKey], 'A ReactFragment is an opaque type. Accessing any of its ' + 'properties is deprecated. Pass it to one of the React.Children ' + 'helpers.') : null);
          this[didWarnKey] = true;
          return this[fragmentKey][key];
        },
        set: function(value) {
          ("production" !== process.env.NODE_ENV ? warning(this[didWarnKey], 'A ReactFragment is an immutable opaque type. Mutating its ' + 'properties is deprecated.') : null);
          this[didWarnKey] = true;
          this[fragmentKey][key] = value;
        }
      });
    };
    var issuedWarnings = {};
    var didWarnForFragment = function(fragment) {
      var fragmentCacheKey = '';
      for (var key in fragment) {
        fragmentCacheKey += key + ':' + (typeof fragment[key]) + ',';
      }
      var alreadyWarnedOnce = !!issuedWarnings[fragmentCacheKey];
      issuedWarnings[fragmentCacheKey] = true;
      return alreadyWarnedOnce;
    };
  }
  var ReactFragment = {
    create: function(object) {
      if ("production" !== process.env.NODE_ENV) {
        if (typeof object !== 'object' || !object || Array.isArray(object)) {
          ("production" !== process.env.NODE_ENV ? warning(false, 'React.addons.createFragment only accepts a single object.', object) : null);
          return object;
        }
        if (ReactElement.isValidElement(object)) {
          ("production" !== process.env.NODE_ENV ? warning(false, 'React.addons.createFragment does not accept a ReactElement ' + 'without a wrapper object.') : null);
          return object;
        }
        if (canWarnForReactFragment) {
          var proxy = {};
          Object.defineProperty(proxy, fragmentKey, {
            enumerable: false,
            value: object
          });
          Object.defineProperty(proxy, didWarnKey, {
            writable: true,
            enumerable: false,
            value: false
          });
          for (var key in object) {
            proxyPropertyAccessWithWarning(proxy, key);
          }
          Object.preventExtensions(proxy);
          return proxy;
        }
      }
      return object;
    },
    extract: function(fragment) {
      if ("production" !== process.env.NODE_ENV) {
        if (canWarnForReactFragment) {
          if (!fragment[fragmentKey]) {
            ("production" !== process.env.NODE_ENV ? warning(didWarnForFragment(fragment), 'Any use of a keyed object should be wrapped in ' + 'React.addons.createFragment(object) before being passed as a ' + 'child.') : null);
            return fragment;
          }
          return fragment[fragmentKey];
        }
      }
      return fragment;
    },
    extractIfFragment: function(fragment) {
      if ("production" !== process.env.NODE_ENV) {
        if (canWarnForReactFragment) {
          if (fragment[fragmentKey]) {
            return fragment[fragmentKey];
          }
          for (var key in fragment) {
            if (fragment.hasOwnProperty(key) && ReactElement.isValidElement(fragment[key])) {
              return ReactFragment.extract(fragment);
            }
          }
        }
      }
      return fragment;
    }
  };
  module.exports = ReactFragment;
})(require("process"));
