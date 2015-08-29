/* */ 
'use strict';
var assign = require("react/lib/Object.assign");
var ReactPropTypes = require("react").PropTypes;
var Route = require("./Route");
var PropTypes = assign({}, ReactPropTypes, {
  falsy: function falsy(props, propName, componentName) {
    if (props[propName]) {
      return new Error('<' + componentName + '> should not have a "' + propName + '" prop');
    }
  },
  route: ReactPropTypes.instanceOf(Route),
  router: ReactPropTypes.func
});
module.exports = PropTypes;
