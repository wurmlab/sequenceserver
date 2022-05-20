/* */ 
(function(process) {
  'use strict';
  var EventPluginUtils = require("./EventPluginUtils");
  var ReactChildren = require("./ReactChildren");
  var ReactComponent = require("./ReactComponent");
  var ReactClass = require("./ReactClass");
  var ReactContext = require("./ReactContext");
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var ReactElement = require("./ReactElement");
  var ReactElementValidator = require("./ReactElementValidator");
  var ReactDOM = require("./ReactDOM");
  var ReactDOMTextComponent = require("./ReactDOMTextComponent");
  var ReactDefaultInjection = require("./ReactDefaultInjection");
  var ReactInstanceHandles = require("./ReactInstanceHandles");
  var ReactMount = require("./ReactMount");
  var ReactPerf = require("./ReactPerf");
  var ReactPropTypes = require("./ReactPropTypes");
  var ReactReconciler = require("./ReactReconciler");
  var ReactServerRendering = require("./ReactServerRendering");
  var assign = require("./Object.assign");
  var findDOMNode = require("./findDOMNode");
  var onlyChild = require("./onlyChild");
  ReactDefaultInjection.inject();
  var createElement = ReactElement.createElement;
  var createFactory = ReactElement.createFactory;
  var cloneElement = ReactElement.cloneElement;
  if ("production" !== process.env.NODE_ENV) {
    createElement = ReactElementValidator.createElement;
    createFactory = ReactElementValidator.createFactory;
    cloneElement = ReactElementValidator.cloneElement;
  }
  var render = ReactPerf.measure('React', 'render', ReactMount.render);
  var React = {
    Children: {
      map: ReactChildren.map,
      forEach: ReactChildren.forEach,
      count: ReactChildren.count,
      only: onlyChild
    },
    Component: ReactComponent,
    DOM: ReactDOM,
    PropTypes: ReactPropTypes,
    initializeTouchEvents: function(shouldUseTouch) {
      EventPluginUtils.useTouchEvents = shouldUseTouch;
    },
    createClass: ReactClass.createClass,
    createElement: createElement,
    cloneElement: cloneElement,
    createFactory: createFactory,
    createMixin: function(mixin) {
      return mixin;
    },
    constructAndRenderComponent: ReactMount.constructAndRenderComponent,
    constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
    findDOMNode: findDOMNode,
    render: render,
    renderToString: ReactServerRendering.renderToString,
    renderToStaticMarkup: ReactServerRendering.renderToStaticMarkup,
    unmountComponentAtNode: ReactMount.unmountComponentAtNode,
    isValidElement: ReactElement.isValidElement,
    withContext: ReactContext.withContext,
    __spread: assign
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function') {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
      CurrentOwner: ReactCurrentOwner,
      InstanceHandles: ReactInstanceHandles,
      Mount: ReactMount,
      Reconciler: ReactReconciler,
      TextComponent: ReactDOMTextComponent
    });
  }
  if ("production" !== process.env.NODE_ENV) {
    var ExecutionEnvironment = require("./ExecutionEnvironment");
    if (ExecutionEnvironment.canUseDOM && window.top === window.self) {
      if (navigator.userAgent.indexOf('Chrome') > -1) {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
          console.debug('Download the React DevTools for a better development experience: ' + 'https://fb.me/react-devtools');
        }
      }
      var expectedFeatures = [Array.isArray, Array.prototype.every, Array.prototype.forEach, Array.prototype.indexOf, Array.prototype.map, Date.now, Function.prototype.bind, Object.keys, String.prototype.split, String.prototype.trim, Object.create, Object.freeze];
      for (var i = 0; i < expectedFeatures.length; i++) {
        if (!expectedFeatures[i]) {
          console.error('One or more ES5 shim/shams expected by React are not available: ' + 'https://fb.me/react-warning-polyfills');
          break;
        }
      }
    }
  }
  React.version = '0.13.3';
  module.exports = React;
})(require("process"));
