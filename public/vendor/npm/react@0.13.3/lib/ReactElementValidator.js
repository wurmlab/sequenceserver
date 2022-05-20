/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var ReactFragment = require("./ReactFragment");
  var ReactPropTypeLocations = require("./ReactPropTypeLocations");
  var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var ReactNativeComponent = require("./ReactNativeComponent");
  var getIteratorFn = require("./getIteratorFn");
  var invariant = require("./invariant");
  var warning = require("./warning");
  function getDeclarationErrorAddendum() {
    if (ReactCurrentOwner.current) {
      var name = ReactCurrentOwner.current.getName();
      if (name) {
        return ' Check the render method of `' + name + '`.';
      }
    }
    return '';
  }
  var ownerHasKeyUseWarning = {};
  var loggedTypeFailures = {};
  var NUMERIC_PROPERTY_REGEX = /^\d+$/;
  function getName(instance) {
    var publicInstance = instance && instance.getPublicInstance();
    if (!publicInstance) {
      return undefined;
    }
    var constructor = publicInstance.constructor;
    if (!constructor) {
      return undefined;
    }
    return constructor.displayName || constructor.name || undefined;
  }
  function getCurrentOwnerDisplayName() {
    var current = ReactCurrentOwner.current;
    return (current && getName(current) || undefined);
  }
  function validateExplicitKey(element, parentType) {
    if (element._store.validated || element.key != null) {
      return;
    }
    element._store.validated = true;
    warnAndMonitorForKeyUse('Each child in an array or iterator should have a unique "key" prop.', element, parentType);
  }
  function validatePropertyKey(name, element, parentType) {
    if (!NUMERIC_PROPERTY_REGEX.test(name)) {
      return;
    }
    warnAndMonitorForKeyUse('Child objects should have non-numeric keys so ordering is preserved.', element, parentType);
  }
  function warnAndMonitorForKeyUse(message, element, parentType) {
    var ownerName = getCurrentOwnerDisplayName();
    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
    var useName = ownerName || parentName;
    var memoizer = ownerHasKeyUseWarning[message] || ((ownerHasKeyUseWarning[message] = {}));
    if (memoizer.hasOwnProperty(useName)) {
      return;
    }
    memoizer[useName] = true;
    var parentOrOwnerAddendum = ownerName ? (" Check the render method of " + ownerName + ".") : parentName ? (" Check the React.render call using <" + parentName + ">.") : '';
    var childOwnerAddendum = '';
    if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
      var childOwnerName = getName(element._owner);
      childOwnerAddendum = (" It was passed a child from " + childOwnerName + ".");
    }
    ("production" !== process.env.NODE_ENV ? warning(false, message + '%s%s See https://fb.me/react-warning-keys for more information.', parentOrOwnerAddendum, childOwnerAddendum) : null);
  }
  function validateChildKeys(node, parentType) {
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];
        if (ReactElement.isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (ReactElement.isValidElement(node)) {
      node._store.validated = true;
    } else if (node) {
      var iteratorFn = getIteratorFn(node);
      if (iteratorFn) {
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;
          while (!(step = iterator.next()).done) {
            if (ReactElement.isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      } else if (typeof node === 'object') {
        var fragment = ReactFragment.extractIfFragment(node);
        for (var key in fragment) {
          if (fragment.hasOwnProperty(key)) {
            validatePropertyKey(key, fragment[key], parentType);
          }
        }
      }
    }
  }
  function checkPropTypes(componentName, propTypes, props, location) {
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error;
        try {
          ("production" !== process.env.NODE_ENV ? invariant(typeof propTypes[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], propName) : invariant(typeof propTypes[propName] === 'function'));
          error = propTypes[propName](props, propName, componentName, location);
        } catch (ex) {
          error = ex;
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          loggedTypeFailures[error.message] = true;
          var addendum = getDeclarationErrorAddendum(this);
          ("production" !== process.env.NODE_ENV ? warning(false, 'Failed propType: %s%s', error.message, addendum) : null);
        }
      }
    }
  }
  var warnedPropsMutations = {};
  function warnForPropsMutation(propName, element) {
    var type = element.type;
    var elementName = typeof type === 'string' ? type : type.displayName;
    var ownerName = element._owner ? element._owner.getPublicInstance().constructor.displayName : null;
    var warningKey = propName + '|' + elementName + '|' + ownerName;
    if (warnedPropsMutations.hasOwnProperty(warningKey)) {
      return;
    }
    warnedPropsMutations[warningKey] = true;
    var elementInfo = '';
    if (elementName) {
      elementInfo = ' <' + elementName + ' />';
    }
    var ownerInfo = '';
    if (ownerName) {
      ownerInfo = ' The element was created by ' + ownerName + '.';
    }
    ("production" !== process.env.NODE_ENV ? warning(false, 'Don\'t set .props.%s of the React component%s. Instead, specify the ' + 'correct value when initially creating the element or use ' + 'React.cloneElement to make a new element with updated props.%s', propName, elementInfo, ownerInfo) : null);
  }
  function is(a, b) {
    if (a !== a) {
      return b !== b;
    }
    if (a === 0 && b === 0) {
      return 1 / a === 1 / b;
    }
    return a === b;
  }
  function checkAndWarnForMutatedProps(element) {
    if (!element._store) {
      return;
    }
    var originalProps = element._store.originalProps;
    var props = element.props;
    for (var propName in props) {
      if (props.hasOwnProperty(propName)) {
        if (!originalProps.hasOwnProperty(propName) || !is(originalProps[propName], props[propName])) {
          warnForPropsMutation(propName, element);
          originalProps[propName] = props[propName];
        }
      }
    }
  }
  function validatePropTypes(element) {
    if (element.type == null) {
      return;
    }
    var componentClass = ReactNativeComponent.getComponentClassForElement(element);
    var name = componentClass.displayName || componentClass.name;
    if (componentClass.propTypes) {
      checkPropTypes(name, componentClass.propTypes, element.props, ReactPropTypeLocations.prop);
    }
    if (typeof componentClass.getDefaultProps === 'function') {
      ("production" !== process.env.NODE_ENV ? warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : null);
    }
  }
  var ReactElementValidator = {
    checkAndWarnForMutatedProps: checkAndWarnForMutatedProps,
    createElement: function(type, props, children) {
      ("production" !== process.env.NODE_ENV ? warning(type != null, 'React.createElement: type should not be null or undefined. It should ' + 'be a string (for DOM elements) or a ReactClass (for composite ' + 'components).') : null);
      var element = ReactElement.createElement.apply(this, arguments);
      if (element == null) {
        return element;
      }
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], type);
      }
      validatePropTypes(element);
      return element;
    },
    createFactory: function(type) {
      var validatedFactory = ReactElementValidator.createElement.bind(null, type);
      validatedFactory.type = type;
      if ("production" !== process.env.NODE_ENV) {
        try {
          Object.defineProperty(validatedFactory, 'type', {
            enumerable: false,
            get: function() {
              ("production" !== process.env.NODE_ENV ? warning(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.') : null);
              Object.defineProperty(this, 'type', {value: type});
              return type;
            }
          });
        } catch (x) {}
      }
      return validatedFactory;
    },
    cloneElement: function(element, props, children) {
      var newElement = ReactElement.cloneElement.apply(this, arguments);
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], newElement.type);
      }
      validatePropTypes(newElement);
      return newElement;
    }
  };
  module.exports = ReactElementValidator;
})(require("process"));
