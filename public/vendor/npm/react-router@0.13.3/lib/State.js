/* */ 
'use strict';
var PropTypes = require("./PropTypes");
var State = {
  contextTypes: {router: PropTypes.router.isRequired},
  getPath: function getPath() {
    return this.context.router.getCurrentPath();
  },
  getPathname: function getPathname() {
    return this.context.router.getCurrentPathname();
  },
  getParams: function getParams() {
    return this.context.router.getCurrentParams();
  },
  getQuery: function getQuery() {
    return this.context.router.getCurrentQuery();
  },
  getRoutes: function getRoutes() {
    return this.context.router.getCurrentRoutes();
  },
  isActive: function isActive(to, params, query) {
    return this.context.router.isActive(to, params, query);
  }
};
module.exports = State;
