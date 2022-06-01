/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV !== "production") {
    (function() {
      'use strict';
      var React = require('react');
      var ReactVersion = '18.0.0-fc46dba67-20220329';
      var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      function warn(format) {
        {
          {
            for (var _len = arguments.length,
                args = new Array(_len > 1 ? _len - 1 : 0),
                _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }
            printWarning('warn', format, args);
          }
        }
      }
      function error(format) {
        {
          {
            for (var _len2 = arguments.length,
                args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            printWarning('error', format, args);
          }
        }
      }
      function printWarning(level, format, args) {
        {
          var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
          var stack = ReactDebugCurrentFrame.getStackAddendum();
          if (stack !== '') {
            format += '%s';
            args = args.concat([stack]);
          }
          var argsWithFormat = args.map(function(item) {
            return String(item);
          });
          argsWithFormat.unshift('Warning: ' + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);
        }
      }
      function scheduleWork(callback) {
        callback();
      }
      function beginWriting(destination) {}
      var prevWasCommentSegmenter = false;
      function writeChunk(destination, chunk) {
        writeChunkAndReturn(destination, chunk);
      }
      function writeChunkAndReturn(destination, chunk) {
        if (prevWasCommentSegmenter) {
          prevWasCommentSegmenter = false;
          if (chunk[0] !== '<') {
            destination.push('<!-- -->');
          }
        }
        if (chunk === '<!-- -->') {
          prevWasCommentSegmenter = true;
          return true;
        }
        return destination.push(chunk);
      }
      function completeWriting(destination) {}
      function close(destination) {
        destination.push(null);
      }
      function stringToChunk(content) {
        return content;
      }
      function stringToPrecomputedChunk(content) {
        return content;
      }
      function closeWithError(destination, error) {
        destination.destroy(error);
      }
      function typeName(value) {
        {
          var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
          var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
          return type;
        }
      }
      function willCoercionThrow(value) {
        {
          try {
            testStringCoercion(value);
            return false;
          } catch (e) {
            return true;
          }
        }
      }
      function testStringCoercion(value) {
        return '' + value;
      }
      function checkAttributeStringCoercion(value, attributeName) {
        {
          if (willCoercionThrow(value)) {
            error('The provided `%s` attribute is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', attributeName, typeName(value));
            return testStringCoercion(value);
          }
        }
      }
      function checkCSSPropertyStringCoercion(value, propName) {
        {
          if (willCoercionThrow(value)) {
            error('The provided `%s` CSS property is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', propName, typeName(value));
            return testStringCoercion(value);
          }
        }
      }
      function checkHtmlStringCoercion(value) {
        {
          if (willCoercionThrow(value)) {
            error('The provided HTML markup uses a value of unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));
            return testStringCoercion(value);
          }
        }
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var RESERVED = 0;
      var STRING = 1;
      var BOOLEANISH_STRING = 2;
      var BOOLEAN = 3;
      var OVERLOADED_BOOLEAN = 4;
      var NUMERIC = 5;
      var POSITIVE_NUMERIC = 6;
      var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
      var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
      var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
      var illegalAttributeNameCache = {};
      var validatedAttributeNameCache = {};
      function isAttributeNameSafe(attributeName) {
        if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
          return true;
        }
        if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
          return false;
        }
        if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
          validatedAttributeNameCache[attributeName] = true;
          return true;
        }
        illegalAttributeNameCache[attributeName] = true;
        {
          error('Invalid attribute name: `%s`', attributeName);
        }
        return false;
      }
      function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
        if (propertyInfo !== null && propertyInfo.type === RESERVED) {
          return false;
        }
        switch (typeof value) {
          case 'function':
          case 'symbol':
            return true;
          case 'boolean':
            {
              if (isCustomComponentTag) {
                return false;
              }
              if (propertyInfo !== null) {
                return !propertyInfo.acceptsBooleans;
              } else {
                var prefix = name.toLowerCase().slice(0, 5);
                return prefix !== 'data-' && prefix !== 'aria-';
              }
            }
          default:
            return false;
        }
      }
      function getPropertyInfo(name) {
        return properties.hasOwnProperty(name) ? properties[name] : null;
      }
      function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL, removeEmptyString) {
        this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
        this.attributeName = attributeName;
        this.attributeNamespace = attributeNamespace;
        this.mustUseProperty = mustUseProperty;
        this.propertyName = name;
        this.type = type;
        this.sanitizeURL = sanitizeURL;
        this.removeEmptyString = removeEmptyString;
      }
      var properties = {};
      var reservedProps = ['children', 'dangerouslySetInnerHTML', 'defaultValue', 'defaultChecked', 'innerHTML', 'suppressContentEditableWarning', 'suppressHydrationWarning', 'style'];
      reservedProps.forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, RESERVED, false, name, null, false, false);
      });
      [['acceptCharset', 'accept-charset'], ['className', 'class'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv']].forEach(function(_ref) {
        var name = _ref[0],
            attributeName = _ref[1];
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false, false);
      });
      ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name.toLowerCase(), null, false, false);
      });
      ['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name, null, false, false);
      });
      ['allowFullScreen', 'async', 'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'disablePictureInPicture', 'disableRemotePlayback', 'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed', 'scoped', 'seamless', 'itemScope'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, name.toLowerCase(), null, false, false);
      });
      ['checked', 'multiple', 'muted', 'selected'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, name, null, false, false);
      });
      ['capture', 'download'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, name, null, false, false);
      });
      ['cols', 'rows', 'size', 'span'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, name, null, false, false);
      });
      ['rowSpan', 'start'].forEach(function(name) {
        properties[name] = new PropertyInfoRecord(name, NUMERIC, false, name.toLowerCase(), null, false, false);
      });
      var CAMELIZE = /[\-\:]([a-z])/g;
      var capitalize = function(token) {
        return token[1].toUpperCase();
      };
      ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'xmlns:xlink', 'x-height'].forEach(function(attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false, false);
      });
      ['xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type'].forEach(function(attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, 'http://www.w3.org/1999/xlink', false, false);
      });
      ['xml:base', 'xml:lang', 'xml:space'].forEach(function(attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, 'http://www.w3.org/XML/1998/namespace', false, false);
      });
      ['tabIndex', 'crossOrigin'].forEach(function(attributeName) {
        properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, false, false);
      });
      var xlinkHref = 'xlinkHref';
      properties[xlinkHref] = new PropertyInfoRecord('xlinkHref', STRING, false, 'xlink:href', 'http://www.w3.org/1999/xlink', true, false);
      ['src', 'href', 'action', 'formAction'].forEach(function(attributeName) {
        properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, true, true);
      });
      var isUnitlessNumber = {
        animationIterationCount: true,
        aspectRatio: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
      };
      function prefixKey(prefix, key) {
        return prefix + key.charAt(0).toUpperCase() + key.substring(1);
      }
      var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
      Object.keys(isUnitlessNumber).forEach(function(prop) {
        prefixes.forEach(function(prefix) {
          isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
        });
      });
      var hasReadOnlyValue = {
        button: true,
        checkbox: true,
        image: true,
        hidden: true,
        radio: true,
        reset: true,
        submit: true
      };
      function checkControlledValueProps(tagName, props) {
        {
          if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
            error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
          }
          if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
            error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
          }
        }
      }
      function isCustomComponent(tagName, props) {
        if (tagName.indexOf('-') === -1) {
          return typeof props.is === 'string';
        }
        switch (tagName) {
          case 'annotation-xml':
          case 'color-profile':
          case 'font-face':
          case 'font-face-src':
          case 'font-face-uri':
          case 'font-face-format':
          case 'font-face-name':
          case 'missing-glyph':
            return false;
          default:
            return true;
        }
      }
      var ariaProperties = {
        'aria-current': 0,
        'aria-description': 0,
        'aria-details': 0,
        'aria-disabled': 0,
        'aria-hidden': 0,
        'aria-invalid': 0,
        'aria-keyshortcuts': 0,
        'aria-label': 0,
        'aria-roledescription': 0,
        'aria-autocomplete': 0,
        'aria-checked': 0,
        'aria-expanded': 0,
        'aria-haspopup': 0,
        'aria-level': 0,
        'aria-modal': 0,
        'aria-multiline': 0,
        'aria-multiselectable': 0,
        'aria-orientation': 0,
        'aria-placeholder': 0,
        'aria-pressed': 0,
        'aria-readonly': 0,
        'aria-required': 0,
        'aria-selected': 0,
        'aria-sort': 0,
        'aria-valuemax': 0,
        'aria-valuemin': 0,
        'aria-valuenow': 0,
        'aria-valuetext': 0,
        'aria-atomic': 0,
        'aria-busy': 0,
        'aria-live': 0,
        'aria-relevant': 0,
        'aria-dropeffect': 0,
        'aria-grabbed': 0,
        'aria-activedescendant': 0,
        'aria-colcount': 0,
        'aria-colindex': 0,
        'aria-colspan': 0,
        'aria-controls': 0,
        'aria-describedby': 0,
        'aria-errormessage': 0,
        'aria-flowto': 0,
        'aria-labelledby': 0,
        'aria-owns': 0,
        'aria-posinset': 0,
        'aria-rowcount': 0,
        'aria-rowindex': 0,
        'aria-rowspan': 0,
        'aria-setsize': 0
      };
      var warnedProperties = {};
      var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
      var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
      function validateProperty(tagName, name) {
        {
          if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
            return true;
          }
          if (rARIACamel.test(name)) {
            var ariaName = 'aria-' + name.slice(4).toLowerCase();
            var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;
            if (correctName == null) {
              error('Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.', name);
              warnedProperties[name] = true;
              return true;
            }
            if (name !== correctName) {
              error('Invalid ARIA attribute `%s`. Did you mean `%s`?', name, correctName);
              warnedProperties[name] = true;
              return true;
            }
          }
          if (rARIA.test(name)) {
            var lowerCasedName = name.toLowerCase();
            var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;
            if (standardName == null) {
              warnedProperties[name] = true;
              return false;
            }
            if (name !== standardName) {
              error('Unknown ARIA attribute `%s`. Did you mean `%s`?', name, standardName);
              warnedProperties[name] = true;
              return true;
            }
          }
        }
        return true;
      }
      function warnInvalidARIAProps(type, props) {
        {
          var invalidProps = [];
          for (var key in props) {
            var isValid = validateProperty(type, key);
            if (!isValid) {
              invalidProps.push(key);
            }
          }
          var unknownPropString = invalidProps.map(function(prop) {
            return '`' + prop + '`';
          }).join(', ');
          if (invalidProps.length === 1) {
            error('Invalid aria prop %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
          } else if (invalidProps.length > 1) {
            error('Invalid aria props %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
          }
        }
      }
      function validateProperties(type, props) {
        if (isCustomComponent(type, props)) {
          return;
        }
        warnInvalidARIAProps(type, props);
      }
      var didWarnValueNull = false;
      function validateProperties$1(type, props) {
        {
          if (type !== 'input' && type !== 'textarea' && type !== 'select') {
            return;
          }
          if (props != null && props.value === null && !didWarnValueNull) {
            didWarnValueNull = true;
            if (type === 'select' && props.multiple) {
              error('`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.', type);
            } else {
              error('`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.', type);
            }
          }
        }
      }
      var possibleStandardNames = {
        accept: 'accept',
        acceptcharset: 'acceptCharset',
        'accept-charset': 'acceptCharset',
        accesskey: 'accessKey',
        action: 'action',
        allowfullscreen: 'allowFullScreen',
        alt: 'alt',
        as: 'as',
        async: 'async',
        autocapitalize: 'autoCapitalize',
        autocomplete: 'autoComplete',
        autocorrect: 'autoCorrect',
        autofocus: 'autoFocus',
        autoplay: 'autoPlay',
        autosave: 'autoSave',
        capture: 'capture',
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        challenge: 'challenge',
        charset: 'charSet',
        checked: 'checked',
        children: 'children',
        cite: 'cite',
        class: 'className',
        classid: 'classID',
        classname: 'className',
        cols: 'cols',
        colspan: 'colSpan',
        content: 'content',
        contenteditable: 'contentEditable',
        contextmenu: 'contextMenu',
        controls: 'controls',
        controlslist: 'controlsList',
        coords: 'coords',
        crossorigin: 'crossOrigin',
        dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
        data: 'data',
        datetime: 'dateTime',
        default: 'default',
        defaultchecked: 'defaultChecked',
        defaultvalue: 'defaultValue',
        defer: 'defer',
        dir: 'dir',
        disabled: 'disabled',
        disablepictureinpicture: 'disablePictureInPicture',
        disableremoteplayback: 'disableRemotePlayback',
        download: 'download',
        draggable: 'draggable',
        enctype: 'encType',
        enterkeyhint: 'enterKeyHint',
        for: 'htmlFor',
        form: 'form',
        formmethod: 'formMethod',
        formaction: 'formAction',
        formenctype: 'formEncType',
        formnovalidate: 'formNoValidate',
        formtarget: 'formTarget',
        frameborder: 'frameBorder',
        headers: 'headers',
        height: 'height',
        hidden: 'hidden',
        high: 'high',
        href: 'href',
        hreflang: 'hrefLang',
        htmlfor: 'htmlFor',
        httpequiv: 'httpEquiv',
        'http-equiv': 'httpEquiv',
        icon: 'icon',
        id: 'id',
        imagesizes: 'imageSizes',
        imagesrcset: 'imageSrcSet',
        innerhtml: 'innerHTML',
        inputmode: 'inputMode',
        integrity: 'integrity',
        is: 'is',
        itemid: 'itemID',
        itemprop: 'itemProp',
        itemref: 'itemRef',
        itemscope: 'itemScope',
        itemtype: 'itemType',
        keyparams: 'keyParams',
        keytype: 'keyType',
        kind: 'kind',
        label: 'label',
        lang: 'lang',
        list: 'list',
        loop: 'loop',
        low: 'low',
        manifest: 'manifest',
        marginwidth: 'marginWidth',
        marginheight: 'marginHeight',
        max: 'max',
        maxlength: 'maxLength',
        media: 'media',
        mediagroup: 'mediaGroup',
        method: 'method',
        min: 'min',
        minlength: 'minLength',
        multiple: 'multiple',
        muted: 'muted',
        name: 'name',
        nomodule: 'noModule',
        nonce: 'nonce',
        novalidate: 'noValidate',
        open: 'open',
        optimum: 'optimum',
        pattern: 'pattern',
        placeholder: 'placeholder',
        playsinline: 'playsInline',
        poster: 'poster',
        preload: 'preload',
        profile: 'profile',
        radiogroup: 'radioGroup',
        readonly: 'readOnly',
        referrerpolicy: 'referrerPolicy',
        rel: 'rel',
        required: 'required',
        reversed: 'reversed',
        role: 'role',
        rows: 'rows',
        rowspan: 'rowSpan',
        sandbox: 'sandbox',
        scope: 'scope',
        scoped: 'scoped',
        scrolling: 'scrolling',
        seamless: 'seamless',
        selected: 'selected',
        shape: 'shape',
        size: 'size',
        sizes: 'sizes',
        span: 'span',
        spellcheck: 'spellCheck',
        src: 'src',
        srcdoc: 'srcDoc',
        srclang: 'srcLang',
        srcset: 'srcSet',
        start: 'start',
        step: 'step',
        style: 'style',
        summary: 'summary',
        tabindex: 'tabIndex',
        target: 'target',
        title: 'title',
        type: 'type',
        usemap: 'useMap',
        value: 'value',
        width: 'width',
        wmode: 'wmode',
        wrap: 'wrap',
        about: 'about',
        accentheight: 'accentHeight',
        'accent-height': 'accentHeight',
        accumulate: 'accumulate',
        additive: 'additive',
        alignmentbaseline: 'alignmentBaseline',
        'alignment-baseline': 'alignmentBaseline',
        allowreorder: 'allowReorder',
        alphabetic: 'alphabetic',
        amplitude: 'amplitude',
        arabicform: 'arabicForm',
        'arabic-form': 'arabicForm',
        ascent: 'ascent',
        attributename: 'attributeName',
        attributetype: 'attributeType',
        autoreverse: 'autoReverse',
        azimuth: 'azimuth',
        basefrequency: 'baseFrequency',
        baselineshift: 'baselineShift',
        'baseline-shift': 'baselineShift',
        baseprofile: 'baseProfile',
        bbox: 'bbox',
        begin: 'begin',
        bias: 'bias',
        by: 'by',
        calcmode: 'calcMode',
        capheight: 'capHeight',
        'cap-height': 'capHeight',
        clip: 'clip',
        clippath: 'clipPath',
        'clip-path': 'clipPath',
        clippathunits: 'clipPathUnits',
        cliprule: 'clipRule',
        'clip-rule': 'clipRule',
        color: 'color',
        colorinterpolation: 'colorInterpolation',
        'color-interpolation': 'colorInterpolation',
        colorinterpolationfilters: 'colorInterpolationFilters',
        'color-interpolation-filters': 'colorInterpolationFilters',
        colorprofile: 'colorProfile',
        'color-profile': 'colorProfile',
        colorrendering: 'colorRendering',
        'color-rendering': 'colorRendering',
        contentscripttype: 'contentScriptType',
        contentstyletype: 'contentStyleType',
        cursor: 'cursor',
        cx: 'cx',
        cy: 'cy',
        d: 'd',
        datatype: 'datatype',
        decelerate: 'decelerate',
        descent: 'descent',
        diffuseconstant: 'diffuseConstant',
        direction: 'direction',
        display: 'display',
        divisor: 'divisor',
        dominantbaseline: 'dominantBaseline',
        'dominant-baseline': 'dominantBaseline',
        dur: 'dur',
        dx: 'dx',
        dy: 'dy',
        edgemode: 'edgeMode',
        elevation: 'elevation',
        enablebackground: 'enableBackground',
        'enable-background': 'enableBackground',
        end: 'end',
        exponent: 'exponent',
        externalresourcesrequired: 'externalResourcesRequired',
        fill: 'fill',
        fillopacity: 'fillOpacity',
        'fill-opacity': 'fillOpacity',
        fillrule: 'fillRule',
        'fill-rule': 'fillRule',
        filter: 'filter',
        filterres: 'filterRes',
        filterunits: 'filterUnits',
        floodopacity: 'floodOpacity',
        'flood-opacity': 'floodOpacity',
        floodcolor: 'floodColor',
        'flood-color': 'floodColor',
        focusable: 'focusable',
        fontfamily: 'fontFamily',
        'font-family': 'fontFamily',
        fontsize: 'fontSize',
        'font-size': 'fontSize',
        fontsizeadjust: 'fontSizeAdjust',
        'font-size-adjust': 'fontSizeAdjust',
        fontstretch: 'fontStretch',
        'font-stretch': 'fontStretch',
        fontstyle: 'fontStyle',
        'font-style': 'fontStyle',
        fontvariant: 'fontVariant',
        'font-variant': 'fontVariant',
        fontweight: 'fontWeight',
        'font-weight': 'fontWeight',
        format: 'format',
        from: 'from',
        fx: 'fx',
        fy: 'fy',
        g1: 'g1',
        g2: 'g2',
        glyphname: 'glyphName',
        'glyph-name': 'glyphName',
        glyphorientationhorizontal: 'glyphOrientationHorizontal',
        'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
        glyphorientationvertical: 'glyphOrientationVertical',
        'glyph-orientation-vertical': 'glyphOrientationVertical',
        glyphref: 'glyphRef',
        gradienttransform: 'gradientTransform',
        gradientunits: 'gradientUnits',
        hanging: 'hanging',
        horizadvx: 'horizAdvX',
        'horiz-adv-x': 'horizAdvX',
        horizoriginx: 'horizOriginX',
        'horiz-origin-x': 'horizOriginX',
        ideographic: 'ideographic',
        imagerendering: 'imageRendering',
        'image-rendering': 'imageRendering',
        in2: 'in2',
        in: 'in',
        inlist: 'inlist',
        intercept: 'intercept',
        k1: 'k1',
        k2: 'k2',
        k3: 'k3',
        k4: 'k4',
        k: 'k',
        kernelmatrix: 'kernelMatrix',
        kernelunitlength: 'kernelUnitLength',
        kerning: 'kerning',
        keypoints: 'keyPoints',
        keysplines: 'keySplines',
        keytimes: 'keyTimes',
        lengthadjust: 'lengthAdjust',
        letterspacing: 'letterSpacing',
        'letter-spacing': 'letterSpacing',
        lightingcolor: 'lightingColor',
        'lighting-color': 'lightingColor',
        limitingconeangle: 'limitingConeAngle',
        local: 'local',
        markerend: 'markerEnd',
        'marker-end': 'markerEnd',
        markerheight: 'markerHeight',
        markermid: 'markerMid',
        'marker-mid': 'markerMid',
        markerstart: 'markerStart',
        'marker-start': 'markerStart',
        markerunits: 'markerUnits',
        markerwidth: 'markerWidth',
        mask: 'mask',
        maskcontentunits: 'maskContentUnits',
        maskunits: 'maskUnits',
        mathematical: 'mathematical',
        mode: 'mode',
        numoctaves: 'numOctaves',
        offset: 'offset',
        opacity: 'opacity',
        operator: 'operator',
        order: 'order',
        orient: 'orient',
        orientation: 'orientation',
        origin: 'origin',
        overflow: 'overflow',
        overlineposition: 'overlinePosition',
        'overline-position': 'overlinePosition',
        overlinethickness: 'overlineThickness',
        'overline-thickness': 'overlineThickness',
        paintorder: 'paintOrder',
        'paint-order': 'paintOrder',
        panose1: 'panose1',
        'panose-1': 'panose1',
        pathlength: 'pathLength',
        patterncontentunits: 'patternContentUnits',
        patterntransform: 'patternTransform',
        patternunits: 'patternUnits',
        pointerevents: 'pointerEvents',
        'pointer-events': 'pointerEvents',
        points: 'points',
        pointsatx: 'pointsAtX',
        pointsaty: 'pointsAtY',
        pointsatz: 'pointsAtZ',
        prefix: 'prefix',
        preservealpha: 'preserveAlpha',
        preserveaspectratio: 'preserveAspectRatio',
        primitiveunits: 'primitiveUnits',
        property: 'property',
        r: 'r',
        radius: 'radius',
        refx: 'refX',
        refy: 'refY',
        renderingintent: 'renderingIntent',
        'rendering-intent': 'renderingIntent',
        repeatcount: 'repeatCount',
        repeatdur: 'repeatDur',
        requiredextensions: 'requiredExtensions',
        requiredfeatures: 'requiredFeatures',
        resource: 'resource',
        restart: 'restart',
        result: 'result',
        results: 'results',
        rotate: 'rotate',
        rx: 'rx',
        ry: 'ry',
        scale: 'scale',
        security: 'security',
        seed: 'seed',
        shaperendering: 'shapeRendering',
        'shape-rendering': 'shapeRendering',
        slope: 'slope',
        spacing: 'spacing',
        specularconstant: 'specularConstant',
        specularexponent: 'specularExponent',
        speed: 'speed',
        spreadmethod: 'spreadMethod',
        startoffset: 'startOffset',
        stddeviation: 'stdDeviation',
        stemh: 'stemh',
        stemv: 'stemv',
        stitchtiles: 'stitchTiles',
        stopcolor: 'stopColor',
        'stop-color': 'stopColor',
        stopopacity: 'stopOpacity',
        'stop-opacity': 'stopOpacity',
        strikethroughposition: 'strikethroughPosition',
        'strikethrough-position': 'strikethroughPosition',
        strikethroughthickness: 'strikethroughThickness',
        'strikethrough-thickness': 'strikethroughThickness',
        string: 'string',
        stroke: 'stroke',
        strokedasharray: 'strokeDasharray',
        'stroke-dasharray': 'strokeDasharray',
        strokedashoffset: 'strokeDashoffset',
        'stroke-dashoffset': 'strokeDashoffset',
        strokelinecap: 'strokeLinecap',
        'stroke-linecap': 'strokeLinecap',
        strokelinejoin: 'strokeLinejoin',
        'stroke-linejoin': 'strokeLinejoin',
        strokemiterlimit: 'strokeMiterlimit',
        'stroke-miterlimit': 'strokeMiterlimit',
        strokewidth: 'strokeWidth',
        'stroke-width': 'strokeWidth',
        strokeopacity: 'strokeOpacity',
        'stroke-opacity': 'strokeOpacity',
        suppresscontenteditablewarning: 'suppressContentEditableWarning',
        suppresshydrationwarning: 'suppressHydrationWarning',
        surfacescale: 'surfaceScale',
        systemlanguage: 'systemLanguage',
        tablevalues: 'tableValues',
        targetx: 'targetX',
        targety: 'targetY',
        textanchor: 'textAnchor',
        'text-anchor': 'textAnchor',
        textdecoration: 'textDecoration',
        'text-decoration': 'textDecoration',
        textlength: 'textLength',
        textrendering: 'textRendering',
        'text-rendering': 'textRendering',
        to: 'to',
        transform: 'transform',
        typeof: 'typeof',
        u1: 'u1',
        u2: 'u2',
        underlineposition: 'underlinePosition',
        'underline-position': 'underlinePosition',
        underlinethickness: 'underlineThickness',
        'underline-thickness': 'underlineThickness',
        unicode: 'unicode',
        unicodebidi: 'unicodeBidi',
        'unicode-bidi': 'unicodeBidi',
        unicoderange: 'unicodeRange',
        'unicode-range': 'unicodeRange',
        unitsperem: 'unitsPerEm',
        'units-per-em': 'unitsPerEm',
        unselectable: 'unselectable',
        valphabetic: 'vAlphabetic',
        'v-alphabetic': 'vAlphabetic',
        values: 'values',
        vectoreffect: 'vectorEffect',
        'vector-effect': 'vectorEffect',
        version: 'version',
        vertadvy: 'vertAdvY',
        'vert-adv-y': 'vertAdvY',
        vertoriginx: 'vertOriginX',
        'vert-origin-x': 'vertOriginX',
        vertoriginy: 'vertOriginY',
        'vert-origin-y': 'vertOriginY',
        vhanging: 'vHanging',
        'v-hanging': 'vHanging',
        videographic: 'vIdeographic',
        'v-ideographic': 'vIdeographic',
        viewbox: 'viewBox',
        viewtarget: 'viewTarget',
        visibility: 'visibility',
        vmathematical: 'vMathematical',
        'v-mathematical': 'vMathematical',
        vocab: 'vocab',
        widths: 'widths',
        wordspacing: 'wordSpacing',
        'word-spacing': 'wordSpacing',
        writingmode: 'writingMode',
        'writing-mode': 'writingMode',
        x1: 'x1',
        x2: 'x2',
        x: 'x',
        xchannelselector: 'xChannelSelector',
        xheight: 'xHeight',
        'x-height': 'xHeight',
        xlinkactuate: 'xlinkActuate',
        'xlink:actuate': 'xlinkActuate',
        xlinkarcrole: 'xlinkArcrole',
        'xlink:arcrole': 'xlinkArcrole',
        xlinkhref: 'xlinkHref',
        'xlink:href': 'xlinkHref',
        xlinkrole: 'xlinkRole',
        'xlink:role': 'xlinkRole',
        xlinkshow: 'xlinkShow',
        'xlink:show': 'xlinkShow',
        xlinktitle: 'xlinkTitle',
        'xlink:title': 'xlinkTitle',
        xlinktype: 'xlinkType',
        'xlink:type': 'xlinkType',
        xmlbase: 'xmlBase',
        'xml:base': 'xmlBase',
        xmllang: 'xmlLang',
        'xml:lang': 'xmlLang',
        xmlns: 'xmlns',
        'xml:space': 'xmlSpace',
        xmlnsxlink: 'xmlnsXlink',
        'xmlns:xlink': 'xmlnsXlink',
        xmlspace: 'xmlSpace',
        y1: 'y1',
        y2: 'y2',
        y: 'y',
        ychannelselector: 'yChannelSelector',
        z: 'z',
        zoomandpan: 'zoomAndPan'
      };
      var validateProperty$1 = function() {};
      {
        var warnedProperties$1 = {};
        var EVENT_NAME_REGEX = /^on./;
        var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
        var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
        var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
        validateProperty$1 = function(tagName, name, value, eventRegistry) {
          if (hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
            return true;
          }
          var lowerCasedName = name.toLowerCase();
          if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
            error('React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');
            warnedProperties$1[name] = true;
            return true;
          }
          if (eventRegistry != null) {
            var registrationNameDependencies = eventRegistry.registrationNameDependencies,
                possibleRegistrationNames = eventRegistry.possibleRegistrationNames;
            if (registrationNameDependencies.hasOwnProperty(name)) {
              return true;
            }
            var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;
            if (registrationName != null) {
              error('Invalid event handler property `%s`. Did you mean `%s`?', name, registrationName);
              warnedProperties$1[name] = true;
              return true;
            }
            if (EVENT_NAME_REGEX.test(name)) {
              error('Unknown event handler property `%s`. It will be ignored.', name);
              warnedProperties$1[name] = true;
              return true;
            }
          } else if (EVENT_NAME_REGEX.test(name)) {
            if (INVALID_EVENT_NAME_REGEX.test(name)) {
              error('Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.', name);
            }
            warnedProperties$1[name] = true;
            return true;
          }
          if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
            return true;
          }
          if (lowerCasedName === 'innerhtml') {
            error('Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');
            warnedProperties$1[name] = true;
            return true;
          }
          if (lowerCasedName === 'aria') {
            error('The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');
            warnedProperties$1[name] = true;
            return true;
          }
          if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
            error('Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.', typeof value);
            warnedProperties$1[name] = true;
            return true;
          }
          if (typeof value === 'number' && isNaN(value)) {
            error('Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.', name);
            warnedProperties$1[name] = true;
            return true;
          }
          var propertyInfo = getPropertyInfo(name);
          var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;
          if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
            var standardName = possibleStandardNames[lowerCasedName];
            if (standardName !== name) {
              error('Invalid DOM property `%s`. Did you mean `%s`?', name, standardName);
              warnedProperties$1[name] = true;
              return true;
            }
          } else if (!isReserved && name !== lowerCasedName) {
            error('React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.', name, lowerCasedName);
            warnedProperties$1[name] = true;
            return true;
          }
          if (typeof value === 'boolean' && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
            if (value) {
              error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.', value, name, name, value, name);
            } else {
              error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
            }
            warnedProperties$1[name] = true;
            return true;
          }
          if (isReserved) {
            return true;
          }
          if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
            warnedProperties$1[name] = true;
            return false;
          }
          if ((value === 'false' || value === 'true') && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
            error('Received the string `%s` for the boolean attribute `%s`. ' + '%s ' + 'Did you mean %s={%s}?', value, name, value === 'false' ? 'The browser will interpret it as a truthy value.' : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
            warnedProperties$1[name] = true;
            return true;
          }
          return true;
        };
      }
      var warnUnknownProperties = function(type, props, eventRegistry) {
        {
          var unknownProps = [];
          for (var key in props) {
            var isValid = validateProperty$1(type, key, props[key], eventRegistry);
            if (!isValid) {
              unknownProps.push(key);
            }
          }
          var unknownPropString = unknownProps.map(function(prop) {
            return '`' + prop + '`';
          }).join(', ');
          if (unknownProps.length === 1) {
            error('Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
          } else if (unknownProps.length > 1) {
            error('Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
          }
        }
      };
      function validateProperties$2(type, props, eventRegistry) {
        if (isCustomComponent(type, props)) {
          return;
        }
        warnUnknownProperties(type, props, eventRegistry);
      }
      var warnValidStyle = function() {};
      {
        var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
        var msPattern = /^-ms-/;
        var hyphenPattern = /-(.)/g;
        var badStyleValueWithSemicolonPattern = /;\s*$/;
        var warnedStyleNames = {};
        var warnedStyleValues = {};
        var warnedForNaNValue = false;
        var warnedForInfinityValue = false;
        var camelize = function(string) {
          return string.replace(hyphenPattern, function(_, character) {
            return character.toUpperCase();
          });
        };
        var warnHyphenatedStyleName = function(name) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }
          warnedStyleNames[name] = true;
          error('Unsupported style property %s. Did you mean %s?', name, camelize(name.replace(msPattern, 'ms-')));
        };
        var warnBadVendoredStyleName = function(name) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }
          warnedStyleNames[name] = true;
          error('Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1));
        };
        var warnStyleValueWithSemicolon = function(name, value) {
          if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
            return;
          }
          warnedStyleValues[value] = true;
          error("Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, ''));
        };
        var warnStyleValueIsNaN = function(name, value) {
          if (warnedForNaNValue) {
            return;
          }
          warnedForNaNValue = true;
          error('`NaN` is an invalid value for the `%s` css style property.', name);
        };
        var warnStyleValueIsInfinity = function(name, value) {
          if (warnedForInfinityValue) {
            return;
          }
          warnedForInfinityValue = true;
          error('`Infinity` is an invalid value for the `%s` css style property.', name);
        };
        warnValidStyle = function(name, value) {
          if (name.indexOf('-') > -1) {
            warnHyphenatedStyleName(name);
          } else if (badVendoredStyleNamePattern.test(name)) {
            warnBadVendoredStyleName(name);
          } else if (badStyleValueWithSemicolonPattern.test(value)) {
            warnStyleValueWithSemicolon(name, value);
          }
          if (typeof value === 'number') {
            if (isNaN(value)) {
              warnStyleValueIsNaN(name, value);
            } else if (!isFinite(value)) {
              warnStyleValueIsInfinity(name, value);
            }
          }
        };
      }
      var warnValidStyle$1 = warnValidStyle;
      var matchHtmlRegExp = /["'&<>]/;
      function escapeHtml(string) {
        {
          checkHtmlStringCoercion(string);
        }
        var str = '' + string;
        var match = matchHtmlRegExp.exec(str);
        if (!match) {
          return str;
        }
        var escape;
        var html = '';
        var index;
        var lastIndex = 0;
        for (index = match.index; index < str.length; index++) {
          switch (str.charCodeAt(index)) {
            case 34:
              escape = '&quot;';
              break;
            case 38:
              escape = '&amp;';
              break;
            case 39:
              escape = '&#x27;';
              break;
            case 60:
              escape = '&lt;';
              break;
            case 62:
              escape = '&gt;';
              break;
            default:
              continue;
          }
          if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
          }
          lastIndex = index + 1;
          html += escape;
        }
        return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
      }
      function escapeTextForBrowser(text) {
        if (typeof text === 'boolean' || typeof text === 'number') {
          return '' + text;
        }
        return escapeHtml(text);
      }
      var uppercasePattern = /([A-Z])/g;
      var msPattern$1 = /^ms-/;
      function hyphenateStyleName(name) {
        return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern$1, '-ms-');
      }
      var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
      var didWarn = false;
      function sanitizeURL(url) {
        {
          if (!didWarn && isJavaScriptProtocol.test(url)) {
            didWarn = true;
            error('A future version of React will block javascript: URLs as a security precaution. ' + 'Use event handlers instead if you can. If you need to generate unsafe HTML try ' + 'using dangerouslySetInnerHTML instead. React was passed %s.', JSON.stringify(url));
          }
        }
      }
      var isArrayImpl = Array.isArray;
      function isArray(a) {
        return isArrayImpl(a);
      }
      var startInlineScript = stringToPrecomputedChunk('<script>');
      var endInlineScript = stringToPrecomputedChunk('</script>');
      var startScriptSrc = stringToPrecomputedChunk('<script src="');
      var startModuleSrc = stringToPrecomputedChunk('<script type="module" src="');
      var endAsyncScript = stringToPrecomputedChunk('" async=""></script>');
      function createResponseState(identifierPrefix, nonce, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
        var idPrefix = identifierPrefix === undefined ? '' : identifierPrefix;
        var inlineScriptWithNonce = nonce === undefined ? startInlineScript : stringToPrecomputedChunk('<script nonce="' + escapeTextForBrowser(nonce) + '">');
        var bootstrapChunks = [];
        if (bootstrapScriptContent !== undefined) {
          bootstrapChunks.push(inlineScriptWithNonce, stringToChunk(escapeTextForBrowser(bootstrapScriptContent)), endInlineScript);
        }
        if (bootstrapScripts !== undefined) {
          for (var i = 0; i < bootstrapScripts.length; i++) {
            bootstrapChunks.push(startScriptSrc, stringToChunk(escapeTextForBrowser(bootstrapScripts[i])), endAsyncScript);
          }
        }
        if (bootstrapModules !== undefined) {
          for (var _i = 0; _i < bootstrapModules.length; _i++) {
            bootstrapChunks.push(startModuleSrc, stringToChunk(escapeTextForBrowser(bootstrapModules[_i])), endAsyncScript);
          }
        }
        return {
          bootstrapChunks: bootstrapChunks,
          startInlineScript: inlineScriptWithNonce,
          placeholderPrefix: stringToPrecomputedChunk(idPrefix + 'P:'),
          segmentPrefix: stringToPrecomputedChunk(idPrefix + 'S:'),
          boundaryPrefix: idPrefix + 'B:',
          idPrefix: idPrefix,
          nextSuspenseID: 0,
          sentCompleteSegmentFunction: false,
          sentCompleteBoundaryFunction: false,
          sentClientRenderFunction: false
        };
      }
      var ROOT_HTML_MODE = 0;
      var HTML_MODE = 1;
      var SVG_MODE = 2;
      var MATHML_MODE = 3;
      var HTML_TABLE_MODE = 4;
      var HTML_TABLE_BODY_MODE = 5;
      var HTML_TABLE_ROW_MODE = 6;
      var HTML_COLGROUP_MODE = 7;
      function createFormatContext(insertionMode, selectedValue) {
        return {
          insertionMode: insertionMode,
          selectedValue: selectedValue
        };
      }
      function getChildFormatContext(parentContext, type, props) {
        switch (type) {
          case 'select':
            return createFormatContext(HTML_MODE, props.value != null ? props.value : props.defaultValue);
          case 'svg':
            return createFormatContext(SVG_MODE, null);
          case 'math':
            return createFormatContext(MATHML_MODE, null);
          case 'foreignObject':
            return createFormatContext(HTML_MODE, null);
          case 'table':
            return createFormatContext(HTML_TABLE_MODE, null);
          case 'thead':
          case 'tbody':
          case 'tfoot':
            return createFormatContext(HTML_TABLE_BODY_MODE, null);
          case 'colgroup':
            return createFormatContext(HTML_COLGROUP_MODE, null);
          case 'tr':
            return createFormatContext(HTML_TABLE_ROW_MODE, null);
        }
        if (parentContext.insertionMode >= HTML_TABLE_MODE) {
          return createFormatContext(HTML_MODE, null);
        }
        if (parentContext.insertionMode === ROOT_HTML_MODE) {
          return createFormatContext(HTML_MODE, null);
        }
        return parentContext;
      }
      var UNINITIALIZED_SUSPENSE_BOUNDARY_ID = null;
      function assignSuspenseBoundaryID(responseState) {
        var generatedID = responseState.nextSuspenseID++;
        return stringToPrecomputedChunk(responseState.boundaryPrefix + generatedID.toString(16));
      }
      function makeId(responseState, treeId, localId) {
        var idPrefix = responseState.idPrefix;
        var id = ':' + idPrefix + 'R' + treeId;
        if (localId > 0) {
          id += 'H' + localId.toString(32);
        }
        return id + ':';
      }
      function encodeHTMLTextNode(text) {
        return escapeTextForBrowser(text);
      }
      var textSeparator = stringToPrecomputedChunk('<!-- -->');
      function pushTextInstance(target, text, responseState) {
        if (text === '') {
          return;
        }
        target.push(stringToChunk(encodeHTMLTextNode(text)), textSeparator);
      }
      var styleNameCache = new Map();
      function processStyleName(styleName) {
        var chunk = styleNameCache.get(styleName);
        if (chunk !== undefined) {
          return chunk;
        }
        var result = stringToPrecomputedChunk(escapeTextForBrowser(hyphenateStyleName(styleName)));
        styleNameCache.set(styleName, result);
        return result;
      }
      var styleAttributeStart = stringToPrecomputedChunk(' style="');
      var styleAssign = stringToPrecomputedChunk(':');
      var styleSeparator = stringToPrecomputedChunk(';');
      function pushStyle(target, responseState, style) {
        if (typeof style !== 'object') {
          throw new Error('The `style` prop expects a mapping from style properties to values, ' + "not a string. For example, style={{marginRight: spacing + 'em'}} when " + 'using JSX.');
        }
        var isFirst = true;
        for (var styleName in style) {
          if (!hasOwnProperty.call(style, styleName)) {
            continue;
          }
          var styleValue = style[styleName];
          if (styleValue == null || typeof styleValue === 'boolean' || styleValue === '') {
            continue;
          }
          var nameChunk = void 0;
          var valueChunk = void 0;
          var isCustomProperty = styleName.indexOf('--') === 0;
          if (isCustomProperty) {
            nameChunk = stringToChunk(escapeTextForBrowser(styleName));
            {
              checkCSSPropertyStringCoercion(styleValue, styleName);
            }
            valueChunk = stringToChunk(escapeTextForBrowser(('' + styleValue).trim()));
          } else {
            {
              warnValidStyle$1(styleName, styleValue);
            }
            nameChunk = processStyleName(styleName);
            if (typeof styleValue === 'number') {
              if (styleValue !== 0 && !hasOwnProperty.call(isUnitlessNumber, styleName)) {
                valueChunk = stringToChunk(styleValue + 'px');
              } else {
                valueChunk = stringToChunk('' + styleValue);
              }
            } else {
              {
                checkCSSPropertyStringCoercion(styleValue, styleName);
              }
              valueChunk = stringToChunk(escapeTextForBrowser(('' + styleValue).trim()));
            }
          }
          if (isFirst) {
            isFirst = false;
            target.push(styleAttributeStart, nameChunk, styleAssign, valueChunk);
          } else {
            target.push(styleSeparator, nameChunk, styleAssign, valueChunk);
          }
        }
        if (!isFirst) {
          target.push(attributeEnd);
        }
      }
      var attributeSeparator = stringToPrecomputedChunk(' ');
      var attributeAssign = stringToPrecomputedChunk('="');
      var attributeEnd = stringToPrecomputedChunk('"');
      var attributeEmptyString = stringToPrecomputedChunk('=""');
      function pushAttribute(target, responseState, name, value) {
        switch (name) {
          case 'style':
            {
              pushStyle(target, responseState, value);
              return;
            }
          case 'defaultValue':
          case 'defaultChecked':
          case 'innerHTML':
          case 'suppressContentEditableWarning':
          case 'suppressHydrationWarning':
            return;
        }
        if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
          return;
        }
        var propertyInfo = getPropertyInfo(name);
        if (propertyInfo !== null) {
          switch (typeof value) {
            case 'function':
            case 'symbol':
              return;
            case 'boolean':
              {
                if (!propertyInfo.acceptsBooleans) {
                  return;
                }
              }
          }
          var attributeName = propertyInfo.attributeName;
          var attributeNameChunk = stringToChunk(attributeName);
          switch (propertyInfo.type) {
            case BOOLEAN:
              if (value) {
                target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
              }
              return;
            case OVERLOADED_BOOLEAN:
              if (value === true) {
                target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
              } else if (value === false)
                ;
              else {
                target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
              }
              return;
            case NUMERIC:
              if (!isNaN(value)) {
                target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
              }
              break;
            case POSITIVE_NUMERIC:
              if (!isNaN(value) && value >= 1) {
                target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
              }
              break;
            default:
              if (propertyInfo.sanitizeURL) {
                {
                  checkAttributeStringCoercion(value, attributeName);
                }
                value = '' + value;
                sanitizeURL(value);
              }
              target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
          }
        } else if (isAttributeNameSafe(name)) {
          switch (typeof value) {
            case 'function':
            case 'symbol':
              return;
            case 'boolean':
              {
                var prefix = name.toLowerCase().slice(0, 5);
                if (prefix !== 'data-' && prefix !== 'aria-') {
                  return;
                }
              }
          }
          target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }
      }
      var endOfStartTag = stringToPrecomputedChunk('>');
      var endOfStartTagSelfClosing = stringToPrecomputedChunk('/>');
      function pushInnerHTML(target, innerHTML, children) {
        if (innerHTML != null) {
          if (children != null) {
            throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
          }
          if (typeof innerHTML !== 'object' || !('__html' in innerHTML)) {
            throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://reactjs.org/link/dangerously-set-inner-html ' + 'for more information.');
          }
          var html = innerHTML.__html;
          if (html !== null && html !== undefined) {
            {
              checkHtmlStringCoercion(html);
            }
            target.push(stringToChunk('' + html));
          }
        }
      }
      var didWarnDefaultInputValue = false;
      var didWarnDefaultChecked = false;
      var didWarnDefaultSelectValue = false;
      var didWarnDefaultTextareaValue = false;
      var didWarnInvalidOptionChildren = false;
      var didWarnInvalidOptionInnerHTML = false;
      var didWarnSelectedSetOnOption = false;
      function checkSelectProp(props, propName) {
        {
          var value = props[propName];
          if (value != null) {
            var array = isArray(value);
            if (props.multiple && !array) {
              error('The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.', propName);
            } else if (!props.multiple && array) {
              error('The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.', propName);
            }
          }
        }
      }
      function pushStartSelect(target, props, responseState) {
        {
          checkControlledValueProps('select', props);
          checkSelectProp(props, 'value');
          checkSelectProp(props, 'defaultValue');
          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultSelectValue) {
            error('Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');
            didWarnDefaultSelectValue = true;
          }
        }
        target.push(startChunkForTag('select'));
        var children = null;
        var innerHTML = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
                children = propValue;
                break;
              case 'dangerouslySetInnerHTML':
                innerHTML = propValue;
                break;
              case 'defaultValue':
              case 'value':
                break;
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        target.push(endOfStartTag);
        pushInnerHTML(target, innerHTML, children);
        return children;
      }
      function flattenOptionChildren(children) {
        var content = '';
        React.Children.forEach(children, function(child) {
          if (child == null) {
            return;
          }
          content += child;
          {
            if (!didWarnInvalidOptionChildren && typeof child !== 'string' && typeof child !== 'number') {
              didWarnInvalidOptionChildren = true;
              error('Cannot infer the option value of complex children. ' + 'Pass a `value` prop or use a plain string as children to <option>.');
            }
          }
        });
        return content;
      }
      var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""');
      function pushStartOption(target, props, responseState, formatContext) {
        var selectedValue = formatContext.selectedValue;
        target.push(startChunkForTag('option'));
        var children = null;
        var value = null;
        var selected = null;
        var innerHTML = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
                children = propValue;
                break;
              case 'selected':
                selected = propValue;
                {
                  if (!didWarnSelectedSetOnOption) {
                    error('Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.');
                    didWarnSelectedSetOnOption = true;
                  }
                }
                break;
              case 'dangerouslySetInnerHTML':
                innerHTML = propValue;
                break;
              case 'value':
                value = propValue;
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        if (selectedValue != null) {
          var stringValue;
          if (value !== null) {
            {
              checkAttributeStringCoercion(value, 'value');
            }
            stringValue = '' + value;
          } else {
            {
              if (innerHTML !== null) {
                if (!didWarnInvalidOptionInnerHTML) {
                  didWarnInvalidOptionInnerHTML = true;
                  error('Pass a `value` prop if you set dangerouslyInnerHTML so React knows ' + 'which value should be selected.');
                }
              }
            }
            stringValue = flattenOptionChildren(children);
          }
          if (isArray(selectedValue)) {
            for (var i = 0; i < selectedValue.length; i++) {
              {
                checkAttributeStringCoercion(selectedValue[i], 'value');
              }
              var v = '' + selectedValue[i];
              if (v === stringValue) {
                target.push(selectedMarkerAttribute);
                break;
              }
            }
          } else {
            {
              checkAttributeStringCoercion(selectedValue, 'select.value');
            }
            if ('' + selectedValue === stringValue) {
              target.push(selectedMarkerAttribute);
            }
          }
        } else if (selected) {
          target.push(selectedMarkerAttribute);
        }
        target.push(endOfStartTag);
        pushInnerHTML(target, innerHTML, children);
        return children;
      }
      function pushInput(target, props, responseState) {
        {
          checkControlledValueProps('input', props);
          if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnDefaultChecked) {
            error('%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', 'A component', props.type);
            didWarnDefaultChecked = true;
          }
          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultInputValue) {
            error('%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', 'A component', props.type);
            didWarnDefaultInputValue = true;
          }
        }
        target.push(startChunkForTag('input'));
        var value = null;
        var defaultValue = null;
        var checked = null;
        var defaultChecked = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
              case 'dangerouslySetInnerHTML':
                throw new Error('input' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
              case 'defaultChecked':
                defaultChecked = propValue;
                break;
              case 'defaultValue':
                defaultValue = propValue;
                break;
              case 'checked':
                checked = propValue;
                break;
              case 'value':
                value = propValue;
                break;
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        if (checked !== null) {
          pushAttribute(target, responseState, 'checked', checked);
        } else if (defaultChecked !== null) {
          pushAttribute(target, responseState, 'checked', defaultChecked);
        }
        if (value !== null) {
          pushAttribute(target, responseState, 'value', value);
        } else if (defaultValue !== null) {
          pushAttribute(target, responseState, 'value', defaultValue);
        }
        target.push(endOfStartTagSelfClosing);
        return null;
      }
      function pushStartTextArea(target, props, responseState) {
        {
          checkControlledValueProps('textarea', props);
          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultTextareaValue) {
            error('Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');
            didWarnDefaultTextareaValue = true;
          }
        }
        target.push(startChunkForTag('textarea'));
        var value = null;
        var defaultValue = null;
        var children = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
                children = propValue;
                break;
              case 'value':
                value = propValue;
                break;
              case 'defaultValue':
                defaultValue = propValue;
                break;
              case 'dangerouslySetInnerHTML':
                throw new Error('`dangerouslySetInnerHTML` does not make sense on <textarea>.');
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        if (value === null && defaultValue !== null) {
          value = defaultValue;
        }
        target.push(endOfStartTag);
        if (children != null) {
          {
            error('Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
          }
          if (value != null) {
            throw new Error('If you supply `defaultValue` on a <textarea>, do not pass children.');
          }
          if (isArray(children)) {
            if (children.length > 1) {
              throw new Error('<textarea> can only have at most one child.');
            }
            {
              checkHtmlStringCoercion(children[0]);
            }
            value = '' + children[0];
          }
          {
            checkHtmlStringCoercion(children);
          }
          value = '' + children;
        }
        if (typeof value === 'string' && value[0] === '\n') {
          target.push(leadingNewline);
        }
        if (value !== null) {
          {
            checkAttributeStringCoercion(value, 'value');
          }
          target.push(stringToChunk(encodeHTMLTextNode('' + value)));
        }
        return null;
      }
      function pushSelfClosing(target, props, tag, responseState) {
        target.push(startChunkForTag(tag));
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
              case 'dangerouslySetInnerHTML':
                throw new Error(tag + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        target.push(endOfStartTagSelfClosing);
        return null;
      }
      function pushStartMenuItem(target, props, responseState) {
        target.push(startChunkForTag('menuitem'));
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
              case 'dangerouslySetInnerHTML':
                throw new Error('menuitems cannot have `children` nor `dangerouslySetInnerHTML`.');
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        target.push(endOfStartTag);
        return null;
      }
      function pushStartGenericElement(target, props, tag, responseState) {
        target.push(startChunkForTag(tag));
        var children = null;
        var innerHTML = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
                children = propValue;
                break;
              case 'dangerouslySetInnerHTML':
                innerHTML = propValue;
                break;
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        target.push(endOfStartTag);
        pushInnerHTML(target, innerHTML, children);
        if (typeof children === 'string') {
          target.push(stringToChunk(encodeHTMLTextNode(children)));
          return null;
        }
        return children;
      }
      function pushStartCustomElement(target, props, tag, responseState) {
        target.push(startChunkForTag(tag));
        var children = null;
        var innerHTML = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
                children = propValue;
                break;
              case 'dangerouslySetInnerHTML':
                innerHTML = propValue;
                break;
              case 'style':
                pushStyle(target, responseState, propValue);
                break;
              case 'suppressContentEditableWarning':
              case 'suppressHydrationWarning':
                break;
              default:
                if (isAttributeNameSafe(propKey) && typeof propValue !== 'function' && typeof propValue !== 'symbol') {
                  target.push(attributeSeparator, stringToChunk(propKey), attributeAssign, stringToChunk(escapeTextForBrowser(propValue)), attributeEnd);
                }
                break;
            }
          }
        }
        target.push(endOfStartTag);
        pushInnerHTML(target, innerHTML, children);
        return children;
      }
      var leadingNewline = stringToPrecomputedChunk('\n');
      function pushStartPreformattedElement(target, props, tag, responseState) {
        target.push(startChunkForTag(tag));
        var children = null;
        var innerHTML = null;
        for (var propKey in props) {
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            switch (propKey) {
              case 'children':
                children = propValue;
                break;
              case 'dangerouslySetInnerHTML':
                innerHTML = propValue;
                break;
              default:
                pushAttribute(target, responseState, propKey, propValue);
                break;
            }
          }
        }
        target.push(endOfStartTag);
        if (innerHTML != null) {
          if (children != null) {
            throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
          }
          if (typeof innerHTML !== 'object' || !('__html' in innerHTML)) {
            throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://reactjs.org/link/dangerously-set-inner-html ' + 'for more information.');
          }
          var html = innerHTML.__html;
          if (html !== null && html !== undefined) {
            if (typeof html === 'string' && html.length > 0 && html[0] === '\n') {
              target.push(leadingNewline, stringToChunk(html));
            } else {
              {
                checkHtmlStringCoercion(html);
              }
              target.push(stringToChunk('' + html));
            }
          }
        }
        if (typeof children === 'string' && children[0] === '\n') {
          target.push(leadingNewline);
        }
        return children;
      }
      var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/;
      var validatedTagCache = new Map();
      function startChunkForTag(tag) {
        var tagStartChunk = validatedTagCache.get(tag);
        if (tagStartChunk === undefined) {
          if (!VALID_TAG_REGEX.test(tag)) {
            throw new Error("Invalid tag: " + tag);
          }
          tagStartChunk = stringToPrecomputedChunk('<' + tag);
          validatedTagCache.set(tag, tagStartChunk);
        }
        return tagStartChunk;
      }
      var DOCTYPE = stringToPrecomputedChunk('<!DOCTYPE html>');
      function pushStartInstance(target, type, props, responseState, formatContext) {
        {
          validateProperties(type, props);
          validateProperties$1(type, props);
          validateProperties$2(type, props, null);
          if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
            error('A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.');
          }
          if (formatContext.insertionMode !== SVG_MODE && formatContext.insertionMode !== MATHML_MODE) {
            if (type.indexOf('-') === -1 && typeof props.is !== 'string' && type.toLowerCase() !== type) {
              error('<%s /> is using incorrect casing. ' + 'Use PascalCase for React components, ' + 'or lowercase for HTML elements.', type);
            }
          }
        }
        switch (type) {
          case 'select':
            return pushStartSelect(target, props, responseState);
          case 'option':
            return pushStartOption(target, props, responseState, formatContext);
          case 'textarea':
            return pushStartTextArea(target, props, responseState);
          case 'input':
            return pushInput(target, props, responseState);
          case 'menuitem':
            return pushStartMenuItem(target, props, responseState);
          case 'listing':
          case 'pre':
            {
              return pushStartPreformattedElement(target, props, type, responseState);
            }
          case 'area':
          case 'base':
          case 'br':
          case 'col':
          case 'embed':
          case 'hr':
          case 'img':
          case 'keygen':
          case 'link':
          case 'meta':
          case 'param':
          case 'source':
          case 'track':
          case 'wbr':
            {
              return pushSelfClosing(target, props, type, responseState);
            }
          case 'annotation-xml':
          case 'color-profile':
          case 'font-face':
          case 'font-face-src':
          case 'font-face-uri':
          case 'font-face-format':
          case 'font-face-name':
          case 'missing-glyph':
            {
              return pushStartGenericElement(target, props, type, responseState);
            }
          case 'html':
            {
              if (formatContext.insertionMode === ROOT_HTML_MODE) {
                target.push(DOCTYPE);
              }
              return pushStartGenericElement(target, props, type, responseState);
            }
          default:
            {
              if (type.indexOf('-') === -1 && typeof props.is !== 'string') {
                return pushStartGenericElement(target, props, type, responseState);
              } else {
                return pushStartCustomElement(target, props, type, responseState);
              }
            }
        }
      }
      var endTag1 = stringToPrecomputedChunk('</');
      var endTag2 = stringToPrecomputedChunk('>');
      function pushEndInstance(target, type, props) {
        switch (type) {
          case 'area':
          case 'base':
          case 'br':
          case 'col':
          case 'embed':
          case 'hr':
          case 'img':
          case 'input':
          case 'keygen':
          case 'link':
          case 'meta':
          case 'param':
          case 'source':
          case 'track':
          case 'wbr':
            {
              break;
            }
          default:
            {
              target.push(endTag1, stringToChunk(type), endTag2);
            }
        }
      }
      function writeCompletedRoot(destination, responseState) {
        var bootstrapChunks = responseState.bootstrapChunks;
        var i = 0;
        for (; i < bootstrapChunks.length - 1; i++) {
          writeChunk(destination, bootstrapChunks[i]);
        }
        if (i < bootstrapChunks.length) {
          return writeChunkAndReturn(destination, bootstrapChunks[i]);
        }
        return true;
      }
      var placeholder1 = stringToPrecomputedChunk('<template id="');
      var placeholder2 = stringToPrecomputedChunk('"></template>');
      function writePlaceholder(destination, responseState, id) {
        writeChunk(destination, placeholder1);
        writeChunk(destination, responseState.placeholderPrefix);
        var formattedID = stringToChunk(id.toString(16));
        writeChunk(destination, formattedID);
        return writeChunkAndReturn(destination, placeholder2);
      }
      var startCompletedSuspenseBoundary = stringToPrecomputedChunk('<!--$-->');
      var startPendingSuspenseBoundary1 = stringToPrecomputedChunk('<!--$?--><template id="');
      var startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>');
      var startClientRenderedSuspenseBoundary = stringToPrecomputedChunk('<!--$!-->');
      var endSuspenseBoundary = stringToPrecomputedChunk('<!--/$-->');
      function writeStartCompletedSuspenseBoundary(destination, responseState) {
        return writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
      }
      function writeStartPendingSuspenseBoundary(destination, responseState, id) {
        writeChunk(destination, startPendingSuspenseBoundary1);
        if (id === null) {
          throw new Error('An ID must have been assigned before we can complete the boundary.');
        }
        writeChunk(destination, id);
        return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
      }
      function writeStartClientRenderedSuspenseBoundary(destination, responseState) {
        return writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
      }
      function writeEndCompletedSuspenseBoundary(destination, responseState) {
        return writeChunkAndReturn(destination, endSuspenseBoundary);
      }
      function writeEndPendingSuspenseBoundary(destination, responseState) {
        return writeChunkAndReturn(destination, endSuspenseBoundary);
      }
      function writeEndClientRenderedSuspenseBoundary(destination, responseState) {
        return writeChunkAndReturn(destination, endSuspenseBoundary);
      }
      var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="');
      var startSegmentHTML2 = stringToPrecomputedChunk('">');
      var endSegmentHTML = stringToPrecomputedChunk('</div>');
      var startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="');
      var startSegmentSVG2 = stringToPrecomputedChunk('">');
      var endSegmentSVG = stringToPrecomputedChunk('</svg>');
      var startSegmentMathML = stringToPrecomputedChunk('<math aria-hidden="true" style="display:none" id="');
      var startSegmentMathML2 = stringToPrecomputedChunk('">');
      var endSegmentMathML = stringToPrecomputedChunk('</math>');
      var startSegmentTable = stringToPrecomputedChunk('<table hidden id="');
      var startSegmentTable2 = stringToPrecomputedChunk('">');
      var endSegmentTable = stringToPrecomputedChunk('</table>');
      var startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="');
      var startSegmentTableBody2 = stringToPrecomputedChunk('">');
      var endSegmentTableBody = stringToPrecomputedChunk('</tbody></table>');
      var startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="');
      var startSegmentTableRow2 = stringToPrecomputedChunk('">');
      var endSegmentTableRow = stringToPrecomputedChunk('</tr></table>');
      var startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="');
      var startSegmentColGroup2 = stringToPrecomputedChunk('">');
      var endSegmentColGroup = stringToPrecomputedChunk('</colgroup></table>');
      function writeStartSegment(destination, responseState, formatContext, id) {
        switch (formatContext.insertionMode) {
          case ROOT_HTML_MODE:
          case HTML_MODE:
            {
              writeChunk(destination, startSegmentHTML);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentHTML2);
            }
          case SVG_MODE:
            {
              writeChunk(destination, startSegmentSVG);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentSVG2);
            }
          case MATHML_MODE:
            {
              writeChunk(destination, startSegmentMathML);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentMathML2);
            }
          case HTML_TABLE_MODE:
            {
              writeChunk(destination, startSegmentTable);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTable2);
            }
          case HTML_TABLE_BODY_MODE:
            {
              writeChunk(destination, startSegmentTableBody);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTableBody2);
            }
          case HTML_TABLE_ROW_MODE:
            {
              writeChunk(destination, startSegmentTableRow);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentTableRow2);
            }
          case HTML_COLGROUP_MODE:
            {
              writeChunk(destination, startSegmentColGroup);
              writeChunk(destination, responseState.segmentPrefix);
              writeChunk(destination, stringToChunk(id.toString(16)));
              return writeChunkAndReturn(destination, startSegmentColGroup2);
            }
          default:
            {
              throw new Error('Unknown insertion mode. This is a bug in React.');
            }
        }
      }
      function writeEndSegment(destination, formatContext) {
        switch (formatContext.insertionMode) {
          case ROOT_HTML_MODE:
          case HTML_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentHTML);
            }
          case SVG_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentSVG);
            }
          case MATHML_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentMathML);
            }
          case HTML_TABLE_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentTable);
            }
          case HTML_TABLE_BODY_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentTableBody);
            }
          case HTML_TABLE_ROW_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentTableRow);
            }
          case HTML_COLGROUP_MODE:
            {
              return writeChunkAndReturn(destination, endSegmentColGroup);
            }
          default:
            {
              throw new Error('Unknown insertion mode. This is a bug in React.');
            }
        }
      }
      var completeSegmentFunction = 'function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}';
      var completeBoundaryFunction = 'function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}}';
      var clientRenderFunction = 'function $RX(a){if(a=document.getElementById(a))a=a.previousSibling,a.data="$!",a._reactRetry&&a._reactRetry()}';
      var completeSegmentScript1Full = stringToPrecomputedChunk(completeSegmentFunction + ';$RS("');
      var completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("');
      var completeSegmentScript2 = stringToPrecomputedChunk('","');
      var completeSegmentScript3 = stringToPrecomputedChunk('")</script>');
      function writeCompletedSegmentInstruction(destination, responseState, contentSegmentID) {
        writeChunk(destination, responseState.startInlineScript);
        if (!responseState.sentCompleteSegmentFunction) {
          responseState.sentCompleteSegmentFunction = true;
          writeChunk(destination, completeSegmentScript1Full);
        } else {
          writeChunk(destination, completeSegmentScript1Partial);
        }
        writeChunk(destination, responseState.segmentPrefix);
        var formattedID = stringToChunk(contentSegmentID.toString(16));
        writeChunk(destination, formattedID);
        writeChunk(destination, completeSegmentScript2);
        writeChunk(destination, responseState.placeholderPrefix);
        writeChunk(destination, formattedID);
        return writeChunkAndReturn(destination, completeSegmentScript3);
      }
      var completeBoundaryScript1Full = stringToPrecomputedChunk(completeBoundaryFunction + ';$RC("');
      var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("');
      var completeBoundaryScript2 = stringToPrecomputedChunk('","');
      var completeBoundaryScript3 = stringToPrecomputedChunk('")</script>');
      function writeCompletedBoundaryInstruction(destination, responseState, boundaryID, contentSegmentID) {
        writeChunk(destination, responseState.startInlineScript);
        if (!responseState.sentCompleteBoundaryFunction) {
          responseState.sentCompleteBoundaryFunction = true;
          writeChunk(destination, completeBoundaryScript1Full);
        } else {
          writeChunk(destination, completeBoundaryScript1Partial);
        }
        if (boundaryID === null) {
          throw new Error('An ID must have been assigned before we can complete the boundary.');
        }
        var formattedContentID = stringToChunk(contentSegmentID.toString(16));
        writeChunk(destination, boundaryID);
        writeChunk(destination, completeBoundaryScript2);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, formattedContentID);
        return writeChunkAndReturn(destination, completeBoundaryScript3);
      }
      var clientRenderScript1Full = stringToPrecomputedChunk(clientRenderFunction + ';$RX("');
      var clientRenderScript1Partial = stringToPrecomputedChunk('$RX("');
      var clientRenderScript2 = stringToPrecomputedChunk('")</script>');
      function writeClientRenderBoundaryInstruction(destination, responseState, boundaryID) {
        writeChunk(destination, responseState.startInlineScript);
        if (!responseState.sentClientRenderFunction) {
          responseState.sentClientRenderFunction = true;
          writeChunk(destination, clientRenderScript1Full);
        } else {
          writeChunk(destination, clientRenderScript1Partial);
        }
        if (boundaryID === null) {
          throw new Error('An ID must have been assigned before we can complete the boundary.');
        }
        writeChunk(destination, boundaryID);
        return writeChunkAndReturn(destination, clientRenderScript2);
      }
      function createResponseState$1(generateStaticMarkup, identifierPrefix) {
        var responseState = createResponseState(identifierPrefix, undefined);
        return {
          bootstrapChunks: responseState.bootstrapChunks,
          startInlineScript: responseState.startInlineScript,
          placeholderPrefix: responseState.placeholderPrefix,
          segmentPrefix: responseState.segmentPrefix,
          boundaryPrefix: responseState.boundaryPrefix,
          idPrefix: responseState.idPrefix,
          nextSuspenseID: responseState.nextSuspenseID,
          sentCompleteSegmentFunction: responseState.sentCompleteSegmentFunction,
          sentCompleteBoundaryFunction: responseState.sentCompleteBoundaryFunction,
          sentClientRenderFunction: responseState.sentClientRenderFunction,
          generateStaticMarkup: generateStaticMarkup
        };
      }
      function createRootFormatContext() {
        return {
          insertionMode: HTML_MODE,
          selectedValue: null
        };
      }
      function pushTextInstance$1(target, text, responseState) {
        if (responseState.generateStaticMarkup) {
          target.push(stringToChunk(escapeTextForBrowser(text)));
        } else {
          pushTextInstance(target, text);
        }
      }
      function writeStartCompletedSuspenseBoundary$1(destination, responseState) {
        if (responseState.generateStaticMarkup) {
          return true;
        }
        return writeStartCompletedSuspenseBoundary(destination);
      }
      function writeStartClientRenderedSuspenseBoundary$1(destination, responseState) {
        if (responseState.generateStaticMarkup) {
          return true;
        }
        return writeStartClientRenderedSuspenseBoundary(destination);
      }
      function writeEndCompletedSuspenseBoundary$1(destination, responseState) {
        if (responseState.generateStaticMarkup) {
          return true;
        }
        return writeEndCompletedSuspenseBoundary(destination);
      }
      function writeEndClientRenderedSuspenseBoundary$1(destination, responseState) {
        if (responseState.generateStaticMarkup) {
          return true;
        }
        return writeEndClientRenderedSuspenseBoundary(destination);
      }
      var assign = Object.assign;
      var REACT_ELEMENT_TYPE = Symbol.for('react.element');
      var REACT_PORTAL_TYPE = Symbol.for('react.portal');
      var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
      var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
      var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
      var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
      var REACT_CONTEXT_TYPE = Symbol.for('react.context');
      var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
      var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
      var REACT_MEMO_TYPE = Symbol.for('react.memo');
      var REACT_LAZY_TYPE = Symbol.for('react.lazy');
      var REACT_SCOPE_TYPE = Symbol.for('react.scope');
      var REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for('react.debug_trace_mode');
      var REACT_LEGACY_HIDDEN_TYPE = Symbol.for('react.legacy_hidden');
      var REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for('react.default_value');
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = '@@iterator';
      function getIteratorFn(maybeIterable) {
        if (maybeIterable === null || typeof maybeIterable !== 'object') {
          return null;
        }
        var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
        if (typeof maybeIterator === 'function') {
          return maybeIterator;
        }
        return null;
      }
      function getWrappedName(outerType, innerType, wrapperName) {
        var displayName = outerType.displayName;
        if (displayName) {
          return displayName;
        }
        var functionName = innerType.displayName || innerType.name || '';
        return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
      }
      function getContextName(type) {
        return type.displayName || 'Context';
      }
      function getComponentNameFromType(type) {
        if (type == null) {
          return null;
        }
        {
          if (typeof type.tag === 'number') {
            error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
          }
        }
        if (typeof type === 'function') {
          return type.displayName || type.name || null;
        }
        if (typeof type === 'string') {
          return type;
        }
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return 'Fragment';
          case REACT_PORTAL_TYPE:
            return 'Portal';
          case REACT_PROFILER_TYPE:
            return 'Profiler';
          case REACT_STRICT_MODE_TYPE:
            return 'StrictMode';
          case REACT_SUSPENSE_TYPE:
            return 'Suspense';
          case REACT_SUSPENSE_LIST_TYPE:
            return 'SuspenseList';
        }
        if (typeof type === 'object') {
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              var context = type;
              return getContextName(context) + '.Consumer';
            case REACT_PROVIDER_TYPE:
              var provider = type;
              return getContextName(provider._context) + '.Provider';
            case REACT_FORWARD_REF_TYPE:
              return getWrappedName(type, type.render, 'ForwardRef');
            case REACT_MEMO_TYPE:
              var outerName = type.displayName || null;
              if (outerName !== null) {
                return outerName;
              }
              return getComponentNameFromType(type.type) || 'Memo';
            case REACT_LAZY_TYPE:
              {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
          }
        }
        return null;
      }
      var disabledDepth = 0;
      var prevLog;
      var prevInfo;
      var prevWarn;
      var prevError;
      var prevGroup;
      var prevGroupCollapsed;
      var prevGroupEnd;
      function disabledLog() {}
      disabledLog.__reactDisabledLog = true;
      function disableLogs() {
        {
          if (disabledDepth === 0) {
            prevLog = console.log;
            prevInfo = console.info;
            prevWarn = console.warn;
            prevError = console.error;
            prevGroup = console.group;
            prevGroupCollapsed = console.groupCollapsed;
            prevGroupEnd = console.groupEnd;
            var props = {
              configurable: true,
              enumerable: true,
              value: disabledLog,
              writable: true
            };
            Object.defineProperties(console, {
              info: props,
              log: props,
              warn: props,
              error: props,
              group: props,
              groupCollapsed: props,
              groupEnd: props
            });
          }
          disabledDepth++;
        }
      }
      function reenableLogs() {
        {
          disabledDepth--;
          if (disabledDepth === 0) {
            var props = {
              configurable: true,
              enumerable: true,
              writable: true
            };
            Object.defineProperties(console, {
              log: assign({}, props, {value: prevLog}),
              info: assign({}, props, {value: prevInfo}),
              warn: assign({}, props, {value: prevWarn}),
              error: assign({}, props, {value: prevError}),
              group: assign({}, props, {value: prevGroup}),
              groupCollapsed: assign({}, props, {value: prevGroupCollapsed}),
              groupEnd: assign({}, props, {value: prevGroupEnd})
            });
          }
          if (disabledDepth < 0) {
            error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
          }
        }
      }
      var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
      var prefix;
      function describeBuiltInComponentFrame(name, source, ownerFn) {
        {
          if (prefix === undefined) {
            try {
              throw Error();
            } catch (x) {
              var match = x.stack.trim().match(/\n( *(at )?)/);
              prefix = match && match[1] || '';
            }
          }
          return '\n' + prefix + name;
        }
      }
      var reentry = false;
      var componentFrameCache;
      {
        var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
        componentFrameCache = new PossiblyWeakMap();
      }
      function describeNativeComponentFrame(fn, construct) {
        if (!fn || reentry) {
          return '';
        }
        {
          var frame = componentFrameCache.get(fn);
          if (frame !== undefined) {
            return frame;
          }
        }
        var control;
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = undefined;
        var previousDispatcher;
        {
          previousDispatcher = ReactCurrentDispatcher.current;
          ReactCurrentDispatcher.current = null;
          disableLogs();
        }
        try {
          if (construct) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, 'props', {set: function() {
                throw Error();
              }});
            if (typeof Reflect === 'object' && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x) {
                control = x;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x) {
              control = x;
            }
            fn();
          }
        } catch (sample) {
          if (sample && control && typeof sample.stack === 'string') {
            var sampleLines = sample.stack.split('\n');
            var controlLines = control.stack.split('\n');
            var s = sampleLines.length - 1;
            var c = controlLines.length - 1;
            while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
              c--;
            }
            for (; s >= 1 && c >= 0; s--, c--) {
              if (sampleLines[s] !== controlLines[c]) {
                if (s !== 1 || c !== 1) {
                  do {
                    s--;
                    c--;
                    if (c < 0 || sampleLines[s] !== controlLines[c]) {
                      var _frame = '\n' + sampleLines[s].replace(' at new ', ' at ');
                      if (fn.displayName && _frame.includes('<anonymous>')) {
                        _frame = _frame.replace('<anonymous>', fn.displayName);
                      }
                      {
                        if (typeof fn === 'function') {
                          componentFrameCache.set(fn, _frame);
                        }
                      }
                      return _frame;
                    }
                  } while (s >= 1 && c >= 0);
                }
                break;
              }
            }
          }
        } finally {
          reentry = false;
          {
            ReactCurrentDispatcher.current = previousDispatcher;
            reenableLogs();
          }
          Error.prepareStackTrace = previousPrepareStackTrace;
        }
        var name = fn ? fn.displayName || fn.name : '';
        var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';
        {
          if (typeof fn === 'function') {
            componentFrameCache.set(fn, syntheticFrame);
          }
        }
        return syntheticFrame;
      }
      function describeClassComponentFrame(ctor, source, ownerFn) {
        {
          return describeNativeComponentFrame(ctor, true);
        }
      }
      function describeFunctionComponentFrame(fn, source, ownerFn) {
        {
          return describeNativeComponentFrame(fn, false);
        }
      }
      function shouldConstruct(Component) {
        var prototype = Component.prototype;
        return !!(prototype && prototype.isReactComponent);
      }
      function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
        if (type == null) {
          return '';
        }
        if (typeof type === 'function') {
          {
            return describeNativeComponentFrame(type, shouldConstruct(type));
          }
        }
        if (typeof type === 'string') {
          return describeBuiltInComponentFrame(type);
        }
        switch (type) {
          case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame('Suspense');
          case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame('SuspenseList');
        }
        if (typeof type === 'object') {
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              return describeFunctionComponentFrame(type.render);
            case REACT_MEMO_TYPE:
              return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
            case REACT_LAZY_TYPE:
              {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {}
              }
          }
        }
        return '';
      }
      var loggedTypeFailures = {};
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame.setExtraStackFrame(null);
          }
        }
      }
      function checkPropTypes(typeSpecs, values, location, componentName, element) {
        {
          var has = Function.call.bind(hasOwnProperty);
          for (var typeSpecName in typeSpecs) {
            if (has(typeSpecs, typeSpecName)) {
              var error$1 = void 0;
              try {
                if (typeof typeSpecs[typeSpecName] !== 'function') {
                  var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
                  err.name = 'Invariant Violation';
                  throw err;
                }
                error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
              } catch (ex) {
                error$1 = ex;
              }
              if (error$1 && !(error$1 instanceof Error)) {
                setCurrentlyValidatingElement(element);
                error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);
                setCurrentlyValidatingElement(null);
              }
              if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                loggedTypeFailures[error$1.message] = true;
                setCurrentlyValidatingElement(element);
                error('Failed %s type: %s', location, error$1.message);
                setCurrentlyValidatingElement(null);
              }
            }
          }
        }
      }
      var warnedAboutMissingGetChildContext;
      {
        warnedAboutMissingGetChildContext = {};
      }
      var emptyContextObject = {};
      {
        Object.freeze(emptyContextObject);
      }
      function getMaskedContext(type, unmaskedContext) {
        {
          var contextTypes = type.contextTypes;
          if (!contextTypes) {
            return emptyContextObject;
          }
          var context = {};
          for (var key in contextTypes) {
            context[key] = unmaskedContext[key];
          }
          {
            var name = getComponentNameFromType(type) || 'Unknown';
            checkPropTypes(contextTypes, context, 'context', name);
          }
          return context;
        }
      }
      function processChildContext(instance, type, parentContext, childContextTypes) {
        {
          if (typeof instance.getChildContext !== 'function') {
            {
              var componentName = getComponentNameFromType(type) || 'Unknown';
              if (!warnedAboutMissingGetChildContext[componentName]) {
                warnedAboutMissingGetChildContext[componentName] = true;
                error('%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
              }
            }
            return parentContext;
          }
          var childContext = instance.getChildContext();
          for (var contextKey in childContext) {
            if (!(contextKey in childContextTypes)) {
              throw new Error((getComponentNameFromType(type) || 'Unknown') + ".getChildContext(): key \"" + contextKey + "\" is not defined in childContextTypes.");
            }
          }
          {
            var name = getComponentNameFromType(type) || 'Unknown';
            checkPropTypes(childContextTypes, childContext, 'child context', name);
          }
          return assign({}, parentContext, childContext);
        }
      }
      var rendererSigil;
      {
        rendererSigil = {};
      }
      var rootContextSnapshot = null;
      var currentActiveSnapshot = null;
      function popNode(prev) {
        {
          prev.context._currentValue2 = prev.parentValue;
        }
      }
      function pushNode(next) {
        {
          next.context._currentValue2 = next.value;
        }
      }
      function popToNearestCommonAncestor(prev, next) {
        if (prev === next)
          ;
        else {
          popNode(prev);
          var parentPrev = prev.parent;
          var parentNext = next.parent;
          if (parentPrev === null) {
            if (parentNext !== null) {
              throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
            }
          } else {
            if (parentNext === null) {
              throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
            }
            popToNearestCommonAncestor(parentPrev, parentNext);
          }
          pushNode(next);
        }
      }
      function popAllPrevious(prev) {
        popNode(prev);
        var parentPrev = prev.parent;
        if (parentPrev !== null) {
          popAllPrevious(parentPrev);
        }
      }
      function pushAllNext(next) {
        var parentNext = next.parent;
        if (parentNext !== null) {
          pushAllNext(parentNext);
        }
        pushNode(next);
      }
      function popPreviousToCommonLevel(prev, next) {
        popNode(prev);
        var parentPrev = prev.parent;
        if (parentPrev === null) {
          throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
        }
        if (parentPrev.depth === next.depth) {
          popToNearestCommonAncestor(parentPrev, next);
        } else {
          popPreviousToCommonLevel(parentPrev, next);
        }
      }
      function popNextToCommonLevel(prev, next) {
        var parentNext = next.parent;
        if (parentNext === null) {
          throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
        }
        if (prev.depth === parentNext.depth) {
          popToNearestCommonAncestor(prev, parentNext);
        } else {
          popNextToCommonLevel(prev, parentNext);
        }
        pushNode(next);
      }
      function switchContext(newSnapshot) {
        var prev = currentActiveSnapshot;
        var next = newSnapshot;
        if (prev !== next) {
          if (prev === null) {
            pushAllNext(next);
          } else if (next === null) {
            popAllPrevious(prev);
          } else if (prev.depth === next.depth) {
            popToNearestCommonAncestor(prev, next);
          } else if (prev.depth > next.depth) {
            popPreviousToCommonLevel(prev, next);
          } else {
            popNextToCommonLevel(prev, next);
          }
          currentActiveSnapshot = next;
        }
      }
      function pushProvider(context, nextValue) {
        var prevValue;
        {
          prevValue = context._currentValue2;
          context._currentValue2 = nextValue;
          {
            if (context._currentRenderer2 !== undefined && context._currentRenderer2 !== null && context._currentRenderer2 !== rendererSigil) {
              error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
            }
            context._currentRenderer2 = rendererSigil;
          }
        }
        var prevNode = currentActiveSnapshot;
        var newNode = {
          parent: prevNode,
          depth: prevNode === null ? 0 : prevNode.depth + 1,
          context: context,
          parentValue: prevValue,
          value: nextValue
        };
        currentActiveSnapshot = newNode;
        return newNode;
      }
      function popProvider(context) {
        var prevSnapshot = currentActiveSnapshot;
        if (prevSnapshot === null) {
          throw new Error('Tried to pop a Context at the root of the app. This is a bug in React.');
        }
        {
          if (prevSnapshot.context !== context) {
            error('The parent context is not the expected context. This is probably a bug in React.');
          }
        }
        {
          var _value = prevSnapshot.parentValue;
          if (_value === REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED) {
            prevSnapshot.context._currentValue2 = prevSnapshot.context._defaultValue;
          } else {
            prevSnapshot.context._currentValue2 = _value;
          }
          {
            if (context._currentRenderer2 !== undefined && context._currentRenderer2 !== null && context._currentRenderer2 !== rendererSigil) {
              error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
            }
            context._currentRenderer2 = rendererSigil;
          }
        }
        return currentActiveSnapshot = prevSnapshot.parent;
      }
      function getActiveContext() {
        return currentActiveSnapshot;
      }
      function readContext(context) {
        var value = context._currentValue2;
        return value;
      }
      function get(key) {
        return key._reactInternals;
      }
      function set(key, value) {
        key._reactInternals = value;
      }
      var didWarnAboutNoopUpdateForComponent = {};
      var didWarnAboutDeprecatedWillMount = {};
      var didWarnAboutUninitializedState;
      var didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
      var didWarnAboutLegacyLifecyclesAndDerivedState;
      var didWarnAboutUndefinedDerivedState;
      var warnOnUndefinedDerivedState;
      var warnOnInvalidCallback;
      var didWarnAboutDirectlyAssigningPropsToState;
      var didWarnAboutContextTypeAndContextTypes;
      var didWarnAboutInvalidateContextType;
      {
        didWarnAboutUninitializedState = new Set();
        didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = new Set();
        didWarnAboutLegacyLifecyclesAndDerivedState = new Set();
        didWarnAboutDirectlyAssigningPropsToState = new Set();
        didWarnAboutUndefinedDerivedState = new Set();
        didWarnAboutContextTypeAndContextTypes = new Set();
        didWarnAboutInvalidateContextType = new Set();
        var didWarnOnInvalidCallback = new Set();
        warnOnInvalidCallback = function(callback, callerName) {
          if (callback === null || typeof callback === 'function') {
            return;
          }
          var key = callerName + '_' + callback;
          if (!didWarnOnInvalidCallback.has(key)) {
            didWarnOnInvalidCallback.add(key);
            error('%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
          }
        };
        warnOnUndefinedDerivedState = function(type, partialState) {
          if (partialState === undefined) {
            var componentName = getComponentNameFromType(type) || 'Component';
            if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
              didWarnAboutUndefinedDerivedState.add(componentName);
              error('%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' + 'You have returned undefined.', componentName);
            }
          }
        };
      }
      function warnNoop(publicInstance, callerName) {
        {
          var _constructor = publicInstance.constructor;
          var componentName = _constructor && getComponentNameFromType(_constructor) || 'ReactClass';
          var warningKey = componentName + '.' + callerName;
          if (didWarnAboutNoopUpdateForComponent[warningKey]) {
            return;
          }
          error('%s(...): Can only update a mounting component. ' + 'This usually means you called %s() outside componentWillMount() on the server. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, callerName, componentName);
          didWarnAboutNoopUpdateForComponent[warningKey] = true;
        }
      }
      var classComponentUpdater = {
        isMounted: function(inst) {
          return false;
        },
        enqueueSetState: function(inst, payload, callback) {
          var internals = get(inst);
          if (internals.queue === null) {
            warnNoop(inst, 'setState');
          } else {
            internals.queue.push(payload);
            {
              if (callback !== undefined && callback !== null) {
                warnOnInvalidCallback(callback, 'setState');
              }
            }
          }
        },
        enqueueReplaceState: function(inst, payload, callback) {
          var internals = get(inst);
          internals.replace = true;
          internals.queue = [payload];
          {
            if (callback !== undefined && callback !== null) {
              warnOnInvalidCallback(callback, 'setState');
            }
          }
        },
        enqueueForceUpdate: function(inst, callback) {
          var internals = get(inst);
          if (internals.queue === null) {
            warnNoop(inst, 'forceUpdate');
          } else {
            {
              if (callback !== undefined && callback !== null) {
                warnOnInvalidCallback(callback, 'setState');
              }
            }
          }
        }
      };
      function applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, prevState, nextProps) {
        var partialState = getDerivedStateFromProps(nextProps, prevState);
        {
          warnOnUndefinedDerivedState(ctor, partialState);
        }
        var newState = partialState === null || partialState === undefined ? prevState : assign({}, prevState, partialState);
        return newState;
      }
      function constructClassInstance(ctor, props, maskedLegacyContext) {
        var context = emptyContextObject;
        var contextType = ctor.contextType;
        {
          if ('contextType' in ctor) {
            var isValid = contextType === null || contextType !== undefined && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === undefined;
            if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
              didWarnAboutInvalidateContextType.add(ctor);
              var addendum = '';
              if (contextType === undefined) {
                addendum = ' However, it is set to undefined. ' + 'This can be caused by a typo or by mixing up named and default imports. ' + 'This can also happen due to a circular dependency, so ' + 'try moving the createContext() call to a separate file.';
              } else if (typeof contextType !== 'object') {
                addendum = ' However, it is set to a ' + typeof contextType + '.';
              } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                addendum = ' Did you accidentally pass the Context.Provider instead?';
              } else if (contextType._context !== undefined) {
                addendum = ' Did you accidentally pass the Context.Consumer instead?';
              } else {
                addendum = ' However, it is set to an object with keys {' + Object.keys(contextType).join(', ') + '}.';
              }
              error('%s defines an invalid contextType. ' + 'contextType should point to the Context object returned by React.createContext().%s', getComponentNameFromType(ctor) || 'Component', addendum);
            }
          }
        }
        if (typeof contextType === 'object' && contextType !== null) {
          context = readContext(contextType);
        } else {
          context = maskedLegacyContext;
        }
        var instance = new ctor(props, context);
        {
          if (typeof ctor.getDerivedStateFromProps === 'function' && (instance.state === null || instance.state === undefined)) {
            var componentName = getComponentNameFromType(ctor) || 'Component';
            if (!didWarnAboutUninitializedState.has(componentName)) {
              didWarnAboutUninitializedState.add(componentName);
              error('`%s` uses `getDerivedStateFromProps` but its initial state is ' + '%s. This is not recommended. Instead, define the initial state by ' + 'assigning an object to `this.state` in the constructor of `%s`. ' + 'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', componentName, instance.state === null ? 'null' : 'undefined', componentName);
            }
          }
          if (typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function') {
            var foundWillMountName = null;
            var foundWillReceivePropsName = null;
            var foundWillUpdateName = null;
            if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
              foundWillMountName = 'componentWillMount';
            } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
              foundWillMountName = 'UNSAFE_componentWillMount';
            }
            if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
              foundWillReceivePropsName = 'componentWillReceiveProps';
            } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
              foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
            }
            if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
              foundWillUpdateName = 'componentWillUpdate';
            } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
              foundWillUpdateName = 'UNSAFE_componentWillUpdate';
            }
            if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
              var _componentName = getComponentNameFromType(ctor) || 'Component';
              var newApiName = typeof ctor.getDerivedStateFromProps === 'function' ? 'getDerivedStateFromProps()' : 'getSnapshotBeforeUpdate()';
              if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
                didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
                error('Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' + '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' + 'The above lifecycles should be removed. Learn more about this warning here:\n' + 'https://reactjs.org/link/unsafe-component-lifecycles', _componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : '', foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : '', foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : '');
              }
            }
          }
        }
        return instance;
      }
      function checkClassInstance(instance, ctor, newProps) {
        {
          var name = getComponentNameFromType(ctor) || 'Component';
          var renderPresent = instance.render;
          if (!renderPresent) {
            if (ctor.prototype && typeof ctor.prototype.render === 'function') {
              error('%s(...): No `render` method found on the returned component ' + 'instance: did you accidentally return an object from the constructor?', name);
            } else {
              error('%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', name);
            }
          }
          if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
            error('getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name);
          }
          if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
            error('getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name);
          }
          if (instance.propTypes) {
            error('propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', name);
          }
          if (instance.contextType) {
            error('contextType was defined as an instance property on %s. Use a static ' + 'property to define contextType instead.', name);
          }
          {
            if (instance.contextTypes) {
              error('contextTypes was defined as an instance property on %s. Use a static ' + 'property to define contextTypes instead.', name);
            }
            if (ctor.contextType && ctor.contextTypes && !didWarnAboutContextTypeAndContextTypes.has(ctor)) {
              didWarnAboutContextTypeAndContextTypes.add(ctor);
              error('%s declares both contextTypes and contextType static properties. ' + 'The legacy contextTypes property will be ignored.', name);
            }
          }
          if (typeof instance.componentShouldUpdate === 'function') {
            error('%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name);
          }
          if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== 'undefined') {
            error('%s has a method called shouldComponentUpdate(). ' + 'shouldComponentUpdate should not be used when extending React.PureComponent. ' + 'Please extend React.Component if shouldComponentUpdate is used.', getComponentNameFromType(ctor) || 'A pure component');
          }
          if (typeof instance.componentDidUnmount === 'function') {
            error('%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name);
          }
          if (typeof instance.componentDidReceiveProps === 'function') {
            error('%s has a method called ' + 'componentDidReceiveProps(). But there is no such lifecycle method. ' + 'If you meant to update the state in response to changing props, ' + 'use componentWillReceiveProps(). If you meant to fetch data or ' + 'run side-effects or mutations after React has updated the UI, use componentDidUpdate().', name);
          }
          if (typeof instance.componentWillRecieveProps === 'function') {
            error('%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name);
          }
          if (typeof instance.UNSAFE_componentWillRecieveProps === 'function') {
            error('%s has a method called ' + 'UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?', name);
          }
          var hasMutatedProps = instance.props !== newProps;
          if (instance.props !== undefined && hasMutatedProps) {
            error('%s(...): When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", name, name);
          }
          if (instance.defaultProps) {
            error('Setting defaultProps as an instance property on %s is not supported and will be ignored.' + ' Instead, define defaultProps as a static property on %s.', name, name);
          }
          if (typeof instance.getSnapshotBeforeUpdate === 'function' && typeof instance.componentDidUpdate !== 'function' && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
            didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);
            error('%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). ' + 'This component defines getSnapshotBeforeUpdate() only.', getComponentNameFromType(ctor));
          }
          if (typeof instance.getDerivedStateFromProps === 'function') {
            error('%s: getDerivedStateFromProps() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
          }
          if (typeof instance.getDerivedStateFromError === 'function') {
            error('%s: getDerivedStateFromError() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
          }
          if (typeof ctor.getSnapshotBeforeUpdate === 'function') {
            error('%s: getSnapshotBeforeUpdate() is defined as a static method ' + 'and will be ignored. Instead, declare it as an instance method.', name);
          }
          var _state = instance.state;
          if (_state && (typeof _state !== 'object' || isArray(_state))) {
            error('%s.state: must be set to an object or null', name);
          }
          if (typeof instance.getChildContext === 'function' && typeof ctor.childContextTypes !== 'object') {
            error('%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', name);
          }
        }
      }
      function callComponentWillMount(type, instance) {
        var oldState = instance.state;
        if (typeof instance.componentWillMount === 'function') {
          {
            if (instance.componentWillMount.__suppressDeprecationWarning !== true) {
              var componentName = getComponentNameFromType(type) || 'Unknown';
              if (!didWarnAboutDeprecatedWillMount[componentName]) {
                warn('componentWillMount has been renamed, and is not recommended for use. ' + 'See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n' + '* Move code from componentWillMount to componentDidMount (preferred in most cases) ' + 'or the constructor.\n' + '\nPlease update the following components: %s', componentName);
                didWarnAboutDeprecatedWillMount[componentName] = true;
              }
            }
          }
          instance.componentWillMount();
        }
        if (typeof instance.UNSAFE_componentWillMount === 'function') {
          instance.UNSAFE_componentWillMount();
        }
        if (oldState !== instance.state) {
          {
            error('%s.componentWillMount(): Assigning directly to this.state is ' + "deprecated (except inside a component's " + 'constructor). Use setState instead.', getComponentNameFromType(type) || 'Component');
          }
          classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
        }
      }
      function processUpdateQueue(internalInstance, inst, props, maskedLegacyContext) {
        if (internalInstance.queue !== null && internalInstance.queue.length > 0) {
          var oldQueue = internalInstance.queue;
          var oldReplace = internalInstance.replace;
          internalInstance.queue = null;
          internalInstance.replace = false;
          if (oldReplace && oldQueue.length === 1) {
            inst.state = oldQueue[0];
          } else {
            var nextState = oldReplace ? oldQueue[0] : inst.state;
            var dontMutate = true;
            for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
              var partial = oldQueue[i];
              var partialState = typeof partial === 'function' ? partial.call(inst, nextState, props, maskedLegacyContext) : partial;
              if (partialState != null) {
                if (dontMutate) {
                  dontMutate = false;
                  nextState = assign({}, nextState, partialState);
                } else {
                  assign(nextState, partialState);
                }
              }
            }
            inst.state = nextState;
          }
        } else {
          internalInstance.queue = null;
        }
      }
      function mountClassInstance(instance, ctor, newProps, maskedLegacyContext) {
        {
          checkClassInstance(instance, ctor, newProps);
        }
        var initialState = instance.state !== undefined ? instance.state : null;
        instance.updater = classComponentUpdater;
        instance.props = newProps;
        instance.state = initialState;
        var internalInstance = {
          queue: [],
          replace: false
        };
        set(instance, internalInstance);
        var contextType = ctor.contextType;
        if (typeof contextType === 'object' && contextType !== null) {
          instance.context = readContext(contextType);
        } else {
          instance.context = maskedLegacyContext;
        }
        {
          if (instance.state === newProps) {
            var componentName = getComponentNameFromType(ctor) || 'Component';
            if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
              didWarnAboutDirectlyAssigningPropsToState.add(componentName);
              error('%s: It is not recommended to assign props directly to state ' + "because updates to props won't be reflected in state. " + 'In most cases, it is better to use props directly.', componentName);
            }
          }
        }
        var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
        if (typeof getDerivedStateFromProps === 'function') {
          instance.state = applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, initialState, newProps);
        }
        if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
          callComponentWillMount(ctor, instance);
          processUpdateQueue(internalInstance, instance, newProps, maskedLegacyContext);
        }
      }
      var emptyTreeContext = {
        id: 1,
        overflow: ''
      };
      function getTreeId(context) {
        var overflow = context.overflow;
        var idWithLeadingBit = context.id;
        var id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
        return id.toString(32) + overflow;
      }
      function pushTreeContext(baseContext, totalChildren, index) {
        var baseIdWithLeadingBit = baseContext.id;
        var baseOverflow = baseContext.overflow;
        var baseLength = getBitLength(baseIdWithLeadingBit) - 1;
        var baseId = baseIdWithLeadingBit & ~(1 << baseLength);
        var slot = index + 1;
        var length = getBitLength(totalChildren) + baseLength;
        if (length > 30) {
          var numberOfOverflowBits = baseLength - baseLength % 5;
          var newOverflowBits = (1 << numberOfOverflowBits) - 1;
          var newOverflow = (baseId & newOverflowBits).toString(32);
          var restOfBaseId = baseId >> numberOfOverflowBits;
          var restOfBaseLength = baseLength - numberOfOverflowBits;
          var restOfLength = getBitLength(totalChildren) + restOfBaseLength;
          var restOfNewBits = slot << restOfBaseLength;
          var id = restOfNewBits | restOfBaseId;
          var overflow = newOverflow + baseOverflow;
          return {
            id: 1 << restOfLength | id,
            overflow: overflow
          };
        } else {
          var newBits = slot << baseLength;
          var _id = newBits | baseId;
          var _overflow = baseOverflow;
          return {
            id: 1 << length | _id,
            overflow: _overflow
          };
        }
      }
      function getBitLength(number) {
        return 32 - clz32(number);
      }
      function getLeadingBit(id) {
        return 1 << getBitLength(id) - 1;
      }
      var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
      var log = Math.log;
      var LN2 = Math.LN2;
      function clz32Fallback(x) {
        var asUint = x >>> 0;
        if (asUint === 0) {
          return 32;
        }
        return 31 - (log(asUint) / LN2 | 0) | 0;
      }
      function is(x, y) {
        return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        ;
      }
      var objectIs = typeof Object.is === 'function' ? Object.is : is;
      var currentlyRenderingComponent = null;
      var currentlyRenderingTask = null;
      var firstWorkInProgressHook = null;
      var workInProgressHook = null;
      var isReRender = false;
      var didScheduleRenderPhaseUpdate = false;
      var localIdCounter = 0;
      var renderPhaseUpdates = null;
      var numberOfReRenders = 0;
      var RE_RENDER_LIMIT = 25;
      var isInHookUserCodeInDev = false;
      var currentHookNameInDev;
      function resolveCurrentlyRenderingComponent() {
        if (currentlyRenderingComponent === null) {
          throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.');
        }
        {
          if (isInHookUserCodeInDev) {
            error('Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. ' + 'You can only call Hooks at the top level of your React function. ' + 'For more information, see ' + 'https://reactjs.org/link/rules-of-hooks');
          }
        }
        return currentlyRenderingComponent;
      }
      function areHookInputsEqual(nextDeps, prevDeps) {
        if (prevDeps === null) {
          {
            error('%s received a final argument during this render, but not during ' + 'the previous render. Even though the final argument is optional, ' + 'its type cannot change between renders.', currentHookNameInDev);
          }
          return false;
        }
        {
          if (nextDeps.length !== prevDeps.length) {
            error('The final argument passed to %s changed size between renders. The ' + 'order and size of this array must remain constant.\n\n' + 'Previous: %s\n' + 'Incoming: %s', currentHookNameInDev, "[" + nextDeps.join(', ') + "]", "[" + prevDeps.join(', ') + "]");
          }
        }
        for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
          if (objectIs(nextDeps[i], prevDeps[i])) {
            continue;
          }
          return false;
        }
        return true;
      }
      function createHook() {
        if (numberOfReRenders > 0) {
          throw new Error('Rendered more hooks than during the previous render');
        }
        return {
          memoizedState: null,
          queue: null,
          next: null
        };
      }
      function createWorkInProgressHook() {
        if (workInProgressHook === null) {
          if (firstWorkInProgressHook === null) {
            isReRender = false;
            firstWorkInProgressHook = workInProgressHook = createHook();
          } else {
            isReRender = true;
            workInProgressHook = firstWorkInProgressHook;
          }
        } else {
          if (workInProgressHook.next === null) {
            isReRender = false;
            workInProgressHook = workInProgressHook.next = createHook();
          } else {
            isReRender = true;
            workInProgressHook = workInProgressHook.next;
          }
        }
        return workInProgressHook;
      }
      function prepareToUseHooks(task, componentIdentity) {
        currentlyRenderingComponent = componentIdentity;
        currentlyRenderingTask = task;
        {
          isInHookUserCodeInDev = false;
        }
        localIdCounter = 0;
      }
      function finishHooks(Component, props, children, refOrContext) {
        while (didScheduleRenderPhaseUpdate) {
          didScheduleRenderPhaseUpdate = false;
          localIdCounter = 0;
          numberOfReRenders += 1;
          workInProgressHook = null;
          children = Component(props, refOrContext);
        }
        resetHooksState();
        return children;
      }
      function checkDidRenderIdHook() {
        var didRenderIdHook = localIdCounter !== 0;
        return didRenderIdHook;
      }
      function resetHooksState() {
        {
          isInHookUserCodeInDev = false;
        }
        currentlyRenderingComponent = null;
        currentlyRenderingTask = null;
        didScheduleRenderPhaseUpdate = false;
        firstWorkInProgressHook = null;
        numberOfReRenders = 0;
        renderPhaseUpdates = null;
        workInProgressHook = null;
      }
      function readContext$1(context) {
        {
          if (isInHookUserCodeInDev) {
            error('Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().');
          }
        }
        return readContext(context);
      }
      function useContext(context) {
        {
          currentHookNameInDev = 'useContext';
        }
        resolveCurrentlyRenderingComponent();
        return readContext(context);
      }
      function basicStateReducer(state, action) {
        return typeof action === 'function' ? action(state) : action;
      }
      function useState(initialState) {
        {
          currentHookNameInDev = 'useState';
        }
        return useReducer(basicStateReducer, initialState);
      }
      function useReducer(reducer, initialArg, init) {
        {
          if (reducer !== basicStateReducer) {
            currentHookNameInDev = 'useReducer';
          }
        }
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        if (isReRender) {
          var queue = workInProgressHook.queue;
          var dispatch = queue.dispatch;
          if (renderPhaseUpdates !== null) {
            var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
            if (firstRenderPhaseUpdate !== undefined) {
              renderPhaseUpdates.delete(queue);
              var newState = workInProgressHook.memoizedState;
              var update = firstRenderPhaseUpdate;
              do {
                var action = update.action;
                {
                  isInHookUserCodeInDev = true;
                }
                newState = reducer(newState, action);
                {
                  isInHookUserCodeInDev = false;
                }
                update = update.next;
              } while (update !== null);
              workInProgressHook.memoizedState = newState;
              return [newState, dispatch];
            }
          }
          return [workInProgressHook.memoizedState, dispatch];
        } else {
          {
            isInHookUserCodeInDev = true;
          }
          var initialState;
          if (reducer === basicStateReducer) {
            initialState = typeof initialArg === 'function' ? initialArg() : initialArg;
          } else {
            initialState = init !== undefined ? init(initialArg) : initialArg;
          }
          {
            isInHookUserCodeInDev = false;
          }
          workInProgressHook.memoizedState = initialState;
          var _queue = workInProgressHook.queue = {
            last: null,
            dispatch: null
          };
          var _dispatch = _queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, _queue);
          return [workInProgressHook.memoizedState, _dispatch];
        }
      }
      function useMemo(nextCreate, deps) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        if (workInProgressHook !== null) {
          var prevState = workInProgressHook.memoizedState;
          if (prevState !== null) {
            if (nextDeps !== null) {
              var prevDeps = prevState[1];
              if (areHookInputsEqual(nextDeps, prevDeps)) {
                return prevState[0];
              }
            }
          }
        }
        {
          isInHookUserCodeInDev = true;
        }
        var nextValue = nextCreate();
        {
          isInHookUserCodeInDev = false;
        }
        workInProgressHook.memoizedState = [nextValue, nextDeps];
        return nextValue;
      }
      function useRef(initialValue) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var previousRef = workInProgressHook.memoizedState;
        if (previousRef === null) {
          var ref = {current: initialValue};
          {
            Object.seal(ref);
          }
          workInProgressHook.memoizedState = ref;
          return ref;
        } else {
          return previousRef;
        }
      }
      function useLayoutEffect(create, inputs) {
        {
          currentHookNameInDev = 'useLayoutEffect';
          error('useLayoutEffect does nothing on the server, because its effect cannot ' + "be encoded into the server renderer's output format. This will lead " + 'to a mismatch between the initial, non-hydrated UI and the intended ' + 'UI. To avoid this, useLayoutEffect should only be used in ' + 'components that render exclusively on the client. ' + 'See https://reactjs.org/link/uselayouteffect-ssr for common fixes.');
        }
      }
      function dispatchAction(componentIdentity, queue, action) {
        if (numberOfReRenders >= RE_RENDER_LIMIT) {
          throw new Error('Too many re-renders. React limits the number of renders to prevent ' + 'an infinite loop.');
        }
        if (componentIdentity === currentlyRenderingComponent) {
          didScheduleRenderPhaseUpdate = true;
          var update = {
            action: action,
            next: null
          };
          if (renderPhaseUpdates === null) {
            renderPhaseUpdates = new Map();
          }
          var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
          if (firstRenderPhaseUpdate === undefined) {
            renderPhaseUpdates.set(queue, update);
          } else {
            var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
            while (lastRenderPhaseUpdate.next !== null) {
              lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
            }
            lastRenderPhaseUpdate.next = update;
          }
        }
      }
      function useCallback(callback, deps) {
        return useMemo(function() {
          return callback;
        }, deps);
      }
      function useMutableSource(source, getSnapshot, subscribe) {
        resolveCurrentlyRenderingComponent();
        return getSnapshot(source._source);
      }
      function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
        if (getServerSnapshot === undefined) {
          throw new Error('Missing getServerSnapshot, which is required for ' + 'server-rendered content. Will revert to client rendering.');
        }
        return getServerSnapshot();
      }
      function useDeferredValue(value) {
        resolveCurrentlyRenderingComponent();
        return value;
      }
      function unsupportedStartTransition() {
        throw new Error('startTransition cannot be called during server rendering.');
      }
      function useTransition() {
        resolveCurrentlyRenderingComponent();
        return [false, unsupportedStartTransition];
      }
      function useId() {
        var task = currentlyRenderingTask;
        var treeId = getTreeId(task.treeContext);
        var responseState = currentResponseState;
        if (responseState === null) {
          throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
        }
        var localId = localIdCounter++;
        return makeId(responseState, treeId, localId);
      }
      function noop() {}
      var Dispatcher = {
        readContext: readContext$1,
        useContext: useContext,
        useMemo: useMemo,
        useReducer: useReducer,
        useRef: useRef,
        useState: useState,
        useInsertionEffect: noop,
        useLayoutEffect: useLayoutEffect,
        useCallback: useCallback,
        useImperativeHandle: noop,
        useEffect: noop,
        useDebugValue: noop,
        useDeferredValue: useDeferredValue,
        useTransition: useTransition,
        useId: useId,
        useMutableSource: useMutableSource,
        useSyncExternalStore: useSyncExternalStore
      };
      var currentResponseState = null;
      function setCurrentResponseState(responseState) {
        currentResponseState = responseState;
      }
      function getStackByComponentStackNode(componentStack) {
        try {
          var info = '';
          var node = componentStack;
          do {
            switch (node.tag) {
              case 0:
                info += describeBuiltInComponentFrame(node.type, null, null);
                break;
              case 1:
                info += describeFunctionComponentFrame(node.type, null, null);
                break;
              case 2:
                info += describeClassComponentFrame(node.type, null, null);
                break;
            }
            node = node.parent;
          } while (node);
          return info;
        } catch (x) {
          return '\nError generating stack: ' + x.message + '\n' + x.stack;
        }
      }
      var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
      var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
      var PENDING = 0;
      var COMPLETED = 1;
      var FLUSHED = 2;
      var ABORTED = 3;
      var ERRORED = 4;
      var OPEN = 0;
      var CLOSING = 1;
      var CLOSED = 2;
      var DEFAULT_PROGRESSIVE_CHUNK_SIZE = 12800;
      function defaultErrorHandler(error) {
        console['error'](error);
      }
      function noop$1() {}
      function createRequest(children, responseState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError) {
        var pingedTasks = [];
        var abortSet = new Set();
        var request = {
          destination: null,
          responseState: responseState,
          progressiveChunkSize: progressiveChunkSize === undefined ? DEFAULT_PROGRESSIVE_CHUNK_SIZE : progressiveChunkSize,
          status: OPEN,
          fatalError: null,
          nextSegmentId: 0,
          allPendingTasks: 0,
          pendingRootTasks: 0,
          completedRootSegment: null,
          abortableTasks: abortSet,
          pingedTasks: pingedTasks,
          clientRenderedBoundaries: [],
          completedBoundaries: [],
          partialBoundaries: [],
          onError: onError === undefined ? defaultErrorHandler : onError,
          onAllReady: onAllReady === undefined ? noop$1 : onAllReady,
          onShellReady: onShellReady === undefined ? noop$1 : onShellReady,
          onShellError: onShellError === undefined ? noop$1 : onShellError,
          onFatalError: onFatalError === undefined ? noop$1 : onFatalError
        };
        var rootSegment = createPendingSegment(request, 0, null, rootFormatContext);
        rootSegment.parentFlushed = true;
        var rootTask = createTask(request, children, null, rootSegment, abortSet, emptyContextObject, rootContextSnapshot, emptyTreeContext);
        pingedTasks.push(rootTask);
        return request;
      }
      function pingTask(request, task) {
        var pingedTasks = request.pingedTasks;
        pingedTasks.push(task);
        if (pingedTasks.length === 1) {
          scheduleWork(function() {
            return performWork(request);
          });
        }
      }
      function createSuspenseBoundary(request, fallbackAbortableTasks) {
        return {
          id: UNINITIALIZED_SUSPENSE_BOUNDARY_ID,
          rootSegmentID: -1,
          parentFlushed: false,
          pendingTasks: 0,
          forceClientRender: false,
          completedSegments: [],
          byteSize: 0,
          fallbackAbortableTasks: fallbackAbortableTasks
        };
      }
      function createTask(request, node, blockedBoundary, blockedSegment, abortSet, legacyContext, context, treeContext) {
        request.allPendingTasks++;
        if (blockedBoundary === null) {
          request.pendingRootTasks++;
        } else {
          blockedBoundary.pendingTasks++;
        }
        var task = {
          node: node,
          ping: function() {
            return pingTask(request, task);
          },
          blockedBoundary: blockedBoundary,
          blockedSegment: blockedSegment,
          abortSet: abortSet,
          legacyContext: legacyContext,
          context: context,
          treeContext: treeContext
        };
        {
          task.componentStack = null;
        }
        abortSet.add(task);
        return task;
      }
      function createPendingSegment(request, index, boundary, formatContext) {
        return {
          status: PENDING,
          id: -1,
          index: index,
          parentFlushed: false,
          chunks: [],
          children: [],
          formatContext: formatContext,
          boundary: boundary
        };
      }
      var currentTaskInDEV = null;
      function getCurrentStackInDEV() {
        {
          if (currentTaskInDEV === null || currentTaskInDEV.componentStack === null) {
            return '';
          }
          return getStackByComponentStackNode(currentTaskInDEV.componentStack);
        }
      }
      function pushBuiltInComponentStackInDEV(task, type) {
        {
          task.componentStack = {
            tag: 0,
            parent: task.componentStack,
            type: type
          };
        }
      }
      function pushFunctionComponentStackInDEV(task, type) {
        {
          task.componentStack = {
            tag: 1,
            parent: task.componentStack,
            type: type
          };
        }
      }
      function pushClassComponentStackInDEV(task, type) {
        {
          task.componentStack = {
            tag: 2,
            parent: task.componentStack,
            type: type
          };
        }
      }
      function popComponentStackInDEV(task) {
        {
          if (task.componentStack === null) {
            error('Unexpectedly popped too many stack frames. This is a bug in React.');
          } else {
            task.componentStack = task.componentStack.parent;
          }
        }
      }
      function logRecoverableError(request, error) {
        var onError = request.onError;
        onError(error);
      }
      function fatalError(request, error) {
        var onShellError = request.onShellError;
        onShellError(error);
        var onFatalError = request.onFatalError;
        onFatalError(error);
        if (request.destination !== null) {
          request.status = CLOSED;
          closeWithError(request.destination, error);
        } else {
          request.status = CLOSING;
          request.fatalError = error;
        }
      }
      function renderSuspenseBoundary(request, task, props) {
        pushBuiltInComponentStackInDEV(task, 'Suspense');
        var parentBoundary = task.blockedBoundary;
        var parentSegment = task.blockedSegment;
        var fallback = props.fallback;
        var content = props.children;
        var fallbackAbortSet = new Set();
        var newBoundary = createSuspenseBoundary(request, fallbackAbortSet);
        var insertionIndex = parentSegment.chunks.length;
        var boundarySegment = createPendingSegment(request, insertionIndex, newBoundary, parentSegment.formatContext);
        parentSegment.children.push(boundarySegment);
        var contentRootSegment = createPendingSegment(request, 0, null, parentSegment.formatContext);
        contentRootSegment.parentFlushed = true;
        task.blockedBoundary = newBoundary;
        task.blockedSegment = contentRootSegment;
        try {
          renderNode(request, task, content);
          contentRootSegment.status = COMPLETED;
          queueCompletedSegment(newBoundary, contentRootSegment);
          if (newBoundary.pendingTasks === 0) {
            popComponentStackInDEV(task);
            return;
          }
        } catch (error) {
          contentRootSegment.status = ERRORED;
          logRecoverableError(request, error);
          newBoundary.forceClientRender = true;
        } finally {
          task.blockedBoundary = parentBoundary;
          task.blockedSegment = parentSegment;
        }
        var suspendedFallbackTask = createTask(request, fallback, parentBoundary, boundarySegment, fallbackAbortSet, task.legacyContext, task.context, task.treeContext);
        {
          suspendedFallbackTask.componentStack = task.componentStack;
        }
        request.pingedTasks.push(suspendedFallbackTask);
        popComponentStackInDEV(task);
      }
      function renderHostElement(request, task, type, props) {
        pushBuiltInComponentStackInDEV(task, type);
        var segment = task.blockedSegment;
        var children = pushStartInstance(segment.chunks, type, props, request.responseState, segment.formatContext);
        var prevContext = segment.formatContext;
        segment.formatContext = getChildFormatContext(prevContext, type, props);
        renderNode(request, task, children);
        segment.formatContext = prevContext;
        pushEndInstance(segment.chunks, type);
        popComponentStackInDEV(task);
      }
      function shouldConstruct$1(Component) {
        return Component.prototype && Component.prototype.isReactComponent;
      }
      function renderWithHooks(request, task, Component, props, secondArg) {
        var componentIdentity = {};
        prepareToUseHooks(task, componentIdentity);
        var result = Component(props, secondArg);
        return finishHooks(Component, props, result, secondArg);
      }
      function finishClassComponent(request, task, instance, Component, props) {
        var nextChildren = instance.render();
        {
          if (instance.props !== props) {
            if (!didWarnAboutReassigningProps) {
              error('It looks like %s is reassigning its own `this.props` while rendering. ' + 'This is not supported and can lead to confusing bugs.', getComponentNameFromType(Component) || 'a component');
            }
            didWarnAboutReassigningProps = true;
          }
        }
        {
          var childContextTypes = Component.childContextTypes;
          if (childContextTypes !== null && childContextTypes !== undefined) {
            var previousContext = task.legacyContext;
            var mergedContext = processChildContext(instance, Component, previousContext, childContextTypes);
            task.legacyContext = mergedContext;
            renderNodeDestructive(request, task, nextChildren);
            task.legacyContext = previousContext;
            return;
          }
        }
        renderNodeDestructive(request, task, nextChildren);
      }
      function renderClassComponent(request, task, Component, props) {
        pushClassComponentStackInDEV(task, Component);
        var maskedContext = getMaskedContext(Component, task.legacyContext);
        var instance = constructClassInstance(Component, props, maskedContext);
        mountClassInstance(instance, Component, props, maskedContext);
        finishClassComponent(request, task, instance, Component, props);
        popComponentStackInDEV(task);
      }
      var didWarnAboutBadClass = {};
      var didWarnAboutModulePatternComponent = {};
      var didWarnAboutContextTypeOnFunctionComponent = {};
      var didWarnAboutGetDerivedStateOnFunctionComponent = {};
      var didWarnAboutReassigningProps = false;
      var didWarnAboutGenerators = false;
      var didWarnAboutMaps = false;
      var hasWarnedAboutUsingContextAsConsumer = false;
      function renderIndeterminateComponent(request, task, Component, props) {
        var legacyContext;
        {
          legacyContext = getMaskedContext(Component, task.legacyContext);
        }
        pushFunctionComponentStackInDEV(task, Component);
        {
          if (Component.prototype && typeof Component.prototype.render === 'function') {
            var componentName = getComponentNameFromType(Component) || 'Unknown';
            if (!didWarnAboutBadClass[componentName]) {
              error("The <%s /> component appears to have a render method, but doesn't extend React.Component. " + 'This is likely to cause errors. Change %s to extend React.Component instead.', componentName, componentName);
              didWarnAboutBadClass[componentName] = true;
            }
          }
        }
        var value = renderWithHooks(request, task, Component, props, legacyContext);
        var hasId = checkDidRenderIdHook();
        {
          if (typeof value === 'object' && value !== null && typeof value.render === 'function' && value.$$typeof === undefined) {
            var _componentName = getComponentNameFromType(Component) || 'Unknown';
            if (!didWarnAboutModulePatternComponent[_componentName]) {
              error('The <%s /> component appears to be a function component that returns a class instance. ' + 'Change %s to a class that extends React.Component instead. ' + "If you can't use a class try assigning the prototype on the function as a workaround. " + "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " + 'cannot be called with `new` by React.', _componentName, _componentName, _componentName);
              didWarnAboutModulePatternComponent[_componentName] = true;
            }
          }
        }
        if (typeof value === 'object' && value !== null && typeof value.render === 'function' && value.$$typeof === undefined) {
          {
            var _componentName2 = getComponentNameFromType(Component) || 'Unknown';
            if (!didWarnAboutModulePatternComponent[_componentName2]) {
              error('The <%s /> component appears to be a function component that returns a class instance. ' + 'Change %s to a class that extends React.Component instead. ' + "If you can't use a class try assigning the prototype on the function as a workaround. " + "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " + 'cannot be called with `new` by React.', _componentName2, _componentName2, _componentName2);
              didWarnAboutModulePatternComponent[_componentName2] = true;
            }
          }
          mountClassInstance(value, Component, props, legacyContext);
          finishClassComponent(request, task, value, Component, props);
        } else {
          {
            validateFunctionComponentInDev(Component);
          }
          if (hasId) {
            var prevTreeContext = task.treeContext;
            var totalChildren = 1;
            var index = 0;
            task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
            try {
              renderNodeDestructive(request, task, value);
            } finally {
              task.treeContext = prevTreeContext;
            }
          } else {
            renderNodeDestructive(request, task, value);
          }
        }
        popComponentStackInDEV(task);
      }
      function validateFunctionComponentInDev(Component) {
        {
          if (Component) {
            if (Component.childContextTypes) {
              error('%s(...): childContextTypes cannot be defined on a function component.', Component.displayName || Component.name || 'Component');
            }
          }
          if (typeof Component.getDerivedStateFromProps === 'function') {
            var _componentName3 = getComponentNameFromType(Component) || 'Unknown';
            if (!didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3]) {
              error('%s: Function components do not support getDerivedStateFromProps.', _componentName3);
              didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3] = true;
            }
          }
          if (typeof Component.contextType === 'object' && Component.contextType !== null) {
            var _componentName4 = getComponentNameFromType(Component) || 'Unknown';
            if (!didWarnAboutContextTypeOnFunctionComponent[_componentName4]) {
              error('%s: Function components do not support contextType.', _componentName4);
              didWarnAboutContextTypeOnFunctionComponent[_componentName4] = true;
            }
          }
        }
      }
      function resolveDefaultProps(Component, baseProps) {
        if (Component && Component.defaultProps) {
          var props = assign({}, baseProps);
          var defaultProps = Component.defaultProps;
          for (var propName in defaultProps) {
            if (props[propName] === undefined) {
              props[propName] = defaultProps[propName];
            }
          }
          return props;
        }
        return baseProps;
      }
      function renderForwardRef(request, task, type, props, ref) {
        pushFunctionComponentStackInDEV(task, type.render);
        var children = renderWithHooks(request, task, type.render, props, ref);
        var hasId = checkDidRenderIdHook();
        if (hasId) {
          var prevTreeContext = task.treeContext;
          var totalChildren = 1;
          var index = 0;
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
          try {
            renderNodeDestructive(request, task, children);
          } finally {
            task.treeContext = prevTreeContext;
          }
        } else {
          renderNodeDestructive(request, task, children);
        }
        popComponentStackInDEV(task);
      }
      function renderMemo(request, task, type, props, ref) {
        var innerType = type.type;
        var resolvedProps = resolveDefaultProps(innerType, props);
        renderElement(request, task, innerType, resolvedProps, ref);
      }
      function renderContextConsumer(request, task, context, props) {
        {
          if (context._context === undefined) {
            if (context !== context.Consumer) {
              if (!hasWarnedAboutUsingContextAsConsumer) {
                hasWarnedAboutUsingContextAsConsumer = true;
                error('Rendering <Context> directly is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
              }
            }
          } else {
            context = context._context;
          }
        }
        var render = props.children;
        {
          if (typeof render !== 'function') {
            error('A context consumer was rendered with multiple children, or a child ' + "that isn't a function. A context consumer expects a single child " + 'that is a function. If you did pass a function, make sure there ' + 'is no trailing or leading whitespace around it.');
          }
        }
        var newValue = readContext(context);
        var newChildren = render(newValue);
        renderNodeDestructive(request, task, newChildren);
      }
      function renderContextProvider(request, task, type, props) {
        var context = type._context;
        var value = props.value;
        var children = props.children;
        var prevSnapshot;
        {
          prevSnapshot = task.context;
        }
        task.context = pushProvider(context, value);
        renderNodeDestructive(request, task, children);
        task.context = popProvider(context);
        {
          if (prevSnapshot !== task.context) {
            error('Popping the context provider did not return back to the original snapshot. This is a bug in React.');
          }
        }
      }
      function renderLazyComponent(request, task, lazyComponent, props, ref) {
        pushBuiltInComponentStackInDEV(task, 'Lazy');
        var payload = lazyComponent._payload;
        var init = lazyComponent._init;
        var Component = init(payload);
        var resolvedProps = resolveDefaultProps(Component, props);
        renderElement(request, task, Component, resolvedProps, ref);
        popComponentStackInDEV(task);
      }
      function renderElement(request, task, type, props, ref) {
        if (typeof type === 'function') {
          if (shouldConstruct$1(type)) {
            renderClassComponent(request, task, type, props);
            return;
          } else {
            renderIndeterminateComponent(request, task, type, props);
            return;
          }
        }
        if (typeof type === 'string') {
          renderHostElement(request, task, type, props);
          return;
        }
        switch (type) {
          case REACT_LEGACY_HIDDEN_TYPE:
          case REACT_DEBUG_TRACING_MODE_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_FRAGMENT_TYPE:
            {
              renderNodeDestructive(request, task, props.children);
              return;
            }
          case REACT_SUSPENSE_LIST_TYPE:
            {
              pushBuiltInComponentStackInDEV(task, 'SuspenseList');
              renderNodeDestructive(request, task, props.children);
              popComponentStackInDEV(task);
              return;
            }
          case REACT_SCOPE_TYPE:
            {
              throw new Error('ReactDOMServer does not yet support scope components.');
            }
          case REACT_SUSPENSE_TYPE:
            {
              {
                renderSuspenseBoundary(request, task, props);
              }
              return;
            }
        }
        if (typeof type === 'object' && type !== null) {
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              {
                renderForwardRef(request, task, type, props, ref);
                return;
              }
            case REACT_MEMO_TYPE:
              {
                renderMemo(request, task, type, props, ref);
                return;
              }
            case REACT_PROVIDER_TYPE:
              {
                renderContextProvider(request, task, type, props);
                return;
              }
            case REACT_CONTEXT_TYPE:
              {
                renderContextConsumer(request, task, type, props);
                return;
              }
            case REACT_LAZY_TYPE:
              {
                renderLazyComponent(request, task, type, props);
                return;
              }
          }
        }
        var info = '';
        {
          if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
            info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and " + 'named imports.';
          }
        }
        throw new Error('Element type is invalid: expected a string (for built-in ' + 'components) or a class/function (for composite components) ' + ("but got: " + (type == null ? type : typeof type) + "." + info));
      }
      function validateIterable(iterable, iteratorFn) {
        {
          if (typeof Symbol === 'function' && iterable[Symbol.toStringTag] === 'Generator') {
            if (!didWarnAboutGenerators) {
              error('Using Generators as children is unsupported and will likely yield ' + 'unexpected results because enumerating a generator mutates it. ' + 'You may convert it to an array with `Array.from()` or the ' + '`[...spread]` operator before rendering. Keep in mind ' + 'you might need to polyfill these features for older browsers.');
            }
            didWarnAboutGenerators = true;
          }
          if (iterable.entries === iteratorFn) {
            if (!didWarnAboutMaps) {
              error('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
            }
            didWarnAboutMaps = true;
          }
        }
      }
      function renderNodeDestructive(request, task, node) {
        task.node = node;
        if (typeof node === 'object' && node !== null) {
          switch (node.$$typeof) {
            case REACT_ELEMENT_TYPE:
              {
                var element = node;
                var type = element.type;
                var props = element.props;
                var ref = element.ref;
                renderElement(request, task, type, props, ref);
                return;
              }
            case REACT_PORTAL_TYPE:
              throw new Error('Portals are not currently supported by the server renderer. ' + 'Render them conditionally so that they only appear on the client render.');
            case REACT_LAZY_TYPE:
              {
                {
                  var lazyNode = node;
                  var payload = lazyNode._payload;
                  var init = lazyNode._init;
                  var resolvedNode = init(payload);
                  renderNodeDestructive(request, task, resolvedNode);
                  return;
                }
              }
          }
          if (isArray(node)) {
            renderChildrenArray(request, task, node);
            return;
          }
          var iteratorFn = getIteratorFn(node);
          if (iteratorFn) {
            {
              validateIterable(node, iteratorFn);
            }
            var iterator = iteratorFn.call(node);
            if (iterator) {
              var step = iterator.next();
              if (!step.done) {
                var children = [];
                do {
                  children.push(step.value);
                  step = iterator.next();
                } while (!step.done);
                renderChildrenArray(request, task, children);
                return;
              }
              return;
            }
          }
          var childString = Object.prototype.toString.call(node);
          throw new Error("Objects are not valid as a React child (found: " + (childString === '[object Object]' ? 'object with keys {' + Object.keys(node).join(', ') + '}' : childString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
        }
        if (typeof node === 'string') {
          pushTextInstance$1(task.blockedSegment.chunks, node, request.responseState);
          return;
        }
        if (typeof node === 'number') {
          pushTextInstance$1(task.blockedSegment.chunks, '' + node, request.responseState);
          return;
        }
        {
          if (typeof node === 'function') {
            error('Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.');
          }
        }
      }
      function renderChildrenArray(request, task, children) {
        var totalChildren = children.length;
        for (var i = 0; i < totalChildren; i++) {
          var prevTreeContext = task.treeContext;
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
          try {
            renderNode(request, task, children[i]);
          } finally {
            task.treeContext = prevTreeContext;
          }
        }
      }
      function spawnNewSuspendedTask(request, task, x) {
        var segment = task.blockedSegment;
        var insertionIndex = segment.chunks.length;
        var newSegment = createPendingSegment(request, insertionIndex, null, segment.formatContext);
        segment.children.push(newSegment);
        var newTask = createTask(request, task.node, task.blockedBoundary, newSegment, task.abortSet, task.legacyContext, task.context, task.treeContext);
        {
          if (task.componentStack !== null) {
            newTask.componentStack = task.componentStack.parent;
          }
        }
        var ping = newTask.ping;
        x.then(ping, ping);
      }
      function renderNode(request, task, node) {
        var previousFormatContext = task.blockedSegment.formatContext;
        var previousLegacyContext = task.legacyContext;
        var previousContext = task.context;
        var previousComponentStack = null;
        {
          previousComponentStack = task.componentStack;
        }
        try {
          return renderNodeDestructive(request, task, node);
        } catch (x) {
          resetHooksState();
          if (typeof x === 'object' && x !== null && typeof x.then === 'function') {
            spawnNewSuspendedTask(request, task, x);
            task.blockedSegment.formatContext = previousFormatContext;
            task.legacyContext = previousLegacyContext;
            task.context = previousContext;
            switchContext(previousContext);
            {
              task.componentStack = previousComponentStack;
            }
            return;
          } else {
            task.blockedSegment.formatContext = previousFormatContext;
            task.legacyContext = previousLegacyContext;
            task.context = previousContext;
            switchContext(previousContext);
            {
              task.componentStack = previousComponentStack;
            }
            throw x;
          }
        }
      }
      function erroredTask(request, boundary, segment, error) {
        logRecoverableError(request, error);
        if (boundary === null) {
          fatalError(request, error);
        } else {
          boundary.pendingTasks--;
          if (!boundary.forceClientRender) {
            boundary.forceClientRender = true;
            if (boundary.parentFlushed) {
              request.clientRenderedBoundaries.push(boundary);
            }
          }
        }
        request.allPendingTasks--;
        if (request.allPendingTasks === 0) {
          var onAllReady = request.onAllReady;
          onAllReady();
        }
      }
      function abortTaskSoft(task) {
        var request = this;
        var boundary = task.blockedBoundary;
        var segment = task.blockedSegment;
        segment.status = ABORTED;
        finishedTask(request, boundary, segment);
      }
      function abortTask(task) {
        var request = this;
        var boundary = task.blockedBoundary;
        var segment = task.blockedSegment;
        segment.status = ABORTED;
        if (boundary === null) {
          request.allPendingTasks--;
          if (request.status !== CLOSED) {
            request.status = CLOSED;
            if (request.destination !== null) {
              close(request.destination);
            }
          }
        } else {
          boundary.pendingTasks--;
          if (!boundary.forceClientRender) {
            boundary.forceClientRender = true;
            if (boundary.parentFlushed) {
              request.clientRenderedBoundaries.push(boundary);
            }
          }
          boundary.fallbackAbortableTasks.forEach(abortTask, request);
          boundary.fallbackAbortableTasks.clear();
          request.allPendingTasks--;
          if (request.allPendingTasks === 0) {
            var onAllReady = request.onAllReady;
            onAllReady();
          }
        }
      }
      function queueCompletedSegment(boundary, segment) {
        if (segment.chunks.length === 0 && segment.children.length === 1 && segment.children[0].boundary === null) {
          var childSegment = segment.children[0];
          childSegment.id = segment.id;
          childSegment.parentFlushed = true;
          if (childSegment.status === COMPLETED) {
            queueCompletedSegment(boundary, childSegment);
          }
        } else {
          var completedSegments = boundary.completedSegments;
          completedSegments.push(segment);
        }
      }
      function finishedTask(request, boundary, segment) {
        if (boundary === null) {
          if (segment.parentFlushed) {
            if (request.completedRootSegment !== null) {
              throw new Error('There can only be one root segment. This is a bug in React.');
            }
            request.completedRootSegment = segment;
          }
          request.pendingRootTasks--;
          if (request.pendingRootTasks === 0) {
            request.onShellError = noop$1;
            var onShellReady = request.onShellReady;
            onShellReady();
          }
        } else {
          boundary.pendingTasks--;
          if (boundary.forceClientRender)
            ;
          else if (boundary.pendingTasks === 0) {
            if (segment.parentFlushed) {
              if (segment.status === COMPLETED) {
                queueCompletedSegment(boundary, segment);
              }
            }
            if (boundary.parentFlushed) {
              request.completedBoundaries.push(boundary);
            }
            boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request);
            boundary.fallbackAbortableTasks.clear();
          } else {
            if (segment.parentFlushed) {
              if (segment.status === COMPLETED) {
                queueCompletedSegment(boundary, segment);
                var completedSegments = boundary.completedSegments;
                if (completedSegments.length === 1) {
                  if (boundary.parentFlushed) {
                    request.partialBoundaries.push(boundary);
                  }
                }
              }
            }
          }
        }
        request.allPendingTasks--;
        if (request.allPendingTasks === 0) {
          var onAllReady = request.onAllReady;
          onAllReady();
        }
      }
      function retryTask(request, task) {
        var segment = task.blockedSegment;
        if (segment.status !== PENDING) {
          return;
        }
        switchContext(task.context);
        var prevTaskInDEV = null;
        {
          prevTaskInDEV = currentTaskInDEV;
          currentTaskInDEV = task;
        }
        try {
          renderNodeDestructive(request, task, task.node);
          task.abortSet.delete(task);
          segment.status = COMPLETED;
          finishedTask(request, task.blockedBoundary, segment);
        } catch (x) {
          resetHooksState();
          if (typeof x === 'object' && x !== null && typeof x.then === 'function') {
            var ping = task.ping;
            x.then(ping, ping);
          } else {
            task.abortSet.delete(task);
            segment.status = ERRORED;
            erroredTask(request, task.blockedBoundary, segment, x);
          }
        } finally {
          {
            currentTaskInDEV = prevTaskInDEV;
          }
        }
      }
      function performWork(request) {
        if (request.status === CLOSED) {
          return;
        }
        var prevContext = getActiveContext();
        var prevDispatcher = ReactCurrentDispatcher$1.current;
        ReactCurrentDispatcher$1.current = Dispatcher;
        var prevGetCurrentStackImpl;
        {
          prevGetCurrentStackImpl = ReactDebugCurrentFrame$1.getCurrentStack;
          ReactDebugCurrentFrame$1.getCurrentStack = getCurrentStackInDEV;
        }
        var prevResponseState = currentResponseState;
        setCurrentResponseState(request.responseState);
        try {
          var pingedTasks = request.pingedTasks;
          var i;
          for (i = 0; i < pingedTasks.length; i++) {
            var task = pingedTasks[i];
            retryTask(request, task);
          }
          pingedTasks.splice(0, i);
          if (request.destination !== null) {
            flushCompletedQueues(request, request.destination);
          }
        } catch (error) {
          logRecoverableError(request, error);
          fatalError(request, error);
        } finally {
          setCurrentResponseState(prevResponseState);
          ReactCurrentDispatcher$1.current = prevDispatcher;
          {
            ReactDebugCurrentFrame$1.getCurrentStack = prevGetCurrentStackImpl;
          }
          if (prevDispatcher === Dispatcher) {
            switchContext(prevContext);
          }
        }
      }
      function flushSubtree(request, destination, segment) {
        segment.parentFlushed = true;
        switch (segment.status) {
          case PENDING:
            {
              var segmentID = segment.id = request.nextSegmentId++;
              return writePlaceholder(destination, request.responseState, segmentID);
            }
          case COMPLETED:
            {
              segment.status = FLUSHED;
              var r = true;
              var chunks = segment.chunks;
              var chunkIdx = 0;
              var children = segment.children;
              for (var childIdx = 0; childIdx < children.length; childIdx++) {
                var nextChild = children[childIdx];
                for (; chunkIdx < nextChild.index; chunkIdx++) {
                  writeChunk(destination, chunks[chunkIdx]);
                }
                r = flushSegment(request, destination, nextChild);
              }
              for (; chunkIdx < chunks.length - 1; chunkIdx++) {
                writeChunk(destination, chunks[chunkIdx]);
              }
              if (chunkIdx < chunks.length) {
                r = writeChunkAndReturn(destination, chunks[chunkIdx]);
              }
              return r;
            }
          default:
            {
              throw new Error('Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.');
            }
        }
      }
      function flushSegment(request, destination, segment) {
        var boundary = segment.boundary;
        if (boundary === null) {
          return flushSubtree(request, destination, segment);
        }
        boundary.parentFlushed = true;
        if (boundary.forceClientRender) {
          writeStartClientRenderedSuspenseBoundary$1(destination, request.responseState);
          flushSubtree(request, destination, segment);
          return writeEndClientRenderedSuspenseBoundary$1(destination, request.responseState);
        } else if (boundary.pendingTasks > 0) {
          boundary.rootSegmentID = request.nextSegmentId++;
          if (boundary.completedSegments.length > 0) {
            request.partialBoundaries.push(boundary);
          }
          var id = boundary.id = assignSuspenseBoundaryID(request.responseState);
          writeStartPendingSuspenseBoundary(destination, request.responseState, id);
          flushSubtree(request, destination, segment);
          return writeEndPendingSuspenseBoundary(destination, request.responseState);
        } else if (boundary.byteSize > request.progressiveChunkSize) {
          boundary.rootSegmentID = request.nextSegmentId++;
          request.completedBoundaries.push(boundary);
          writeStartPendingSuspenseBoundary(destination, request.responseState, boundary.id);
          flushSubtree(request, destination, segment);
          return writeEndPendingSuspenseBoundary(destination, request.responseState);
        } else {
          writeStartCompletedSuspenseBoundary$1(destination, request.responseState);
          var completedSegments = boundary.completedSegments;
          if (completedSegments.length !== 1) {
            throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in React.');
          }
          var contentSegment = completedSegments[0];
          flushSegment(request, destination, contentSegment);
          return writeEndCompletedSuspenseBoundary$1(destination, request.responseState);
        }
      }
      function flushClientRenderedBoundary(request, destination, boundary) {
        return writeClientRenderBoundaryInstruction(destination, request.responseState, boundary.id);
      }
      function flushSegmentContainer(request, destination, segment) {
        writeStartSegment(destination, request.responseState, segment.formatContext, segment.id);
        flushSegment(request, destination, segment);
        return writeEndSegment(destination, segment.formatContext);
      }
      function flushCompletedBoundary(request, destination, boundary) {
        var completedSegments = boundary.completedSegments;
        var i = 0;
        for (; i < completedSegments.length; i++) {
          var segment = completedSegments[i];
          flushPartiallyCompletedSegment(request, destination, boundary, segment);
        }
        completedSegments.length = 0;
        return writeCompletedBoundaryInstruction(destination, request.responseState, boundary.id, boundary.rootSegmentID);
      }
      function flushPartialBoundary(request, destination, boundary) {
        var completedSegments = boundary.completedSegments;
        var i = 0;
        for (; i < completedSegments.length; i++) {
          var segment = completedSegments[i];
          if (!flushPartiallyCompletedSegment(request, destination, boundary, segment)) {
            i++;
            completedSegments.splice(0, i);
            return false;
          }
        }
        completedSegments.splice(0, i);
        return true;
      }
      function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
        if (segment.status === FLUSHED) {
          return true;
        }
        var segmentID = segment.id;
        if (segmentID === -1) {
          var rootSegmentID = segment.id = boundary.rootSegmentID;
          if (rootSegmentID === -1) {
            throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');
          }
          return flushSegmentContainer(request, destination, segment);
        } else {
          flushSegmentContainer(request, destination, segment);
          return writeCompletedSegmentInstruction(destination, request.responseState, segmentID);
        }
      }
      function flushCompletedQueues(request, destination) {
        try {
          var completedRootSegment = request.completedRootSegment;
          if (completedRootSegment !== null && request.pendingRootTasks === 0) {
            flushSegment(request, destination, completedRootSegment);
            request.completedRootSegment = null;
            writeCompletedRoot(destination, request.responseState);
          }
          var clientRenderedBoundaries = request.clientRenderedBoundaries;
          var i;
          for (i = 0; i < clientRenderedBoundaries.length; i++) {
            var boundary = clientRenderedBoundaries[i];
            if (!flushClientRenderedBoundary(request, destination, boundary)) {
              request.destination = null;
              i++;
              clientRenderedBoundaries.splice(0, i);
              return;
            }
          }
          clientRenderedBoundaries.splice(0, i);
          var completedBoundaries = request.completedBoundaries;
          for (i = 0; i < completedBoundaries.length; i++) {
            var _boundary = completedBoundaries[i];
            if (!flushCompletedBoundary(request, destination, _boundary)) {
              request.destination = null;
              i++;
              completedBoundaries.splice(0, i);
              return;
            }
          }
          completedBoundaries.splice(0, i);
          completeWriting(destination);
          beginWriting(destination);
          var partialBoundaries = request.partialBoundaries;
          for (i = 0; i < partialBoundaries.length; i++) {
            var _boundary2 = partialBoundaries[i];
            if (!flushPartialBoundary(request, destination, _boundary2)) {
              request.destination = null;
              i++;
              partialBoundaries.splice(0, i);
              return;
            }
          }
          partialBoundaries.splice(0, i);
          var largeBoundaries = request.completedBoundaries;
          for (i = 0; i < largeBoundaries.length; i++) {
            var _boundary3 = largeBoundaries[i];
            if (!flushCompletedBoundary(request, destination, _boundary3)) {
              request.destination = null;
              i++;
              largeBoundaries.splice(0, i);
              return;
            }
          }
          largeBoundaries.splice(0, i);
        } finally {
          if (request.allPendingTasks === 0 && request.pingedTasks.length === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0) {
            {
              if (request.abortableTasks.size !== 0) {
                error('There was still abortable task at the root when we closed. This is a bug in React.');
              }
            }
            close(destination);
          }
        }
      }
      function startWork(request) {
        scheduleWork(function() {
          return performWork(request);
        });
      }
      function startFlowing(request, destination) {
        if (request.status === CLOSING) {
          request.status = CLOSED;
          closeWithError(destination, request.fatalError);
          return;
        }
        if (request.status === CLOSED) {
          return;
        }
        if (request.destination !== null) {
          return;
        }
        request.destination = destination;
        try {
          flushCompletedQueues(request, destination);
        } catch (error) {
          logRecoverableError(request, error);
          fatalError(request, error);
        }
      }
      function abort(request) {
        try {
          var abortableTasks = request.abortableTasks;
          abortableTasks.forEach(abortTask, request);
          abortableTasks.clear();
          if (request.destination !== null) {
            flushCompletedQueues(request, request.destination);
          }
        } catch (error) {
          logRecoverableError(request, error);
          fatalError(request, error);
        }
      }
      function onError() {}
      function renderToStringImpl(children, options, generateStaticMarkup) {
        var didFatal = false;
        var fatalError = null;
        var result = '';
        var destination = {
          push: function(chunk) {
            if (chunk !== null) {
              result += chunk;
            }
            return true;
          },
          destroy: function(error) {
            didFatal = true;
            fatalError = error;
          }
        };
        var readyToStream = false;
        function onShellReady() {
          readyToStream = true;
        }
        var request = createRequest(children, createResponseState$1(generateStaticMarkup, options ? options.identifierPrefix : undefined), createRootFormatContext(), Infinity, onError, undefined, onShellReady, undefined, undefined);
        startWork(request);
        abort(request);
        startFlowing(request, destination);
        if (didFatal) {
          throw fatalError;
        }
        if (!readyToStream) {
          throw new Error('A component suspended while responding to synchronous input. This ' + 'will cause the UI to be replaced with a loading indicator. To fix, ' + 'updates that suspend should be wrapped with startTransition.');
        }
        return result;
      }
      function renderToString(children, options) {
        return renderToStringImpl(children, options, false);
      }
      function renderToStaticMarkup(children, options) {
        return renderToStringImpl(children, options, true);
      }
      function renderToNodeStream() {
        throw new Error('ReactDOMServer.renderToNodeStream(): The streaming API is not available ' + 'in the browser. Use ReactDOMServer.renderToString() instead.');
      }
      function renderToStaticNodeStream() {
        throw new Error('ReactDOMServer.renderToStaticNodeStream(): The streaming API is not available ' + 'in the browser. Use ReactDOMServer.renderToStaticMarkup() instead.');
      }
      exports.renderToNodeStream = renderToNodeStream;
      exports.renderToStaticMarkup = renderToStaticMarkup;
      exports.renderToStaticNodeStream = renderToStaticNodeStream;
      exports.renderToString = renderToString;
      exports.version = ReactVersion;
    })();
  }
})(require('process'));
