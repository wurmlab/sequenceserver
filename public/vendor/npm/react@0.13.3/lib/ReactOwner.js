/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  var ReactOwner = {
    isValidOwner: function(object) {
      return !!((object && typeof object.attachRef === 'function' && typeof object.detachRef === 'function'));
    },
    addComponentAsRefTo: function(component, ref, owner) {
      ("production" !== process.env.NODE_ENV ? invariant(ReactOwner.isValidOwner(owner), 'addComponentAsRefTo(...): Only a ReactOwner can have refs. This ' + 'usually means that you\'re trying to add a ref to a component that ' + 'doesn\'t have an owner (that is, was not created inside of another ' + 'component\'s `render` method). Try rendering this component inside of ' + 'a new top-level component which will hold the ref.') : invariant(ReactOwner.isValidOwner(owner)));
      owner.attachRef(ref, component);
    },
    removeComponentAsRefFrom: function(component, ref, owner) {
      ("production" !== process.env.NODE_ENV ? invariant(ReactOwner.isValidOwner(owner), 'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. This ' + 'usually means that you\'re trying to remove a ref to a component that ' + 'doesn\'t have an owner (that is, was not created inside of another ' + 'component\'s `render` method). Try rendering this component inside of ' + 'a new top-level component which will hold the ref.') : invariant(ReactOwner.isValidOwner(owner)));
      if (owner.getPublicInstance().refs[ref] === component.getPublicInstance()) {
        owner.detachRef(ref);
      }
    }
  };
  module.exports = ReactOwner;
})(require("process"));
