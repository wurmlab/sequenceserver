/* */ 
'use strict';
var ReactReconciler = require("./ReactReconciler");
var flattenChildren = require("./flattenChildren");
var instantiateReactComponent = require("./instantiateReactComponent");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var ReactChildReconciler = {
  instantiateChildren: function(nestedChildNodes, transaction, context) {
    var children = flattenChildren(nestedChildNodes);
    for (var name in children) {
      if (children.hasOwnProperty(name)) {
        var child = children[name];
        var childInstance = instantiateReactComponent(child, null);
        children[name] = childInstance;
      }
    }
    return children;
  },
  updateChildren: function(prevChildren, nextNestedChildNodes, transaction, context) {
    var nextChildren = flattenChildren(nextNestedChildNodes);
    if (!nextChildren && !prevChildren) {
      return null;
    }
    var name;
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      var prevChild = prevChildren && prevChildren[name];
      var prevElement = prevChild && prevChild._currentElement;
      var nextElement = nextChildren[name];
      if (shouldUpdateReactComponent(prevElement, nextElement)) {
        ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
        nextChildren[name] = prevChild;
      } else {
        if (prevChild) {
          ReactReconciler.unmountComponent(prevChild, name);
        }
        var nextChildInstance = instantiateReactComponent(nextElement, null);
        nextChildren[name] = nextChildInstance;
      }
    }
    for (name in prevChildren) {
      if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
        ReactReconciler.unmountComponent(prevChildren[name]);
      }
    }
    return nextChildren;
  },
  unmountChildren: function(renderedChildren) {
    for (var name in renderedChildren) {
      var renderedChild = renderedChildren[name];
      ReactReconciler.unmountComponent(renderedChild);
    }
  }
};
module.exports = ReactChildReconciler;
