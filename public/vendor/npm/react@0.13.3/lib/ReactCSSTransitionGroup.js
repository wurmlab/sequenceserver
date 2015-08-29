/* */ 
'use strict';
var React = require("./React");
var assign = require("./Object.assign");
var ReactTransitionGroup = React.createFactory(require("./ReactTransitionGroup"));
var ReactCSSTransitionGroupChild = React.createFactory(require("./ReactCSSTransitionGroupChild"));
var ReactCSSTransitionGroup = React.createClass({
  displayName: 'ReactCSSTransitionGroup',
  propTypes: {
    transitionName: React.PropTypes.string.isRequired,
    transitionAppear: React.PropTypes.bool,
    transitionEnter: React.PropTypes.bool,
    transitionLeave: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      transitionAppear: false,
      transitionEnter: true,
      transitionLeave: true
    };
  },
  _wrapChild: function(child) {
    return ReactCSSTransitionGroupChild({
      name: this.props.transitionName,
      appear: this.props.transitionAppear,
      enter: this.props.transitionEnter,
      leave: this.props.transitionLeave
    }, child);
  },
  render: function() {
    return (ReactTransitionGroup(assign({}, this.props, {childFactory: this._wrapChild})));
  }
});
module.exports = ReactCSSTransitionGroup;
