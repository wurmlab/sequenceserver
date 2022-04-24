/* */ 
'use strict';
var Promise = require('../Promise');
'use strict';
var Deferred = require.requireActual('../Deferred');
function fetch(uri, options) {
  var deferred = new Deferred();
  fetch.mock.calls.push([uri, options]);
  fetch.mock.deferreds.push(deferred);
  return deferred.getPromise();
}
fetch.mock = {
  calls: [],
  deferreds: []
};
module.exports = fetch;
