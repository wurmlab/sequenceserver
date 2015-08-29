/* */ 
'use strict';
var createRouter = require("./createRouter");
function runRouter(routes, location, callback) {
  if (typeof location === 'function') {
    callback = location;
    location = null;
  }
  var router = createRouter({
    routes: routes,
    location: location
  });
  router.run(callback);
  return router;
}
module.exports = runRouter;
