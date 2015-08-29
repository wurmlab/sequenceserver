/* */ 
(function(process) {
  'use strict';
  var CSSProperty = require("./CSSProperty");
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  var camelizeStyleName = require("./camelizeStyleName");
  var dangerousStyleValue = require("./dangerousStyleValue");
  var hyphenateStyleName = require("./hyphenateStyleName");
  var memoizeStringOnly = require("./memoizeStringOnly");
  var warning = require("./warning");
  var processStyleName = memoizeStringOnly(function(styleName) {
    return hyphenateStyleName(styleName);
  });
  var styleFloatAccessor = 'cssFloat';
  if (ExecutionEnvironment.canUseDOM) {
    if (document.documentElement.style.cssFloat === undefined) {
      styleFloatAccessor = 'styleFloat';
    }
  }
  if ("production" !== process.env.NODE_ENV) {
    var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
    var badStyleValueWithSemicolonPattern = /;\s*$/;
    var warnedStyleNames = {};
    var warnedStyleValues = {};
    var warnHyphenatedStyleName = function(name) {
      if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
        return;
      }
      warnedStyleNames[name] = true;
      ("production" !== process.env.NODE_ENV ? warning(false, 'Unsupported style property %s. Did you mean %s?', name, camelizeStyleName(name)) : null);
    };
    var warnBadVendoredStyleName = function(name) {
      if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
        return;
      }
      warnedStyleNames[name] = true;
      ("production" !== process.env.NODE_ENV ? warning(false, 'Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1)) : null);
    };
    var warnStyleValueWithSemicolon = function(name, value) {
      if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
        return;
      }
      warnedStyleValues[value] = true;
      ("production" !== process.env.NODE_ENV ? warning(false, 'Style property values shouldn\'t contain a semicolon. ' + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, '')) : null);
    };
    var warnValidStyle = function(name, value) {
      if (name.indexOf('-') > -1) {
        warnHyphenatedStyleName(name);
      } else if (badVendoredStyleNamePattern.test(name)) {
        warnBadVendoredStyleName(name);
      } else if (badStyleValueWithSemicolonPattern.test(value)) {
        warnStyleValueWithSemicolon(name, value);
      }
    };
  }
  var CSSPropertyOperations = {
    createMarkupForStyles: function(styles) {
      var serialized = '';
      for (var styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
          continue;
        }
        var styleValue = styles[styleName];
        if ("production" !== process.env.NODE_ENV) {
          warnValidStyle(styleName, styleValue);
        }
        if (styleValue != null) {
          serialized += processStyleName(styleName) + ':';
          serialized += dangerousStyleValue(styleName, styleValue) + ';';
        }
      }
      return serialized || null;
    },
    setValueForStyles: function(node, styles) {
      var style = node.style;
      for (var styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
          continue;
        }
        if ("production" !== process.env.NODE_ENV) {
          warnValidStyle(styleName, styles[styleName]);
        }
        var styleValue = dangerousStyleValue(styleName, styles[styleName]);
        if (styleName === 'float') {
          styleName = styleFloatAccessor;
        }
        if (styleValue) {
          style[styleName] = styleValue;
        } else {
          var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
          if (expansion) {
            for (var individualStyleName in expansion) {
              style[individualStyleName] = '';
            }
          } else {
            style[styleName] = '';
          }
        }
      }
    }
  };
  module.exports = CSSPropertyOperations;
})(require("process"));
