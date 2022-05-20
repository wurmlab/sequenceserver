/* */ 
(function(process) {
  'use strict';
  var DOMProperty = require("./DOMProperty");
  var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var ReactElement = require("./ReactElement");
  var ReactElementValidator = require("./ReactElementValidator");
  var ReactEmptyComponent = require("./ReactEmptyComponent");
  var ReactInstanceHandles = require("./ReactInstanceHandles");
  var ReactInstanceMap = require("./ReactInstanceMap");
  var ReactMarkupChecksum = require("./ReactMarkupChecksum");
  var ReactPerf = require("./ReactPerf");
  var ReactReconciler = require("./ReactReconciler");
  var ReactUpdateQueue = require("./ReactUpdateQueue");
  var ReactUpdates = require("./ReactUpdates");
  var emptyObject = require("./emptyObject");
  var containsNode = require("./containsNode");
  var getReactRootElementInContainer = require("./getReactRootElementInContainer");
  var instantiateReactComponent = require("./instantiateReactComponent");
  var invariant = require("./invariant");
  var setInnerHTML = require("./setInnerHTML");
  var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
  var warning = require("./warning");
  var SEPARATOR = ReactInstanceHandles.SEPARATOR;
  var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
  var nodeCache = {};
  var ELEMENT_NODE_TYPE = 1;
  var DOC_NODE_TYPE = 9;
  var instancesByReactRootID = {};
  var containersByReactRootID = {};
  if ("production" !== process.env.NODE_ENV) {
    var rootElementsByReactRootID = {};
  }
  var findComponentRootReusableArray = [];
  function firstDifferenceIndex(string1, string2) {
    var minLen = Math.min(string1.length, string2.length);
    for (var i = 0; i < minLen; i++) {
      if (string1.charAt(i) !== string2.charAt(i)) {
        return i;
      }
    }
    return string1.length === string2.length ? -1 : minLen;
  }
  function getReactRootID(container) {
    var rootElement = getReactRootElementInContainer(container);
    return rootElement && ReactMount.getID(rootElement);
  }
  function getID(node) {
    var id = internalGetID(node);
    if (id) {
      if (nodeCache.hasOwnProperty(id)) {
        var cached = nodeCache[id];
        if (cached !== node) {
          ("production" !== process.env.NODE_ENV ? invariant(!isValid(cached, id), 'ReactMount: Two valid but unequal nodes with the same `%s`: %s', ATTR_NAME, id) : invariant(!isValid(cached, id)));
          nodeCache[id] = node;
        }
      } else {
        nodeCache[id] = node;
      }
    }
    return id;
  }
  function internalGetID(node) {
    return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
  }
  function setID(node, id) {
    var oldID = internalGetID(node);
    if (oldID !== id) {
      delete nodeCache[oldID];
    }
    node.setAttribute(ATTR_NAME, id);
    nodeCache[id] = node;
  }
  function getNode(id) {
    if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
      nodeCache[id] = ReactMount.findReactNodeByID(id);
    }
    return nodeCache[id];
  }
  function getNodeFromInstance(instance) {
    var id = ReactInstanceMap.get(instance)._rootNodeID;
    if (ReactEmptyComponent.isNullComponentID(id)) {
      return null;
    }
    if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
      nodeCache[id] = ReactMount.findReactNodeByID(id);
    }
    return nodeCache[id];
  }
  function isValid(node, id) {
    if (node) {
      ("production" !== process.env.NODE_ENV ? invariant(internalGetID(node) === id, 'ReactMount: Unexpected modification of `%s`', ATTR_NAME) : invariant(internalGetID(node) === id));
      var container = ReactMount.findReactContainerForID(id);
      if (container && containsNode(container, node)) {
        return true;
      }
    }
    return false;
  }
  function purgeID(id) {
    delete nodeCache[id];
  }
  var deepestNodeSoFar = null;
  function findDeepestCachedAncestorImpl(ancestorID) {
    var ancestor = nodeCache[ancestorID];
    if (ancestor && isValid(ancestor, ancestorID)) {
      deepestNodeSoFar = ancestor;
    } else {
      return false;
    }
  }
  function findDeepestCachedAncestor(targetID) {
    deepestNodeSoFar = null;
    ReactInstanceHandles.traverseAncestors(targetID, findDeepestCachedAncestorImpl);
    var foundNode = deepestNodeSoFar;
    deepestNodeSoFar = null;
    return foundNode;
  }
  function mountComponentIntoNode(componentInstance, rootID, container, transaction, shouldReuseMarkup) {
    var markup = ReactReconciler.mountComponent(componentInstance, rootID, transaction, emptyObject);
    componentInstance._isTopLevel = true;
    ReactMount._mountImageIntoNode(markup, container, shouldReuseMarkup);
  }
  function batchedMountComponentIntoNode(componentInstance, rootID, container, shouldReuseMarkup) {
    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(mountComponentIntoNode, null, componentInstance, rootID, container, transaction, shouldReuseMarkup);
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }
  var ReactMount = {
    _instancesByReactRootID: instancesByReactRootID,
    scrollMonitor: function(container, renderCallback) {
      renderCallback();
    },
    _updateRootComponent: function(prevComponent, nextElement, container, callback) {
      if ("production" !== process.env.NODE_ENV) {
        ReactElementValidator.checkAndWarnForMutatedProps(nextElement);
      }
      ReactMount.scrollMonitor(container, function() {
        ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
        if (callback) {
          ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
        }
      });
      if ("production" !== process.env.NODE_ENV) {
        rootElementsByReactRootID[getReactRootID(container)] = getReactRootElementInContainer(container);
      }
      return prevComponent;
    },
    _registerComponent: function(nextComponent, container) {
      ("production" !== process.env.NODE_ENV ? invariant(container && ((container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)), '_registerComponent(...): Target container is not a DOM element.') : invariant(container && ((container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE))));
      ReactBrowserEventEmitter.ensureScrollValueMonitoring();
      var reactRootID = ReactMount.registerContainer(container);
      instancesByReactRootID[reactRootID] = nextComponent;
      return reactRootID;
    },
    _renderNewRootComponent: function(nextElement, container, shouldReuseMarkup) {
      ("production" !== process.env.NODE_ENV ? warning(ReactCurrentOwner.current == null, '_renderNewRootComponent(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from ' + 'render is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate.') : null);
      var componentInstance = instantiateReactComponent(nextElement, null);
      var reactRootID = ReactMount._registerComponent(componentInstance, container);
      ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, reactRootID, container, shouldReuseMarkup);
      if ("production" !== process.env.NODE_ENV) {
        rootElementsByReactRootID[reactRootID] = getReactRootElementInContainer(container);
      }
      return componentInstance;
    },
    render: function(nextElement, container, callback) {
      ("production" !== process.env.NODE_ENV ? invariant(ReactElement.isValidElement(nextElement), 'React.render(): Invalid component element.%s', (typeof nextElement === 'string' ? ' Instead of passing an element string, make sure to instantiate ' + 'it by passing it to React.createElement.' : typeof nextElement === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' : nextElement != null && nextElement.props !== undefined ? ' This may be caused by unintentionally loading two independent ' + 'copies of React.' : '')) : invariant(ReactElement.isValidElement(nextElement)));
      var prevComponent = instancesByReactRootID[getReactRootID(container)];
      if (prevComponent) {
        var prevElement = prevComponent._currentElement;
        if (shouldUpdateReactComponent(prevElement, nextElement)) {
          return ReactMount._updateRootComponent(prevComponent, nextElement, container, callback).getPublicInstance();
        } else {
          ReactMount.unmountComponentAtNode(container);
        }
      }
      var reactRootElement = getReactRootElementInContainer(container);
      var containerHasReactMarkup = reactRootElement && ReactMount.isRenderedByReact(reactRootElement);
      if ("production" !== process.env.NODE_ENV) {
        if (!containerHasReactMarkup || reactRootElement.nextSibling) {
          var rootElementSibling = reactRootElement;
          while (rootElementSibling) {
            if (ReactMount.isRenderedByReact(rootElementSibling)) {
              ("production" !== process.env.NODE_ENV ? warning(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.') : null);
              break;
            }
            rootElementSibling = rootElementSibling.nextSibling;
          }
        }
      }
      var shouldReuseMarkup = containerHasReactMarkup && !prevComponent;
      var component = ReactMount._renderNewRootComponent(nextElement, container, shouldReuseMarkup).getPublicInstance();
      if (callback) {
        callback.call(component);
      }
      return component;
    },
    constructAndRenderComponent: function(constructor, props, container) {
      var element = ReactElement.createElement(constructor, props);
      return ReactMount.render(element, container);
    },
    constructAndRenderComponentByID: function(constructor, props, id) {
      var domNode = document.getElementById(id);
      ("production" !== process.env.NODE_ENV ? invariant(domNode, 'Tried to get element with id of "%s" but it is not present on the page.', id) : invariant(domNode));
      return ReactMount.constructAndRenderComponent(constructor, props, domNode);
    },
    registerContainer: function(container) {
      var reactRootID = getReactRootID(container);
      if (reactRootID) {
        reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
      }
      if (!reactRootID) {
        reactRootID = ReactInstanceHandles.createReactRootID();
      }
      containersByReactRootID[reactRootID] = container;
      return reactRootID;
    },
    unmountComponentAtNode: function(container) {
      ("production" !== process.env.NODE_ENV ? warning(ReactCurrentOwner.current == null, 'unmountComponentAtNode(): Render methods should be a pure function of ' + 'props and state; triggering nested component updates from render is ' + 'not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate.') : null);
      ("production" !== process.env.NODE_ENV ? invariant(container && ((container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)), 'unmountComponentAtNode(...): Target container is not a DOM element.') : invariant(container && ((container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE))));
      var reactRootID = getReactRootID(container);
      var component = instancesByReactRootID[reactRootID];
      if (!component) {
        return false;
      }
      ReactMount.unmountComponentFromNode(component, container);
      delete instancesByReactRootID[reactRootID];
      delete containersByReactRootID[reactRootID];
      if ("production" !== process.env.NODE_ENV) {
        delete rootElementsByReactRootID[reactRootID];
      }
      return true;
    },
    unmountComponentFromNode: function(instance, container) {
      ReactReconciler.unmountComponent(instance);
      if (container.nodeType === DOC_NODE_TYPE) {
        container = container.documentElement;
      }
      while (container.lastChild) {
        container.removeChild(container.lastChild);
      }
    },
    findReactContainerForID: function(id) {
      var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
      var container = containersByReactRootID[reactRootID];
      if ("production" !== process.env.NODE_ENV) {
        var rootElement = rootElementsByReactRootID[reactRootID];
        if (rootElement && rootElement.parentNode !== container) {
          ("production" !== process.env.NODE_ENV ? invariant(internalGetID(rootElement) === reactRootID, 'ReactMount: Root element ID differed from reactRootID.') : invariant(internalGetID(rootElement) === reactRootID));
          var containerChild = container.firstChild;
          if (containerChild && reactRootID === internalGetID(containerChild)) {
            rootElementsByReactRootID[reactRootID] = containerChild;
          } else {
            ("production" !== process.env.NODE_ENV ? warning(false, 'ReactMount: Root element has been removed from its original ' + 'container. New container:', rootElement.parentNode) : null);
          }
        }
      }
      return container;
    },
    findReactNodeByID: function(id) {
      var reactRoot = ReactMount.findReactContainerForID(id);
      return ReactMount.findComponentRoot(reactRoot, id);
    },
    isRenderedByReact: function(node) {
      if (node.nodeType !== 1) {
        return false;
      }
      var id = ReactMount.getID(node);
      return id ? id.charAt(0) === SEPARATOR : false;
    },
    getFirstReactDOM: function(node) {
      var current = node;
      while (current && current.parentNode !== current) {
        if (ReactMount.isRenderedByReact(current)) {
          return current;
        }
        current = current.parentNode;
      }
      return null;
    },
    findComponentRoot: function(ancestorNode, targetID) {
      var firstChildren = findComponentRootReusableArray;
      var childIndex = 0;
      var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;
      firstChildren[0] = deepestAncestor.firstChild;
      firstChildren.length = 1;
      while (childIndex < firstChildren.length) {
        var child = firstChildren[childIndex++];
        var targetChild;
        while (child) {
          var childID = ReactMount.getID(child);
          if (childID) {
            if (targetID === childID) {
              targetChild = child;
            } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
              firstChildren.length = childIndex = 0;
              firstChildren.push(child.firstChild);
            }
          } else {
            firstChildren.push(child.firstChild);
          }
          child = child.nextSibling;
        }
        if (targetChild) {
          firstChildren.length = 0;
          return targetChild;
        }
      }
      firstChildren.length = 0;
      ("production" !== process.env.NODE_ENV ? invariant(false, 'findComponentRoot(..., %s): Unable to find element. This probably ' + 'means the DOM was unexpectedly mutated (e.g., by the browser), ' + 'usually due to forgetting a <tbody> when using tables, nesting tags ' + 'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' + 'parent. ' + 'Try inspecting the child nodes of the element with React ID `%s`.', targetID, ReactMount.getID(ancestorNode)) : invariant(false));
    },
    _mountImageIntoNode: function(markup, container, shouldReuseMarkup) {
      ("production" !== process.env.NODE_ENV ? invariant(container && ((container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)), 'mountComponentIntoNode(...): Target container is not valid.') : invariant(container && ((container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE))));
      if (shouldReuseMarkup) {
        var rootElement = getReactRootElementInContainer(container);
        if (ReactMarkupChecksum.canReuseMarkup(markup, rootElement)) {
          return;
        } else {
          var checksum = rootElement.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
          rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
          var rootMarkup = rootElement.outerHTML;
          rootElement.setAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME, checksum);
          var diffIndex = firstDifferenceIndex(markup, rootMarkup);
          var difference = ' (client) ' + markup.substring(diffIndex - 20, diffIndex + 20) + '\n (server) ' + rootMarkup.substring(diffIndex - 20, diffIndex + 20);
          ("production" !== process.env.NODE_ENV ? invariant(container.nodeType !== DOC_NODE_TYPE, 'You\'re trying to render a component to the document using ' + 'server rendering but the checksum was invalid. This usually ' + 'means you rendered a different component type or props on ' + 'the client from the one on the server, or your render() ' + 'methods are impure. React cannot handle this case due to ' + 'cross-browser quirks by rendering at the document root. You ' + 'should look for environment dependent code in your components ' + 'and ensure the props are the same client and server side:\n%s', difference) : invariant(container.nodeType !== DOC_NODE_TYPE));
          if ("production" !== process.env.NODE_ENV) {
            ("production" !== process.env.NODE_ENV ? warning(false, 'React attempted to reuse markup in a container but the ' + 'checksum was invalid. This generally means that you are ' + 'using server rendering and the markup generated on the ' + 'server was not what the client was expecting. React injected ' + 'new markup to compensate which works but you have lost many ' + 'of the benefits of server rendering. Instead, figure out ' + 'why the markup being generated is different on the client ' + 'or server:\n%s', difference) : null);
          }
        }
      }
      ("production" !== process.env.NODE_ENV ? invariant(container.nodeType !== DOC_NODE_TYPE, 'You\'re trying to render a component to the document but ' + 'you didn\'t use server rendering. We can\'t do this ' + 'without using server rendering due to cross-browser quirks. ' + 'See React.renderToString() for server rendering.') : invariant(container.nodeType !== DOC_NODE_TYPE));
      setInnerHTML(container, markup);
    },
    getReactRootID: getReactRootID,
    getID: getID,
    setID: setID,
    getNode: getNode,
    getNodeFromInstance: getNodeFromInstance,
    purgeID: purgeID
  };
  ReactPerf.measureMethods(ReactMount, 'ReactMount', {
    _renderNewRootComponent: '_renderNewRootComponent',
    _mountImageIntoNode: '_mountImageIntoNode'
  });
  module.exports = ReactMount;
})(require("process"));
