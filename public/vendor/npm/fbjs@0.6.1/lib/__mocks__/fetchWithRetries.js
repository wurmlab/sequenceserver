/* */ 
'use strict';
var Promise = require('../Promise');
'use strict';
var Deferred = require.requireActual('../Deferred');
function fetchWithRetries() {
  var deferred = new Deferred();
  for (var _len = arguments.length,
      args = Array(_len),
      _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  fetchWithRetries.mock.calls.push(args);
  fetchWithRetries.mock.deferreds.push(deferred);
  return deferred.getPromise();
}
fetchWithRetries.mock = {
  calls: [],
  deferreds: []
};
module.exports = fetchWithRetries;
