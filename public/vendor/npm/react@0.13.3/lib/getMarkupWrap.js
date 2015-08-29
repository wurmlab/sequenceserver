/* */ 
(function(process) {
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  var invariant = require("./invariant");
  var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;
  var shouldWrap = {
    'circle': true,
    'clipPath': true,
    'defs': true,
    'ellipse': true,
    'g': true,
    'line': true,
    'linearGradient': true,
    'path': true,
    'polygon': true,
    'polyline': true,
    'radialGradient': true,
    'rect': true,
    'stop': true,
    'text': true
  };
  var selectWrap = [1, '<select multiple="true">', '</select>'];
  var tableWrap = [1, '<table>', '</table>'];
  var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];
  var svgWrap = [1, '<svg>', '</svg>'];
  var markupWrap = {
    '*': [1, '?<div>', '</div>'],
    'area': [1, '<map>', '</map>'],
    'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    'legend': [1, '<fieldset>', '</fieldset>'],
    'param': [1, '<object>', '</object>'],
    'tr': [2, '<table><tbody>', '</tbody></table>'],
    'optgroup': selectWrap,
    'option': selectWrap,
    'caption': tableWrap,
    'colgroup': tableWrap,
    'tbody': tableWrap,
    'tfoot': tableWrap,
    'thead': tableWrap,
    'td': trWrap,
    'th': trWrap,
    'circle': svgWrap,
    'clipPath': svgWrap,
    'defs': svgWrap,
    'ellipse': svgWrap,
    'g': svgWrap,
    'line': svgWrap,
    'linearGradient': svgWrap,
    'path': svgWrap,
    'polygon': svgWrap,
    'polyline': svgWrap,
    'radialGradient': svgWrap,
    'rect': svgWrap,
    'stop': svgWrap,
    'text': svgWrap
  };
  function getMarkupWrap(nodeName) {
    ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'Markup wrapping node not initialized') : invariant(!!dummyNode));
    if (!markupWrap.hasOwnProperty(nodeName)) {
      nodeName = '*';
    }
    if (!shouldWrap.hasOwnProperty(nodeName)) {
      if (nodeName === '*') {
        dummyNode.innerHTML = '<link />';
      } else {
        dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
      }
      shouldWrap[nodeName] = !dummyNode.firstChild;
    }
    return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
  }
  module.exports = getMarkupWrap;
})(require("process"));
