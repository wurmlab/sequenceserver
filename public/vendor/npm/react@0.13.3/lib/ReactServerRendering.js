/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var ReactInstanceHandles = require("./ReactInstanceHandles");
  var ReactMarkupChecksum = require("./ReactMarkupChecksum");
  var ReactServerRenderingTransaction = require("./ReactServerRenderingTransaction");
  var emptyObject = require("./emptyObject");
  var instantiateReactComponent = require("./instantiateReactComponent");
  var invariant = require("./invariant");
  function renderToString(element) {
    ("production" !== process.env.NODE_ENV ? invariant(ReactElement.isValidElement(element), 'renderToString(): You must pass a valid ReactElement.') : invariant(ReactElement.isValidElement(element)));
    var transaction;
    try {
      var id = ReactInstanceHandles.createReactRootID();
      transaction = ReactServerRenderingTransaction.getPooled(false);
      return transaction.perform(function() {
        var componentInstance = instantiateReactComponent(element, null);
        var markup = componentInstance.mountComponent(id, transaction, emptyObject);
        return ReactMarkupChecksum.addChecksumToMarkup(markup);
      }, null);
    } finally {
      ReactServerRenderingTransaction.release(transaction);
    }
  }
  function renderToStaticMarkup(element) {
    ("production" !== process.env.NODE_ENV ? invariant(ReactElement.isValidElement(element), 'renderToStaticMarkup(): You must pass a valid ReactElement.') : invariant(ReactElement.isValidElement(element)));
    var transaction;
    try {
      var id = ReactInstanceHandles.createReactRootID();
      transaction = ReactServerRenderingTransaction.getPooled(true);
      return transaction.perform(function() {
        var componentInstance = instantiateReactComponent(element, null);
        return componentInstance.mountComponent(id, transaction, emptyObject);
      }, null);
    } finally {
      ReactServerRenderingTransaction.release(transaction);
    }
  }
  module.exports = {
    renderToString: renderToString,
    renderToStaticMarkup: renderToStaticMarkup
  };
})(require("process"));
