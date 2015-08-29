/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPropagators = require("./EventPropagators");
var React = require("./React");
var ReactElement = require("./ReactElement");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactInstanceMap = require("./ReactInstanceMap");
var ReactMount = require("./ReactMount");
var ReactUpdates = require("./ReactUpdates");
var SyntheticEvent = require("./SyntheticEvent");
var assign = require("./Object.assign");
var emptyObject = require("./emptyObject");
var topLevelTypes = EventConstants.topLevelTypes;
function Event(suffix) {}
var ReactTestUtils = {
  renderIntoDocument: function(instance) {
    var div = document.createElement('div');
    return React.render(instance, div);
  },
  isElement: function(element) {
    return ReactElement.isValidElement(element);
  },
  isElementOfType: function(inst, convenienceConstructor) {
    return (ReactElement.isValidElement(inst) && inst.type === convenienceConstructor);
  },
  isDOMComponent: function(inst) {
    return !!(inst && inst.tagName && inst.getDOMNode);
  },
  isDOMComponentElement: function(inst) {
    return !!(inst && ReactElement.isValidElement(inst) && !!inst.tagName);
  },
  isCompositeComponent: function(inst) {
    return typeof inst.render === 'function' && typeof inst.setState === 'function';
  },
  isCompositeComponentWithType: function(inst, type) {
    return !!(ReactTestUtils.isCompositeComponent(inst) && (inst.constructor === type));
  },
  isCompositeComponentElement: function(inst) {
    if (!ReactElement.isValidElement(inst)) {
      return false;
    }
    var prototype = inst.type.prototype;
    return (typeof prototype.render === 'function' && typeof prototype.setState === 'function');
  },
  isCompositeComponentElementWithType: function(inst, type) {
    return !!(ReactTestUtils.isCompositeComponentElement(inst) && (inst.constructor === type));
  },
  getRenderedChildOfCompositeComponent: function(inst) {
    if (!ReactTestUtils.isCompositeComponent(inst)) {
      return null;
    }
    var internalInstance = ReactInstanceMap.get(inst);
    return internalInstance._renderedComponent.getPublicInstance();
  },
  findAllInRenderedTree: function(inst, test) {
    if (!inst) {
      return [];
    }
    var ret = test(inst) ? [inst] : [];
    if (ReactTestUtils.isDOMComponent(inst)) {
      var internalInstance = ReactInstanceMap.get(inst);
      var renderedChildren = internalInstance._renderedComponent._renderedChildren;
      var key;
      for (key in renderedChildren) {
        if (!renderedChildren.hasOwnProperty(key)) {
          continue;
        }
        if (!renderedChildren[key].getPublicInstance) {
          continue;
        }
        ret = ret.concat(ReactTestUtils.findAllInRenderedTree(renderedChildren[key].getPublicInstance(), test));
      }
    } else if (ReactTestUtils.isCompositeComponent(inst)) {
      ret = ret.concat(ReactTestUtils.findAllInRenderedTree(ReactTestUtils.getRenderedChildOfCompositeComponent(inst), test));
    }
    return ret;
  },
  scryRenderedDOMComponentsWithClass: function(root, className) {
    return ReactTestUtils.findAllInRenderedTree(root, function(inst) {
      var instClassName = inst.props.className;
      return ReactTestUtils.isDOMComponent(inst) && ((instClassName && (' ' + instClassName + ' ').indexOf(' ' + className + ' ') !== -1));
    });
  },
  findRenderedDOMComponentWithClass: function(root, className) {
    var all = ReactTestUtils.scryRenderedDOMComponentsWithClass(root, className);
    if (all.length !== 1) {
      throw new Error('Did not find exactly one match ' + '(found: ' + all.length + ') for class:' + className);
    }
    return all[0];
  },
  scryRenderedDOMComponentsWithTag: function(root, tagName) {
    return ReactTestUtils.findAllInRenderedTree(root, function(inst) {
      return ReactTestUtils.isDOMComponent(inst) && inst.tagName === tagName.toUpperCase();
    });
  },
  findRenderedDOMComponentWithTag: function(root, tagName) {
    var all = ReactTestUtils.scryRenderedDOMComponentsWithTag(root, tagName);
    if (all.length !== 1) {
      throw new Error('Did not find exactly one match for tag:' + tagName);
    }
    return all[0];
  },
  scryRenderedComponentsWithType: function(root, componentType) {
    return ReactTestUtils.findAllInRenderedTree(root, function(inst) {
      return ReactTestUtils.isCompositeComponentWithType(inst, componentType);
    });
  },
  findRenderedComponentWithType: function(root, componentType) {
    var all = ReactTestUtils.scryRenderedComponentsWithType(root, componentType);
    if (all.length !== 1) {
      throw new Error('Did not find exactly one match for componentType:' + componentType);
    }
    return all[0];
  },
  mockComponent: function(module, mockTagName) {
    mockTagName = mockTagName || module.mockTagName || "div";
    module.prototype.render.mockImplementation(function() {
      return React.createElement(mockTagName, null, this.props.children);
    });
    return this;
  },
  simulateNativeEventOnNode: function(topLevelType, node, fakeNativeEvent) {
    fakeNativeEvent.target = node;
    ReactBrowserEventEmitter.ReactEventListener.dispatchEvent(topLevelType, fakeNativeEvent);
  },
  simulateNativeEventOnDOMComponent: function(topLevelType, comp, fakeNativeEvent) {
    ReactTestUtils.simulateNativeEventOnNode(topLevelType, comp.getDOMNode(), fakeNativeEvent);
  },
  nativeTouchData: function(x, y) {
    return {touches: [{
        pageX: x,
        pageY: y
      }]};
  },
  createRenderer: function() {
    return new ReactShallowRenderer();
  },
  Simulate: null,
  SimulateNative: {}
};
var ReactShallowRenderer = function() {
  this._instance = null;
};
ReactShallowRenderer.prototype.getRenderOutput = function() {
  return ((this._instance && this._instance._renderedComponent && this._instance._renderedComponent._renderedOutput) || null);
};
var NoopInternalComponent = function(element) {
  this._renderedOutput = element;
  this._currentElement = element === null || element === false ? ReactEmptyComponent.emptyElement : element;
};
NoopInternalComponent.prototype = {
  mountComponent: function() {},
  receiveComponent: function(element) {
    this._renderedOutput = element;
    this._currentElement = element === null || element === false ? ReactEmptyComponent.emptyElement : element;
  },
  unmountComponent: function() {}
};
var ShallowComponentWrapper = function() {};
assign(ShallowComponentWrapper.prototype, ReactCompositeComponent.Mixin, {
  _instantiateReactComponent: function(element) {
    return new NoopInternalComponent(element);
  },
  _replaceNodeWithMarkupByID: function() {},
  _renderValidatedComponent: ReactCompositeComponent.Mixin._renderValidatedComponentWithoutOwnerOrContext
});
ReactShallowRenderer.prototype.render = function(element, context) {
  if (!context) {
    context = emptyObject;
  }
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  this._render(element, transaction, context);
  ReactUpdates.ReactReconcileTransaction.release(transaction);
};
ReactShallowRenderer.prototype.unmount = function() {
  if (this._instance) {
    this._instance.unmountComponent();
  }
};
ReactShallowRenderer.prototype._render = function(element, transaction, context) {
  if (!this._instance) {
    var rootID = ReactInstanceHandles.createReactRootID();
    var instance = new ShallowComponentWrapper(element.type);
    instance.construct(element);
    instance.mountComponent(rootID, transaction, context);
    this._instance = instance;
  } else {
    this._instance.receiveComponent(element, transaction, context);
  }
};
function makeSimulator(eventType) {
  return function(domComponentOrNode, eventData) {
    var node;
    if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
      node = domComponentOrNode.getDOMNode();
    } else if (domComponentOrNode.tagName) {
      node = domComponentOrNode;
    }
    var fakeNativeEvent = new Event();
    fakeNativeEvent.target = node;
    var event = new SyntheticEvent(ReactBrowserEventEmitter.eventNameDispatchConfigs[eventType], ReactMount.getID(node), fakeNativeEvent);
    assign(event, eventData);
    EventPropagators.accumulateTwoPhaseDispatches(event);
    ReactUpdates.batchedUpdates(function() {
      EventPluginHub.enqueueEvents(event);
      EventPluginHub.processEventQueue();
    });
  };
}
function buildSimulators() {
  ReactTestUtils.Simulate = {};
  var eventType;
  for (eventType in ReactBrowserEventEmitter.eventNameDispatchConfigs) {
    ReactTestUtils.Simulate[eventType] = makeSimulator(eventType);
  }
}
var oldInjectEventPluginOrder = EventPluginHub.injection.injectEventPluginOrder;
EventPluginHub.injection.injectEventPluginOrder = function() {
  oldInjectEventPluginOrder.apply(this, arguments);
  buildSimulators();
};
var oldInjectEventPlugins = EventPluginHub.injection.injectEventPluginsByName;
EventPluginHub.injection.injectEventPluginsByName = function() {
  oldInjectEventPlugins.apply(this, arguments);
  buildSimulators();
};
buildSimulators();
function makeNativeSimulator(eventType) {
  return function(domComponentOrNode, nativeEventData) {
    var fakeNativeEvent = new Event(eventType);
    assign(fakeNativeEvent, nativeEventData);
    if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
      ReactTestUtils.simulateNativeEventOnDOMComponent(eventType, domComponentOrNode, fakeNativeEvent);
    } else if (!!domComponentOrNode.tagName) {
      ReactTestUtils.simulateNativeEventOnNode(eventType, domComponentOrNode, fakeNativeEvent);
    }
  };
}
var eventType;
for (eventType in topLevelTypes) {
  var convenienceName = eventType.indexOf('top') === 0 ? eventType.charAt(3).toLowerCase() + eventType.substr(4) : eventType;
  ReactTestUtils.SimulateNative[convenienceName] = makeNativeSimulator(eventType);
}
module.exports = ReactTestUtils;
