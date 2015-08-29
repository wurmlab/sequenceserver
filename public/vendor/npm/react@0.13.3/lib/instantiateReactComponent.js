/* */ 
(function(process) {
  'use strict';
  var ReactCompositeComponent = require("./ReactCompositeComponent");
  var ReactEmptyComponent = require("./ReactEmptyComponent");
  var ReactNativeComponent = require("./ReactNativeComponent");
  var assign = require("./Object.assign");
  var invariant = require("./invariant");
  var warning = require("./warning");
  var ReactCompositeComponentWrapper = function() {};
  assign(ReactCompositeComponentWrapper.prototype, ReactCompositeComponent.Mixin, {_instantiateReactComponent: instantiateReactComponent});
  function isInternalComponentType(type) {
    return (typeof type === 'function' && typeof type.prototype !== 'undefined' && typeof type.prototype.mountComponent === 'function' && typeof type.prototype.receiveComponent === 'function');
  }
  function instantiateReactComponent(node, parentCompositeType) {
    var instance;
    if (node === null || node === false) {
      node = ReactEmptyComponent.emptyElement;
    }
    if (typeof node === 'object') {
      var element = node;
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(element && (typeof element.type === 'function' || typeof element.type === 'string'), 'Only functions or strings can be mounted as React components.') : null);
      }
      if (parentCompositeType === element.type && typeof element.type === 'string') {
        instance = ReactNativeComponent.createInternalComponent(element);
      } else if (isInternalComponentType(element.type)) {
        instance = new element.type(element);
      } else {
        instance = new ReactCompositeComponentWrapper();
      }
    } else if (typeof node === 'string' || typeof node === 'number') {
      instance = ReactNativeComponent.createInstanceForText(node);
    } else {
      ("production" !== process.env.NODE_ENV ? invariant(false, 'Encountered invalid React node of type %s', typeof node) : invariant(false));
    }
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(typeof instance.construct === 'function' && typeof instance.mountComponent === 'function' && typeof instance.receiveComponent === 'function' && typeof instance.unmountComponent === 'function', 'Only React Components can be mounted.') : null);
    }
    instance.construct(node);
    instance._mountIndex = 0;
    instance._mountImage = null;
    if ("production" !== process.env.NODE_ENV) {
      instance._isOwnerNecessary = false;
      instance._warnedAboutRefsInRender = false;
    }
    if ("production" !== process.env.NODE_ENV) {
      if (Object.preventExtensions) {
        Object.preventExtensions(instance);
      }
    }
    return instance;
  }
  module.exports = instantiateReactComponent;
})(require("process"));
