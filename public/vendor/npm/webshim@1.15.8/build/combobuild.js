/* */ 
var fs = require("fs");
var url = phantom.args[0];
var last = new Date();
function sendMessage(args) {
  console.log(JSON.stringify(args));
  phantom.exit();
}
setInterval(function() {
  sendMessage(['done_timeout']);
}, 5000);
var page = require("webpage").create();
page.onAlert = function(args) {
  sendMessage(JSON.parse(args));
};
page.open(url);
