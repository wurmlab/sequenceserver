/* */ 
(function(process) {
  'use strict';
  var AutoFocusMixin = require("./AutoFocusMixin");
  var DOMPropertyOperations = require("./DOMPropertyOperations");
  var LinkedValueUtils = require("./LinkedValueUtils");
  var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
  var ReactClass = require("./ReactClass");
  var ReactElement = require("./ReactElement");
  var ReactMount = require("./ReactMount");
  var ReactUpdates = require("./ReactUpdates");
  var assign = require("./Object.assign");
  var invariant = require("./invariant");
  var input = ReactElement.createFactory('input');
  var instancesByReactID = {};
  function forceUpdateIfMounted() {
    if (this.isMounted()) {
      this.forceUpdate();
    }
  }
  var ReactDOMInput = ReactClass.createClass({
    displayName: 'ReactDOMInput',
    tagName: 'INPUT',
    mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],
    getInitialState: function() {
      var defaultValue = this.props.defaultValue;
      return {
        initialChecked: this.props.defaultChecked || false,
        initialValue: defaultValue != null ? defaultValue : null
      };
    },
    render: function() {
      var props = assign({}, this.props);
      props.defaultChecked = null;
      props.defaultValue = null;
      var value = LinkedValueUtils.getValue(this);
      props.value = value != null ? value : this.state.initialValue;
      var checked = LinkedValueUtils.getChecked(this);
      props.checked = checked != null ? checked : this.state.initialChecked;
      props.onChange = this._handleChange;
      return input(props, this.props.children);
    },
    componentDidMount: function() {
      var id = ReactMount.getID(this.getDOMNode());
      instancesByReactID[id] = this;
    },
    componentWillUnmount: function() {
      var rootNode = this.getDOMNode();
      var id = ReactMount.getID(rootNode);
      delete instancesByReactID[id];
    },
    componentDidUpdate: function(prevProps, prevState, prevContext) {
      var rootNode = this.getDOMNode();
      if (this.props.checked != null) {
        DOMPropertyOperations.setValueForProperty(rootNode, 'checked', this.props.checked || false);
      }
      var value = LinkedValueUtils.getValue(this);
      if (value != null) {
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
      var name = this.props.name;
      if (this.props.type === 'radio' && name != null) {
        var rootNode = this.getDOMNode();
        var queryRoot = rootNode;
        while (queryRoot.parentNode) {
          queryRoot = queryRoot.parentNode;
        }
        var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');
        for (var i = 0,
            groupLen = group.length; i < groupLen; i++) {
          var otherNode = group[i];
          if (otherNode === rootNode || otherNode.form !== rootNode.form) {
            continue;
          }
          var otherID = ReactMount.getID(otherNode);
          ("production" !== process.env.NODE_ENV ? invariant(otherID, 'ReactDOMInput: Mixing React and non-React radio inputs with the ' + 'same `name` is not supported.') : invariant(otherID));
          var otherInstance = instancesByReactID[otherID];
          ("production" !== process.env.NODE_ENV ? invariant(otherInstance, 'ReactDOMInput: Unknown radio button ID %s.', otherID) : invariant(otherInstance));
          ReactUpdates.asap(forceUpdateIfMounted, otherInstance);
        }
      }
      return returnValue;
    }
  });
  module.exports = ReactDOMInput;
})(require("process"));
