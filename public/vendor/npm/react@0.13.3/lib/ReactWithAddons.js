/* */ 
(function(process) {
  'use strict';
  var LinkedStateMixin = require("./LinkedStateMixin");
  var React = require("./React");
  var ReactComponentWithPureRenderMixin = require("./ReactComponentWithPureRenderMixin");
  var ReactCSSTransitionGroup = require("./ReactCSSTransitionGroup");
  var ReactFragment = require("./ReactFragment");
  var ReactTransitionGroup = require("./ReactTransitionGroup");
  var ReactUpdates = require("./ReactUpdates");
  var cx = require("./cx");
  var cloneWithProps = require("./cloneWithProps");
  var update = require("./update");
  React.addons = {
    CSSTransitionGroup: ReactCSSTransitionGroup,
    LinkedStateMixin: LinkedStateMixin,
    PureRenderMixin: ReactComponentWithPureRenderMixin,
    TransitionGroup: ReactTransitionGroup,
    batchedUpdates: ReactUpdates.batchedUpdates,
    classSet: cx,
    cloneWithProps: cloneWithProps,
    createFragment: ReactFragment.create,
    update: update
  };
  if ("production" !== process.env.NODE_ENV) {
    React.addons.Perf = require("./ReactDefaultPerf");
    React.addons.TestUtils = require("./ReactTestUtils");
  }
  module.exports = React;
})(require("process"));
