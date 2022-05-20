/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  function checkMask(value, bitmask) {
    return (value & bitmask) === bitmask;
  }
  var DOMPropertyInjection = {
    MUST_USE_ATTRIBUTE: 0x1,
    MUST_USE_PROPERTY: 0x2,
    HAS_SIDE_EFFECTS: 0x4,
    HAS_BOOLEAN_VALUE: 0x8,
    HAS_NUMERIC_VALUE: 0x10,
    HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
    HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,
    injectDOMPropertyConfig: function(domPropertyConfig) {
      var Properties = domPropertyConfig.Properties || {};
      var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
      var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
      var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};
      if (domPropertyConfig.isCustomAttribute) {
        DOMProperty._isCustomAttributeFunctions.push(domPropertyConfig.isCustomAttribute);
      }
      for (var propName in Properties) {
        ("production" !== process.env.NODE_ENV ? invariant(!DOMProperty.isStandardName.hasOwnProperty(propName), 'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' + '\'%s\' which has already been injected. You may be accidentally ' + 'injecting the same DOM property config twice, or you may be ' + 'injecting two configs that have conflicting property names.', propName) : invariant(!DOMProperty.isStandardName.hasOwnProperty(propName)));
        DOMProperty.isStandardName[propName] = true;
        var lowerCased = propName.toLowerCase();
        DOMProperty.getPossibleStandardName[lowerCased] = propName;
        if (DOMAttributeNames.hasOwnProperty(propName)) {
          var attributeName = DOMAttributeNames[propName];
          DOMProperty.getPossibleStandardName[attributeName] = propName;
          DOMProperty.getAttributeName[propName] = attributeName;
        } else {
          DOMProperty.getAttributeName[propName] = lowerCased;
        }
        DOMProperty.getPropertyName[propName] = DOMPropertyNames.hasOwnProperty(propName) ? DOMPropertyNames[propName] : propName;
        if (DOMMutationMethods.hasOwnProperty(propName)) {
          DOMProperty.getMutationMethod[propName] = DOMMutationMethods[propName];
        } else {
          DOMProperty.getMutationMethod[propName] = null;
        }
        var propConfig = Properties[propName];
        DOMProperty.mustUseAttribute[propName] = checkMask(propConfig, DOMPropertyInjection.MUST_USE_ATTRIBUTE);
        DOMProperty.mustUseProperty[propName] = checkMask(propConfig, DOMPropertyInjection.MUST_USE_PROPERTY);
        DOMProperty.hasSideEffects[propName] = checkMask(propConfig, DOMPropertyInjection.HAS_SIDE_EFFECTS);
        DOMProperty.hasBooleanValue[propName] = checkMask(propConfig, DOMPropertyInjection.HAS_BOOLEAN_VALUE);
        DOMProperty.hasNumericValue[propName] = checkMask(propConfig, DOMPropertyInjection.HAS_NUMERIC_VALUE);
        DOMProperty.hasPositiveNumericValue[propName] = checkMask(propConfig, DOMPropertyInjection.HAS_POSITIVE_NUMERIC_VALUE);
        DOMProperty.hasOverloadedBooleanValue[propName] = checkMask(propConfig, DOMPropertyInjection.HAS_OVERLOADED_BOOLEAN_VALUE);
        ("production" !== process.env.NODE_ENV ? invariant(!DOMProperty.mustUseAttribute[propName] || !DOMProperty.mustUseProperty[propName], 'DOMProperty: Cannot require using both attribute and property: %s', propName) : invariant(!DOMProperty.mustUseAttribute[propName] || !DOMProperty.mustUseProperty[propName]));
        ("production" !== process.env.NODE_ENV ? invariant(DOMProperty.mustUseProperty[propName] || !DOMProperty.hasSideEffects[propName], 'DOMProperty: Properties that have side effects must use property: %s', propName) : invariant(DOMProperty.mustUseProperty[propName] || !DOMProperty.hasSideEffects[propName]));
        ("production" !== process.env.NODE_ENV ? invariant(!!DOMProperty.hasBooleanValue[propName] + !!DOMProperty.hasNumericValue[propName] + !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1, 'DOMProperty: Value can be one of boolean, overloaded boolean, or ' + 'numeric value, but not a combination: %s', propName) : invariant(!!DOMProperty.hasBooleanValue[propName] + !!DOMProperty.hasNumericValue[propName] + !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1));
      }
    }
  };
  var defaultValueCache = {};
  var DOMProperty = {
    ID_ATTRIBUTE_NAME: 'data-reactid',
    isStandardName: {},
    getPossibleStandardName: {},
    getAttributeName: {},
    getPropertyName: {},
    getMutationMethod: {},
    mustUseAttribute: {},
    mustUseProperty: {},
    hasSideEffects: {},
    hasBooleanValue: {},
    hasNumericValue: {},
    hasPositiveNumericValue: {},
    hasOverloadedBooleanValue: {},
    _isCustomAttributeFunctions: [],
    isCustomAttribute: function(attributeName) {
      for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
        var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
        if (isCustomAttributeFn(attributeName)) {
          return true;
        }
      }
      return false;
    },
    getDefaultValueForProperty: function(nodeName, prop) {
      var nodeDefaults = defaultValueCache[nodeName];
      var testElement;
      if (!nodeDefaults) {
        defaultValueCache[nodeName] = nodeDefaults = {};
      }
      if (!(prop in nodeDefaults)) {
        testElement = document.createElement(nodeName);
        nodeDefaults[prop] = testElement[prop];
      }
      return nodeDefaults[prop];
    },
    injection: DOMPropertyInjection
  };
  module.exports = DOMProperty;
})(require("process"));
