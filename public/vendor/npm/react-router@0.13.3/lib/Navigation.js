/* */ 
'use strict';
var PropTypes = require("./PropTypes");
var Navigation = {
  contextTypes: {router: PropTypes.router.isRequired},
  makePath: function makePath(to, params, query) {
    return this.context.router.makePath(to, params, query);
  },
  makeHref: function makeHref(to, params, query) {
    return this.context.router.makeHref(to, params, query);
  },
  transitionTo: function transitionTo(to, params, query) {
    this.context.router.transitionTo(to, params, query);
  },
  replaceWith: function replaceWith(to, params, query) {
    this.context.router.replaceWith(to, params, query);
  },
  goBack: function goBack() {
    return this.context.router.goBack();
  }
};
module.exports = Navigation;
