/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV !== "production") {
    (function() {
      'use strict';
      var React = require('react');
      var ReactDOM = require('../index');
      var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      function warn(format) {
        {
          {
            for (var _len = arguments.length,
                args = new Array(_len > 1 ? _len - 1 : 0),
                _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }
            printWarning('warn', format, args);
          }
        }
      }
      function error(format) {
        {
          {
            for (var _len2 = arguments.length,
                args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            printWarning('error', format, args);
          }
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
            return String(item);
          });
          argsWithFormat.unshift('Warning: ' + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);
        }
      }
      function get(key) {
        return key._reactInternals;
      }
      var FunctionComponent = 0;
      var ClassComponent = 1;
      var HostRoot = 3;
      var HostComponent = 5;
      var HostText = 6;
      var NoFlags = 0;
      var Placement = 2;
      var Hydrating = 4096;
      var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
      function getNearestMountedFiber(fiber) {
        var node = fiber;
        var nearestMounted = fiber;
        if (!fiber.alternate) {
          var nextNode = node;
          do {
            node = nextNode;
            if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
              nearestMounted = node.return;
            }
            nextNode = node.return;
          } while (nextNode);
        } else {
          while (node.return) {
            node = node.return;
          }
        }
        if (node.tag === HostRoot) {
          return nearestMounted;
        }
        return null;
      }
      function assertIsMounted(fiber) {
        if (getNearestMountedFiber(fiber) !== fiber) {
          throw new Error('Unable to find node on an unmounted component.');
        }
      }
      function findCurrentFiberUsingSlowPath(fiber) {
        var alternate = fiber.alternate;
        if (!alternate) {
          var nearestMounted = getNearestMountedFiber(fiber);
          if (nearestMounted === null) {
            throw new Error('Unable to find node on an unmounted component.');
          }
          if (nearestMounted !== fiber) {
            return null;
          }
          return fiber;
        }
        var a = fiber;
        var b = alternate;
        while (true) {
          var parentA = a.return;
          if (parentA === null) {
            break;
          }
          var parentB = parentA.alternate;
          if (parentB === null) {
            var nextParent = parentA.return;
            if (nextParent !== null) {
              a = b = nextParent;
              continue;
            }
            break;
          }
          if (parentA.child === parentB.child) {
            var child = parentA.child;
            while (child) {
              if (child === a) {
                assertIsMounted(parentA);
                return fiber;
              }
              if (child === b) {
                assertIsMounted(parentA);
                return alternate;
              }
              child = child.sibling;
            }
            throw new Error('Unable to find node on an unmounted component.');
          }
          if (a.return !== b.return) {
            a = parentA;
            b = parentB;
          } else {
            var didFindChild = false;
            var _child = parentA.child;
            while (_child) {
              if (_child === a) {
                didFindChild = true;
                a = parentA;
                b = parentB;
                break;
              }
              if (_child === b) {
                didFindChild = true;
                b = parentA;
                a = parentB;
                break;
              }
              _child = _child.sibling;
            }
            if (!didFindChild) {
              _child = parentB.child;
              while (_child) {
                if (_child === a) {
                  didFindChild = true;
                  a = parentB;
                  b = parentA;
                  break;
                }
                if (_child === b) {
                  didFindChild = true;
                  b = parentB;
                  a = parentA;
                  break;
                }
                _child = _child.sibling;
              }
              if (!didFindChild) {
                throw new Error('Child was not found in either parent set. This indicates a bug ' + 'in React related to the return pointer. Please file an issue.');
              }
            }
          }
          if (a.alternate !== b) {
            throw new Error("Return fibers should always be each others' alternates. " + 'This error is likely caused by a bug in React. Please file an issue.');
          }
        }
        if (a.tag !== HostRoot) {
          throw new Error('Unable to find node on an unmounted component.');
        }
        if (a.stateNode.current === a) {
          return fiber;
        }
        return alternate;
      }
      var assign = Object.assign;
      function getEventCharCode(nativeEvent) {
        var charCode;
        var keyCode = nativeEvent.keyCode;
        if ('charCode' in nativeEvent) {
          charCode = nativeEvent.charCode;
          if (charCode === 0 && keyCode === 13) {
            charCode = 13;
          }
        } else {
          charCode = keyCode;
        }
        if (charCode === 10) {
          charCode = 13;
        }
        if (charCode >= 32 || charCode === 13) {
          return charCode;
        }
        return 0;
      }
      function functionThatReturnsTrue() {
        return true;
      }
      function functionThatReturnsFalse() {
        return false;
      }
      function createSyntheticEvent(Interface) {
        function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
          this._reactName = reactName;
          this._targetInst = targetInst;
          this.type = reactEventType;
          this.nativeEvent = nativeEvent;
          this.target = nativeEventTarget;
          this.currentTarget = null;
          for (var _propName in Interface) {
            if (!Interface.hasOwnProperty(_propName)) {
              continue;
            }
            var normalize = Interface[_propName];
            if (normalize) {
              this[_propName] = normalize(nativeEvent);
            } else {
              this[_propName] = nativeEvent[_propName];
            }
          }
          var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
          if (defaultPrevented) {
            this.isDefaultPrevented = functionThatReturnsTrue;
          } else {
            this.isDefaultPrevented = functionThatReturnsFalse;
          }
          this.isPropagationStopped = functionThatReturnsFalse;
          return this;
        }
        assign(SyntheticBaseEvent.prototype, {
          preventDefault: function() {
            this.defaultPrevented = true;
            var event = this.nativeEvent;
            if (!event) {
              return;
            }
            if (event.preventDefault) {
              event.preventDefault();
            } else if (typeof event.returnValue !== 'unknown') {
              event.returnValue = false;
            }
            this.isDefaultPrevented = functionThatReturnsTrue;
          },
          stopPropagation: function() {
            var event = this.nativeEvent;
            if (!event) {
              return;
            }
            if (event.stopPropagation) {
              event.stopPropagation();
            } else if (typeof event.cancelBubble !== 'unknown') {
              event.cancelBubble = true;
            }
            this.isPropagationStopped = functionThatReturnsTrue;
          },
          persist: function() {},
          isPersistent: functionThatReturnsTrue
        });
        return SyntheticBaseEvent;
      }
      var EventInterface = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(event) {
          return event.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0
      };
      var SyntheticEvent = createSyntheticEvent(EventInterface);
      var UIEventInterface = assign({}, EventInterface, {
        view: 0,
        detail: 0
      });
      var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
      var lastMovementX;
      var lastMovementY;
      var lastMouseEvent;
      function updateMouseMovementPolyfillState(event) {
        if (event !== lastMouseEvent) {
          if (lastMouseEvent && event.type === 'mousemove') {
            lastMovementX = event.screenX - lastMouseEvent.screenX;
            lastMovementY = event.screenY - lastMouseEvent.screenY;
          } else {
            lastMovementX = 0;
            lastMovementY = 0;
          }
          lastMouseEvent = event;
        }
      }
      var MouseEventInterface = assign({}, UIEventInterface, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: getEventModifierState,
        button: 0,
        buttons: 0,
        relatedTarget: function(event) {
          if (event.relatedTarget === undefined)
            return event.fromElement === event.srcElement ? event.toElement : event.fromElement;
          return event.relatedTarget;
        },
        movementX: function(event) {
          if ('movementX' in event) {
            return event.movementX;
          }
          updateMouseMovementPolyfillState(event);
          return lastMovementX;
        },
        movementY: function(event) {
          if ('movementY' in event) {
            return event.movementY;
          }
          return lastMovementY;
        }
      });
      var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
      var DragEventInterface = assign({}, MouseEventInterface, {dataTransfer: 0});
      var SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
      var FocusEventInterface = assign({}, UIEventInterface, {relatedTarget: 0});
      var SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
      var AnimationEventInterface = assign({}, EventInterface, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
      });
      var SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
      var ClipboardEventInterface = assign({}, EventInterface, {clipboardData: function(event) {
          return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
        }});
      var SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
      var CompositionEventInterface = assign({}, EventInterface, {data: 0});
      var SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
      var normalizeKey = {
        Esc: 'Escape',
        Spacebar: ' ',
        Left: 'ArrowLeft',
        Up: 'ArrowUp',
        Right: 'ArrowRight',
        Down: 'ArrowDown',
        Del: 'Delete',
        Win: 'OS',
        Menu: 'ContextMenu',
        Apps: 'ContextMenu',
        Scroll: 'ScrollLock',
        MozPrintableKey: 'Unidentified'
      };
      var translateToKey = {
        '8': 'Backspace',
        '9': 'Tab',
        '12': 'Clear',
        '13': 'Enter',
        '16': 'Shift',
        '17': 'Control',
        '18': 'Alt',
        '19': 'Pause',
        '20': 'CapsLock',
        '27': 'Escape',
        '32': ' ',
        '33': 'PageUp',
        '34': 'PageDown',
        '35': 'End',
        '36': 'Home',
        '37': 'ArrowLeft',
        '38': 'ArrowUp',
        '39': 'ArrowRight',
        '40': 'ArrowDown',
        '45': 'Insert',
        '46': 'Delete',
        '112': 'F1',
        '113': 'F2',
        '114': 'F3',
        '115': 'F4',
        '116': 'F5',
        '117': 'F6',
        '118': 'F7',
        '119': 'F8',
        '120': 'F9',
        '121': 'F10',
        '122': 'F11',
        '123': 'F12',
        '144': 'NumLock',
        '145': 'ScrollLock',
        '224': 'Meta'
      };
      function getEventKey(nativeEvent) {
        if (nativeEvent.key) {
          var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
          if (key !== 'Unidentified') {
            return key;
          }
        }
        if (nativeEvent.type === 'keypress') {
          var charCode = getEventCharCode(nativeEvent);
          return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
        }
        if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
          return translateToKey[nativeEvent.keyCode] || 'Unidentified';
        }
        return '';
      }
      var modifierKeyToProp = {
        Alt: 'altKey',
        Control: 'ctrlKey',
        Meta: 'metaKey',
        Shift: 'shiftKey'
      };
      function modifierStateGetter(keyArg) {
        var syntheticEvent = this;
        var nativeEvent = syntheticEvent.nativeEvent;
        if (nativeEvent.getModifierState) {
          return nativeEvent.getModifierState(keyArg);
        }
        var keyProp = modifierKeyToProp[keyArg];
        return keyProp ? !!nativeEvent[keyProp] : false;
      }
      function getEventModifierState(nativeEvent) {
        return modifierStateGetter;
      }
      var KeyboardEventInterface = assign({}, UIEventInterface, {
        key: getEventKey,
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: getEventModifierState,
        charCode: function(event) {
          if (event.type === 'keypress') {
            return getEventCharCode(event);
          }
          return 0;
        },
        keyCode: function(event) {
          if (event.type === 'keydown' || event.type === 'keyup') {
            return event.keyCode;
          }
          return 0;
        },
        which: function(event) {
          if (event.type === 'keypress') {
            return getEventCharCode(event);
          }
          if (event.type === 'keydown' || event.type === 'keyup') {
            return event.keyCode;
          }
          return 0;
        }
      });
      var SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
      var PointerEventInterface = assign({}, MouseEventInterface, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
      });
      var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
      var TouchEventInterface = assign({}, UIEventInterface, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: getEventModifierState
      });
      var SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
      var TransitionEventInterface = assign({}, EventInterface, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
      });
      var SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
      var WheelEventInterface = assign({}, MouseEventInterface, {
        deltaX: function(event) {
          return 'deltaX' in event ? event.deltaX : 'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
        },
        deltaY: function(event) {
          return 'deltaY' in event ? event.deltaY : 'wheelDeltaY' in event ? -event.wheelDeltaY : 'wheelDelta' in event ? -event.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
      });
      var SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
      var ELEMENT_NODE = 1;
      function invokeGuardedCallbackProd(name, func, context, a, b, c, d, e, f) {
        var funcArgs = Array.prototype.slice.call(arguments, 3);
        try {
          func.apply(context, funcArgs);
        } catch (error) {
          this.onError(error);
        }
      }
      var invokeGuardedCallbackImpl = invokeGuardedCallbackProd;
      {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
          var fakeNode = document.createElement('react');
          invokeGuardedCallbackImpl = function invokeGuardedCallbackDev(name, func, context, a, b, c, d, e, f) {
            if (typeof document === 'undefined' || document === null) {
              throw new Error('The `document` global was defined when React was initialized, but is not ' + 'defined anymore. This can happen in a test environment if a component ' + 'schedules an update from an asynchronous callback, but the test has already ' + 'finished running. To solve this, you can either unmount the component at ' + 'the end of your test (and ensure that any asynchronous operations get ' + 'canceled in `componentWillUnmount`), or you can change the test itself ' + 'to be asynchronous.');
            }
            var evt = document.createEvent('Event');
            var didCall = false;
            var didError = true;
            var windowEvent = window.event;
            var windowEventDescriptor = Object.getOwnPropertyDescriptor(window, 'event');
            function restoreAfterDispatch() {
              fakeNode.removeEventListener(evtType, callCallback, false);
              if (typeof window.event !== 'undefined' && window.hasOwnProperty('event')) {
                window.event = windowEvent;
              }
            }
            var funcArgs = Array.prototype.slice.call(arguments, 3);
            function callCallback() {
              didCall = true;
              restoreAfterDispatch();
              func.apply(context, funcArgs);
              didError = false;
            }
            var error;
            var didSetError = false;
            var isCrossOriginError = false;
            function handleWindowError(event) {
              error = event.error;
              didSetError = true;
              if (error === null && event.colno === 0 && event.lineno === 0) {
                isCrossOriginError = true;
              }
              if (event.defaultPrevented) {
                if (error != null && typeof error === 'object') {
                  try {
                    error._suppressLogging = true;
                  } catch (inner) {}
                }
              }
            }
            var evtType = "react-" + (name ? name : 'invokeguardedcallback');
            window.addEventListener('error', handleWindowError);
            fakeNode.addEventListener(evtType, callCallback, false);
            evt.initEvent(evtType, false, false);
            fakeNode.dispatchEvent(evt);
            if (windowEventDescriptor) {
              Object.defineProperty(window, 'event', windowEventDescriptor);
            }
            if (didCall && didError) {
              if (!didSetError) {
                error = new Error('An error was thrown inside one of your components, but React ' + "doesn't know what it was. This is likely due to browser " + 'flakiness. React does its best to preserve the "Pause on ' + 'exceptions" behavior of the DevTools, which requires some ' + "DEV-mode only tricks. It's possible that these don't work in " + 'your browser. Try triggering the error in production mode, ' + 'or switching to a modern browser. If you suspect that this is ' + 'actually an issue with React, please file an issue.');
              } else if (isCrossOriginError) {
                error = new Error("A cross-origin error was thrown. React doesn't have access to " + 'the actual error object in development. ' + 'See https://reactjs.org/link/crossorigin-error for more information.');
              }
              this.onError(error);
            }
            window.removeEventListener('error', handleWindowError);
            if (!didCall) {
              restoreAfterDispatch();
              return invokeGuardedCallbackProd.apply(this, arguments);
            }
          };
        }
      }
      var invokeGuardedCallbackImpl$1 = invokeGuardedCallbackImpl;
      var hasError = false;
      var caughtError = null;
      var hasRethrowError = false;
      var rethrowError = null;
      var reporter = {onError: function(error) {
          hasError = true;
          caughtError = error;
        }};
      function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
        hasError = false;
        caughtError = null;
        invokeGuardedCallbackImpl$1.apply(reporter, arguments);
      }
      function invokeGuardedCallbackAndCatchFirstError(name, func, context, a, b, c, d, e, f) {
        invokeGuardedCallback.apply(this, arguments);
        if (hasError) {
          var error = clearCaughtError();
          if (!hasRethrowError) {
            hasRethrowError = true;
            rethrowError = error;
          }
        }
      }
      function rethrowCaughtError() {
        if (hasRethrowError) {
          var error = rethrowError;
          hasRethrowError = false;
          rethrowError = null;
          throw error;
        }
      }
      function clearCaughtError() {
        if (hasError) {
          var error = caughtError;
          hasError = false;
          caughtError = null;
          return error;
        } else {
          throw new Error('clearCaughtError was called but no error was captured. This error ' + 'is likely caused by a bug in React. Please file an issue.');
        }
      }
      var isArrayImpl = Array.isArray;
      function isArray(a) {
        return isArrayImpl(a);
      }
      var SecretInternals = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      var EventInternals = SecretInternals.Events;
      var getInstanceFromNode = EventInternals[0];
      var getNodeFromInstance = EventInternals[1];
      var getFiberCurrentPropsFromNode = EventInternals[2];
      var enqueueStateRestore = EventInternals[3];
      var restoreStateIfNeeded = EventInternals[4];
      var act = React.unstable_act;
      function Event(suffix) {}
      var hasWarnedAboutDeprecatedMockComponent = false;
      function findAllInRenderedFiberTreeInternal(fiber, test) {
        if (!fiber) {
          return [];
        }
        var currentParent = findCurrentFiberUsingSlowPath(fiber);
        if (!currentParent) {
          return [];
        }
        var node = currentParent;
        var ret = [];
        while (true) {
          if (node.tag === HostComponent || node.tag === HostText || node.tag === ClassComponent || node.tag === FunctionComponent) {
            var publicInst = node.stateNode;
            if (test(publicInst)) {
              ret.push(publicInst);
            }
          }
          if (node.child) {
            node.child.return = node;
            node = node.child;
            continue;
          }
          if (node === currentParent) {
            return ret;
          }
          while (!node.sibling) {
            if (!node.return || node.return === currentParent) {
              return ret;
            }
            node = node.return;
          }
          node.sibling.return = node.return;
          node = node.sibling;
        }
      }
      function validateClassInstance(inst, methodName) {
        if (!inst) {
          return;
        }
        if (get(inst)) {
          return;
        }
        var received;
        var stringified = String(inst);
        if (isArray(inst)) {
          received = 'an array';
        } else if (inst && inst.nodeType === ELEMENT_NODE && inst.tagName) {
          received = 'a DOM node';
        } else if (stringified === '[object Object]') {
          received = 'object with keys {' + Object.keys(inst).join(', ') + '}';
        } else {
          received = stringified;
        }
        throw new Error(methodName + "(...): the first argument must be a React class instance. " + ("Instead received: " + received + "."));
      }
      function renderIntoDocument(element) {
        var div = document.createElement('div');
        return ReactDOM.render(element, div);
      }
      function isElement(element) {
        return React.isValidElement(element);
      }
      function isElementOfType(inst, convenienceConstructor) {
        return React.isValidElement(inst) && inst.type === convenienceConstructor;
      }
      function isDOMComponent(inst) {
        return !!(inst && inst.nodeType === ELEMENT_NODE && inst.tagName);
      }
      function isDOMComponentElement(inst) {
        return !!(inst && React.isValidElement(inst) && !!inst.tagName);
      }
      function isCompositeComponent(inst) {
        if (isDOMComponent(inst)) {
          return false;
        }
        return inst != null && typeof inst.render === 'function' && typeof inst.setState === 'function';
      }
      function isCompositeComponentWithType(inst, type) {
        if (!isCompositeComponent(inst)) {
          return false;
        }
        var internalInstance = get(inst);
        var constructor = internalInstance.type;
        return constructor === type;
      }
      function findAllInRenderedTree(inst, test) {
        validateClassInstance(inst, 'findAllInRenderedTree');
        if (!inst) {
          return [];
        }
        var internalInstance = get(inst);
        return findAllInRenderedFiberTreeInternal(internalInstance, test);
      }
      function scryRenderedDOMComponentsWithClass(root, classNames) {
        validateClassInstance(root, 'scryRenderedDOMComponentsWithClass');
        return findAllInRenderedTree(root, function(inst) {
          if (isDOMComponent(inst)) {
            var className = inst.className;
            if (typeof className !== 'string') {
              className = inst.getAttribute('class') || '';
            }
            var classList = className.split(/\s+/);
            if (!isArray(classNames)) {
              if (classNames === undefined) {
                throw new Error('TestUtils.scryRenderedDOMComponentsWithClass expects a ' + 'className as a second argument.');
              }
              classNames = classNames.split(/\s+/);
            }
            return classNames.every(function(name) {
              return classList.indexOf(name) !== -1;
            });
          }
          return false;
        });
      }
      function findRenderedDOMComponentWithClass(root, className) {
        validateClassInstance(root, 'findRenderedDOMComponentWithClass');
        var all = scryRenderedDOMComponentsWithClass(root, className);
        if (all.length !== 1) {
          throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for class:' + className);
        }
        return all[0];
      }
      function scryRenderedDOMComponentsWithTag(root, tagName) {
        validateClassInstance(root, 'scryRenderedDOMComponentsWithTag');
        return findAllInRenderedTree(root, function(inst) {
          return isDOMComponent(inst) && inst.tagName.toUpperCase() === tagName.toUpperCase();
        });
      }
      function findRenderedDOMComponentWithTag(root, tagName) {
        validateClassInstance(root, 'findRenderedDOMComponentWithTag');
        var all = scryRenderedDOMComponentsWithTag(root, tagName);
        if (all.length !== 1) {
          throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for tag:' + tagName);
        }
        return all[0];
      }
      function scryRenderedComponentsWithType(root, componentType) {
        validateClassInstance(root, 'scryRenderedComponentsWithType');
        return findAllInRenderedTree(root, function(inst) {
          return isCompositeComponentWithType(inst, componentType);
        });
      }
      function findRenderedComponentWithType(root, componentType) {
        validateClassInstance(root, 'findRenderedComponentWithType');
        var all = scryRenderedComponentsWithType(root, componentType);
        if (all.length !== 1) {
          throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for componentType:' + componentType);
        }
        return all[0];
      }
      function mockComponent(module, mockTagName) {
        {
          if (!hasWarnedAboutDeprecatedMockComponent) {
            hasWarnedAboutDeprecatedMockComponent = true;
            warn('ReactTestUtils.mockComponent() is deprecated. ' + 'Use shallow rendering or jest.mock() instead.\n\n' + 'See https://reactjs.org/link/test-utils-mock-component for more information.');
          }
        }
        mockTagName = mockTagName || module.mockTagName || 'div';
        module.prototype.render.mockImplementation(function() {
          return React.createElement(mockTagName, null, this.props.children);
        });
        return this;
      }
      function nativeTouchData(x, y) {
        return {touches: [{
            pageX: x,
            pageY: y
          }]};
      }
      function executeDispatch(event, listener, inst) {
        var type = event.type || 'unknown-event';
        event.currentTarget = getNodeFromInstance(inst);
        invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
        event.currentTarget = null;
      }
      function executeDispatchesInOrder(event) {
        var dispatchListeners = event._dispatchListeners;
        var dispatchInstances = event._dispatchInstances;
        if (isArray(dispatchListeners)) {
          for (var i = 0; i < dispatchListeners.length; i++) {
            if (event.isPropagationStopped()) {
              break;
            }
            executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
          }
        } else if (dispatchListeners) {
          executeDispatch(event, dispatchListeners, dispatchInstances);
        }
        event._dispatchListeners = null;
        event._dispatchInstances = null;
      }
      var executeDispatchesAndRelease = function(event) {
        if (event) {
          executeDispatchesInOrder(event);
          if (!event.isPersistent()) {
            event.constructor.release(event);
          }
        }
      };
      function isInteractive(tag) {
        return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
      }
      function getParent(inst) {
        do {
          inst = inst.return;
        } while (inst && inst.tag !== HostComponent);
        if (inst) {
          return inst;
        }
        return null;
      }
      function traverseTwoPhase(inst, fn, arg) {
        var path = [];
        while (inst) {
          path.push(inst);
          inst = getParent(inst);
        }
        var i;
        for (i = path.length; i-- > 0; ) {
          fn(path[i], 'captured', arg);
        }
        for (i = 0; i < path.length; i++) {
          fn(path[i], 'bubbled', arg);
        }
      }
      function shouldPreventMouseEvent(name, type, props) {
        switch (name) {
          case 'onClick':
          case 'onClickCapture':
          case 'onDoubleClick':
          case 'onDoubleClickCapture':
          case 'onMouseDown':
          case 'onMouseDownCapture':
          case 'onMouseMove':
          case 'onMouseMoveCapture':
          case 'onMouseUp':
          case 'onMouseUpCapture':
          case 'onMouseEnter':
            return !!(props.disabled && isInteractive(type));
          default:
            return false;
        }
      }
      function getListener(inst, registrationName) {
        var stateNode = inst.stateNode;
        if (!stateNode) {
          return null;
        }
        var props = getFiberCurrentPropsFromNode(stateNode);
        if (!props) {
          return null;
        }
        var listener = props[registrationName];
        if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
          return null;
        }
        if (listener && typeof listener !== 'function') {
          throw new Error("Expected `" + registrationName + "` listener to be a function, instead got a value of `" + typeof listener + "` type.");
        }
        return listener;
      }
      function listenerAtPhase(inst, event, propagationPhase) {
        var registrationName = event._reactName;
        if (propagationPhase === 'captured') {
          registrationName += 'Capture';
        }
        return getListener(inst, registrationName);
      }
      function accumulateDispatches(inst, ignoredDirection, event) {
        if (inst && event && event._reactName) {
          var registrationName = event._reactName;
          var listener = getListener(inst, registrationName);
          if (listener) {
            if (event._dispatchListeners == null) {
              event._dispatchListeners = [];
            }
            if (event._dispatchInstances == null) {
              event._dispatchInstances = [];
            }
            event._dispatchListeners.push(listener);
            event._dispatchInstances.push(inst);
          }
        }
      }
      function accumulateDirectionalDispatches(inst, phase, event) {
        {
          if (!inst) {
            error('Dispatching inst must not be null');
          }
        }
        var listener = listenerAtPhase(inst, event, phase);
        if (listener) {
          if (event._dispatchListeners == null) {
            event._dispatchListeners = [];
          }
          if (event._dispatchInstances == null) {
            event._dispatchInstances = [];
          }
          event._dispatchListeners.push(listener);
          event._dispatchInstances.push(inst);
        }
      }
      function accumulateDirectDispatchesSingle(event) {
        if (event && event._reactName) {
          accumulateDispatches(event._targetInst, null, event);
        }
      }
      function accumulateTwoPhaseDispatchesSingle(event) {
        if (event && event._reactName) {
          traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
        }
      }
      var Simulate = {};
      var directDispatchEventTypes = new Set(['mouseEnter', 'mouseLeave', 'pointerEnter', 'pointerLeave']);
      function makeSimulator(eventType) {
        return function(domNode, eventData) {
          if (React.isValidElement(domNode)) {
            throw new Error('TestUtils.Simulate expected a DOM node as the first argument but received ' + 'a React element. Pass the DOM node you wish to simulate the event on instead. ' + 'Note that TestUtils.Simulate will not work if you are using shallow rendering.');
          }
          if (isCompositeComponent(domNode)) {
            throw new Error('TestUtils.Simulate expected a DOM node as the first argument but received ' + 'a component instance. Pass the DOM node you wish to simulate the event on instead.');
          }
          var reactName = 'on' + eventType[0].toUpperCase() + eventType.slice(1);
          var fakeNativeEvent = new Event();
          fakeNativeEvent.target = domNode;
          fakeNativeEvent.type = eventType.toLowerCase();
          var targetInst = getInstanceFromNode(domNode);
          var event = new SyntheticEvent(reactName, fakeNativeEvent.type, targetInst, fakeNativeEvent, domNode);
          event.persist();
          assign(event, eventData);
          if (directDispatchEventTypes.has(eventType)) {
            accumulateDirectDispatchesSingle(event);
          } else {
            accumulateTwoPhaseDispatchesSingle(event);
          }
          ReactDOM.unstable_batchedUpdates(function() {
            enqueueStateRestore(domNode);
            executeDispatchesAndRelease(event);
            rethrowCaughtError();
          });
          restoreStateIfNeeded();
        };
      }
      var simulatedEventTypes = ['blur', 'cancel', 'click', 'close', 'contextMenu', 'copy', 'cut', 'auxClick', 'doubleClick', 'dragEnd', 'dragStart', 'drop', 'focus', 'input', 'invalid', 'keyDown', 'keyPress', 'keyUp', 'mouseDown', 'mouseUp', 'paste', 'pause', 'play', 'pointerCancel', 'pointerDown', 'pointerUp', 'rateChange', 'reset', 'resize', 'seeked', 'submit', 'touchCancel', 'touchEnd', 'touchStart', 'volumeChange', 'drag', 'dragEnter', 'dragExit', 'dragLeave', 'dragOver', 'mouseMove', 'mouseOut', 'mouseOver', 'pointerMove', 'pointerOut', 'pointerOver', 'scroll', 'toggle', 'touchMove', 'wheel', 'abort', 'animationEnd', 'animationIteration', 'animationStart', 'canPlay', 'canPlayThrough', 'durationChange', 'emptied', 'encrypted', 'ended', 'error', 'gotPointerCapture', 'load', 'loadedData', 'loadedMetadata', 'loadStart', 'lostPointerCapture', 'playing', 'progress', 'seeking', 'stalled', 'suspend', 'timeUpdate', 'transitionEnd', 'waiting', 'mouseEnter', 'mouseLeave', 'pointerEnter', 'pointerLeave', 'change', 'select', 'beforeInput', 'compositionEnd', 'compositionStart', 'compositionUpdate'];
      function buildSimulators() {
        simulatedEventTypes.forEach(function(eventType) {
          Simulate[eventType] = makeSimulator(eventType);
        });
      }
      buildSimulators();
      exports.Simulate = Simulate;
      exports.act = act;
      exports.findAllInRenderedTree = findAllInRenderedTree;
      exports.findRenderedComponentWithType = findRenderedComponentWithType;
      exports.findRenderedDOMComponentWithClass = findRenderedDOMComponentWithClass;
      exports.findRenderedDOMComponentWithTag = findRenderedDOMComponentWithTag;
      exports.isCompositeComponent = isCompositeComponent;
      exports.isCompositeComponentWithType = isCompositeComponentWithType;
      exports.isDOMComponent = isDOMComponent;
      exports.isDOMComponentElement = isDOMComponentElement;
      exports.isElement = isElement;
      exports.isElementOfType = isElementOfType;
      exports.mockComponent = mockComponent;
      exports.nativeTouchData = nativeTouchData;
      exports.renderIntoDocument = renderIntoDocument;
      exports.scryRenderedComponentsWithType = scryRenderedComponentsWithType;
      exports.scryRenderedDOMComponentsWithClass = scryRenderedDOMComponentsWithClass;
      exports.scryRenderedDOMComponentsWithTag = scryRenderedDOMComponentsWithTag;
      exports.traverseTwoPhase = traverseTwoPhase;
    })();
  }
})(require('process'));
