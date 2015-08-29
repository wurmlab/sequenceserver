/* */ 
(function(process) {
  'use strict';
  var AutoFocusMixin = require("./AutoFocusMixin");
  var DOMPropertyOperations = require("./DOMPropertyOperations");
  var LinkedValueUtils = require("./LinkedValueUtils");
  var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
  var ReactClass = require("./ReactClass");
  var ReactElement = require("./ReactElement");
  var ReactUpdates = require("./ReactUpdates");
  var assign = require("./Object.assign");
  var invariant = require("./invariant");
  var warning = require("./warning");
  var textarea = ReactElement.createFactory('textarea');
  function forceUpdateIfMounted() {
    if (this.isMounted()) {
      this.forceUpdate();
    }
  }
  var ReactDOMTextarea = ReactClass.createClass({
    displayName: 'ReactDOMTextarea',
    tagName: 'TEXTAREA',
    mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],
    getInitialState: function() {
      var defaultValue = this.props.defaultValue;
      var children = this.props.children;
      if (children != null) {
        if ("production" !== process.env.NODE_ENV) {
          ("production" !== process.env.NODE_ENV ? warning(false, 'Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.') : null);
        }
        ("production" !== process.env.NODE_ENV ? invariant(defaultValue == null, 'If you supply `defaultValue` on a <textarea>, do not pass children.') : invariant(defaultValue == null));
        if (Array.isArray(children)) {
          ("production" !== process.env.NODE_ENV ? invariant(children.length <= 1, '<textarea> can only have at most one child.') : invariant(children.length <= 1));
          children = children[0];
        }
        defaultValue = '' + children;
      }
      if (defaultValue == null) {
        defaultValue = '';
      }
      var value = LinkedValueUtils.getValue(this);
      return {initialValue: '' + (value != null ? value : defaultValue)};
    },
    render: function() {
      var props = assign({}, this.props);
      ("production" !== process.env.NODE_ENV ? invariant(props.dangerouslySetInnerHTML == null, '`dangerouslySetInnerHTML` does not make sense on <textarea>.') : invariant(props.dangerouslySetInnerHTML == null));
      props.defaultValue = null;
      props.value = null;
      props.onChange = this._handleChange;
      return textarea(props, this.state.initialValue);
    },
    componentDidUpdate: function(prevProps, prevState, prevContext) {
      var value = LinkedValueUtils.getValue(this);
      if (value != null) {
        var rootNode = this.getDOMNode();
        DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
      }
    },
    _handleChange: function(event) {
      var returnValue;
      var onChange = LinkedValueUtils.getOnChange(this);
      if (onChange) {
        returnValue = onChange.call(this, event);
      }
      ReactUpdates.asap(forceUpdateIfMounted, this);
      return returnValue;
    }
  });
  module.exports = ReactDOMTextarea;
})(require("process"));
