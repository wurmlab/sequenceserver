/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV !== "production") {
    (function() {
      'use strict';
      var React = require('react');
      var _assign = require('object-assign');
      function formatProdErrorMessage(code) {
        var url = 'https://reactjs.org/docs/error-decoder.html?invariant=' + code;
        for (var i = 1; i < arguments.length; i++) {
          url += '&args[]=' + encodeURIComponent(arguments[i]);
        }
        return "Minified React error #" + code + "; visit " + url + " for the full message or " + 'use the non-minified dev environment for full errors and additional ' + 'helpful warnings.';
      }
      var ReactVersion = '17.0.2';
      var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      function warn(format) {
        {
          for (var _len = arguments.length,
              args = new Array(_len > 1 ? _len - 1 : 0),
              _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          printWarning('warn', format, args);
        }
      }
      function error(format) {
        {
          for (var _len2 = arguments.length,
              args = new Array(_len2 > 1 ? _len2 - 1 : 0),
              _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }
          printWarning('error', format, args);
        }
      }
      function printWarning(level, format, args) {
        {
          var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
          var stack = ReactDebugCurrentFrame.getStackAddendum();
          if (stack !== '') {
            format += '%s';
            args = args.concat([stack]);
          }
          var argsWithFormat = args.map(function(item) {
            return '' + item;
          });
          argsWithFormat.unshift('Warning: ' + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);
        }
      }
      var REACT_ELEMENT_TYPE = 0xeac7;
      var REACT_PORTAL_TYPE = 0xeaca;
      var REACT_FRAGMENT_TYPE = 0xeacb;
      var REACT_STRICT_MODE_TYPE = 0xeacc;
      var REACT_PROFILER_TYPE = 0xead2;
      var REACT_PROVIDER_TYPE = 0xeacd;
      var REACT_CONTEXT_TYPE = 0xeace;
      var REACT_FORWARD_REF_TYPE = 0xead0;
      var REACT_SUSPENSE_TYPE = 0xead1;
      var REACT_SUSPENSE_LIST_TYPE = 0xead8;
      var REACT_MEMO_TYPE = 0xead3;
      var REACT_LAZY_TYPE = 0xead4;
      var REACT_BLOCK_TYPE = 0xead9;
      var REACT_SERVER_BLOCK_TYPE = 0xeada;
      var REACT_FUNDAMENTAL_TYPE = 0xead5;
      var REACT_SCOPE_TYPE = 0xead7;
      var REACT_OPAQUE_ID_TYPE = 0xeae0;
      var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
      var REACT_OFFSCREEN_TYPE = 0xeae2;
      var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;
      if (typeof Symbol === 'function' && Symbol.for) {
        var symbolFor = Symbol.for;
        REACT_ELEMENT_TYPE = symbolFor('react.element');
        REACT_PORTAL_TYPE = symbolFor('react.portal');
        REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
        REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
        REACT_PROFILER_TYPE = symbolFor('react.profiler');
        REACT_PROVIDER_TYPE = symbolFor('react.provider');
        REACT_CONTEXT_TYPE = symbolFor('react.context');
        REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
        REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
        REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
        REACT_MEMO_TYPE = symbolFor('react.memo');
        REACT_LAZY_TYPE = symbolFor('react.lazy');
        REACT_BLOCK_TYPE = symbolFor('react.block');
        REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
        REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
        REACT_SCOPE_TYPE = symbolFor('react.scope');
        REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
        REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
        REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
        REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
      }
      function getWrappedName(outerType, innerType, wrapperName) {
        var functionName = innerType.displayName || innerType.name || '';
        return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
      }
      function getContextName(type) {
        return type.displayName || 'Context';
      }
      function getComponentName(type) {
        if (type == null) {
          return null;
        }
        {
          if (typeof type.tag === 'number') {
            error('Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
          }
        }
        if (typeof type === 'function') {
          return type.displayName || type.name || null;
        }
        if (typeof type === 'string') {
          return type;
        }
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return 'Fragment';
          case REACT_PORTAL_TYPE:
            return 'Portal';
          case REACT_PROFILER_TYPE:
            return 'Profiler';
          case REACT_STRICT_MODE_TYPE:
            return 'StrictMode';
          case REACT_SUSPENSE_TYPE:
            return 'Suspense';
          case REACT_SUSPENSE_LIST_TYPE:
            return 'SuspenseList';
        }
        if (typeof type === 'object') {
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              var context = type;
              return getContextName(context) + '.Consumer';
            case REACT_PROVIDER_TYPE:
              var provider = type;
              return getContextName(provider._context) + '.Provider';
            case REACT_FORWARD_REF_TYPE:
              return getWrappedName(type, type.render, 'ForwardRef');
            case REACT_MEMO_TYPE:
              return getComponentName(type.type);
            case REACT_BLOCK_TYPE:
              return getComponentName(type._render);
            case REACT_LAZY_TYPE:
              {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentName(init(payload));
                } catch (x) {
                  return null;
                }
              }
          }
        }
        return null;
      }
      var enableSuspenseServerRenderer = false;
      var disabledDepth = 0;
      var prevLog;
      var prevInfo;
      var prevWarn;
      var prevError;
      var prevGroup;
      var prevGroupCollapsed;
      var prevGroupEnd;
      function disabledLog() {}
      disabledLog.__reactDisabledLog = true;
      function disableLogs() {
        {
          if (disabledDepth === 0) {
            prevLog = console.log;
            prevInfo = console.info;
            prevWarn = console.warn;
            prevError = console.error;
            prevGroup = console.group;
            prevGroupCollapsed = console.groupCollapsed;
            prevGroupEnd = console.groupEnd;
            var props = {
              configurable: true,
              enumerable: true,
              value: disabledLog,
              writable: true
            };
            Object.defineProperties(console, {
              info: props,
              log: props,
              warn: props,
              error: props,
              group: props,
              groupCollapsed: props,
              groupEnd: props
            });
          }
          disabledDepth++;
        }
      }
      function reenableLogs() {
        {
          disabledDepth--;
          if (disabledDepth === 0) {
            var props = {
              configurable: true,
              enumerable: true,
              writable: true
            };
            Object.defineProperties(console, {
              log: _assign({}, props, {value: prevLog}),
              info: _assign({}, props, {value: prevInfo}),
              warn: _assign({}, props, {value: prevWarn}),
              error: _assign({}, props, {value: prevError}),
              group: _assign({}, props, {value: prevGroup}),
              groupCollapsed: _assign({}, props, {value: prevGroupCollapsed}),
              groupEnd: _assign({}, props, {value: prevGroupEnd})
            });
          }
          if (disabledDepth < 0) {
            error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
          }
        }
      }
      var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
      var prefix;
      function describeBuiltInComponentFrame(name, source, ownerFn) {
        {
          if (prefix === undefined) {
            try {
              throw Error();
            } catch (x) {
              var match = x.stack.trim().match(/\n( *(at )?)/);
              prefix = match && match[1] || '';
            }
          }
          return '\n' + prefix + name;
        }
      }
      var reentry = false;
      var componentFrameCache;
      {
        var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
        componentFrameCache = new PossiblyWeakMap();
      }
      function describeNativeComponentFrame(fn, construct) {
        if (!fn || reentry) {
          return '';
        }
        {
          var frame = componentFrameCache.get(fn);
          if (frame !== undefined) {
            return frame;
          }
        }
        var control;
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = undefined;
        var previousDispatcher;
        {
          previousDispatcher = ReactCurrentDispatcher.current;
          ReactCurrentDispatcher.current = null;
          disableLogs();
        }
        try {
          if (construct) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, 'props', {set: function() {
                throw Error();
              }});
            if (typeof Reflect === 'object' && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x) {
                control = x;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x) {
              control = x;
            }
            fn();
          }
        } catch (sample) {
          if (sample && control && typeof sample.stack === 'string') {
            var sampleLines = sample.stack.split('\n');
            var controlLines = control.stack.split('\n');
            var s = sampleLines.length - 1;
            var c = controlLines.length - 1;
            while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
              c--;
            }
            for (; s >= 1 && c >= 0; s--, c--) {
              if (sampleLines[s] !== controlLines[c]) {
                if (s !== 1 || c !== 1) {
                  do {
                    s--;
                    c--;
                    if (c < 0 || sampleLines[s] !== controlLines[c]) {
                      var _frame = '\n' + sampleLines[s].replace(' at new ', ' at ');
                      {
                        if (typeof fn === 'function') {
                          componentFrameCache.set(fn, _frame);
                        }
                      }
                      return _frame;
                    }
                  } while (s >= 1 && c >= 0);
                }
                break;
              }
            }
          }
        } finally {
          reentry = false;
          {
            ReactCurrentDispatcher.current = previousDispatcher;
            reenableLogs();
          }
          Error.prepareStackTrace = previousPrepareStackTrace;
        }
        var name = fn ? fn.displayName || fn.name : '';
        var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';
        {
          if (typeof fn === 'function') {
            componentFrameCache.set(fn, syntheticFrame);
          }
        }
        return syntheticFrame;
      }
      function describeFunctionComponentFrame(fn, source, ownerFn) {
        {
          return describeNativeComponentFrame(fn, false);
        }
      }
      function shouldConstruct(Component) {
        var prototype = Component.prototype;
        return !!(prototype && prototype.isReactComponent);
      }
      function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
        if (type == null) {
          return '';
        }
        if (typeof type === 'function') {
          {
            return describeNativeComponentFrame(type, shouldConstruct(type));
          }
        }
        if (typeof type === 'string') {
          return describeBuiltInComponentFrame(type);
        }
        switch (type) {
          case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame('Suspense');
          case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame('SuspenseList');
        }
        if (typeof type === 'object') {
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              return describeFunctionComponentFrame(type.render);
            case REACT_MEMO_TYPE:
              return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
            case REACT_BLOCK_TYPE:
              return describeFunctionComponentFrame(type._render);
            case REACT_LAZY_TYPE:
              {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {}
              }
          }
        }
        return '';
      }
      var loggedTypeFailures = {};
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame.setExtraStackFrame(null);
          }
        }
      }
      function checkPropTypes(typeSpecs, values, location, componentName, element) {
        {
          var has = Function.call.bind(Object.prototype.hasOwnProperty);
          for (var typeSpecName in typeSpecs) {
            if (has(typeSpecs, typeSpecName)) {
              var error$1 = void 0;
              try {
                if (typeof typeSpecs[typeSpecName] !== 'function') {
                  var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
                  err.name = 'Invariant Violation';
                  throw err;
                }
                error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
              } catch (ex) {
                error$1 = ex;
              }
              if (error$1 && !(error$1 instanceof Error)) {
                setCurrentlyValidatingElement(element);
                error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);
                setCurrentlyValidatingElement(null);
              }
              if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                loggedTypeFailures[error$1.message] = true;
                setCurrentlyValidatingElement(element);
                error('Failed %s type: %s', location, error$1.message);
                setCurrentlyValidatingElement(null);
              }
            }
          }
        }
      }
      var didWarnAboutInvalidateContextType;
      {
        didWarnAboutInvalidateContextType = new Set();
      }
      var emptyObject = {};
      {
        Object.freeze(emptyObject);
      }
      function maskContext(type, context) {
        var contextTypes = type.contextTypes;
        if (!contextTypes) {
          return emptyObject;
        }
        var maskedContext = {};
        for (var contextName in contextTypes) {
          maskedContext[contextName] = context[contextName];
        }
        return maskedContext;
      }
      function checkContextTypes(typeSpecs, values, location) {
        {
          checkPropTypes(typeSpecs, values, location, 'Component');
        }
      }
      function validateContextBounds(context, threadID) {
        for (var i = context._threadCount | 0; i <= threadID; i++) {
          context[i] = context._currentValue2;
          context._threadCount = i + 1;
        }
      }
      function processContext(type, context, threadID, isClass) {
        if (isClass) {
          var contextType = type.contextType;
          {
            if ('contextType' in type) {
              var isValid = contextType === null || contextType !== undefined && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === undefined;
              if (!isValid && !didWarnAboutInvalidateContextType.has(type)) {
                didWarnAboutInvalidateContextType.add(type);
                var addendum = '';
                if (contextType === undefined) {
                  addendum = ' However, it is set to undefined. ' + 'This can be caused by a typo or by mixing up named and default imports. ' + 'This can also happen due to a circular dependency, so ' + 'try moving the createContext() call to a separate file.';
                } else if (typeof contextType !== 'object') {
                  addendum = ' However, it is set to a ' + typeof contextType + '.';
                } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                  addendum = ' Did you accidentally pass the Context.Provider instead?';
                } else if (contextType._context !== undefined) {
                  addendum = ' Did you accidentally pass the Context.Consumer instead?';
                } else {
                  addendum = ' However, it is set to an object with keys {' + Object.keys(contextType).join(', ') + '}.';
                }
                error('%s defines an invalid contextType. ' + 'contextType should point to the Context object returned by React.createContext().%s', getComponentName(type) || 'Component', addendum);
              }
            }
          }
          if (typeof contextType === 'object' && contextType !== null) {
            validateContextBounds(contextType, threadID);
            return contextType[threadID];
          }
          {
            var maskedContext = maskContext(type, context);
            {
              if (type.contextTypes) {
                checkContextTypes(type.contextTypes, maskedContext, 'context');
              }
            }
            return maskedContext;
          }
        } else {
          {
            var _maskedContext = maskContext(type, context);
            {
              if (type.contextTypes) {
                checkContextTypes(type.contextTypes, _maskedContext, 'context');
              }
            }
            return _maskedContext;
          }
        }
      }
      var nextAvailableThreadIDs = new Uint16Array(16);
      for (var i = 0; i < 15; i++) {
        nextAvailableThreadIDs[i] = i + 1;
      }
      nextAvailableThreadIDs[15] = 0;
      function growThreadCountAndReturnNextAvailable() {
        var oldArray = nextAvailableThreadIDs;
        var oldSize = oldArray.length;
        var newSize = oldSize * 2;
        if (!(newSize <= 0x10000)) {
          {
            throw Error("Maximum number of concurrent React renderers exceeded. This can happen if you are not properly destroying the Readable provided by React. Ensure that you call .destroy() on it if you no longer want to read from it, and did not read to the end. If you use .pipe() this should be automatic.");
          }
        }
        var newArray = new Uint16Array(newSize);
        newArray.set(oldArray);
        nextAvailableThreadIDs = newArray;
        nextAvailableThreadIDs[0] = oldSize + 1;
        for (var _i = oldSize; _i < newSize - 1; _i++) {
          nextAvailableThreadIDs[_i] = _i + 1;
        }
        nextAvailableThreadIDs[newSize - 1] = 0;
        return oldSize;
      }
      function allocThreadID() {
        var nextID = nextAvailableThreadIDs[0];
        if (nextID === 0) {
          return growThreadCountAndReturnNextAvailable();
        }
        nextAvailableThreadIDs[0] = nextAvailableThreadIDs[nextID];
        return nextID;
      }
      function freeThreadID(id) {
        nextAvailableThreadIDs[id] = nextAvailableThreadIDs[0];
        nextAvailableThreadIDs[0] = id;
      }
      var RESERVED = 0;
      var STRING = 1;
      var BOOLEANISH_STRING = 2;
      var BOOLEAN = 3;
      var OVERLOADED_BOOLEAN = 4;
      var NUMERIC = 5;
      var POSITIVE_NUMERIC = 6;
      var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
      var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
      var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
      var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var illegalAttributeNameCache = {};
      var validatedAttributeNameCache = {};
      function isAttributeNameSafe(attributeName) {
        if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
          return true;
        }
        if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
          return false;
        }
        if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
          validatedAttributeNameCache[attributeName] = true;
          return true;
        }
        illegalAttributeNameCache[attributeName] = true;
        {
          error('Invalid attribute name: `%s`', attributeName);
        }
        return false;
      }
      function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
        if (propertyInfo !== null) {
          return propertyInfo.type === RESERVED;
        }
        if (isCustomComponentTag) {
          return false;
        }
        if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
          return true;
        }
        return false;
      }
      function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
        if (propertyInfo !== null && propertyInfo.type === RESERVED) {
          return false;
        }
        switch (typeof value) {
          case 'function':
          case 'symbol':
            return true;
          case 'boolean':
            {
              if (isCustomComponentTag) {
                return false;
              }
              if (propertyInfo !== null) {
                return !propertyInfo.acceptsBooleans;
              } else {
                var prefix = name.toLowerCase().slice(0, 5);
                return prefix !== 'data-' && prefix !== 'aria-';
              }
            }
          default:
            return false;
        }
      }
      function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
        if (value === null || typeof value === 'undefined') {
          return true;
        }
        if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag)) {
          return true;
        }
        if (isCustomComponentTag) {
          return false;
        }
        if (propertyInfo !== null) {
          switch (propertyInfo.type) {
            case BOOLEAN:
              return !value;
            case OVERLOADED_BOOLEAN:
              return value === false;
            case NUMERIC:
              return isNaN(value);
            case POSITIVE_NUMERIC:
              return isNaN(value) || value < 1;
          }
        }
        return false;
      }
      function getPropertyInfo(name) {
        return properties.hasOwnProperty(name) ? properties[name] : null;
      }
      function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL, removeEmptyString) {
        this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
        this.attributeName = attributeName;
        this.attributeNamespace = attributeNamespace;
        this.mustUseProperty = mustUseProperty;
        this.propertyName = name;
        this.type = type;
        this.sanitizeURL = sanitizeURL;
        this.removeEmptyString = removeEmptyString;
      }
      var properties = {};
      var reservedProps = ['children', 'dangerouslySetInnerHTML', 'defaultValue', 'defaultChecked', 'innerHTML', 'suppressContentEditableWarning', 'suppressHydrationWarning', 'style'];
      reservedProps.forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, RESERVED, false, name, null, false, false);
      });
      [['acceptCharset', 'accept-charset'], ['className', 'class'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv']].forEach(function(_ref) {
        var name = _ref[0],
            attributeName = _ref[1];
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false, false);
      });
      ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name.toLowerCase(), null, false, false);
      });
      ['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name, null, false, false);
      });
      ['allowFullScreen', 'async', 'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'disablePictureInPicture', 'disableRemotePlayback', 'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed', 'scoped', 'seamless', 'itemScope'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, name.toLowerCase(), null, false, false);
      });
      ['checked', 'multiple', 'muted', 'selected'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, name, null, false, false);
      });
      ['capture', 'download'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, name, null, false, false);
      });
      ['cols', 'rows', 'size', 'span'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, name, null, false, false);
      });
      ['rowSpan', 'start'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, NUMERIC, false, name.toLowerCase(), null, false, false);
      });
      var CAMELIZE = /[\-\:]([a-z])/g;
      var capitalize = function(token) {
        return token[1].toUpperCase();
      };
      ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'xmlns:xlink', 'x-height'].forEach(function(attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false, false);
      });
      ['xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type'].forEach(function(attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, 'http://www.w3.org/1999/xlink', false, false);
      });
      ['xml:base', 'xml:lang', 'xml:space'].forEach(function(attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, 'http://www.w3.org/XML/1998/namespace', false, false);
      });
      ['tabIndex', 'crossOrigin'].forEach(function(attributeName) {
        properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, false, false);
      });
      var xlinkHref = 'xlinkHref';
      properties[xlinkHref] = new PropertyInfoRecord('xlinkHref', STRING, false, 'xlink:href', 'http://www.w3.org/1999/xlink', true, false);
      ['src', 'href', 'action', 'formAction'].forEach(function(attributeName) {
        properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, true, true);
      });
      var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
      var didWarn = false;
      function sanitizeURL(url) {
        {
          if (!didWarn && isJavaScriptProtocol.test(url)) {
            didWarn = true;
            error('A future version of React will block javascript: URLs as a security precaution. ' + 'Use event handlers instead if you can. If you need to generate unsafe HTML try ' + 'using dangerouslySetInnerHTML instead. React was passed %s.', JSON.stringify(url));
          }
        }
      }
      var matchHtmlRegExp = /["'&<>]/;
      function escapeHtml(string) {
        var str = '' + string;
        var match = matchHtmlRegExp.exec(str);
        if (!match) {
          return str;
        }
        var escape;
        var html = '';
        var index;
        var lastIndex = 0;
        for (index = match.index; index < str.length; index++) {
          switch (str.charCodeAt(index)) {
            case 34:
              escape = '&quot;';
              break;
            case 38:
              escape = '&amp;';
              break;
            case 39:
              escape = '&#x27;';
              break;
            case 60:
              escape = '&lt;';
              break;
            case 62:
              escape = '&gt;';
              break;
            default:
              continue;
          }
          if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
          }
          lastIndex = index + 1;
          html += escape;
        }
        return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
      }
      function escapeTextForBrowser(text) {
        if (typeof text === 'boolean' || typeof text === 'number') {
          return '' + text;
        }
        return escapeHtml(text);
      }
      function quoteAttributeValueForBrowser(value) {
        return '"' + escapeTextForBrowser(value) + '"';
      }
      function createMarkupForRoot() {
        return ROOT_ATTRIBUTE_NAME + '=""';
      }
      function createMarkupForProperty(name, value) {
        var propertyInfo = getPropertyInfo(name);
        if (name !== 'style' && shouldIgnoreAttribute(name, propertyInfo, false)) {
          return '';
        }
        if (shouldRemoveAttribute(name, value, propertyInfo, false)) {
          return '';
        }
        if (propertyInfo !== null) {
          var attributeName = propertyInfo.attributeName;
          var type = propertyInfo.type;
          if (type === BOOLEAN || type === OVERLOADED_BOOLEAN && value === true) {
            return attributeName + '=""';
          } else {
            if (propertyInfo.sanitizeURL) {
              value = '' + value;
              sanitizeURL(value);
            }
            return attributeName + '=' + quoteAttributeValueForBrowser(value);
          }
        } else if (isAttributeNameSafe(name)) {
          return name + '=' + quoteAttributeValueForBrowser(value);
        }
        return '';
      }
      function createMarkupForCustomAttribute(name, value) {
        if (!isAttributeNameSafe(name) || value == null) {
          return '';
        }
        return name + '=' + quoteAttributeValueForBrowser(value);
      }
      function is(x, y) {
        return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        ;
      }
      var objectIs = typeof Object.is === 'function' ? Object.is : is;
      var currentlyRenderingComponent = null;
      var firstWorkInProgressHook = null;
      var workInProgressHook = null;
      var isReRender = false;
      var didScheduleRenderPhaseUpdate = false;
      var renderPhaseUpdates = null;
      var numberOfReRenders = 0;
      var RE_RENDER_LIMIT = 25;
      var isInHookUserCodeInDev = false;
      var currentHookNameInDev;
      function resolveCurrentlyRenderingComponent() {
        if (!(currentlyRenderingComponent !== null)) {
          {
            throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
          }
        }
        {
          if (isInHookUserCodeInDev) {
            error('Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. ' + 'You can only call Hooks at the top level of your React function. ' + 'For more information, see ' + 'https://reactjs.org/link/rules-of-hooks');
          }
        }
        return currentlyRenderingComponent;
      }
      function areHookInputsEqual(nextDeps, prevDeps) {
        if (prevDeps === null) {
          {
            error('%s received a final argument during this render, but not during ' + 'the previous render. Even though the final argument is optional, ' + 'its type cannot change between renders.', currentHookNameInDev);
          }
          return false;
        }
        {
          if (nextDeps.length !== prevDeps.length) {
            error('The final argument passed to %s changed size between renders. The ' + 'order and size of this array must remain constant.\n\n' + 'Previous: %s\n' + 'Incoming: %s', currentHookNameInDev, "[" + nextDeps.join(', ') + "]", "[" + prevDeps.join(', ') + "]");
          }
        }
        for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
          if (objectIs(nextDeps[i], prevDeps[i])) {
            continue;
          }
          return false;
        }
        return true;
      }
      function createHook() {
        if (numberOfReRenders > 0) {
          {
            {
              throw Error("Rendered more hooks than during the previous render");
            }
          }
        }
        return {
          memoizedState: null,
          queue: null,
          next: null
        };
      }
      function createWorkInProgressHook() {
        if (workInProgressHook === null) {
          if (firstWorkInProgressHook === null) {
            isReRender = false;
            firstWorkInProgressHook = workInProgressHook = createHook();
          } else {
            isReRender = true;
            workInProgressHook = firstWorkInProgressHook;
          }
        } else {
          if (workInProgressHook.next === null) {
            isReRender = false;
            workInProgressHook = workInProgressHook.next = createHook();
          } else {
            isReRender = true;
            workInProgressHook = workInProgressHook.next;
          }
        }
        return workInProgressHook;
      }
      function prepareToUseHooks(componentIdentity) {
        currentlyRenderingComponent = componentIdentity;
        {
          isInHookUserCodeInDev = false;
        }
      }
      function finishHooks(Component, props, children, refOrContext) {
        while (didScheduleRenderPhaseUpdate) {
          didScheduleRenderPhaseUpdate = false;
          numberOfReRenders += 1;
          workInProgressHook = null;
          children = Component(props, refOrContext);
        }
        resetHooksState();
        return children;
      }
      function resetHooksState() {
        {
          isInHookUserCodeInDev = false;
        }
        currentlyRenderingComponent = null;
        didScheduleRenderPhaseUpdate = false;
        firstWorkInProgressHook = null;
        numberOfReRenders = 0;
        renderPhaseUpdates = null;
        workInProgressHook = null;
      }
      function readContext(context, observedBits) {
        var threadID = currentPartialRenderer.threadID;
        validateContextBounds(context, threadID);
        {
          if (isInHookUserCodeInDev) {
            error('Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().');
          }
        }
        return context[threadID];
      }
      function useContext(context, observedBits) {
        {
          currentHookNameInDev = 'useContext';
        }
        resolveCurrentlyRenderingComponent();
        var threadID = currentPartialRenderer.threadID;
        validateContextBounds(context, threadID);
        return context[threadID];
      }
      function basicStateReducer(state, action) {
        return typeof action === 'function' ? action(state) : action;
      }
      function useState(initialState) {
        {
          currentHookNameInDev = 'useState';
        }
        return useReducer(basicStateReducer, initialState);
      }
      function useReducer(reducer, initialArg, init) {
        {
          if (reducer !== basicStateReducer) {
            currentHookNameInDev = 'useReducer';
          }
        }
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        if (isReRender) {
          var queue = workInProgressHook.queue;
          var dispatch = queue.dispatch;
          if (renderPhaseUpdates !== null) {
            var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
            if (firstRenderPhaseUpdate !== undefined) {
              renderPhaseUpdates.delete(queue);
              var newState = workInProgressHook.memoizedState;
              var update = firstRenderPhaseUpdate;
              do {
                var action = update.action;
                {
                  isInHookUserCodeInDev = true;
                }
                newState = reducer(newState, action);
                {
                  isInHookUserCodeInDev = false;
                }
                update = update.next;
              } while (update !== null);
              workInProgressHook.memoizedState = newState;
              return [newState, dispatch];
            }
          }
          return [workInProgressHook.memoizedState, dispatch];
        } else {
          {
            isInHookUserCodeInDev = true;
          }
          var initialState;
          if (reducer === basicStateReducer) {
            initialState = typeof initialArg === 'function' ? initialArg() : initialArg;
          } else {
            initialState = init !== undefined ? init(initialArg) : initialArg;
          }
          {
            isInHookUserCodeInDev = false;
          }
          workInProgressHook.memoizedState = initialState;
          var _queue = workInProgressHook.queue = {
            last: null,
            dispatch: null
          };
          var _dispatch = _queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, _queue);
          return [workInProgressHook.memoizedState, _dispatch];
        }
      }
      function useMemo(nextCreate, deps) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        if (workInProgressHook !== null) {
          var prevState = workInProgressHook.memoizedState;
          if (prevState !== null) {
            if (nextDeps !== null) {
              var prevDeps = prevState[1];
              if (areHookInputsEqual(nextDeps, prevDeps)) {
                return prevState[0];
              }
            }
          }
        }
        {
          isInHookUserCodeInDev = true;
        }
        var nextValue = nextCreate();
        {
          isInHookUserCodeInDev = false;
        }
        workInProgressHook.memoizedState = [nextValue, nextDeps];
        return nextValue;
      }
      function useRef(initialValue) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var previousRef = workInProgressHook.memoizedState;
        if (previousRef === null) {
          var ref = {current: initialValue};
          {
            Object.seal(ref);
          }
          workInProgressHook.memoizedState = ref;
          return ref;
        } else {
          return previousRef;
        }
      }
      function useLayoutEffect(create, inputs) {
        {
          currentHookNameInDev = 'useLayoutEffect';
          error('useLayoutEffect does nothing on the server, because its effect cannot ' + "be encoded into the server renderer's output format. This will lead " + 'to a mismatch between the initial, non-hydrated UI and the intended ' + 'UI. To avoid this, useLayoutEffect should only be used in ' + 'components that render exclusively on the client. ' + 'See https://reactjs.org/link/uselayouteffect-ssr for common fixes.');
        }
      }
      function dispatchAction(componentIdentity, queue, action) {
        if (!(numberOfReRenders < RE_RENDER_LIMIT)) {
          {
            throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          }
        }
        if (componentIdentity === currentlyRenderingComponent) {
          didScheduleRenderPhaseUpdate = true;
          var update = {
            action: action,
            next: null
          };
          if (renderPhaseUpdates === null) {
            renderPhaseUpdates = new Map();
          }
          var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
          if (firstRenderPhaseUpdate === undefined) {
            renderPhaseUpdates.set(queue, update);
          } else {
            var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
            while (lastRenderPhaseUpdate.next !== null) {
              lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
            }
            lastRenderPhaseUpdate.next = update;
          }
        }
      }
      function useCallback(callback, deps) {
        return useMemo(function() {
          return callback;
        }, deps);
      }
      function useMutableSource(source, getSnapshot, subscribe) {
        resolveCurrentlyRenderingComponent();
        return getSnapshot(source._source);
      }
      function useDeferredValue(value) {
        resolveCurrentlyRenderingComponent();
        return value;
      }
      function useTransition() {
        resolveCurrentlyRenderingComponent();
        var startTransition = function(callback) {
          callback();
        };
        return [startTransition, false];
      }
      function useOpaqueIdentifier() {
        return (currentPartialRenderer.identifierPrefix || '') + 'R:' + (currentPartialRenderer.uniqueID++).toString(36);
      }
      function noop() {}
      var currentPartialRenderer = null;
      function setCurrentPartialRenderer(renderer) {
        currentPartialRenderer = renderer;
      }
      var Dispatcher = {
        readContext: readContext,
        useContext: useContext,
        useMemo: useMemo,
        useReducer: useReducer,
        useRef: useRef,
        useState: useState,
        useLayoutEffect: useLayoutEffect,
        useCallback: useCallback,
        useImperativeHandle: noop,
        useEffect: noop,
        useDebugValue: noop,
        useDeferredValue: useDeferredValue,
        useTransition: useTransition,
        useOpaqueIdentifier: useOpaqueIdentifier,
        useMutableSource: useMutableSource
      };
      var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
      var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
      var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
      var Namespaces = {
        html: HTML_NAMESPACE,
        mathml: MATH_NAMESPACE,
        svg: SVG_NAMESPACE
      };
      function getIntrinsicNamespace(type) {
        switch (type) {
          case 'svg':
            return SVG_NAMESPACE;
          case 'math':
            return MATH_NAMESPACE;
          default:
            return HTML_NAMESPACE;
        }
      }
      function getChildNamespace(parentNamespace, type) {
        if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
          return getIntrinsicNamespace(type);
        }
        if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
          return HTML_NAMESPACE;
        }
        return parentNamespace;
      }
      var hasReadOnlyValue = {
        button: true,
        checkbox: true,
        image: true,
        hidden: true,
        radio: true,
        reset: true,
        submit: true
      };
      function checkControlledValueProps(tagName, props) {
        {
          if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
            error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
          }
          if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
            error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
          }
        }
      }
      var omittedCloseTags = {
        area: true,
        base: true,
        br: true,
        col: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        keygen: true,
        link: true,
        meta: true,
        param: true,
        source: true,
        track: true,
        wbr: true
      };
      var voidElementTags = _assign({menuitem: true}, omittedCloseTags);
      var HTML = '__html';
      function assertValidProps(tag, props) {
        if (!props) {
          return;
        }
        if (voidElementTags[tag]) {
          if (!(props.children == null && props.dangerouslySetInnerHTML == null)) {
            {
              throw Error(tag + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            }
          }
        }
        if (props.dangerouslySetInnerHTML != null) {
          if (!(props.children == null)) {
            {
              throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
          }
          if (!(typeof props.dangerouslySetInnerHTML === 'object' && HTML in props.dangerouslySetInnerHTML)) {
            {
              throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            }
          }
        }
        {
          if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
            error('A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.');
          }
        }
        if (!(props.style == null || typeof props.style === 'object')) {
          {
            throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
          }
        }
      }
      var isUnitlessNumber = {
        animationIterationCount: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
      };
      function prefixKey(prefix, key) {
        return prefix + key.charAt(0).toUpperCase() + key.substring(1);
      }
      var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
      Object.keys(isUnitlessNumber).forEach(function(prop) {
        prefixes.forEach(function(prefix) {
          isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
        });
      });
      function dangerousStyleValue(name, value, isCustomProperty) {
        var isEmpty = value == null || typeof value === 'boolean' || value === '';
        if (isEmpty) {
          return '';
        }
        if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
          return value + 'px';
        }
        return ('' + value).trim();
      }
      var uppercasePattern = /([A-Z])/g;
      var msPattern = /^ms-/;
      function hyphenateStyleName(name) {
        return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
      }
      function isCustomComponent(tagName, props) {
        if (tagName.indexOf('-') === -1) {
          return typeof props.is === 'string';
        }
        switch (tagName) {
          case 'annotation-xml':
          case 'color-profile':
          case 'font-face':
          case 'font-face-src':
          case 'font-face-uri':
          case 'font-face-format':
          case 'font-face-name':
          case 'missing-glyph':
            return false;
          default:
            return true;
        }
      }
      var warnValidStyle = function() {};
      {
        var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
        var msPattern$1 = /^-ms-/;
        var hyphenPattern = /-(.)/g;
        var badStyleValueWithSemicolonPattern = /;\s*$/;
        var warnedStyleNames = {};
        var warnedStyleValues = {};
        var warnedForNaNValue = false;
        var warnedForInfinityValue = false;
        var camelize = function(string) {
          return string.replace(hyphenPattern, function(_, character) {
            return character.toUpperCase();
          });
        };
        var warnHyphenatedStyleName = function(name) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }
          warnedStyleNames[name] = true;
          error('Unsupported style property %s. Did you mean %s?', name, camelize(name.replace(msPattern$1, 'ms-')));
        };
        var warnBadVendoredStyleName = function(name) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }
          warnedStyleNames[name] = true;
          error('Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1));
        };
        var warnStyleValueWithSemicolon = function(name, value) {
          if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
            return;
          }
          warnedStyleValues[value] = true;
          error("Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, ''));
        };
        var warnStyleValueIsNaN = function(name, value) {
          if (warnedForNaNValue) {
            return;
          }
          warnedForNaNValue = true;
          error('`NaN` is an invalid value for the `%s` css style property.', name);
        };
        var warnStyleValueIsInfinity = function(name, value) {
          if (warnedForInfinityValue) {
            return;
          }
          warnedForInfinityValue = true;
          error('`Infinity` is an invalid value for the `%s` css style property.', name);
        };
        warnValidStyle = function(name, value) {
          if (name.indexOf('-') > -1) {
            warnHyphenatedStyleName(name);
          } else if (badVendoredStyleNamePattern.test(name)) {
            warnBadVendoredStyleName(name);
          } else if (badStyleValueWithSemicolonPattern.test(value)) {
            warnStyleValueWithSemicolon(name, value);
          }
          if (typeof value === 'number') {
            if (isNaN(value)) {
              warnStyleValueIsNaN(name, value);
            } else if (!isFinite(value)) {
              warnStyleValueIsInfinity(name, value);
            }
          }
        };
      }
      var warnValidStyle$1 = warnValidStyle;
      var ariaProperties = {
        'aria-current': 0,
        'aria-details': 0,
        'aria-disabled': 0,
        'aria-hidden': 0,
        'aria-invalid': 0,
        'aria-keyshortcuts': 0,
        'aria-label': 0,
        'aria-roledescription': 0,
        'aria-autocomplete': 0,
        'aria-checked': 0,
        'aria-expanded': 0,
        'aria-haspopup': 0,
        'aria-level': 0,
        'aria-modal': 0,
        'aria-multiline': 0,
        'aria-multiselectable': 0,
        'aria-orientation': 0,
        'aria-placeholder': 0,
        'aria-pressed': 0,
        'aria-readonly': 0,
        'aria-required': 0,
        'aria-selected': 0,
        'aria-sort': 0,
        'aria-valuemax': 0,
        'aria-valuemin': 0,
        'aria-valuenow': 0,
        'aria-valuetext': 0,
        'aria-atomic': 0,
        'aria-busy': 0,
        'aria-live': 0,
        'aria-relevant': 0,
        'aria-dropeffect': 0,
        'aria-grabbed': 0,
        'aria-activedescendant': 0,
        'aria-colcount': 0,
        'aria-colindex': 0,
        'aria-colspan': 0,
        'aria-controls': 0,
        'aria-describedby': 0,
        'aria-errormessage': 0,
        'aria-flowto': 0,
        'aria-labelledby': 0,
        'aria-owns': 0,
        'aria-posinset': 0,
        'aria-rowcount': 0,
        'aria-rowindex': 0,
        'aria-rowspan': 0,
        'aria-setsize': 0
      };
      var warnedProperties = {};
      var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
      var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
      var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
      function validateProperty(tagName, name) {
        {
          if (hasOwnProperty$1.call(warnedProperties, name) && warnedProperties[name]) {
            return true;
          }
          if (rARIACamel.test(name)) {
            var ariaName = 'aria-' + name.slice(4).toLowerCase();
            var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;
            if (correctName == null) {
              error('Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.', name);
              warnedProperties[name] = true;
              return true;
            }
            if (name !== correctName) {
              error('Invalid ARIA attribute `%s`. Did you mean `%s`?', name, correctName);
              warnedProperties[name] = true;
              return true;
            }
          }
          if (rARIA.test(name)) {
            var lowerCasedName = name.toLowerCase();
            var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;
            if (standardName == null) {
              warnedProperties[name] = true;
              return false;
            }
            if (name !== standardName) {
              error('Unknown ARIA attribute `%s`. Did you mean `%s`?', name, standardName);
              warnedProperties[name] = true;
              return true;
            }
          }
        }
        return true;
      }
      function warnInvalidARIAProps(type, props) {
        {
          var invalidProps = [];
          for (var key in props) {
            var isValid = validateProperty(type, key);
            if (!isValid) {
              invalidProps.push(key);
            }
          }
          var unknownPropString = invalidProps.map(function(prop) {
            return '`' + prop + '`';
          }).join(', ');
          if (invalidProps.length === 1) {
            error('Invalid aria prop %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
          } else if (invalidProps.length > 1) {
            error('Invalid aria props %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
          }
        }
      }
      function validateProperties(type, props) {
        if (isCustomComponent(type, props)) {
          return;
        }
        warnInvalidARIAProps(type, props);
      }
      var didWarnValueNull = false;
      function validateProperties$1(type, props) {
        {
          if (type !== 'input' && type !== 'textarea' && type !== 'select') {
            return;
          }
          if (props != null && props.value === null && !didWarnValueNull) {
            didWarnValueNull = true;
            if (type === 'select' && props.multiple) {
              error('`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.', type);
            } else {
              error('`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.', type);
            }
          }
        }
      }
      var possibleStandardNames = {
        accept: 'accept',
        acceptcharset: 'acceptCharset',
        'accept-charset': 'acceptCharset',
        accesskey: 'accessKey',
        action: 'action',
        allowfullscreen: 'allowFullScreen',
        alt: 'alt',
        as: 'as',
        async: 'async',
        autocapitalize: 'autoCapitalize',
        autocomplete: 'autoComplete',
        autocorrect: 'autoCorrect',
        autofocus: 'autoFocus',
        autoplay: 'autoPlay',
        autosave: 'autoSave',
        capture: 'capture',
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        challenge: 'challenge',
        charset: 'charSet',
        checked: 'checked',
        children: 'children',
        cite: 'cite',
        class: 'className',
        classid: 'classID',
        classname: 'className',
        cols: 'cols',
        colspan: 'colSpan',
        content: 'content',
        contenteditable: 'contentEditable',
        contextmenu: 'contextMenu',
        controls: 'controls',
        controlslist: 'controlsList',
        coords: 'coords',
        crossorigin: 'crossOrigin',
        dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
        data: 'data',
        datetime: 'dateTime',
        default: 'default',
        defaultchecked: 'defaultChecked',
        defaultvalue: 'defaultValue',
        defer: 'defer',
        dir: 'dir',
        disabled: 'disabled',
        disablepictureinpicture: 'disablePictureInPicture',
        disableremoteplayback: 'disableRemotePlayback',
        download: 'download',
        draggable: 'draggable',
        enctype: 'encType',
        enterkeyhint: 'enterKeyHint',
        for: 'htmlFor',
        form: 'form',
        formmethod: 'formMethod',
        formaction: 'formAction',
        formenctype: 'formEncType',
        formnovalidate: 'formNoValidate',
        formtarget: 'formTarget',
        frameborder: 'frameBorder',
        headers: 'headers',
        height: 'height',
        hidden: 'hidden',
        high: 'high',
        href: 'href',
        hreflang: 'hrefLang',
        htmlfor: 'htmlFor',
        httpequiv: 'httpEquiv',
        'http-equiv': 'httpEquiv',
        icon: 'icon',
        id: 'id',
        innerhtml: 'innerHTML',
        inputmode: 'inputMode',
        integrity: 'integrity',
        is: 'is',
        itemid: 'itemID',
        itemprop: 'itemProp',
        itemref: 'itemRef',
        itemscope: 'itemScope',
        itemtype: 'itemType',
        keyparams: 'keyParams',
        keytype: 'keyType',
        kind: 'kind',
        label: 'label',
        lang: 'lang',
        list: 'list',
        loop: 'loop',
        low: 'low',
        manifest: 'manifest',
        marginwidth: 'marginWidth',
        marginheight: 'marginHeight',
        max: 'max',
        maxlength: 'maxLength',
        media: 'media',
        mediagroup: 'mediaGroup',
        method: 'method',
        min: 'min',
        minlength: 'minLength',
        multiple: 'multiple',
        muted: 'muted',
        name: 'name',
        nomodule: 'noModule',
        nonce: 'nonce',
        novalidate: 'noValidate',
        open: 'open',
        optimum: 'optimum',
        pattern: 'pattern',
        placeholder: 'placeholder',
        playsinline: 'playsInline',
        poster: 'poster',
        preload: 'preload',
        profile: 'profile',
        radiogroup: 'radioGroup',
        readonly: 'readOnly',
        referrerpolicy: 'referrerPolicy',
        rel: 'rel',
        required: 'required',
        reversed: 'reversed',
        role: 'role',
        rows: 'rows',
        rowspan: 'rowSpan',
        sandbox: 'sandbox',
        scope: 'scope',
        scoped: 'scoped',
        scrolling: 'scrolling',
        seamless: 'seamless',
        selected: 'selected',
        shape: 'shape',
        size: 'size',
        sizes: 'sizes',
        span: 'span',
        spellcheck: 'spellCheck',
        src: 'src',
        srcdoc: 'srcDoc',
        srclang: 'srcLang',
        srcset: 'srcSet',
        start: 'start',
        step: 'step',
        style: 'style',
        summary: 'summary',
        tabindex: 'tabIndex',
        target: 'target',
        title: 'title',
        type: 'type',
        usemap: 'useMap',
        value: 'value',
        width: 'width',
        wmode: 'wmode',
        wrap: 'wrap',
        about: 'about',
        accentheight: 'accentHeight',
        'accent-height': 'accentHeight',
        accumulate: 'accumulate',
        additive: 'additive',
        alignmentbaseline: 'alignmentBaseline',
        'alignment-baseline': 'alignmentBaseline',
        allowreorder: 'allowReorder',
        alphabetic: 'alphabetic',
        amplitude: 'amplitude',
        arabicform: 'arabicForm',
        'arabic-form': 'arabicForm',
        ascent: 'ascent',
        attributename: 'attributeName',
        attributetype: 'attributeType',
        autoreverse: 'autoReverse',
        azimuth: 'azimuth',
        basefrequency: 'baseFrequency',
        baselineshift: 'baselineShift',
        'baseline-shift': 'baselineShift',
        baseprofile: 'baseProfile',
        bbox: 'bbox',
        begin: 'begin',
        bias: 'bias',
        by: 'by',
        calcmode: 'calcMode',
        capheight: 'capHeight',
        'cap-height': 'capHeight',
        clip: 'clip',
        clippath: 'clipPath',
        'clip-path': 'clipPath',
        clippathunits: 'clipPathUnits',
        cliprule: 'clipRule',
        'clip-rule': 'clipRule',
        color: 'color',
        colorinterpolation: 'colorInterpolation',
        'color-interpolation': 'colorInterpolation',
        colorinterpolationfilters: 'colorInterpolationFilters',
        'color-interpolation-filters': 'colorInterpolationFilters',
        colorprofile: 'colorProfile',
        'color-profile': 'colorProfile',
        colorrendering: 'colorRendering',
        'color-rendering': 'colorRendering',
        contentscripttype: 'contentScriptType',
        contentstyletype: 'contentStyleType',
        cursor: 'cursor',
        cx: 'cx',
        cy: 'cy',
        d: 'd',
        datatype: 'datatype',
        decelerate: 'decelerate',
        descent: 'descent',
        diffuseconstant: 'diffuseConstant',
        direction: 'direction',
        display: 'display',
        divisor: 'divisor',
        dominantbaseline: 'dominantBaseline',
        'dominant-baseline': 'dominantBaseline',
        dur: 'dur',
        dx: 'dx',
        dy: 'dy',
        edgemode: 'edgeMode',
        elevation: 'elevation',
        enablebackground: 'enableBackground',
        'enable-background': 'enableBackground',
        end: 'end',
        exponent: 'exponent',
        externalresourcesrequired: 'externalResourcesRequired',
        fill: 'fill',
        fillopacity: 'fillOpacity',
        'fill-opacity': 'fillOpacity',
        fillrule: 'fillRule',
        'fill-rule': 'fillRule',
        filter: 'filter',
        filterres: 'filterRes',
        filterunits: 'filterUnits',
        floodopacity: 'floodOpacity',
        'flood-opacity': 'floodOpacity',
        floodcolor: 'floodColor',
        'flood-color': 'floodColor',
        focusable: 'focusable',
        fontfamily: 'fontFamily',
        'font-family': 'fontFamily',
        fontsize: 'fontSize',
        'font-size': 'fontSize',
        fontsizeadjust: 'fontSizeAdjust',
        'font-size-adjust': 'fontSizeAdjust',
        fontstretch: 'fontStretch',
        'font-stretch': 'fontStretch',
        fontstyle: 'fontStyle',
        'font-style': 'fontStyle',
        fontvariant: 'fontVariant',
        'font-variant': 'fontVariant',
        fontweight: 'fontWeight',
        'font-weight': 'fontWeight',
        format: 'format',
        from: 'from',
        fx: 'fx',
        fy: 'fy',
        g1: 'g1',
        g2: 'g2',
        glyphname: 'glyphName',
        'glyph-name': 'glyphName',
        glyphorientationhorizontal: 'glyphOrientationHorizontal',
        'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
        glyphorientationvertical: 'glyphOrientationVertical',
        'glyph-orientation-vertical': 'glyphOrientationVertical',
        glyphref: 'glyphRef',
        gradienttransform: 'gradientTransform',
        gradientunits: 'gradientUnits',
        hanging: 'hanging',
        horizadvx: 'horizAdvX',
        'horiz-adv-x': 'horizAdvX',
        horizoriginx: 'horizOriginX',
        'horiz-origin-x': 'horizOriginX',
        ideographic: 'ideographic',
        imagerendering: 'imageRendering',
        'image-rendering': 'imageRendering',
        in2: 'in2',
        in: 'in',
        inlist: 'inlist',
        intercept: 'intercept',
        k1: 'k1',
        k2: 'k2',
        k3: 'k3',
        k4: 'k4',
        k: 'k',
        kernelmatrix: 'kernelMatrix',
        kernelunitlength: 'kernelUnitLength',
        kerning: 'kerning',
        keypoints: 'keyPoints',
        keysplines: 'keySplines',
        keytimes: 'keyTimes',
        lengthadjust: 'lengthAdjust',
        letterspacing: 'letterSpacing',
        'letter-spacing': 'letterSpacing',
        lightingcolor: 'lightingColor',
        'lighting-color': 'lightingColor',
        limitingconeangle: 'limitingConeAngle',
        local: 'local',
        markerend: 'markerEnd',
        'marker-end': 'markerEnd',
        markerheight: 'markerHeight',
        markermid: 'markerMid',
        'marker-mid': 'markerMid',
        markerstart: 'markerStart',
        'marker-start': 'markerStart',
        markerunits: 'markerUnits',
        markerwidth: 'markerWidth',
        mask: 'mask',
        maskcontentunits: 'maskContentUnits',
        maskunits: 'maskUnits',
        mathematical: 'mathematical',
        mode: 'mode',
        numoctaves: 'numOctaves',
        offset: 'offset',
        opacity: 'opacity',
        operator: 'operator',
        order: 'order',
        orient: 'orient',
        orientation: 'orientation',
        origin: 'origin',
        overflow: 'overflow',
        overlineposition: 'overlinePosition',
        'overline-position': 'overlinePosition',
        overlinethickness: 'overlineThickness',
        'overline-thickness': 'overlineThickness',
        paintorder: 'paintOrder',
        'paint-order': 'paintOrder',
        panose1: 'panose1',
        'panose-1': 'panose1',
        pathlength: 'pathLength',
        patterncontentunits: 'patternContentUnits',
        patterntransform: 'patternTransform',
        patternunits: 'patternUnits',
        pointerevents: 'pointerEvents',
        'pointer-events': 'pointerEvents',
        points: 'points',
        pointsatx: 'pointsAtX',
        pointsaty: 'pointsAtY',
        pointsatz: 'pointsAtZ',
        prefix: 'prefix',
        preservealpha: 'preserveAlpha',
        preserveaspectratio: 'preserveAspectRatio',
        primitiveunits: 'primitiveUnits',
        property: 'property',
        r: 'r',
        radius: 'radius',
        refx: 'refX',
        refy: 'refY',
        renderingintent: 'renderingIntent',
        'rendering-intent': 'renderingIntent',
        repeatcount: 'repeatCount',
        repeatdur: 'repeatDur',
        requiredextensions: 'requiredExtensions',
        requiredfeatures: 'requiredFeatures',
        resource: 'resource',
        restart: 'restart',
        result: 'result',
        results: 'results',
        rotate: 'rotate',
        rx: 'rx',
        ry: 'ry',
        scale: 'scale',
        security: 'security',
        seed: 'seed',
        shaperendering: 'shapeRendering',
        'shape-rendering': 'shapeRendering',
        slope: 'slope',
        spacing: 'spacing',
        specularconstant: 'specularConstant',
        specularexponent: 'specularExponent',
        speed: 'speed',
        spreadmethod: 'spreadMethod',
        startoffset: 'startOffset',
        stddeviation: 'stdDeviation',
        stemh: 'stemh',
        stemv: 'stemv',
        stitchtiles: 'stitchTiles',
        stopcolor: 'stopColor',
        'stop-color': 'stopColor',
        stopopacity: 'stopOpacity',
        'stop-opacity': 'stopOpacity',
        strikethroughposition: 'strikethroughPosition',
        'strikethrough-position': 'strikethroughPosition',
        strikethroughthickness: 'strikethroughThickness',
        'strikethrough-thickness': 'strikethroughThickness',
        string: 'string',
        stroke: 'stroke',
        strokedasharray: 'strokeDasharray',
        'stroke-dasharray': 'strokeDasharray',
        strokedashoffset: 'strokeDashoffset',
        'stroke-dashoffset': 'strokeDashoffset',
        strokelinecap: 'strokeLinecap',
        'stroke-linecap': 'strokeLinecap',
        strokelinejoin: 'strokeLinejoin',
        'stroke-linejoin': 'strokeLinejoin',
        strokemiterlimit: 'strokeMiterlimit',
        'stroke-miterlimit': 'strokeMiterlimit',
        strokewidth: 'strokeWidth',
        'stroke-width': 'strokeWidth',
        strokeopacity: 'strokeOpacity',
        'stroke-opacity': 'strokeOpacity',
        suppresscontenteditablewarning: 'suppressContentEditableWarning',
        suppresshydrationwarning: 'suppressHydrationWarning',
        surfacescale: 'surfaceScale',
        systemlanguage: 'systemLanguage',
        tablevalues: 'tableValues',
        targetx: 'targetX',
        targety: 'targetY',
        textanchor: 'textAnchor',
        'text-anchor': 'textAnchor',
        textdecoration: 'textDecoration',
        'text-decoration': 'textDecoration',
        textlength: 'textLength',
        textrendering: 'textRendering',
        'text-rendering': 'textRendering',
        to: 'to',
        transform: 'transform',
        typeof: 'typeof',
        u1: 'u1',
        u2: 'u2',
        underlineposition: 'underlinePosition',
        'underline-position': 'underlinePosition',
        underlinethickness: 'underlineThickness',
        'underline-thickness': 'underlineThickness',
        unicode: 'unicode',
        unicodebidi: 'unicodeBidi',
        'unicode-bidi': 'unicodeBidi',
        unicoderange: 'unicodeRange',
        'unicode-range': 'unicodeRange',
        unitsperem: 'unitsPerEm',
        'units-per-em': 'unitsPerEm',
        unselectable: 'unselectable',
        valphabetic: 'vAlphabetic',
        'v-alphabetic': 'vAlphabetic',
        values: 'values',
        vectoreffect: 'vectorEffect',
        'vector-effect': 'vectorEffect',
        version: 'version',
        vertadvy: 'vertAdvY',
        'vert-adv-y': 'vertAdvY',
        vertoriginx: 'vertOriginX',
        'vert-origin-x': 'vertOriginX',
        vertoriginy: 'vertOriginY',
        'vert-origin-y': 'vertOriginY',
        vhanging: 'vHanging',
        'v-hanging': 'vHanging',
        videographic: 'vIdeographic',
        'v-ideographic': 'vIdeographic',
        viewbox: 'viewBox',
        viewtarget: 'viewTarget',
        visibility: 'visibility',
        vmathematical: 'vMathematical',
        'v-mathematical': 'vMathematical',
        vocab: 'vocab',
        widths: 'widths',
        wordspacing: 'wordSpacing',
        'word-spacing': 'wordSpacing',
        writingmode: 'writingMode',
        'writing-mode': 'writingMode',
        x1: 'x1',
        x2: 'x2',
        x: 'x',
        xchannelselector: 'xChannelSelector',
        xheight: 'xHeight',
        'x-height': 'xHeight',
        xlinkactuate: 'xlinkActuate',
        'xlink:actuate': 'xlinkActuate',
        xlinkarcrole: 'xlinkArcrole',
        'xlink:arcrole': 'xlinkArcrole',
        xlinkhref: 'xlinkHref',
        'xlink:href': 'xlinkHref',
        xlinkrole: 'xlinkRole',
        'xlink:role': 'xlinkRole',
        xlinkshow: 'xlinkShow',
        'xlink:show': 'xlinkShow',
        xlinktitle: 'xlinkTitle',
        'xlink:title': 'xlinkTitle',
        xlinktype: 'xlinkType',
        'xlink:type': 'xlinkType',
        xmlbase: 'xmlBase',
        'xml:base': 'xmlBase',
        xmllang: 'xmlLang',
        'xml:lang': 'xmlLang',
        xmlns: 'xmlns',
        'xml:space': 'xmlSpace',
        xmlnsxlink: 'xmlnsXlink',
        'xmlns:xlink': 'xmlnsXlink',
        xmlspace: 'xmlSpace',
        y1: 'y1',
        y2: 'y2',
        y: 'y',
        ychannelselector: 'yChannelSelector',
        z: 'z',
        zoomandpan: 'zoomAndPan'
      };
      var validateProperty$1 = function() {};
      {
        var warnedProperties$1 = {};
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        var EVENT_NAME_REGEX = /^on./;
        var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
        var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
        var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
        validateProperty$1 = function(tagName, name, value, eventRegistry) {
          if (_hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
            return true;
          }
          var lowerCasedName = name.toLowerCase();
          if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
            error('React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');
            warnedProperties$1[name] = true;
            return true;
          }
          if (eventRegistry != null) {
            var registrationNameDependencies = eventRegistry.registrationNameDependencies,
                possibleRegistrationNames = eventRegistry.possibleRegistrationNames;
            if (registrationNameDependencies.hasOwnProperty(name)) {
              return true;
            }
            var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;
            if (registrationName != null) {
              error('Invalid event handler property `%s`. Did you mean `%s`?', name, registrationName);
              warnedProperties$1[name] = true;
              return true;
            }
            if (EVENT_NAME_REGEX.test(name)) {
              error('Unknown event handler property `%s`. It will be ignored.', name);
              warnedProperties$1[name] = true;
              return true;
            }
          } else if (EVENT_NAME_REGEX.test(name)) {
            if (INVALID_EVENT_NAME_REGEX.test(name)) {
              error('Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.', name);
            }
            warnedProperties$1[name] = true;
            return true;
          }
          if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
            return true;
          }
          if (lowerCasedName === 'innerhtml') {
            error('Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');
            warnedProperties$1[name] = true;
            return true;
          }
          if (lowerCasedName === 'aria') {
            error('The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');
            warnedProperties$1[name] = true;
            return true;
          }
          if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
            error('Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.', typeof value);
            warnedProperties$1[name] = true;
            return true;
          }
          if (typeof value === 'number' && isNaN(value)) {
            error('Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.', name);
            warnedProperties$1[name] = true;
            return true;
          }
          var propertyInfo = getPropertyInfo(name);
          var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;
          if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
            var standardName = possibleStandardNames[lowerCasedName];
            if (standardName !== name) {
              error('Invalid DOM property `%s`. Did you mean `%s`?', name, standardName);
              warnedProperties$1[name] = true;
              return true;
            }
          } else if (!isReserved && name !== lowerCasedName) {
            error('React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.', name, lowerCasedName);
            warnedProperties$1[name] = true;
            return true;
          }
          if (typeof value === 'boolean' && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
            if (value) {
              error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.', value, name, name, value, name);
            } else {
              error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
            }
            warnedProperties$1[name] = true;
            return true;
          }
          if (isReserved) {
            return true;
          }
          if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
            warnedProperties$1[name] = true;
            return false;
          }
          if ((value === 'false' || value === 'true') && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
            error('Received the string `%s` for the boolean attribute `%s`. ' + '%s ' + 'Did you mean %s={%s}?', value, name, value === 'false' ? 'The browser will interpret it as a truthy value.' : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
            warnedProperties$1[name] = true;
            return true;
          }
          return true;
        };
      }
      var warnUnknownProperties = function(type, props, eventRegistry) {
        {
          var unknownProps = [];
          for (var key in props) {
            var isValid = validateProperty$1(type, key, props[key], eventRegistry);
            if (!isValid) {
              unknownProps.push(key);
            }
          }
          var unknownPropString = unknownProps.map(function(prop) {
            return '`' + prop + '`';
          }).join(', ');
          if (unknownProps.length === 1) {
            error('Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
          } else if (unknownProps.length > 1) {
            error('Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
          }
        }
      };
      function validateProperties$2(type, props, eventRegistry) {
        if (isCustomComponent(type, props)) {
          return;
        }
        warnUnknownProperties(type, props, eventRegistry);
      }
      var toArray = React.Children.toArray;
      var currentDebugStacks = [];
      var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
      var ReactDebugCurrentFrame$1;
      var prevGetCurrentStackImpl = null;
      var getCurrentServerStackImpl = function() {
        return '';
      };
      var describeStackFrame = function(element) {
        return '';
      };
      var validatePropertiesInDevelopment = function(type, props) {};
      var pushCurrentDebugStack = function(stack) {};
      var pushElementToDebugStack = function(element) {};
      var popCurrentDebugStack = function() {};
      var hasWarnedAboutUsingContextAsConsumer = false;
      {
        ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        validatePropertiesInDevelopment = function(type, props) {
          validateProperties(type, props);
          validateProperties$1(type, props);
          validateProperties$2(type, props, null);
        };
        describeStackFrame = function(element) {
          return describeUnknownElementTypeFrameInDEV(element.type, element._source, null);
        };
        pushCurrentDebugStack = function(stack) {
          currentDebugStacks.push(stack);
          if (currentDebugStacks.length === 1) {
            prevGetCurrentStackImpl = ReactDebugCurrentFrame$1.getCurrentStack;
            ReactDebugCurrentFrame$1.getCurrentStack = getCurrentServerStackImpl;
          }
        };
        pushElementToDebugStack = function(element) {
          var stack = currentDebugStacks[currentDebugStacks.length - 1];
          var frame = stack[stack.length - 1];
          frame.debugElementStack.push(element);
        };
        popCurrentDebugStack = function() {
          currentDebugStacks.pop();
          if (currentDebugStacks.length === 0) {
            ReactDebugCurrentFrame$1.getCurrentStack = prevGetCurrentStackImpl;
            prevGetCurrentStackImpl = null;
          }
        };
        getCurrentServerStackImpl = function() {
          if (currentDebugStacks.length === 0) {
            return '';
          }
          var frames = currentDebugStacks[currentDebugStacks.length - 1];
          var stack = '';
          for (var i = frames.length - 1; i >= 0; i--) {
            var frame = frames[i];
            var debugElementStack = frame.debugElementStack;
            for (var ii = debugElementStack.length - 1; ii >= 0; ii--) {
              stack += describeStackFrame(debugElementStack[ii]);
            }
          }
          return stack;
        };
      }
      var didWarnDefaultInputValue = false;
      var didWarnDefaultChecked = false;
      var didWarnDefaultSelectValue = false;
      var didWarnDefaultTextareaValue = false;
      var didWarnInvalidOptionChildren = false;
      var didWarnAboutNoopUpdateForComponent = {};
      var didWarnAboutBadClass = {};
      var didWarnAboutModulePatternComponent = {};
      var didWarnAboutDeprecatedWillMount = {};
      var didWarnAboutUndefinedDerivedState = {};
      var didWarnAboutUninitializedState = {};
      var valuePropNames = ['value', 'defaultValue'];
      var newlineEatingTags = {
        listing: true,
        pre: true,
        textarea: true
      };
      var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
      var validatedTagCache = {};
      function validateDangerousTag(tag) {
        if (!validatedTagCache.hasOwnProperty(tag)) {
          if (!VALID_TAG_REGEX.test(tag)) {
            {
              throw Error("Invalid tag: " + tag);
            }
          }
          validatedTagCache[tag] = true;
        }
      }
      var styleNameCache = {};
      var processStyleName = function(styleName) {
        if (styleNameCache.hasOwnProperty(styleName)) {
          return styleNameCache[styleName];
        }
        var result = hyphenateStyleName(styleName);
        styleNameCache[styleName] = result;
        return result;
      };
      function createMarkupForStyles(styles) {
        var serialized = '';
        var delimiter = '';
        for (var styleName in styles) {
          if (!styles.hasOwnProperty(styleName)) {
            continue;
          }
          var isCustomProperty = styleName.indexOf('--') === 0;
          var styleValue = styles[styleName];
          {
            if (!isCustomProperty) {
              warnValidStyle$1(styleName, styleValue);
            }
          }
          if (styleValue != null) {
            serialized += delimiter + (isCustomProperty ? styleName : processStyleName(styleName)) + ':';
            serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);
            delimiter = ';';
          }
        }
        return serialized || null;
      }
      function warnNoop(publicInstance, callerName) {
        {
          var _constructor = publicInstance.constructor;
          var componentName = _constructor && getComponentName(_constructor) || 'ReactClass';
          var warningKey = componentName + '.' + callerName;
          if (didWarnAboutNoopUpdateForComponent[warningKey]) {
            return;
          }
          error('%s(...): Can only update a mounting component. ' + 'This usually means you called %s() outside componentWillMount() on the server. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, callerName, componentName);
          didWarnAboutNoopUpdateForComponent[warningKey] = true;
        }
      }
      function shouldConstruct$1(Component) {
        return Component.prototype && Component.prototype.isReactComponent;
      }
      function getNonChildrenInnerMarkup(props) {
        var innerHTML = props.dangerouslySetInnerHTML;
        if (innerHTML != null) {
          if (innerHTML.__html != null) {
            return innerHTML.__html;
          }
        } else {
          var content = props.children;
          if (typeof content === 'string' || typeof content === 'number') {
            return escapeTextForBrowser(content);
          }
        }
        return null;
      }
      function flattenTopLevelChildren(children) {
        if (!React.isValidElement(children)) {
          return toArray(children);
        }
        var element = children;
        if (element.type !== REACT_FRAGMENT_TYPE) {
          return [element];
        }
        var fragmentChildren = element.props.children;
        if (!React.isValidElement(fragmentChildren)) {
          return toArray(fragmentChildren);
        }
        var fragmentChildElement = fragmentChildren;
        return [fragmentChildElement];
      }
      function flattenOptionChildren(children) {
        if (children === undefined || children === null) {
          return children;
        }
        var content = '';
        React.Children.forEach(children, function(child) {
          if (child == null) {
            return;
          }
          content += child;
          {
            if (!didWarnInvalidOptionChildren && typeof child !== 'string' && typeof child !== 'number') {
              didWarnInvalidOptionChildren = true;
              error('Only strings and numbers are supported as <option> children.');
            }
          }
        });
        return content;
      }
      var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
      var STYLE = 'style';
      var RESERVED_PROPS = {
        children: null,
        dangerouslySetInnerHTML: null,
        suppressContentEditableWarning: null,
        suppressHydrationWarning: null
      };
      function createOpenTagMarkup(tagVerbatim, tagLowercase, props, namespace, makeStaticMarkup, isRootElement) {
        var ret = '<' + tagVerbatim;
        var isCustomComponent$1 = isCustomComponent(tagLowercase, props);
        for (var propKey in props) {
          if (!hasOwnProperty$2.call(props, propKey)) {
            continue;
          }
          var propValue = props[propKey];
          if (propValue == null) {
            continue;
          }
          if (propKey === STYLE) {
            propValue = createMarkupForStyles(propValue);
          }
          var markup = null;
          if (isCustomComponent$1) {
            if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
              markup = createMarkupForCustomAttribute(propKey, propValue);
            }
          } else {
            markup = createMarkupForProperty(propKey, propValue);
          }
          if (markup) {
            ret += ' ' + markup;
          }
        }
        if (makeStaticMarkup) {
          return ret;
        }
        if (isRootElement) {
          ret += ' ' + createMarkupForRoot();
        }
        return ret;
      }
      function validateRenderResult(child, type) {
        if (child === undefined) {
          {
            {
              throw Error((getComponentName(type) || 'Component') + "(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.");
            }
          }
        }
      }
      function resolve(child, context, threadID) {
        while (React.isValidElement(child)) {
          var element = child;
          var Component = element.type;
          {
            pushElementToDebugStack(element);
          }
          if (typeof Component !== 'function') {
            break;
          }
          processChild(element, Component);
        }
        function processChild(element, Component) {
          var isClass = shouldConstruct$1(Component);
          var publicContext = processContext(Component, context, threadID, isClass);
          var queue = [];
          var replace = false;
          var updater = {
            isMounted: function(publicInstance) {
              return false;
            },
            enqueueForceUpdate: function(publicInstance) {
              if (queue === null) {
                warnNoop(publicInstance, 'forceUpdate');
                return null;
              }
            },
            enqueueReplaceState: function(publicInstance, completeState) {
              replace = true;
              queue = [completeState];
            },
            enqueueSetState: function(publicInstance, currentPartialState) {
              if (queue === null) {
                warnNoop(publicInstance, 'setState');
                return null;
              }
              queue.push(currentPartialState);
            }
          };
          var inst;
          if (isClass) {
            inst = new Component(element.props, publicContext, updater);
            if (typeof Component.getDerivedStateFromProps === 'function') {
              {
                if (inst.state === null || inst.state === undefined) {
                  var componentName = getComponentName(Component) || 'Unknown';
                  if (!didWarnAboutUninitializedState[componentName]) {
                    error('`%s` uses `getDerivedStateFromProps` but its initial state is ' + '%s. This is not recommended. Instead, define the initial state by ' + 'assigning an object to `this.state` in the constructor of `%s`. ' + 'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', componentName, inst.state === null ? 'null' : 'undefined', componentName);
                    didWarnAboutUninitializedState[componentName] = true;
                  }
                }
              }
              var partialState = Component.getDerivedStateFromProps.call(null, element.props, inst.state);
              {
                if (partialState === undefined) {
                  var _componentName = getComponentName(Component) || 'Unknown';
                  if (!didWarnAboutUndefinedDerivedState[_componentName]) {
                    error('%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' + 'You have returned undefined.', _componentName);
                    didWarnAboutUndefinedDerivedState[_componentName] = true;
                  }
                }
              }
              if (partialState != null) {
                inst.state = _assign({}, inst.state, partialState);
              }
            }
          } else {
            {
              if (Component.prototype && typeof Component.prototype.render === 'function') {
                var _componentName2 = getComponentName(Component) || 'Unknown';
                if (!didWarnAboutBadClass[_componentName2]) {
                  error("The <%s /> component appears to have a render method, but doesn't extend React.Component. " + 'This is likely to cause errors. Change %s to extend React.Component instead.', _componentName2, _componentName2);
                  didWarnAboutBadClass[_componentName2] = true;
                }
              }
            }
            var componentIdentity = {};
            prepareToUseHooks(componentIdentity);
            inst = Component(element.props, publicContext, updater);
            inst = finishHooks(Component, element.props, inst, publicContext);
            {
              if (inst != null && inst.render != null) {
                var _componentName3 = getComponentName(Component) || 'Unknown';
                if (!didWarnAboutModulePatternComponent[_componentName3]) {
                  error('The <%s /> component appears to be a function component that returns a class instance. ' + 'Change %s to a class that extends React.Component instead. ' + "If you can't use a class try assigning the prototype on the function as a workaround. " + "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " + 'cannot be called with `new` by React.', _componentName3, _componentName3, _componentName3);
                  didWarnAboutModulePatternComponent[_componentName3] = true;
                }
              }
            }
            if (inst == null || inst.render == null) {
              child = inst;
              validateRenderResult(child, Component);
              return;
            }
          }
          inst.props = element.props;
          inst.context = publicContext;
          inst.updater = updater;
          var initialState = inst.state;
          if (initialState === undefined) {
            inst.state = initialState = null;
          }
          if (typeof inst.UNSAFE_componentWillMount === 'function' || typeof inst.componentWillMount === 'function') {
            if (typeof inst.componentWillMount === 'function') {
              {
                if (inst.componentWillMount.__suppressDeprecationWarning !== true) {
                  var _componentName4 = getComponentName(Component) || 'Unknown';
                  if (!didWarnAboutDeprecatedWillMount[_componentName4]) {
                    warn('componentWillMount has been renamed, and is not recommended for use. ' + 'See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n' + '* Move code from componentWillMount to componentDidMount (preferred in most cases) ' + 'or the constructor.\n' + '\nPlease update the following components: %s', _componentName4);
                    didWarnAboutDeprecatedWillMount[_componentName4] = true;
                  }
                }
              }
              if (typeof Component.getDerivedStateFromProps !== 'function') {
                inst.componentWillMount();
              }
            }
            if (typeof inst.UNSAFE_componentWillMount === 'function' && typeof Component.getDerivedStateFromProps !== 'function') {
              inst.UNSAFE_componentWillMount();
            }
            if (queue.length) {
              var oldQueue = queue;
              var oldReplace = replace;
              queue = null;
              replace = false;
              if (oldReplace && oldQueue.length === 1) {
                inst.state = oldQueue[0];
              } else {
                var nextState = oldReplace ? oldQueue[0] : inst.state;
                var dontMutate = true;
                for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
                  var partial = oldQueue[i];
                  var _partialState = typeof partial === 'function' ? partial.call(inst, nextState, element.props, publicContext) : partial;
                  if (_partialState != null) {
                    if (dontMutate) {
                      dontMutate = false;
                      nextState = _assign({}, nextState, _partialState);
                    } else {
                      _assign(nextState, _partialState);
                    }
                  }
                }
                inst.state = nextState;
              }
            } else {
              queue = null;
            }
          }
          child = inst.render();
          {
            if (child === undefined && inst.render._isMockFunction) {
              child = null;
            }
          }
          validateRenderResult(child, Component);
          var childContext;
          {
            if (typeof inst.getChildContext === 'function') {
              var _childContextTypes = Component.childContextTypes;
              if (typeof _childContextTypes === 'object') {
                childContext = inst.getChildContext();
                for (var contextKey in childContext) {
                  if (!(contextKey in _childContextTypes)) {
                    {
                      throw Error((getComponentName(Component) || 'Unknown') + ".getChildContext(): key \"" + contextKey + "\" is not defined in childContextTypes.");
                    }
                  }
                }
              } else {
                {
                  error('%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', getComponentName(Component) || 'Unknown');
                }
              }
            }
            if (childContext) {
              context = _assign({}, context, childContext);
            }
          }
        }
        return {
          child: child,
          context: context
        };
      }
      var ReactDOMServerRenderer = function() {
        function ReactDOMServerRenderer(children, makeStaticMarkup, options) {
          var flatChildren = flattenTopLevelChildren(children);
          var topFrame = {
            type: null,
            domNamespace: Namespaces.html,
            children: flatChildren,
            childIndex: 0,
            context: emptyObject,
            footer: ''
          };
          {
            topFrame.debugElementStack = [];
          }
          this.threadID = allocThreadID();
          this.stack = [topFrame];
          this.exhausted = false;
          this.currentSelectValue = null;
          this.previousWasTextNode = false;
          this.makeStaticMarkup = makeStaticMarkup;
          this.suspenseDepth = 0;
          this.contextIndex = -1;
          this.contextStack = [];
          this.contextValueStack = [];
          this.uniqueID = 0;
          this.identifierPrefix = options && options.identifierPrefix || '';
          {
            this.contextProviderStack = [];
          }
        }
        var _proto = ReactDOMServerRenderer.prototype;
        _proto.destroy = function destroy() {
          if (!this.exhausted) {
            this.exhausted = true;
            this.clearProviders();
            freeThreadID(this.threadID);
          }
        };
        ;
        _proto.pushProvider = function pushProvider(provider) {
          var index = ++this.contextIndex;
          var context = provider.type._context;
          var threadID = this.threadID;
          validateContextBounds(context, threadID);
          var previousValue = context[threadID];
          this.contextStack[index] = context;
          this.contextValueStack[index] = previousValue;
          {
            this.contextProviderStack[index] = provider;
          }
          context[threadID] = provider.props.value;
        };
        _proto.popProvider = function popProvider(provider) {
          var index = this.contextIndex;
          {
            if (index < 0 || provider !== this.contextProviderStack[index]) {
              error('Unexpected pop.');
            }
          }
          var context = this.contextStack[index];
          var previousValue = this.contextValueStack[index];
          this.contextStack[index] = null;
          this.contextValueStack[index] = null;
          {
            this.contextProviderStack[index] = null;
          }
          this.contextIndex--;
          context[this.threadID] = previousValue;
        };
        _proto.clearProviders = function clearProviders() {
          for (var index = this.contextIndex; index >= 0; index--) {
            var context = this.contextStack[index];
            var previousValue = this.contextValueStack[index];
            context[this.threadID] = previousValue;
          }
        };
        _proto.read = function read(bytes) {
          if (this.exhausted) {
            return null;
          }
          var prevPartialRenderer = currentPartialRenderer;
          setCurrentPartialRenderer(this);
          var prevDispatcher = ReactCurrentDispatcher$1.current;
          ReactCurrentDispatcher$1.current = Dispatcher;
          try {
            var out = [''];
            var suspended = false;
            while (out[0].length < bytes) {
              if (this.stack.length === 0) {
                this.exhausted = true;
                freeThreadID(this.threadID);
                break;
              }
              var frame = this.stack[this.stack.length - 1];
              if (suspended || frame.childIndex >= frame.children.length) {
                var footer = frame.footer;
                if (footer !== '') {
                  this.previousWasTextNode = false;
                }
                this.stack.pop();
                if (frame.type === 'select') {
                  this.currentSelectValue = null;
                } else if (frame.type != null && frame.type.type != null && frame.type.type.$$typeof === REACT_PROVIDER_TYPE) {
                  var provider = frame.type;
                  this.popProvider(provider);
                } else if (frame.type === REACT_SUSPENSE_TYPE) {
                  this.suspenseDepth--;
                  var buffered = out.pop();
                  if (suspended) {
                    suspended = false;
                    var fallbackFrame = frame.fallbackFrame;
                    if (!fallbackFrame) {
                      {
                        throw Error(true ? "ReactDOMServer did not find an internal fallback frame for Suspense. This is a bug in React. Please file an issue." : formatProdErrorMessage(303));
                      }
                    }
                    this.stack.push(fallbackFrame);
                    out[this.suspenseDepth] += '<!--$!-->';
                    continue;
                  } else {
                    out[this.suspenseDepth] += buffered;
                  }
                }
                out[this.suspenseDepth] += footer;
                continue;
              }
              var child = frame.children[frame.childIndex++];
              var outBuffer = '';
              if (true) {
                pushCurrentDebugStack(this.stack);
                frame.debugElementStack.length = 0;
              }
              try {
                outBuffer += this.render(child, frame.context, frame.domNamespace);
              } catch (err) {
                if (err != null && typeof err.then === 'function') {
                  if (enableSuspenseServerRenderer) {
                    if (!(this.suspenseDepth > 0)) {
                      {
                        throw Error(true ? "A React component suspended while rendering, but no fallback UI was specified.\n\nAdd a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display." : formatProdErrorMessage(342));
                      }
                    }
                    suspended = true;
                  } else {
                    if (!false) {
                      {
                        throw Error(true ? "ReactDOMServer does not yet support Suspense." : formatProdErrorMessage(294));
                      }
                    }
                  }
                } else {
                  throw err;
                }
              } finally {
                if (true) {
                  popCurrentDebugStack();
                }
              }
              if (out.length <= this.suspenseDepth) {
                out.push('');
              }
              out[this.suspenseDepth] += outBuffer;
            }
            return out[0];
          } finally {
            ReactCurrentDispatcher$1.current = prevDispatcher;
            setCurrentPartialRenderer(prevPartialRenderer);
            resetHooksState();
          }
        };
        _proto.render = function render(child, context, parentNamespace) {
          if (typeof child === 'string' || typeof child === 'number') {
            var text = '' + child;
            if (text === '') {
              return '';
            }
            if (this.makeStaticMarkup) {
              return escapeTextForBrowser(text);
            }
            if (this.previousWasTextNode) {
              return '<!-- -->' + escapeTextForBrowser(text);
            }
            this.previousWasTextNode = true;
            return escapeTextForBrowser(text);
          } else {
            var nextChild;
            var _resolve = resolve(child, context, this.threadID);
            nextChild = _resolve.child;
            context = _resolve.context;
            if (nextChild === null || nextChild === false) {
              return '';
            } else if (!React.isValidElement(nextChild)) {
              if (nextChild != null && nextChild.$$typeof != null) {
                var $$typeof = nextChild.$$typeof;
                if (!($$typeof !== REACT_PORTAL_TYPE)) {
                  {
                    throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
                  }
                }
                {
                  {
                    throw Error("Unknown element-like object type: " + $$typeof.toString() + ". This is likely a bug in React. Please file an issue.");
                  }
                }
              }
              var nextChildren = toArray(nextChild);
              var frame = {
                type: null,
                domNamespace: parentNamespace,
                children: nextChildren,
                childIndex: 0,
                context: context,
                footer: ''
              };
              {
                frame.debugElementStack = [];
              }
              this.stack.push(frame);
              return '';
            }
            var nextElement = nextChild;
            var elementType = nextElement.type;
            if (typeof elementType === 'string') {
              return this.renderDOM(nextElement, context, parentNamespace);
            }
            switch (elementType) {
              case REACT_LEGACY_HIDDEN_TYPE:
              case REACT_DEBUG_TRACING_MODE_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_SUSPENSE_LIST_TYPE:
              case REACT_FRAGMENT_TYPE:
                {
                  var _nextChildren = toArray(nextChild.props.children);
                  var _frame = {
                    type: null,
                    domNamespace: parentNamespace,
                    children: _nextChildren,
                    childIndex: 0,
                    context: context,
                    footer: ''
                  };
                  {
                    _frame.debugElementStack = [];
                  }
                  this.stack.push(_frame);
                  return '';
                }
              case REACT_SUSPENSE_TYPE:
                {
                  {
                    {
                      {
                        throw Error("ReactDOMServer does not yet support Suspense.");
                      }
                    }
                  }
                }
              case REACT_SCOPE_TYPE:
                {
                  {
                    {
                      throw Error("ReactDOMServer does not yet support scope components.");
                    }
                  }
                }
            }
            if (typeof elementType === 'object' && elementType !== null) {
              switch (elementType.$$typeof) {
                case REACT_FORWARD_REF_TYPE:
                  {
                    var element = nextChild;
                    var _nextChildren5;
                    var componentIdentity = {};
                    prepareToUseHooks(componentIdentity);
                    _nextChildren5 = elementType.render(element.props, element.ref);
                    _nextChildren5 = finishHooks(elementType.render, element.props, _nextChildren5, element.ref);
                    _nextChildren5 = toArray(_nextChildren5);
                    var _frame5 = {
                      type: null,
                      domNamespace: parentNamespace,
                      children: _nextChildren5,
                      childIndex: 0,
                      context: context,
                      footer: ''
                    };
                    {
                      _frame5.debugElementStack = [];
                    }
                    this.stack.push(_frame5);
                    return '';
                  }
                case REACT_MEMO_TYPE:
                  {
                    var _element = nextChild;
                    var _nextChildren6 = [React.createElement(elementType.type, _assign({ref: _element.ref}, _element.props))];
                    var _frame6 = {
                      type: null,
                      domNamespace: parentNamespace,
                      children: _nextChildren6,
                      childIndex: 0,
                      context: context,
                      footer: ''
                    };
                    {
                      _frame6.debugElementStack = [];
                    }
                    this.stack.push(_frame6);
                    return '';
                  }
                case REACT_PROVIDER_TYPE:
                  {
                    var provider = nextChild;
                    var nextProps = provider.props;
                    var _nextChildren7 = toArray(nextProps.children);
                    var _frame7 = {
                      type: provider,
                      domNamespace: parentNamespace,
                      children: _nextChildren7,
                      childIndex: 0,
                      context: context,
                      footer: ''
                    };
                    {
                      _frame7.debugElementStack = [];
                    }
                    this.pushProvider(provider);
                    this.stack.push(_frame7);
                    return '';
                  }
                case REACT_CONTEXT_TYPE:
                  {
                    var reactContext = nextChild.type;
                    {
                      if (reactContext._context === undefined) {
                        if (reactContext !== reactContext.Consumer) {
                          if (!hasWarnedAboutUsingContextAsConsumer) {
                            hasWarnedAboutUsingContextAsConsumer = true;
                            error('Rendering <Context> directly is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
                          }
                        }
                      } else {
                        reactContext = reactContext._context;
                      }
                    }
                    var _nextProps = nextChild.props;
                    var threadID = this.threadID;
                    validateContextBounds(reactContext, threadID);
                    var nextValue = reactContext[threadID];
                    var _nextChildren8 = toArray(_nextProps.children(nextValue));
                    var _frame8 = {
                      type: nextChild,
                      domNamespace: parentNamespace,
                      children: _nextChildren8,
                      childIndex: 0,
                      context: context,
                      footer: ''
                    };
                    {
                      _frame8.debugElementStack = [];
                    }
                    this.stack.push(_frame8);
                    return '';
                  }
                case REACT_FUNDAMENTAL_TYPE:
                  {
                    {
                      {
                        throw Error("ReactDOMServer does not yet support the fundamental API.");
                      }
                    }
                  }
                case REACT_LAZY_TYPE:
                  {
                    var _element2 = nextChild;
                    var lazyComponent = nextChild.type;
                    var payload = lazyComponent._payload;
                    var init = lazyComponent._init;
                    var result = init(payload);
                    var _nextChildren10 = [React.createElement(result, _assign({ref: _element2.ref}, _element2.props))];
                    var _frame10 = {
                      type: null,
                      domNamespace: parentNamespace,
                      children: _nextChildren10,
                      childIndex: 0,
                      context: context,
                      footer: ''
                    };
                    {
                      _frame10.debugElementStack = [];
                    }
                    this.stack.push(_frame10);
                    return '';
                  }
              }
            }
            var info = '';
            {
              var owner = nextElement._owner;
              if (elementType === undefined || typeof elementType === 'object' && elementType !== null && Object.keys(elementType).length === 0) {
                info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and " + 'named imports.';
              }
              var ownerName = owner ? getComponentName(owner) : null;
              if (ownerName) {
                info += '\n\nCheck the render method of `' + ownerName + '`.';
              }
            }
            {
              {
                throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + (elementType == null ? elementType : typeof elementType) + "." + info);
              }
            }
          }
        };
        _proto.renderDOM = function renderDOM(element, context, parentNamespace) {
          var tag = element.type.toLowerCase();
          var namespace = parentNamespace;
          if (parentNamespace === Namespaces.html) {
            namespace = getIntrinsicNamespace(tag);
          }
          {
            if (namespace === Namespaces.html) {
              if (tag !== element.type) {
                error('<%s /> is using incorrect casing. ' + 'Use PascalCase for React components, ' + 'or lowercase for HTML elements.', element.type);
              }
            }
          }
          validateDangerousTag(tag);
          var props = element.props;
          if (tag === 'input') {
            {
              checkControlledValueProps('input', props);
              if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnDefaultChecked) {
                error('%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', 'A component', props.type);
                didWarnDefaultChecked = true;
              }
              if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultInputValue) {
                error('%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', 'A component', props.type);
                didWarnDefaultInputValue = true;
              }
            }
            props = _assign({type: undefined}, props, {
              defaultChecked: undefined,
              defaultValue: undefined,
              value: props.value != null ? props.value : props.defaultValue,
              checked: props.checked != null ? props.checked : props.defaultChecked
            });
          } else if (tag === 'textarea') {
            {
              checkControlledValueProps('textarea', props);
              if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultTextareaValue) {
                error('Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');
                didWarnDefaultTextareaValue = true;
              }
            }
            var initialValue = props.value;
            if (initialValue == null) {
              var defaultValue = props.defaultValue;
              var textareaChildren = props.children;
              if (textareaChildren != null) {
                {
                  error('Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
                }
                if (!(defaultValue == null)) {
                  {
                    throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
                  }
                }
                if (Array.isArray(textareaChildren)) {
                  if (!(textareaChildren.length <= 1)) {
                    {
                      throw Error("<textarea> can only have at most one child.");
                    }
                  }
                  textareaChildren = textareaChildren[0];
                }
                defaultValue = '' + textareaChildren;
              }
              if (defaultValue == null) {
                defaultValue = '';
              }
              initialValue = defaultValue;
            }
            props = _assign({}, props, {
              value: undefined,
              children: '' + initialValue
            });
          } else if (tag === 'select') {
            {
              checkControlledValueProps('select', props);
              for (var i = 0; i < valuePropNames.length; i++) {
                var propName = valuePropNames[i];
                if (props[propName] == null) {
                  continue;
                }
                var isArray = Array.isArray(props[propName]);
                if (props.multiple && !isArray) {
                  error('The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.', propName);
                } else if (!props.multiple && isArray) {
                  error('The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.', propName);
                }
              }
              if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultSelectValue) {
                error('Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');
                didWarnDefaultSelectValue = true;
              }
            }
            this.currentSelectValue = props.value != null ? props.value : props.defaultValue;
            props = _assign({}, props, {value: undefined});
          } else if (tag === 'option') {
            var selected = null;
            var selectValue = this.currentSelectValue;
            var optionChildren = flattenOptionChildren(props.children);
            if (selectValue != null) {
              var value;
              if (props.value != null) {
                value = props.value + '';
              } else {
                value = optionChildren;
              }
              selected = false;
              if (Array.isArray(selectValue)) {
                for (var j = 0; j < selectValue.length; j++) {
                  if ('' + selectValue[j] === value) {
                    selected = true;
                    break;
                  }
                }
              } else {
                selected = '' + selectValue === value;
              }
              props = _assign({
                selected: undefined,
                children: undefined
              }, props, {
                selected: selected,
                children: optionChildren
              });
            }
          }
          {
            validatePropertiesInDevelopment(tag, props);
          }
          assertValidProps(tag, props);
          var out = createOpenTagMarkup(element.type, tag, props, namespace, this.makeStaticMarkup, this.stack.length === 1);
          var footer = '';
          if (omittedCloseTags.hasOwnProperty(tag)) {
            out += '/>';
          } else {
            out += '>';
            footer = '</' + element.type + '>';
          }
          var children;
          var innerMarkup = getNonChildrenInnerMarkup(props);
          if (innerMarkup != null) {
            children = [];
            if (newlineEatingTags.hasOwnProperty(tag) && innerMarkup.charAt(0) === '\n') {
              out += '\n';
            }
            out += innerMarkup;
          } else {
            children = toArray(props.children);
          }
          var frame = {
            domNamespace: getChildNamespace(parentNamespace, element.type),
            type: tag,
            children: children,
            childIndex: 0,
            context: context,
            footer: footer
          };
          {
            frame.debugElementStack = [];
          }
          this.stack.push(frame);
          this.previousWasTextNode = false;
          return out;
        };
        return ReactDOMServerRenderer;
      }();
      function renderToString(element, options) {
        var renderer = new ReactDOMServerRenderer(element, false, options);
        try {
          var markup = renderer.read(Infinity);
          return markup;
        } finally {
          renderer.destroy();
        }
      }
      function renderToStaticMarkup(element, options) {
        var renderer = new ReactDOMServerRenderer(element, true, options);
        try {
          var markup = renderer.read(Infinity);
          return markup;
        } finally {
          renderer.destroy();
        }
      }
      function renderToNodeStream() {
        {
          {
            throw Error("ReactDOMServer.renderToNodeStream(): The streaming API is not available in the browser. Use ReactDOMServer.renderToString() instead.");
          }
        }
      }
      function renderToStaticNodeStream() {
        {
          {
            throw Error("ReactDOMServer.renderToStaticNodeStream(): The streaming API is not available in the browser. Use ReactDOMServer.renderToStaticMarkup() instead.");
          }
        }
      }
      exports.renderToNodeStream = renderToNodeStream;
      exports.renderToStaticMarkup = renderToStaticMarkup;
      exports.renderToStaticNodeStream = renderToStaticNodeStream;
      exports.renderToString = renderToString;
      exports.version = ReactVersion;
    })();
  }
})(require('process'));
