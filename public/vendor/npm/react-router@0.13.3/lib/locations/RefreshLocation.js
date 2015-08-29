/* */ 
'use strict';
var HistoryLocation = require("./HistoryLocation");
var History = require("../History");
var RefreshLocation = {
  push: function push(path) {
    window.location = path;
  },
  replace: function replace(path) {
    window.location.replace(path);
  },
  pop: History.back,
  getCurrentPath: HistoryLocation.getCurrentPath,
  toString: function toString() {
    return '<RefreshLocation>';
  }
};
module.exports = RefreshLocation;
