/* */ 
(function(process) {
  'use strict';
  var ReactOwner = require("./ReactOwner");
  var ReactRef = {};
  function attachRef(ref, component, owner) {
    if (typeof ref === 'function') {
      ref(component.getPublicInstance());
    } else {
      ReactOwner.addComponentAsRefTo(component, ref, owner);
    }
  }
  function detachRef(ref, component, owner) {
    if (typeof ref === 'function') {
      ref(null);
    } else {
      ReactOwner.removeComponentAsRefFrom(component, ref, owner);
    }
  }
  ReactRef.attachRefs = function(instance, element) {
    var ref = element.ref;
    if (ref != null) {
      attachRef(ref, instance, element._owner);
    }
  };
  ReactRef.shouldUpdateRefs = function(prevElement, nextElement) {
    return (nextElement._owner !== prevElement._owner || nextElement.ref !== prevElement.ref);
  };
  ReactRef.detachRefs = function(instance, element) {
    var ref = element.ref;
    if (ref != null) {
      detachRef(ref, instance, element._owner);
    }
  };
  module.exports = ReactRef;
})(require("process"));
