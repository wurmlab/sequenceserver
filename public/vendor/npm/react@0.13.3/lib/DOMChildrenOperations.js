/* */ 
(function(process) {
  'use strict';
  var Danger = require("./Danger");
  var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");
  var setTextContent = require("./setTextContent");
  var invariant = require("./invariant");
  function insertChildAt(parentNode, childNode, index) {
    parentNode.insertBefore(childNode, parentNode.childNodes[index] || null);
  }
  var DOMChildrenOperations = {
    dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,
    updateTextContent: setTextContent,
    processUpdates: function(updates, markupList) {
      var update;
      var initialChildren = null;
      var updatedChildren = null;
      for (var i = 0; i < updates.length; i++) {
        update = updates[i];
        if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING || update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
          var updatedIndex = update.fromIndex;
          var updatedChild = update.parentNode.childNodes[updatedIndex];
          var parentID = update.parentID;
          ("production" !== process.env.NODE_ENV ? invariant(updatedChild, 'processUpdates(): Unable to find child %s of element. This ' + 'probably means the DOM was unexpectedly mutated (e.g., by the ' + 'browser), usually due to forgetting a <tbody> when using tables, ' + 'nesting tags like <form>, <p>, or <a>, or using non-SVG elements ' + 'in an <svg> parent. Try inspecting the child nodes of the element ' + 'with React ID `%s`.', updatedIndex, parentID) : invariant(updatedChild));
          initialChildren = initialChildren || {};
          initialChildren[parentID] = initialChildren[parentID] || [];
          initialChildren[parentID][updatedIndex] = updatedChild;
          updatedChildren = updatedChildren || [];
          updatedChildren.push(updatedChild);
        }
      }
      var renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);
      if (updatedChildren) {
        for (var j = 0; j < updatedChildren.length; j++) {
          updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
        }
      }
      for (var k = 0; k < updates.length; k++) {
        update = updates[k];
        switch (update.type) {
          case ReactMultiChildUpdateTypes.INSERT_MARKUP:
            insertChildAt(update.parentNode, renderedMarkup[update.markupIndex], update.toIndex);
            break;
          case ReactMultiChildUpdateTypes.MOVE_EXISTING:
            insertChildAt(update.parentNode, initialChildren[update.parentID][update.fromIndex], update.toIndex);
            break;
          case ReactMultiChildUpdateTypes.TEXT_CONTENT:
            setTextContent(update.parentNode, update.textContent);
            break;
          case ReactMultiChildUpdateTypes.REMOVE_NODE:
            break;
        }
      }
    }
  };
  module.exports = DOMChildrenOperations;
})(require("process"));
