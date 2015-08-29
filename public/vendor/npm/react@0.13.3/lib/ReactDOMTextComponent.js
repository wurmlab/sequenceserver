/* */ 
'use strict';
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactComponentBrowserEnvironment = require("./ReactComponentBrowserEnvironment");
var ReactDOMComponent = require("./ReactDOMComponent");
var assign = require("./Object.assign");
var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
var ReactDOMTextComponent = function(props) {};
assign(ReactDOMTextComponent.prototype, {
  construct: function(text) {
    this._currentElement = text;
    this._stringText = '' + text;
    this._rootNodeID = null;
    this._mountIndex = 0;
  },
  mountComponent: function(rootID, transaction, context) {
    this._rootNodeID = rootID;
    var escapedText = escapeTextContentForBrowser(this._stringText);
    if (transaction.renderToStaticMarkup) {
      return escapedText;
    }
    return ('<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' + escapedText + '</span>');
  },
  receiveComponent: function(nextText, transaction) {
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      var nextStringText = '' + nextText;
      if (nextStringText !== this._stringText) {
        this._stringText = nextStringText;
        ReactDOMComponent.BackendIDOperations.updateTextContentByID(this._rootNodeID, nextStringText);
      }
    }
  },
  unmountComponent: function() {
    ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
  }
});
module.exports = ReactDOMTextComponent;
