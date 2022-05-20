/* */ 
(function(process) {
  'use strict';
  var CSSPropertyOperations = require("./CSSPropertyOperations");
  var DOMChildrenOperations = require("./DOMChildrenOperations");
  var DOMPropertyOperations = require("./DOMPropertyOperations");
  var ReactMount = require("./ReactMount");
  var ReactPerf = require("./ReactPerf");
  var invariant = require("./invariant");
  var setInnerHTML = require("./setInnerHTML");
  var INVALID_PROPERTY_ERRORS = {
    dangerouslySetInnerHTML: '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
    style: '`style` must be set using `updateStylesByID()`.'
  };
  var ReactDOMIDOperations = {
    updatePropertyByID: function(id, name, value) {
      var node = ReactMount.getNode(id);
      ("production" !== process.env.NODE_ENV ? invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name), 'updatePropertyByID(...): %s', INVALID_PROPERTY_ERRORS[name]) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));
      if (value != null) {
        DOMPropertyOperations.setValueForProperty(node, name, value);
      } else {
        DOMPropertyOperations.deleteValueForProperty(node, name);
      }
    },
    deletePropertyByID: function(id, name, value) {
      var node = ReactMount.getNode(id);
      ("production" !== process.env.NODE_ENV ? invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name), 'updatePropertyByID(...): %s', INVALID_PROPERTY_ERRORS[name]) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));
      DOMPropertyOperations.deleteValueForProperty(node, name, value);
    },
    updateStylesByID: function(id, styles) {
      var node = ReactMount.getNode(id);
      CSSPropertyOperations.setValueForStyles(node, styles);
    },
    updateInnerHTMLByID: function(id, html) {
      var node = ReactMount.getNode(id);
      setInnerHTML(node, html);
    },
    updateTextContentByID: function(id, content) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.updateTextContent(node, content);
    },
    dangerouslyReplaceNodeWithMarkupByID: function(id, markup) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
    },
    dangerouslyProcessChildrenUpdates: function(updates, markup) {
      for (var i = 0; i < updates.length; i++) {
        updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
      }
      DOMChildrenOperations.processUpdates(updates, markup);
    }
  };
  ReactPerf.measureMethods(ReactDOMIDOperations, 'ReactDOMIDOperations', {
    updatePropertyByID: 'updatePropertyByID',
    deletePropertyByID: 'deletePropertyByID',
    updateStylesByID: 'updateStylesByID',
    updateInnerHTMLByID: 'updateInnerHTMLByID',
    updateTextContentByID: 'updateTextContentByID',
    dangerouslyReplaceNodeWithMarkupByID: 'dangerouslyReplaceNodeWithMarkupByID',
    dangerouslyProcessChildrenUpdates: 'dangerouslyProcessChildrenUpdates'
  });
  module.exports = ReactDOMIDOperations;
})(require("process"));
