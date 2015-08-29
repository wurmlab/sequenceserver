/* */ 
(function(process) {
  'use strict';
  var assign = require("./Object.assign");
  var invariant = require("./invariant");
  var autoGenerateWrapperClass = null;
  var genericComponentClass = null;
  var tagToComponentClass = {};
  var textComponentClass = null;
  var ReactNativeComponentInjection = {
    injectGenericComponentClass: function(componentClass) {
      genericComponentClass = componentClass;
    },
    injectTextComponentClass: function(componentClass) {
      textComponentClass = componentClass;
    },
    injectComponentClasses: function(componentClasses) {
      assign(tagToComponentClass, componentClasses);
    },
    injectAutoWrapper: function(wrapperFactory) {
      autoGenerateWrapperClass = wrapperFactory;
    }
  };
  function getComponentClassForElement(element) {
    if (typeof element.type === 'function') {
      return element.type;
    }
    var tag = element.type;
    var componentClass = tagToComponentClass[tag];
    if (componentClass == null) {
      tagToComponentClass[tag] = componentClass = autoGenerateWrapperClass(tag);
    }
    return componentClass;
  }
  function createInternalComponent(element) {
    ("production" !== process.env.NODE_ENV ? invariant(genericComponentClass, 'There is no registered component for the tag %s', element.type) : invariant(genericComponentClass));
    return new genericComponentClass(element.type, element.props);
  }
  function createInstanceForText(text) {
    return new textComponentClass(text);
  }
  function isTextComponent(component) {
    return component instanceof textComponentClass;
  }
  var ReactNativeComponent = {
    getComponentClassForElement: getComponentClassForElement,
    createInternalComponent: createInternalComponent,
    createInstanceForText: createInstanceForText,
    isTextComponent: isTextComponent,
    injection: ReactNativeComponentInjection
  };
  module.exports = ReactNativeComponent;
})(require("process"));
