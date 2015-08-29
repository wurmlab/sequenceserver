/* */ 
'use strict';
var AutoFocusMixin = require("./AutoFocusMixin");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var ReactUpdates = require("./ReactUpdates");
var assign = require("./Object.assign");
var select = ReactElement.createFactory('select');
function updateOptionsIfPendingUpdateAndMounted() {
  if (this._pendingUpdate) {
    this._pendingUpdate = false;
    var value = LinkedValueUtils.getValue(this);
    if (value != null && this.isMounted()) {
      updateOptions(this, value);
    }
  }
}
function selectValueType(props, propName, componentName) {
  if (props[propName] == null) {
    return null;
  }
  if (props.multiple) {
    if (!Array.isArray(props[propName])) {
      return new Error(("The `" + propName + "` prop supplied to <select> must be an array if ") + ("`multiple` is true."));
    }
  } else {
    if (Array.isArray(props[propName])) {
      return new Error(("The `" + propName + "` prop supplied to <select> must be a scalar ") + ("value if `multiple` is false."));
    }
  }
}
function updateOptions(component, propValue) {
  var selectedValue,
      i,
      l;
  var options = component.getDOMNode().options;
  if (component.props.multiple) {
    selectedValue = {};
    for (i = 0, l = propValue.length; i < l; i++) {
      selectedValue['' + propValue[i]] = true;
    }
    for (i = 0, l = options.length; i < l; i++) {
      var selected = selectedValue.hasOwnProperty(options[i].value);
      if (options[i].selected !== selected) {
        options[i].selected = selected;
      }
    }
  } else {
    selectedValue = '' + propValue;
    for (i = 0, l = options.length; i < l; i++) {
      if (options[i].value === selectedValue) {
        options[i].selected = true;
        return;
      }
    }
    if (options.length) {
      options[0].selected = true;
    }
  }
}
var ReactDOMSelect = ReactClass.createClass({
  displayName: 'ReactDOMSelect',
  tagName: 'SELECT',
  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],
  propTypes: {
    defaultValue: selectValueType,
    value: selectValueType
  },
  render: function() {
    var props = assign({}, this.props);
    props.onChange = this._handleChange;
    props.value = null;
    return select(props, this.props.children);
  },
  componentWillMount: function() {
    this._pendingUpdate = false;
  },
  componentDidMount: function() {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      updateOptions(this, value);
    } else if (this.props.defaultValue != null) {
      updateOptions(this, this.props.defaultValue);
    }
  },
  componentDidUpdate: function(prevProps) {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      this._pendingUpdate = false;
      updateOptions(this, value);
    } else if (!prevProps.multiple !== !this.props.multiple) {
      if (this.props.defaultValue != null) {
        updateOptions(this, this.props.defaultValue);
      } else {
        updateOptions(this, this.props.multiple ? [] : '');
      }
    }
  },
  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      returnValue = onChange.call(this, event);
    }
    this._pendingUpdate = true;
    ReactUpdates.asap(updateOptionsIfPendingUpdateAndMounted, this);
    return returnValue;
  }
});
module.exports = ReactDOMSelect;
