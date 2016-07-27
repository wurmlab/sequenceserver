/* */ 
(function(process) {
  var global = require('./$.global'),
      macrotask = require('./$.task').set,
      Observer = global.MutationObserver || global.WebKitMutationObserver,
      process = global.process,
      head,
      last,
      notify;
  var flush = function() {
    while (head) {
      head.fn.call();
      head = head.next;
    }
    last = undefined;
  };
  if (require('./$.cof')(process) == 'process') {
    notify = function() {
      process.nextTick(flush);
    };
  } else if (Observer) {
    var toggle = 1,
        node = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true});
    notify = function() {
      node.data = toggle = -toggle;
    };
  } else {
    notify = function() {
      macrotask.call(global, flush);
    };
  }
  module.exports = function asap(fn) {
    var task = {
      fn: fn,
      next: undefined
    };
    if (last)
      last.next = task;
    if (!head) {
      head = task;
      notify();
    }
    last = task;
  };
})(require('process'));
