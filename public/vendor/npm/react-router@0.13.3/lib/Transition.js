/* */ 
'use strict';
var Cancellation = require("./Cancellation");
var Redirect = require("./Redirect");
function Transition(path, retry) {
  this.path = path;
  this.abortReason = null;
  this.retry = retry.bind(this);
}
Transition.prototype.abort = function(reason) {
  if (this.abortReason == null)
    this.abortReason = reason || 'ABORT';
};
Transition.prototype.redirect = function(to, params, query) {
  this.abort(new Redirect(to, params, query));
};
Transition.prototype.cancel = function() {
  this.abort(new Cancellation());
};
Transition.from = function(transition, routes, components, callback) {
  routes.reduce(function(callback, route, index) {
    return function(error) {
      if (error || transition.abortReason) {
        callback(error);
      } else if (route.onLeave) {
        try {
          route.onLeave(transition, components[index], callback);
          if (route.onLeave.length < 3)
            callback();
        } catch (e) {
          callback(e);
        }
      } else {
        callback();
      }
    };
  }, callback)();
};
Transition.to = function(transition, routes, params, query, callback) {
  routes.reduceRight(function(callback, route) {
    return function(error) {
      if (error || transition.abortReason) {
        callback(error);
      } else if (route.onEnter) {
        try {
          route.onEnter(transition, params, query, callback);
          if (route.onEnter.length < 4)
            callback();
        } catch (e) {
          callback(e);
        }
      } else {
        callback();
      }
    };
  }, callback)();
};
module.exports = Transition;
