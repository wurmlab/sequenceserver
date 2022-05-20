/* */ 
(function(process) {
  'use strict';
  var ReactComponentEnvironment = require("./ReactComponentEnvironment");
  var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");
  var ReactReconciler = require("./ReactReconciler");
  var ReactChildReconciler = require("./ReactChildReconciler");
  var updateDepth = 0;
  var updateQueue = [];
  var markupQueue = [];
  function enqueueMarkup(parentID, markup, toIndex) {
    updateQueue.push({
      parentID: parentID,
      parentNode: null,
      type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
      markupIndex: markupQueue.push(markup) - 1,
      textContent: null,
      fromIndex: null,
      toIndex: toIndex
    });
  }
  function enqueueMove(parentID, fromIndex, toIndex) {
    updateQueue.push({
      parentID: parentID,
      parentNode: null,
      type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
      markupIndex: null,
      textContent: null,
      fromIndex: fromIndex,
      toIndex: toIndex
    });
  }
  function enqueueRemove(parentID, fromIndex) {
    updateQueue.push({
      parentID: parentID,
      parentNode: null,
      type: ReactMultiChildUpdateTypes.REMOVE_NODE,
      markupIndex: null,
      textContent: null,
      fromIndex: fromIndex,
      toIndex: null
    });
  }
  function enqueueTextContent(parentID, textContent) {
    updateQueue.push({
      parentID: parentID,
      parentNode: null,
      type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
      markupIndex: null,
      textContent: textContent,
      fromIndex: null,
      toIndex: null
    });
  }
  function processQueue() {
    if (updateQueue.length) {
      ReactComponentEnvironment.processChildrenUpdates(updateQueue, markupQueue);
      clearQueue();
    }
  }
  function clearQueue() {
    updateQueue.length = 0;
    markupQueue.length = 0;
  }
  var ReactMultiChild = {Mixin: {
      mountChildren: function(nestedChildren, transaction, context) {
        var children = ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context);
        this._renderedChildren = children;
        var mountImages = [];
        var index = 0;
        for (var name in children) {
          if (children.hasOwnProperty(name)) {
            var child = children[name];
            var rootID = this._rootNodeID + name;
            var mountImage = ReactReconciler.mountComponent(child, rootID, transaction, context);
            child._mountIndex = index;
            mountImages.push(mountImage);
            index++;
          }
        }
        return mountImages;
      },
      updateTextContent: function(nextContent) {
        updateDepth++;
        var errorThrown = true;
        try {
          var prevChildren = this._renderedChildren;
          ReactChildReconciler.unmountChildren(prevChildren);
          for (var name in prevChildren) {
            if (prevChildren.hasOwnProperty(name)) {
              this._unmountChildByName(prevChildren[name], name);
            }
          }
          this.setTextContent(nextContent);
          errorThrown = false;
        } finally {
          updateDepth--;
          if (!updateDepth) {
            if (errorThrown) {
              clearQueue();
            } else {
              processQueue();
            }
          }
        }
      },
      updateChildren: function(nextNestedChildren, transaction, context) {
        updateDepth++;
        var errorThrown = true;
        try {
          this._updateChildren(nextNestedChildren, transaction, context);
          errorThrown = false;
        } finally {
          updateDepth--;
          if (!updateDepth) {
            if (errorThrown) {
              clearQueue();
            } else {
              processQueue();
            }
          }
        }
      },
      _updateChildren: function(nextNestedChildren, transaction, context) {
        var prevChildren = this._renderedChildren;
        var nextChildren = ReactChildReconciler.updateChildren(prevChildren, nextNestedChildren, transaction, context);
        this._renderedChildren = nextChildren;
        if (!nextChildren && !prevChildren) {
          return;
        }
        var name;
        var lastIndex = 0;
        var nextIndex = 0;
        for (name in nextChildren) {
          if (!nextChildren.hasOwnProperty(name)) {
            continue;
          }
          var prevChild = prevChildren && prevChildren[name];
          var nextChild = nextChildren[name];
          if (prevChild === nextChild) {
            this.moveChild(prevChild, nextIndex, lastIndex);
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            prevChild._mountIndex = nextIndex;
          } else {
            if (prevChild) {
              lastIndex = Math.max(prevChild._mountIndex, lastIndex);
              this._unmountChildByName(prevChild, name);
            }
            this._mountChildByNameAtIndex(nextChild, name, nextIndex, transaction, context);
          }
          nextIndex++;
        }
        for (name in prevChildren) {
          if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
            this._unmountChildByName(prevChildren[name], name);
          }
        }
      },
      unmountChildren: function() {
        var renderedChildren = this._renderedChildren;
        ReactChildReconciler.unmountChildren(renderedChildren);
        this._renderedChildren = null;
      },
      moveChild: function(child, toIndex, lastIndex) {
        if (child._mountIndex < lastIndex) {
          enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
        }
      },
      createChild: function(child, mountImage) {
        enqueueMarkup(this._rootNodeID, mountImage, child._mountIndex);
      },
      removeChild: function(child) {
        enqueueRemove(this._rootNodeID, child._mountIndex);
      },
      setTextContent: function(textContent) {
        enqueueTextContent(this._rootNodeID, textContent);
      },
      _mountChildByNameAtIndex: function(child, name, index, transaction, context) {
        var rootID = this._rootNodeID + name;
        var mountImage = ReactReconciler.mountComponent(child, rootID, transaction, context);
        child._mountIndex = index;
        this.createChild(child, mountImage);
      },
      _unmountChildByName: function(child, name) {
        this.removeChild(child);
        child._mountIndex = null;
      }
    }};
  module.exports = ReactMultiChild;
})(require("process"));
