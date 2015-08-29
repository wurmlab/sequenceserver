/* */ 
"format cjs";
(function(process) {
  (function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
      module.exports = global.document ? factory(global, true) : function(w) {
        if (!w.document) {
          throw new Error("jQuery requires a window with a document");
        }
        return factory(w);
      };
    } else {
      factory(global);
    }
  }(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    var arr = [];
    var slice = arr.slice;
    var concat = arr.concat;
    var push = arr.push;
    var indexOf = arr.indexOf;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var support = {};
    var document = window.document,
        version = "2.1.1 -css/hiddenVisibleSelectors,-effects/animatedSelector,-effects,-effects/Tween,-deprecated,-event/alias,-wrap",
        jQuery = function(selector, context) {
          return new jQuery.fn.init(selector, context);
        },
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,
        fcamelCase = function(all, letter) {
          return letter.toUpperCase();
        };
    jQuery.fn = jQuery.prototype = {
      jquery: version,
      constructor: jQuery,
      selector: "",
      length: 0,
      toArray: function() {
        return slice.call(this);
      },
      get: function(num) {
        return num != null ? (num < 0 ? this[num + this.length] : this[num]) : slice.call(this);
      },
      pushStack: function(elems) {
        var ret = jQuery.merge(this.constructor(), elems);
        ret.prevObject = this;
        ret.context = this.context;
        return ret;
      },
      each: function(callback, args) {
        return jQuery.each(this, callback, args);
      },
      map: function(callback) {
        return this.pushStack(jQuery.map(this, function(elem, i) {
          return callback.call(elem, i, elem);
        }));
      },
      slice: function() {
        return this.pushStack(slice.apply(this, arguments));
      },
      first: function() {
        return this.eq(0);
      },
      last: function() {
        return this.eq(-1);
      },
      eq: function(i) {
        var len = this.length,
            j = +i + (i < 0 ? len : 0);
        return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
      },
      end: function() {
        return this.prevObject || this.constructor(null);
      },
      push: push,
      sort: arr.sort,
      splice: arr.splice
    };
    jQuery.extend = jQuery.fn.extend = function() {
      var options,
          name,
          src,
          copy,
          copyIsArray,
          clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[i] || {};
        i++;
      }
      if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
      }
      if (i === length) {
        target = this;
        i--;
      }
      for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
          for (name in options) {
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue;
            }
            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && jQuery.isArray(src) ? src : [];
              } else {
                clone = src && jQuery.isPlainObject(src) ? src : {};
              }
              target[name] = jQuery.extend(deep, clone, copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    };
    jQuery.extend({
      expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
      isReady: true,
      error: function(msg) {
        throw new Error(msg);
      },
      noop: function() {},
      isFunction: function(obj) {
        return jQuery.type(obj) === "function";
      },
      isArray: Array.isArray,
      isWindow: function(obj) {
        return obj != null && obj === obj.window;
      },
      isNumeric: function(obj) {
        return !jQuery.isArray(obj) && obj - parseFloat(obj) >= 0;
      },
      isPlainObject: function(obj) {
        if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
          return false;
        }
        if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
          return false;
        }
        return true;
      },
      isEmptyObject: function(obj) {
        var name;
        for (name in obj) {
          return false;
        }
        return true;
      },
      type: function(obj) {
        if (obj == null) {
          return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
      },
      globalEval: function(code) {
        var script,
            indirect = eval;
        code = jQuery.trim(code);
        if (code) {
          if (code.indexOf("use strict") === 1) {
            script = document.createElement("script");
            script.text = code;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else {
            indirect(code);
          }
        }
      },
      camelCase: function(string) {
        return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
      },
      nodeName: function(elem, name) {
        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
      },
      each: function(obj, callback, args) {
        var value,
            i = 0,
            length = obj.length,
            isArray = isArraylike(obj);
        if (args) {
          if (isArray) {
            for (; i < length; i++) {
              value = callback.apply(obj[i], args);
              if (value === false) {
                break;
              }
            }
          } else {
            for (i in obj) {
              value = callback.apply(obj[i], args);
              if (value === false) {
                break;
              }
            }
          }
        } else {
          if (isArray) {
            for (; i < length; i++) {
              value = callback.call(obj[i], i, obj[i]);
              if (value === false) {
                break;
              }
            }
          } else {
            for (i in obj) {
              value = callback.call(obj[i], i, obj[i]);
              if (value === false) {
                break;
              }
            }
          }
        }
        return obj;
      },
      trim: function(text) {
        return text == null ? "" : (text + "").replace(rtrim, "");
      },
      makeArray: function(arr, results) {
        var ret = results || [];
        if (arr != null) {
          if (isArraylike(Object(arr))) {
            jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
          } else {
            push.call(ret, arr);
          }
        }
        return ret;
      },
      inArray: function(elem, arr, i) {
        return arr == null ? -1 : indexOf.call(arr, elem, i);
      },
      merge: function(first, second) {
        var len = +second.length,
            j = 0,
            i = first.length;
        for (; j < len; j++) {
          first[i++] = second[j];
        }
        first.length = i;
        return first;
      },
      grep: function(elems, callback, invert) {
        var callbackInverse,
            matches = [],
            i = 0,
            length = elems.length,
            callbackExpect = !invert;
        for (; i < length; i++) {
          callbackInverse = !callback(elems[i], i);
          if (callbackInverse !== callbackExpect) {
            matches.push(elems[i]);
          }
        }
        return matches;
      },
      map: function(elems, callback, arg) {
        var value,
            i = 0,
            length = elems.length,
            isArray = isArraylike(elems),
            ret = [];
        if (isArray) {
          for (; i < length; i++) {
            value = callback(elems[i], i, arg);
            if (value != null) {
              ret.push(value);
            }
          }
        } else {
          for (i in elems) {
            value = callback(elems[i], i, arg);
            if (value != null) {
              ret.push(value);
            }
          }
        }
        return concat.apply([], ret);
      },
      guid: 1,
      proxy: function(fn, context) {
        var tmp,
            args,
            proxy;
        if (typeof context === "string") {
          tmp = fn[context];
          context = fn;
          fn = tmp;
        }
        if (!jQuery.isFunction(fn)) {
          return undefined;
        }
        args = slice.call(arguments, 2);
        proxy = function() {
          return fn.apply(context || this, args.concat(slice.call(arguments)));
        };
        proxy.guid = fn.guid = fn.guid || jQuery.guid++;
        return proxy;
      },
      now: Date.now,
      support: support
    });
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
      class2type["[object " + name + "]"] = name.toLowerCase();
    });
    function isArraylike(obj) {
      var length = obj.length,
          type = jQuery.type(obj);
      if (type === "function" || jQuery.isWindow(obj)) {
        return false;
      }
      if (obj.nodeType === 1 && length) {
        return true;
      }
      return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }
    var docElem = window.document.documentElement,
        selector_hasDuplicate,
        matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector,
        selector_sortOrder = function(a, b) {
          if (a === b) {
            selector_hasDuplicate = true;
            return 0;
          }
          var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);
          if (compare) {
            if (compare & 1) {
              if (a === document || jQuery.contains(document, a)) {
                return -1;
              }
              if (b === document || jQuery.contains(document, b)) {
                return 1;
              }
              return 0;
            }
            return compare & 4 ? -1 : 1;
          }
          return a.compareDocumentPosition ? -1 : 1;
        };
    jQuery.extend({
      find: function(selector, context, results, seed) {
        var elem,
            nodeType,
            i = 0;
        results = results || [];
        context = context || document;
        if (!selector || typeof selector !== "string") {
          return results;
        }
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
          return [];
        }
        if (seed) {
          while ((elem = seed[i++])) {
            if (jQuery.find.matchesSelector(elem, selector)) {
              results.push(elem);
            }
          }
        } else {
          jQuery.merge(results, context.querySelectorAll(selector));
        }
        return results;
      },
      unique: function(results) {
        var elem,
            duplicates = [],
            i = 0,
            j = 0;
        selector_hasDuplicate = false;
        results.sort(selector_sortOrder);
        if (selector_hasDuplicate) {
          while ((elem = results[i++])) {
            if (elem === results[i]) {
              j = duplicates.push(i);
            }
          }
          while (j--) {
            results.splice(duplicates[j], 1);
          }
        }
        return results;
      },
      text: function(elem) {
        var node,
            ret = "",
            i = 0,
            nodeType = elem.nodeType;
        if (!nodeType) {
          while ((node = elem[i++])) {
            ret += jQuery.text(node);
          }
        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
          return elem.textContent;
        } else if (nodeType === 3 || nodeType === 4) {
          return elem.nodeValue;
        }
        return ret;
      },
      contains: function(a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && adown.contains(bup));
      },
      isXMLDoc: function(elem) {
        return (elem.ownerDocument || elem).documentElement.nodeName !== "HTML";
      },
      expr: {
        attrHandle: {},
        match: {
          bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,
          needsContext: /^[\x20\t\r\n\f]*[>+~]/
        }
      }
    });
    jQuery.extend(jQuery.find, {
      matches: function(expr, elements) {
        return jQuery.find(expr, null, null, elements);
      },
      matchesSelector: function(elem, expr) {
        return matches.call(elem, expr);
      },
      attr: function(elem, name) {
        return elem.getAttribute(name);
      }
    });
    var rneedsContext = jQuery.expr.match.needsContext;
    var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
    var risSimple = /^.[^:#\[\.,]*$/;
    function winnow(elements, qualifier, not) {
      if (jQuery.isFunction(qualifier)) {
        return jQuery.grep(elements, function(elem, i) {
          return !!qualifier.call(elem, i, elem) !== not;
        });
      }
      if (qualifier.nodeType) {
        return jQuery.grep(elements, function(elem) {
          return (elem === qualifier) !== not;
        });
      }
      if (typeof qualifier === "string") {
        if (risSimple.test(qualifier)) {
          return jQuery.filter(qualifier, elements, not);
        }
        qualifier = jQuery.filter(qualifier, elements);
      }
      return jQuery.grep(elements, function(elem) {
        return (indexOf.call(qualifier, elem) >= 0) !== not;
      });
    }
    jQuery.filter = function(expr, elems, not) {
      var elem = elems[0];
      if (not) {
        expr = ":not(" + expr + ")";
      }
      return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
        return elem.nodeType === 1;
      }));
    };
    jQuery.fn.extend({
      find: function(selector) {
        var i,
            len = this.length,
            ret = [],
            self = this;
        if (typeof selector !== "string") {
          return this.pushStack(jQuery(selector).filter(function() {
            for (i = 0; i < len; i++) {
              if (jQuery.contains(self[i], this)) {
                return true;
              }
            }
          }));
        }
        for (i = 0; i < len; i++) {
          jQuery.find(selector, self[i], ret);
        }
        ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
        ret.selector = this.selector ? this.selector + " " + selector : selector;
        return ret;
      },
      filter: function(selector) {
        return this.pushStack(winnow(this, selector || [], false));
      },
      not: function(selector) {
        return this.pushStack(winnow(this, selector || [], true));
      },
      is: function(selector) {
        return !!winnow(this, typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
      }
    });
    var rootjQuery,
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        init = jQuery.fn.init = function(selector, context) {
          var match,
              elem;
          if (!selector) {
            return this;
          }
          if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
              match = [null, selector, null];
            } else {
              match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
              if (match[1]) {
                context = context instanceof jQuery ? context[0] : context;
                jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                  for (match in context) {
                    if (jQuery.isFunction(this[match])) {
                      this[match](context[match]);
                    } else {
                      this.attr(match, context[match]);
                    }
                  }
                }
                return this;
              } else {
                elem = document.getElementById(match[2]);
                if (elem && elem.parentNode) {
                  this.length = 1;
                  this[0] = elem;
                }
                this.context = document;
                this.selector = selector;
                return this;
              }
            } else if (!context || context.jquery) {
              return (context || rootjQuery).find(selector);
            } else {
              return this.constructor(context).find(selector);
            }
          } else if (selector.nodeType) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
          } else if (jQuery.isFunction(selector)) {
            return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) : selector(jQuery);
          }
          if (selector.selector !== undefined) {
            this.selector = selector.selector;
            this.context = selector.context;
          }
          return jQuery.makeArray(selector, this);
        };
    init.prototype = jQuery.fn;
    rootjQuery = jQuery(document);
    var rparentsprev = /^(?:parents|prev(?:Until|All))/,
        guaranteedUnique = {
          children: true,
          contents: true,
          next: true,
          prev: true
        };
    jQuery.extend({
      dir: function(elem, dir, until) {
        var matched = [],
            truncate = until !== undefined;
        while ((elem = elem[dir]) && elem.nodeType !== 9) {
          if (elem.nodeType === 1) {
            if (truncate && jQuery(elem).is(until)) {
              break;
            }
            matched.push(elem);
          }
        }
        return matched;
      },
      sibling: function(n, elem) {
        var matched = [];
        for (; n; n = n.nextSibling) {
          if (n.nodeType === 1 && n !== elem) {
            matched.push(n);
          }
        }
        return matched;
      }
    });
    jQuery.fn.extend({
      has: function(target) {
        var targets = jQuery(target, this),
            l = targets.length;
        return this.filter(function() {
          var i = 0;
          for (; i < l; i++) {
            if (jQuery.contains(this, targets[i])) {
              return true;
            }
          }
        });
      },
      closest: function(selectors, context) {
        var cur,
            i = 0,
            l = this.length,
            matched = [],
            pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
        for (; i < l; i++) {
          for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
            if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
              matched.push(cur);
              break;
            }
          }
        }
        return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
      },
      index: function(elem) {
        if (!elem) {
          return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
        }
        if (typeof elem === "string") {
          return indexOf.call(jQuery(elem), this[0]);
        }
        return indexOf.call(this, elem.jquery ? elem[0] : elem);
      },
      add: function(selector, context) {
        return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
      },
      addBack: function(selector) {
        return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
      }
    });
    function sibling(cur, dir) {
      while ((cur = cur[dir]) && cur.nodeType !== 1) {}
      return cur;
    }
    jQuery.each({
      parent: function(elem) {
        var parent = elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
      },
      parents: function(elem) {
        return jQuery.dir(elem, "parentNode");
      },
      parentsUntil: function(elem, i, until) {
        return jQuery.dir(elem, "parentNode", until);
      },
      next: function(elem) {
        return sibling(elem, "nextSibling");
      },
      prev: function(elem) {
        return sibling(elem, "previousSibling");
      },
      nextAll: function(elem) {
        return jQuery.dir(elem, "nextSibling");
      },
      prevAll: function(elem) {
        return jQuery.dir(elem, "previousSibling");
      },
      nextUntil: function(elem, i, until) {
        return jQuery.dir(elem, "nextSibling", until);
      },
      prevUntil: function(elem, i, until) {
        return jQuery.dir(elem, "previousSibling", until);
      },
      siblings: function(elem) {
        return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
      },
      children: function(elem) {
        return jQuery.sibling(elem.firstChild);
      },
      contents: function(elem) {
        return elem.contentDocument || jQuery.merge([], elem.childNodes);
      }
    }, function(name, fn) {
      jQuery.fn[name] = function(until, selector) {
        var matched = jQuery.map(this, fn, until);
        if (name.slice(-5) !== "Until") {
          selector = until;
        }
        if (selector && typeof selector === "string") {
          matched = jQuery.filter(selector, matched);
        }
        if (this.length > 1) {
          if (!guaranteedUnique[name]) {
            jQuery.unique(matched);
          }
          if (rparentsprev.test(name)) {
            matched.reverse();
          }
        }
        return this.pushStack(matched);
      };
    });
    var rnotwhite = (/\S+/g);
    var optionsCache = {};
    function createOptions(options) {
      var object = optionsCache[options] = {};
      jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
        object[flag] = true;
      });
      return object;
    }
    jQuery.Callbacks = function(options) {
      options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : jQuery.extend({}, options);
      var memory,
          fired,
          firing,
          firingStart,
          firingLength,
          firingIndex,
          list = [],
          stack = !options.once && [],
          fire = function(data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
              if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                memory = false;
                break;
              }
            }
            firing = false;
            if (list) {
              if (stack) {
                if (stack.length) {
                  fire(stack.shift());
                }
              } else if (memory) {
                list = [];
              } else {
                self.disable();
              }
            }
          },
          self = {
            add: function() {
              if (list) {
                var start = list.length;
                (function add(args) {
                  jQuery.each(args, function(_, arg) {
                    var type = jQuery.type(arg);
                    if (type === "function") {
                      if (!options.unique || !self.has(arg)) {
                        list.push(arg);
                      }
                    } else if (arg && arg.length && type !== "string") {
                      add(arg);
                    }
                  });
                })(arguments);
                if (firing) {
                  firingLength = list.length;
                } else if (memory) {
                  firingStart = start;
                  fire(memory);
                }
              }
              return this;
            },
            remove: function() {
              if (list) {
                jQuery.each(arguments, function(_, arg) {
                  var index;
                  while ((index = jQuery.inArray(arg, list, index)) > -1) {
                    list.splice(index, 1);
                    if (firing) {
                      if (index <= firingLength) {
                        firingLength--;
                      }
                      if (index <= firingIndex) {
                        firingIndex--;
                      }
                    }
                  }
                });
              }
              return this;
            },
            has: function(fn) {
              return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            empty: function() {
              list = [];
              firingLength = 0;
              return this;
            },
            disable: function() {
              list = stack = memory = undefined;
              return this;
            },
            disabled: function() {
              return !list;
            },
            lock: function() {
              stack = undefined;
              if (!memory) {
                self.disable();
              }
              return this;
            },
            locked: function() {
              return !stack;
            },
            fireWith: function(context, args) {
              if (list && (!fired || stack)) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                if (firing) {
                  stack.push(args);
                } else {
                  fire(args);
                }
              }
              return this;
            },
            fire: function() {
              self.fireWith(this, arguments);
              return this;
            },
            fired: function() {
              return !!fired;
            }
          };
      return self;
    };
    jQuery.extend({
      Deferred: function(func) {
        var tuples = [["resolve", "done", jQuery.Callbacks("once memory"), "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"], ["notify", "progress", jQuery.Callbacks("memory")]],
            state = "pending",
            promise = {
              state: function() {
                return state;
              },
              always: function() {
                deferred.done(arguments).fail(arguments);
                return this;
              },
              then: function() {
                var fns = arguments;
                return jQuery.Deferred(function(newDefer) {
                  jQuery.each(tuples, function(i, tuple) {
                    var fn = jQuery.isFunction(fns[i]) && fns[i];
                    deferred[tuple[1]](function() {
                      var returned = fn && fn.apply(this, arguments);
                      if (returned && jQuery.isFunction(returned.promise)) {
                        returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                      } else {
                        newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                      }
                    });
                  });
                  fns = null;
                }).promise();
              },
              promise: function(obj) {
                return obj != null ? jQuery.extend(obj, promise) : promise;
              }
            },
            deferred = {};
        promise.pipe = promise.then;
        jQuery.each(tuples, function(i, tuple) {
          var list = tuple[2],
              stateString = tuple[3];
          promise[tuple[1]] = list.add;
          if (stateString) {
            list.add(function() {
              state = stateString;
            }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
          }
          deferred[tuple[0]] = function() {
            deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
            return this;
          };
          deferred[tuple[0] + "With"] = list.fireWith;
        });
        promise.promise(deferred);
        if (func) {
          func.call(deferred, deferred);
        }
        return deferred;
      },
      when: function(subordinate) {
        var i = 0,
            resolveValues = slice.call(arguments),
            length = resolveValues.length,
            remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,
            deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
            updateFunc = function(i, contexts, values) {
              return function(value) {
                contexts[i] = this;
                values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                if (values === progressValues) {
                  deferred.notifyWith(contexts, values);
                } else if (!(--remaining)) {
                  deferred.resolveWith(contexts, values);
                }
              };
            },
            progressValues,
            progressContexts,
            resolveContexts;
        if (length > 1) {
          progressValues = new Array(length);
          progressContexts = new Array(length);
          resolveContexts = new Array(length);
          for (; i < length; i++) {
            if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
              resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
            } else {
              --remaining;
            }
          }
        }
        if (!remaining) {
          deferred.resolveWith(resolveContexts, resolveValues);
        }
        return deferred.promise();
      }
    });
    var readyList;
    jQuery.fn.ready = function(fn) {
      jQuery.ready.promise().done(fn);
      return this;
    };
    jQuery.extend({
      isReady: false,
      readyWait: 1,
      holdReady: function(hold) {
        if (hold) {
          jQuery.readyWait++;
        } else {
          jQuery.ready(true);
        }
      },
      ready: function(wait) {
        if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
          return;
        }
        jQuery.isReady = true;
        if (wait !== true && --jQuery.readyWait > 0) {
          return;
        }
        readyList.resolveWith(document, [jQuery]);
        if (jQuery.fn.triggerHandler) {
          jQuery(document).triggerHandler("ready");
          jQuery(document).off("ready");
        }
      }
    });
    function completed() {
      document.removeEventListener("DOMContentLoaded", completed, false);
      window.removeEventListener("load", completed, false);
      jQuery.ready();
    }
    jQuery.ready.promise = function(obj) {
      if (!readyList) {
        readyList = jQuery.Deferred();
        if (document.readyState === "complete") {
          setTimeout(jQuery.ready);
        } else {
          document.addEventListener("DOMContentLoaded", completed, false);
          window.addEventListener("load", completed, false);
        }
      }
      return readyList.promise(obj);
    };
    jQuery.ready.promise();
    var access = jQuery.access = function(elems, fn, key, value, chainable, emptyGet, raw) {
      var i = 0,
          len = elems.length,
          bulk = key == null;
      if (jQuery.type(key) === "object") {
        chainable = true;
        for (i in key) {
          jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
        }
      } else if (value !== undefined) {
        chainable = true;
        if (!jQuery.isFunction(value)) {
          raw = true;
        }
        if (bulk) {
          if (raw) {
            fn.call(elems, value);
            fn = null;
          } else {
            bulk = fn;
            fn = function(elem, key, value) {
              return bulk.call(jQuery(elem), value);
            };
          }
        }
        if (fn) {
          for (; i < len; i++) {
            fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
          }
        }
      }
      return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
    };
    jQuery.acceptData = function(owner) {
      return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
    };
    function Data() {
      Object.defineProperty(this.cache = {}, 0, {get: function() {
          return {};
        }});
      this.expando = jQuery.expando + Math.random();
    }
    Data.uid = 1;
    Data.accepts = jQuery.acceptData;
    Data.prototype = {
      key: function(owner) {
        if (!Data.accepts(owner)) {
          return 0;
        }
        var descriptor = {},
            unlock = owner[this.expando];
        if (!unlock) {
          unlock = Data.uid++;
          try {
            descriptor[this.expando] = {value: unlock};
            Object.defineProperties(owner, descriptor);
          } catch (e) {
            descriptor[this.expando] = unlock;
            jQuery.extend(owner, descriptor);
          }
        }
        if (!this.cache[unlock]) {
          this.cache[unlock] = {};
        }
        return unlock;
      },
      set: function(owner, data, value) {
        var prop,
            unlock = this.key(owner),
            cache = this.cache[unlock];
        if (typeof data === "string") {
          cache[data] = value;
        } else {
          if (jQuery.isEmptyObject(cache)) {
            jQuery.extend(this.cache[unlock], data);
          } else {
            for (prop in data) {
              cache[prop] = data[prop];
            }
          }
        }
        return cache;
      },
      get: function(owner, key) {
        var cache = this.cache[this.key(owner)];
        return key === undefined ? cache : cache[key];
      },
      access: function(owner, key, value) {
        var stored;
        if (key === undefined || ((key && typeof key === "string") && value === undefined)) {
          stored = this.get(owner, key);
          return stored !== undefined ? stored : this.get(owner, jQuery.camelCase(key));
        }
        this.set(owner, key, value);
        return value !== undefined ? value : key;
      },
      remove: function(owner, key) {
        var i,
            name,
            camel,
            unlock = this.key(owner),
            cache = this.cache[unlock];
        if (key === undefined) {
          this.cache[unlock] = {};
        } else {
          if (jQuery.isArray(key)) {
            name = key.concat(key.map(jQuery.camelCase));
          } else {
            camel = jQuery.camelCase(key);
            if (key in cache) {
              name = [key, camel];
            } else {
              name = camel;
              name = name in cache ? [name] : (name.match(rnotwhite) || []);
            }
          }
          i = name.length;
          while (i--) {
            delete cache[name[i]];
          }
        }
      },
      hasData: function(owner) {
        return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});
      },
      discard: function(owner) {
        if (owner[this.expando]) {
          delete this.cache[owner[this.expando]];
        }
      }
    };
    var data_priv = new Data();
    var data_user = new Data();
    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        rmultiDash = /([A-Z])/g;
    function dataAttr(elem, key, data) {
      var name;
      if (data === undefined && elem.nodeType === 1) {
        name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
        data = elem.getAttribute(name);
        if (typeof data === "string") {
          try {
            data = data === "true" ? true : data === "false" ? false : data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
          } catch (e) {}
          data_user.set(elem, key, data);
        } else {
          data = undefined;
        }
      }
      return data;
    }
    jQuery.extend({
      hasData: function(elem) {
        return data_user.hasData(elem) || data_priv.hasData(elem);
      },
      data: function(elem, name, data) {
        return data_user.access(elem, name, data);
      },
      removeData: function(elem, name) {
        data_user.remove(elem, name);
      },
      _data: function(elem, name, data) {
        return data_priv.access(elem, name, data);
      },
      _removeData: function(elem, name) {
        data_priv.remove(elem, name);
      }
    });
    jQuery.fn.extend({
      data: function(key, value) {
        var i,
            name,
            data,
            elem = this[0],
            attrs = elem && elem.attributes;
        if (key === undefined) {
          if (this.length) {
            data = data_user.get(elem);
            if (elem.nodeType === 1 && !data_priv.get(elem, "hasDataAttrs")) {
              i = attrs.length;
              while (i--) {
                if (attrs[i]) {
                  name = attrs[i].name;
                  if (name.indexOf("data-") === 0) {
                    name = jQuery.camelCase(name.slice(5));
                    dataAttr(elem, name, data[name]);
                  }
                }
              }
              data_priv.set(elem, "hasDataAttrs", true);
            }
          }
          return data;
        }
        if (typeof key === "object") {
          return this.each(function() {
            data_user.set(this, key);
          });
        }
        return access(this, function(value) {
          var data,
              camelKey = jQuery.camelCase(key);
          if (elem && value === undefined) {
            data = data_user.get(elem, key);
            if (data !== undefined) {
              return data;
            }
            data = data_user.get(elem, camelKey);
            if (data !== undefined) {
              return data;
            }
            data = dataAttr(elem, camelKey, undefined);
            if (data !== undefined) {
              return data;
            }
            return;
          }
          this.each(function() {
            var data = data_user.get(this, camelKey);
            data_user.set(this, camelKey, value);
            if (key.indexOf("-") !== -1 && data !== undefined) {
              data_user.set(this, key, value);
            }
          });
        }, null, value, arguments.length > 1, null, true);
      },
      removeData: function(key) {
        return this.each(function() {
          data_user.remove(this, key);
        });
      }
    });
    jQuery.extend({
      queue: function(elem, type, data) {
        var queue;
        if (elem) {
          type = (type || "fx") + "queue";
          queue = data_priv.get(elem, type);
          if (data) {
            if (!queue || jQuery.isArray(data)) {
              queue = data_priv.access(elem, type, jQuery.makeArray(data));
            } else {
              queue.push(data);
            }
          }
          return queue || [];
        }
      },
      dequeue: function(elem, type) {
        type = type || "fx";
        var queue = jQuery.queue(elem, type),
            startLength = queue.length,
            fn = queue.shift(),
            hooks = jQuery._queueHooks(elem, type),
            next = function() {
              jQuery.dequeue(elem, type);
            };
        if (fn === "inprogress") {
          fn = queue.shift();
          startLength--;
        }
        if (fn) {
          if (type === "fx") {
            queue.unshift("inprogress");
          }
          delete hooks.stop;
          fn.call(elem, next, hooks);
        }
        if (!startLength && hooks) {
          hooks.empty.fire();
        }
      },
      _queueHooks: function(elem, type) {
        var key = type + "queueHooks";
        return data_priv.get(elem, key) || data_priv.access(elem, key, {empty: jQuery.Callbacks("once memory").add(function() {
            data_priv.remove(elem, [type + "queue", key]);
          })});
      }
    });
    jQuery.fn.extend({
      queue: function(type, data) {
        var setter = 2;
        if (typeof type !== "string") {
          data = type;
          type = "fx";
          setter--;
        }
        if (arguments.length < setter) {
          return jQuery.queue(this[0], type);
        }
        return data === undefined ? this : this.each(function() {
          var queue = jQuery.queue(this, type, data);
          jQuery._queueHooks(this, type);
          if (type === "fx" && queue[0] !== "inprogress") {
            jQuery.dequeue(this, type);
          }
        });
      },
      dequeue: function(type) {
        return this.each(function() {
          jQuery.dequeue(this, type);
        });
      },
      clearQueue: function(type) {
        return this.queue(type || "fx", []);
      },
      promise: function(type, obj) {
        var tmp,
            count = 1,
            defer = jQuery.Deferred(),
            elements = this,
            i = this.length,
            resolve = function() {
              if (!(--count)) {
                defer.resolveWith(elements, [elements]);
              }
            };
        if (typeof type !== "string") {
          obj = type;
          type = undefined;
        }
        type = type || "fx";
        while (i--) {
          tmp = data_priv.get(elements[i], type + "queueHooks");
          if (tmp && tmp.empty) {
            count++;
            tmp.empty.add(resolve);
          }
        }
        resolve();
        return defer.promise(obj);
      }
    });
    var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
    var cssExpand = ["Top", "Right", "Bottom", "Left"];
    var isHidden = function(elem, el) {
      elem = el || elem;
      return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
    };
    var rcheckableType = (/^(?:checkbox|radio)$/i);
    (function() {
      var fragment = document.createDocumentFragment(),
          div = fragment.appendChild(document.createElement("div")),
          input = document.createElement("input");
      input.setAttribute("type", "radio");
      input.setAttribute("checked", "checked");
      input.setAttribute("name", "t");
      div.appendChild(input);
      support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
      div.innerHTML = "<textarea>x</textarea>";
      support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
    })();
    var strundefined = typeof undefined;
    support.focusinBubbles = "onfocusin" in window;
    var rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
    function returnTrue() {
      return true;
    }
    function returnFalse() {
      return false;
    }
    function safeActiveElement() {
      try {
        return document.activeElement;
      } catch (err) {}
    }
    jQuery.event = {
      global: {},
      add: function(elem, types, handler, data, selector) {
        var handleObjIn,
            eventHandle,
            tmp,
            events,
            t,
            handleObj,
            special,
            handlers,
            type,
            namespaces,
            origType,
            elemData = data_priv.get(elem);
        if (!elemData) {
          return;
        }
        if (handler.handler) {
          handleObjIn = handler;
          handler = handleObjIn.handler;
          selector = handleObjIn.selector;
        }
        if (!handler.guid) {
          handler.guid = jQuery.guid++;
        }
        if (!(events = elemData.events)) {
          events = elemData.events = {};
        }
        if (!(eventHandle = elemData.handle)) {
          eventHandle = elemData.handle = function(e) {
            return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
          };
        }
        types = (types || "").match(rnotwhite) || [""];
        t = types.length;
        while (t--) {
          tmp = rtypenamespace.exec(types[t]) || [];
          type = origType = tmp[1];
          namespaces = (tmp[2] || "").split(".").sort();
          if (!type) {
            continue;
          }
          special = jQuery.event.special[type] || {};
          type = (selector ? special.delegateType : special.bindType) || type;
          special = jQuery.event.special[type] || {};
          handleObj = jQuery.extend({
            type: type,
            origType: origType,
            data: data,
            handler: handler,
            guid: handler.guid,
            selector: selector,
            needsContext: selector && jQuery.expr.match.needsContext.test(selector),
            namespace: namespaces.join(".")
          }, handleObjIn);
          if (!(handlers = events[type])) {
            handlers = events[type] = [];
            handlers.delegateCount = 0;
            if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
              if (elem.addEventListener) {
                elem.addEventListener(type, eventHandle, false);
              }
            }
          }
          if (special.add) {
            special.add.call(elem, handleObj);
            if (!handleObj.handler.guid) {
              handleObj.handler.guid = handler.guid;
            }
          }
          if (selector) {
            handlers.splice(handlers.delegateCount++, 0, handleObj);
          } else {
            handlers.push(handleObj);
          }
          jQuery.event.global[type] = true;
        }
      },
      remove: function(elem, types, handler, selector, mappedTypes) {
        var j,
            origCount,
            tmp,
            events,
            t,
            handleObj,
            special,
            handlers,
            type,
            namespaces,
            origType,
            elemData = data_priv.hasData(elem) && data_priv.get(elem);
        if (!elemData || !(events = elemData.events)) {
          return;
        }
        types = (types || "").match(rnotwhite) || [""];
        t = types.length;
        while (t--) {
          tmp = rtypenamespace.exec(types[t]) || [];
          type = origType = tmp[1];
          namespaces = (tmp[2] || "").split(".").sort();
          if (!type) {
            for (type in events) {
              jQuery.event.remove(elem, type + types[t], handler, selector, true);
            }
            continue;
          }
          special = jQuery.event.special[type] || {};
          type = (selector ? special.delegateType : special.bindType) || type;
          handlers = events[type] || [];
          tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
          origCount = j = handlers.length;
          while (j--) {
            handleObj = handlers[j];
            if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
              handlers.splice(j, 1);
              if (handleObj.selector) {
                handlers.delegateCount--;
              }
              if (special.remove) {
                special.remove.call(elem, handleObj);
              }
            }
          }
          if (origCount && !handlers.length) {
            if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
              jQuery.removeEvent(elem, type, elemData.handle);
            }
            delete events[type];
          }
        }
        if (jQuery.isEmptyObject(events)) {
          delete elemData.handle;
          data_priv.remove(elem, "events");
        }
      },
      trigger: function(event, data, elem, onlyHandlers) {
        var i,
            cur,
            tmp,
            bubbleType,
            ontype,
            handle,
            special,
            eventPath = [elem || document],
            type = hasOwn.call(event, "type") ? event.type : event,
            namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
        cur = tmp = elem = elem || document;
        if (elem.nodeType === 3 || elem.nodeType === 8) {
          return;
        }
        if (rfocusMorph.test(type + jQuery.event.triggered)) {
          return;
        }
        if (type.indexOf(".") >= 0) {
          namespaces = type.split(".");
          type = namespaces.shift();
          namespaces.sort();
        }
        ontype = type.indexOf(":") < 0 && "on" + type;
        event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === "object" && event);
        event.isTrigger = onlyHandlers ? 2 : 3;
        event.namespace = namespaces.join(".");
        event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
        event.result = undefined;
        if (!event.target) {
          event.target = elem;
        }
        data = data == null ? [event] : jQuery.makeArray(data, [event]);
        special = jQuery.event.special[type] || {};
        if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
          return;
        }
        if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
          bubbleType = special.delegateType || type;
          if (!rfocusMorph.test(bubbleType + type)) {
            cur = cur.parentNode;
          }
          for (; cur; cur = cur.parentNode) {
            eventPath.push(cur);
            tmp = cur;
          }
          if (tmp === (elem.ownerDocument || document)) {
            eventPath.push(tmp.defaultView || tmp.parentWindow || window);
          }
        }
        i = 0;
        while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
          event.type = i > 1 ? bubbleType : special.bindType || type;
          handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle");
          if (handle) {
            handle.apply(cur, data);
          }
          handle = ontype && cur[ontype];
          if (handle && handle.apply && jQuery.acceptData(cur)) {
            event.result = handle.apply(cur, data);
            if (event.result === false) {
              event.preventDefault();
            }
          }
        }
        event.type = type;
        if (!onlyHandlers && !event.isDefaultPrevented()) {
          if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {
            if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {
              tmp = elem[ontype];
              if (tmp) {
                elem[ontype] = null;
              }
              jQuery.event.triggered = type;
              elem[type]();
              jQuery.event.triggered = undefined;
              if (tmp) {
                elem[ontype] = tmp;
              }
            }
          }
        }
        return event.result;
      },
      dispatch: function(event) {
        event = jQuery.event.fix(event);
        var i,
            j,
            ret,
            matched,
            handleObj,
            handlerQueue = [],
            args = slice.call(arguments),
            handlers = (data_priv.get(this, "events") || {})[event.type] || [],
            special = jQuery.event.special[event.type] || {};
        args[0] = event;
        event.delegateTarget = this;
        if (special.preDispatch && special.preDispatch.call(this, event) === false) {
          return;
        }
        handlerQueue = jQuery.event.handlers.call(this, event, handlers);
        i = 0;
        while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
          event.currentTarget = matched.elem;
          j = 0;
          while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
            if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
              event.handleObj = handleObj;
              event.data = handleObj.data;
              ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
              if (ret !== undefined) {
                if ((event.result = ret) === false) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            }
          }
        }
        if (special.postDispatch) {
          special.postDispatch.call(this, event);
        }
        return event.result;
      },
      handlers: function(event, handlers) {
        var i,
            matches,
            sel,
            handleObj,
            handlerQueue = [],
            delegateCount = handlers.delegateCount,
            cur = event.target;
        if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
          for (; cur !== this; cur = cur.parentNode || this) {
            if (cur.disabled !== true || event.type !== "click") {
              matches = [];
              for (i = 0; i < delegateCount; i++) {
                handleObj = handlers[i];
                sel = handleObj.selector + " ";
                if (matches[sel] === undefined) {
                  matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
                }
                if (matches[sel]) {
                  matches.push(handleObj);
                }
              }
              if (matches.length) {
                handlerQueue.push({
                  elem: cur,
                  handlers: matches
                });
              }
            }
          }
        }
        if (delegateCount < handlers.length) {
          handlerQueue.push({
            elem: this,
            handlers: handlers.slice(delegateCount)
          });
        }
        return handlerQueue;
      },
      props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
      fixHooks: {},
      keyHooks: {
        props: "char charCode key keyCode".split(" "),
        filter: function(event, original) {
          if (event.which == null) {
            event.which = original.charCode != null ? original.charCode : original.keyCode;
          }
          return event;
        }
      },
      mouseHooks: {
        props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
        filter: function(event, original) {
          var eventDoc,
              doc,
              body,
              button = original.button;
          if (event.pageX == null && original.clientX != null) {
            eventDoc = event.target.ownerDocument || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;
            event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
          }
          if (!event.which && button !== undefined) {
            event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
          }
          return event;
        }
      },
      fix: function(event) {
        if (event[jQuery.expando]) {
          return event;
        }
        var i,
            prop,
            copy,
            type = event.type,
            originalEvent = event,
            fixHook = this.fixHooks[type];
        if (!fixHook) {
          this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
        }
        copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
        event = new jQuery.Event(originalEvent);
        i = copy.length;
        while (i--) {
          prop = copy[i];
          event[prop] = originalEvent[prop];
        }
        if (!event.target) {
          event.target = document;
        }
        if (event.target.nodeType === 3) {
          event.target = event.target.parentNode;
        }
        return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
      },
      special: {
        load: {noBubble: true},
        focus: {
          trigger: function() {
            if (this !== safeActiveElement() && this.focus) {
              this.focus();
              return false;
            }
          },
          delegateType: "focusin"
        },
        blur: {
          trigger: function() {
            if (this === safeActiveElement() && this.blur) {
              this.blur();
              return false;
            }
          },
          delegateType: "focusout"
        },
        click: {
          trigger: function() {
            if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
              this.click();
              return false;
            }
          },
          _default: function(event) {
            return jQuery.nodeName(event.target, "a");
          }
        },
        beforeunload: {postDispatch: function(event) {
            if (event.result !== undefined && event.originalEvent) {
              event.originalEvent.returnValue = event.result;
            }
          }}
      },
      simulate: function(type, elem, event, bubble) {
        var e = jQuery.extend(new jQuery.Event(), event, {
          type: type,
          isSimulated: true,
          originalEvent: {}
        });
        if (bubble) {
          jQuery.event.trigger(e, null, elem);
        } else {
          jQuery.event.dispatch.call(elem, e);
        }
        if (e.isDefaultPrevented()) {
          event.preventDefault();
        }
      }
    };
    jQuery.removeEvent = function(elem, type, handle) {
      if (elem.removeEventListener) {
        elem.removeEventListener(type, handle, false);
      }
    };
    jQuery.Event = function(src, props) {
      if (!(this instanceof jQuery.Event)) {
        return new jQuery.Event(src, props);
      }
      if (src && src.type) {
        this.originalEvent = src;
        this.type = src.type;
        this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ? returnTrue : returnFalse;
      } else {
        this.type = src;
      }
      if (props) {
        jQuery.extend(this, props);
      }
      this.timeStamp = src && src.timeStamp || jQuery.now();
      this[jQuery.expando] = true;
    };
    jQuery.Event.prototype = {
      isDefaultPrevented: returnFalse,
      isPropagationStopped: returnFalse,
      isImmediatePropagationStopped: returnFalse,
      preventDefault: function() {
        var e = this.originalEvent;
        this.isDefaultPrevented = returnTrue;
        if (e && e.preventDefault) {
          e.preventDefault();
        }
      },
      stopPropagation: function() {
        var e = this.originalEvent;
        this.isPropagationStopped = returnTrue;
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
      },
      stopImmediatePropagation: function() {
        var e = this.originalEvent;
        this.isImmediatePropagationStopped = returnTrue;
        if (e && e.stopImmediatePropagation) {
          e.stopImmediatePropagation();
        }
        this.stopPropagation();
      }
    };
    jQuery.each({
      mouseenter: "mouseover",
      mouseleave: "mouseout",
      pointerenter: "pointerover",
      pointerleave: "pointerout"
    }, function(orig, fix) {
      jQuery.event.special[orig] = {
        delegateType: fix,
        bindType: fix,
        handle: function(event) {
          var ret,
              target = this,
              related = event.relatedTarget,
              handleObj = event.handleObj;
          if (!related || (related !== target && !jQuery.contains(target, related))) {
            event.type = handleObj.origType;
            ret = handleObj.handler.apply(this, arguments);
            event.type = fix;
          }
          return ret;
        }
      };
    });
    if (!support.focusinBubbles) {
      jQuery.each({
        focus: "focusin",
        blur: "focusout"
      }, function(orig, fix) {
        var handler = function(event) {
          jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
        };
        jQuery.event.special[fix] = {
          setup: function() {
            var doc = this.ownerDocument || this,
                attaches = data_priv.access(doc, fix);
            if (!attaches) {
              doc.addEventListener(orig, handler, true);
            }
            data_priv.access(doc, fix, (attaches || 0) + 1);
          },
          teardown: function() {
            var doc = this.ownerDocument || this,
                attaches = data_priv.access(doc, fix) - 1;
            if (!attaches) {
              doc.removeEventListener(orig, handler, true);
              data_priv.remove(doc, fix);
            } else {
              data_priv.access(doc, fix, attaches);
            }
          }
        };
      });
    }
    jQuery.fn.extend({
      on: function(types, selector, data, fn, one) {
        var origFn,
            type;
        if (typeof types === "object") {
          if (typeof selector !== "string") {
            data = data || selector;
            selector = undefined;
          }
          for (type in types) {
            this.on(type, selector, data, types[type], one);
          }
          return this;
        }
        if (data == null && fn == null) {
          fn = selector;
          data = selector = undefined;
        } else if (fn == null) {
          if (typeof selector === "string") {
            fn = data;
            data = undefined;
          } else {
            fn = data;
            data = selector;
            selector = undefined;
          }
        }
        if (fn === false) {
          fn = returnFalse;
        } else if (!fn) {
          return this;
        }
        if (one === 1) {
          origFn = fn;
          fn = function(event) {
            jQuery().off(event);
            return origFn.apply(this, arguments);
          };
          fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
        }
        return this.each(function() {
          jQuery.event.add(this, types, fn, data, selector);
        });
      },
      one: function(types, selector, data, fn) {
        return this.on(types, selector, data, fn, 1);
      },
      off: function(types, selector, fn) {
        var handleObj,
            type;
        if (types && types.preventDefault && types.handleObj) {
          handleObj = types.handleObj;
          jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
          return this;
        }
        if (typeof types === "object") {
          for (type in types) {
            this.off(type, selector, types[type]);
          }
          return this;
        }
        if (selector === false || typeof selector === "function") {
          fn = selector;
          selector = undefined;
        }
        if (fn === false) {
          fn = returnFalse;
        }
        return this.each(function() {
          jQuery.event.remove(this, types, fn, selector);
        });
      },
      trigger: function(type, data) {
        return this.each(function() {
          jQuery.event.trigger(type, data, this);
        });
      },
      triggerHandler: function(type, data) {
        var elem = this[0];
        if (elem) {
          return jQuery.event.trigger(type, data, elem, true);
        }
      }
    });
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style|link)/i,
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        wrapMap = {
          option: [1, "<select multiple='multiple'>", "</select>"],
          thead: [1, "<table>", "</table>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          tr: [2, "<table><tbody>", "</tbody></table>"],
          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
          _default: [0, "", ""]
        };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    function manipulationTarget(elem, content) {
      return jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
    }
    function disableScript(elem) {
      elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
      return elem;
    }
    function restoreScript(elem) {
      var match = rscriptTypeMasked.exec(elem.type);
      if (match) {
        elem.type = match[1];
      } else {
        elem.removeAttribute("type");
      }
      return elem;
    }
    function setGlobalEval(elems, refElements) {
      var i = 0,
          l = elems.length;
      for (; i < l; i++) {
        data_priv.set(elems[i], "globalEval", !refElements || data_priv.get(refElements[i], "globalEval"));
      }
    }
    function cloneCopyEvent(src, dest) {
      var i,
          l,
          type,
          pdataOld,
          pdataCur,
          udataOld,
          udataCur,
          events;
      if (dest.nodeType !== 1) {
        return;
      }
      if (data_priv.hasData(src)) {
        pdataOld = data_priv.access(src);
        pdataCur = data_priv.set(dest, pdataOld);
        events = pdataOld.events;
        if (events) {
          delete pdataCur.handle;
          pdataCur.events = {};
          for (type in events) {
            for (i = 0, l = events[type].length; i < l; i++) {
              jQuery.event.add(dest, type, events[type][i]);
            }
          }
        }
      }
      if (data_user.hasData(src)) {
        udataOld = data_user.access(src);
        udataCur = jQuery.extend({}, udataOld);
        data_user.set(dest, udataCur);
      }
    }
    function getAll(context, tag) {
      var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];
      return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], ret) : ret;
    }
    function fixInput(src, dest) {
      var nodeName = dest.nodeName.toLowerCase();
      if (nodeName === "input" && rcheckableType.test(src.type)) {
        dest.checked = src.checked;
      } else if (nodeName === "input" || nodeName === "textarea") {
        dest.defaultValue = src.defaultValue;
      }
    }
    jQuery.extend({
      clone: function(elem, dataAndEvents, deepDataAndEvents) {
        var i,
            l,
            srcElements,
            destElements,
            clone = elem.cloneNode(true),
            inPage = jQuery.contains(elem.ownerDocument, elem);
        if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
          destElements = getAll(clone);
          srcElements = getAll(elem);
          for (i = 0, l = srcElements.length; i < l; i++) {
            fixInput(srcElements[i], destElements[i]);
          }
        }
        if (dataAndEvents) {
          if (deepDataAndEvents) {
            srcElements = srcElements || getAll(elem);
            destElements = destElements || getAll(clone);
            for (i = 0, l = srcElements.length; i < l; i++) {
              cloneCopyEvent(srcElements[i], destElements[i]);
            }
          } else {
            cloneCopyEvent(elem, clone);
          }
        }
        destElements = getAll(clone, "script");
        if (destElements.length > 0) {
          setGlobalEval(destElements, !inPage && getAll(elem, "script"));
        }
        return clone;
      },
      buildFragment: function(elems, context, scripts, selection) {
        var elem,
            tmp,
            tag,
            wrap,
            contains,
            j,
            fragment = context.createDocumentFragment(),
            nodes = [],
            i = 0,
            l = elems.length;
        for (; i < l; i++) {
          elem = elems[i];
          if (elem || elem === 0) {
            if (jQuery.type(elem) === "object") {
              jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
            } else if (!rhtml.test(elem)) {
              nodes.push(context.createTextNode(elem));
            } else {
              tmp = tmp || fragment.appendChild(context.createElement("div"));
              tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
              wrap = wrapMap[tag] || wrapMap._default;
              tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
              j = wrap[0];
              while (j--) {
                tmp = tmp.lastChild;
              }
              jQuery.merge(nodes, tmp.childNodes);
              tmp = fragment.firstChild;
              tmp.textContent = "";
            }
          }
        }
        fragment.textContent = "";
        i = 0;
        while ((elem = nodes[i++])) {
          if (selection && jQuery.inArray(elem, selection) !== -1) {
            continue;
          }
          contains = jQuery.contains(elem.ownerDocument, elem);
          tmp = getAll(fragment.appendChild(elem), "script");
          if (contains) {
            setGlobalEval(tmp);
          }
          if (scripts) {
            j = 0;
            while ((elem = tmp[j++])) {
              if (rscriptType.test(elem.type || "")) {
                scripts.push(elem);
              }
            }
          }
        }
        return fragment;
      },
      cleanData: function(elems) {
        var data,
            elem,
            type,
            key,
            special = jQuery.event.special,
            i = 0;
        for (; (elem = elems[i]) !== undefined; i++) {
          if (jQuery.acceptData(elem)) {
            key = elem[data_priv.expando];
            if (key && (data = data_priv.cache[key])) {
              if (data.events) {
                for (type in data.events) {
                  if (special[type]) {
                    jQuery.event.remove(elem, type);
                  } else {
                    jQuery.removeEvent(elem, type, data.handle);
                  }
                }
              }
              if (data_priv.cache[key]) {
                delete data_priv.cache[key];
              }
            }
          }
          delete data_user.cache[elem[data_user.expando]];
        }
      }
    });
    jQuery.fn.extend({
      text: function(value) {
        return access(this, function(value) {
          return value === undefined ? jQuery.text(this) : this.empty().each(function() {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
              this.textContent = value;
            }
          });
        }, null, value, arguments.length);
      },
      append: function() {
        return this.domManip(arguments, function(elem) {
          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
            var target = manipulationTarget(this, elem);
            target.appendChild(elem);
          }
        });
      },
      prepend: function() {
        return this.domManip(arguments, function(elem) {
          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
            var target = manipulationTarget(this, elem);
            target.insertBefore(elem, target.firstChild);
          }
        });
      },
      before: function() {
        return this.domManip(arguments, function(elem) {
          if (this.parentNode) {
            this.parentNode.insertBefore(elem, this);
          }
        });
      },
      after: function() {
        return this.domManip(arguments, function(elem) {
          if (this.parentNode) {
            this.parentNode.insertBefore(elem, this.nextSibling);
          }
        });
      },
      remove: function(selector, keepData) {
        var elem,
            elems = selector ? jQuery.filter(selector, this) : this,
            i = 0;
        for (; (elem = elems[i]) != null; i++) {
          if (!keepData && elem.nodeType === 1) {
            jQuery.cleanData(getAll(elem));
          }
          if (elem.parentNode) {
            if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
              setGlobalEval(getAll(elem, "script"));
            }
            elem.parentNode.removeChild(elem);
          }
        }
        return this;
      },
      empty: function() {
        var elem,
            i = 0;
        for (; (elem = this[i]) != null; i++) {
          if (elem.nodeType === 1) {
            jQuery.cleanData(getAll(elem, false));
            elem.textContent = "";
          }
        }
        return this;
      },
      clone: function(dataAndEvents, deepDataAndEvents) {
        dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
        deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
        return this.map(function() {
          return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
        });
      },
      html: function(value) {
        return access(this, function(value) {
          var elem = this[0] || {},
              i = 0,
              l = this.length;
          if (value === undefined && elem.nodeType === 1) {
            return elem.innerHTML;
          }
          if (typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
            value = value.replace(rxhtmlTag, "<$1></$2>");
            try {
              for (; i < l; i++) {
                elem = this[i] || {};
                if (elem.nodeType === 1) {
                  jQuery.cleanData(getAll(elem, false));
                  elem.innerHTML = value;
                }
              }
              elem = 0;
            } catch (e) {}
          }
          if (elem) {
            this.empty().append(value);
          }
        }, null, value, arguments.length);
      },
      replaceWith: function() {
        var arg = arguments[0];
        this.domManip(arguments, function(elem) {
          arg = this.parentNode;
          jQuery.cleanData(getAll(this));
          if (arg) {
            arg.replaceChild(elem, this);
          }
        });
        return arg && (arg.length || arg.nodeType) ? this : this.remove();
      },
      detach: function(selector) {
        return this.remove(selector, true);
      },
      domManip: function(args, callback) {
        args = concat.apply([], args);
        var fragment,
            first,
            scripts,
            hasScripts,
            node,
            doc,
            i = 0,
            l = this.length,
            set = this,
            iNoClone = l - 1,
            value = args[0],
            isFunction = jQuery.isFunction(value);
        if (isFunction || (l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value))) {
          return this.each(function(index) {
            var self = set.eq(index);
            if (isFunction) {
              args[0] = value.call(this, index, self.html());
            }
            self.domManip(args, callback);
          });
        }
        if (l) {
          fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
          first = fragment.firstChild;
          if (fragment.childNodes.length === 1) {
            fragment = first;
          }
          if (first) {
            scripts = jQuery.map(getAll(fragment, "script"), disableScript);
            hasScripts = scripts.length;
            for (; i < l; i++) {
              node = fragment;
              if (i !== iNoClone) {
                node = jQuery.clone(node, true, true);
                if (hasScripts) {
                  jQuery.merge(scripts, getAll(node, "script"));
                }
              }
              callback.call(this[i], node, i);
            }
            if (hasScripts) {
              doc = scripts[scripts.length - 1].ownerDocument;
              jQuery.map(scripts, restoreScript);
              for (i = 0; i < hasScripts; i++) {
                node = scripts[i];
                if (rscriptType.test(node.type || "") && !data_priv.access(node, "globalEval") && jQuery.contains(doc, node)) {
                  if (node.src) {
                    if (jQuery._evalUrl) {
                      jQuery._evalUrl(node.src);
                    }
                  } else {
                    jQuery.globalEval(node.textContent.replace(rcleanScript, ""));
                  }
                }
              }
            }
          }
        }
        return this;
      }
    });
    jQuery.each({
      appendTo: "append",
      prependTo: "prepend",
      insertBefore: "before",
      insertAfter: "after",
      replaceAll: "replaceWith"
    }, function(name, original) {
      jQuery.fn[name] = function(selector) {
        var elems,
            ret = [],
            insert = jQuery(selector),
            last = insert.length - 1,
            i = 0;
        for (; i <= last; i++) {
          elems = i === last ? this : this.clone(true);
          jQuery(insert[i])[original](elems);
          push.apply(ret, elems.get());
        }
        return this.pushStack(ret);
      };
    });
    var iframe,
        elemdisplay = {};
    function actualDisplay(name, doc) {
      var style,
          elem = jQuery(doc.createElement(name)).appendTo(doc.body),
          display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ? style.display : jQuery.css(elem[0], "display");
      elem.detach();
      return display;
    }
    function defaultDisplay(nodeName) {
      var doc = document,
          display = elemdisplay[nodeName];
      if (!display) {
        display = actualDisplay(nodeName, doc);
        if (display === "none" || !display) {
          iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);
          doc = iframe[0].contentDocument;
          doc.write();
          doc.close();
          display = actualDisplay(nodeName, doc);
          iframe.detach();
        }
        elemdisplay[nodeName] = display;
      }
      return display;
    }
    var rmargin = (/^margin/);
    var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
    var getStyles = function(elem) {
      return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
    };
    function curCSS(elem, name, computed) {
      var width,
          minWidth,
          maxWidth,
          ret,
          style = elem.style;
      computed = computed || getStyles(elem);
      if (computed) {
        ret = computed.getPropertyValue(name) || computed[name];
      }
      if (computed) {
        if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
          ret = jQuery.style(elem, name);
        }
        if (rnumnonpx.test(ret) && rmargin.test(name)) {
          width = style.width;
          minWidth = style.minWidth;
          maxWidth = style.maxWidth;
          style.minWidth = style.maxWidth = style.width = ret;
          ret = computed.width;
          style.width = width;
          style.minWidth = minWidth;
          style.maxWidth = maxWidth;
        }
      }
      return ret !== undefined ? ret + "" : ret;
    }
    function addGetHookIf(conditionFn, hookFn) {
      return {get: function() {
          if (conditionFn()) {
            delete this.get;
            return;
          }
          return (this.get = hookFn).apply(this, arguments);
        }};
    }
    (function() {
      var pixelPositionVal,
          boxSizingReliableVal,
          docElem = document.documentElement,
          container = document.createElement("div"),
          div = document.createElement("div");
      if (!div.style) {
        return;
      }
      div.style.backgroundClip = "content-box";
      div.cloneNode(true).style.backgroundClip = "";
      support.clearCloneStyle = div.style.backgroundClip === "content-box";
      container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" + "position:absolute";
      container.appendChild(div);
      function computePixelPositionAndBoxSizingReliable() {
        div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" + "box-sizing:border-box;display:block;margin-top:1%;top:1%;" + "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        docElem.appendChild(container);
        var divStyle = window.getComputedStyle(div, null);
        pixelPositionVal = divStyle.top !== "1%";
        boxSizingReliableVal = divStyle.width === "4px";
        docElem.removeChild(container);
      }
      if (window.getComputedStyle) {
        jQuery.extend(support, {
          pixelPosition: function() {
            computePixelPositionAndBoxSizingReliable();
            return pixelPositionVal;
          },
          boxSizingReliable: function() {
            if (boxSizingReliableVal == null) {
              computePixelPositionAndBoxSizingReliable();
            }
            return boxSizingReliableVal;
          },
          reliableMarginRight: function() {
            var ret,
                marginDiv = div.appendChild(document.createElement("div"));
            marginDiv.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" + "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
            marginDiv.style.marginRight = marginDiv.style.width = "0";
            div.style.width = "1px";
            docElem.appendChild(container);
            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
            docElem.removeChild(container);
            return ret;
          }
        });
      }
    })();
    jQuery.swap = function(elem, options, callback, args) {
      var ret,
          name,
          old = {};
      for (name in options) {
        old[name] = elem.style[name];
        elem.style[name] = options[name];
      }
      ret = callback.apply(elem, args || []);
      for (name in options) {
        elem.style[name] = old[name];
      }
      return ret;
    };
    var rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
        rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
        cssShow = {
          position: "absolute",
          visibility: "hidden",
          display: "block"
        },
        cssNormalTransform = {
          letterSpacing: "0",
          fontWeight: "400"
        },
        cssPrefixes = ["Webkit", "O", "Moz", "ms"];
    function vendorPropName(style, name) {
      if (name in style) {
        return name;
      }
      var capName = name[0].toUpperCase() + name.slice(1),
          origName = name,
          i = cssPrefixes.length;
      while (i--) {
        name = cssPrefixes[i] + capName;
        if (name in style) {
          return name;
        }
      }
      return origName;
    }
    function setPositiveNumber(elem, value, subtract) {
      var matches = rnumsplit.exec(value);
      return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
    }
    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
      var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,
          val = 0;
      for (; i < 4; i += 2) {
        if (extra === "margin") {
          val += jQuery.css(elem, extra + cssExpand[i], true, styles);
        }
        if (isBorderBox) {
          if (extra === "content") {
            val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
          }
          if (extra !== "margin") {
            val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
          }
        } else {
          val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
          if (extra !== "padding") {
            val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
          }
        }
      }
      return val;
    }
    function getWidthOrHeight(elem, name, extra) {
      var valueIsBorderBox = true,
          val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
          styles = getStyles(elem),
          isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";
      if (val <= 0 || val == null) {
        val = curCSS(elem, name, styles);
        if (val < 0 || val == null) {
          val = elem.style[name];
        }
        if (rnumnonpx.test(val)) {
          return val;
        }
        valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
        val = parseFloat(val) || 0;
      }
      return (val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles)) + "px";
    }
    function showHide(elements, show) {
      var display,
          elem,
          hidden,
          values = [],
          index = 0,
          length = elements.length;
      for (; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
          continue;
        }
        values[index] = data_priv.get(elem, "olddisplay");
        display = elem.style.display;
        if (show) {
          if (!values[index] && display === "none") {
            elem.style.display = "";
          }
          if (elem.style.display === "" && isHidden(elem)) {
            values[index] = data_priv.access(elem, "olddisplay", defaultDisplay(elem.nodeName));
          }
        } else {
          hidden = isHidden(elem);
          if (display !== "none" || !hidden) {
            data_priv.set(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
          }
        }
      }
      for (index = 0; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
          continue;
        }
        if (!show || elem.style.display === "none" || elem.style.display === "") {
          elem.style.display = show ? values[index] || "" : "none";
        }
      }
      return elements;
    }
    jQuery.extend({
      cssHooks: {opacity: {get: function(elem, computed) {
            if (computed) {
              var ret = curCSS(elem, "opacity");
              return ret === "" ? "1" : ret;
            }
          }}},
      cssNumber: {
        "columnCount": true,
        "fillOpacity": true,
        "flexGrow": true,
        "flexShrink": true,
        "fontWeight": true,
        "lineHeight": true,
        "opacity": true,
        "order": true,
        "orphans": true,
        "widows": true,
        "zIndex": true,
        "zoom": true
      },
      cssProps: {"float": "cssFloat"},
      style: function(elem, name, value, extra) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
          return;
        }
        var ret,
            type,
            hooks,
            origName = jQuery.camelCase(name),
            style = elem.style;
        name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
        if (value !== undefined) {
          type = typeof value;
          if (type === "string" && (ret = rrelNum.exec(value))) {
            value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
            type = "number";
          }
          if (value == null || value !== value) {
            return;
          }
          if (type === "number" && !jQuery.cssNumber[origName]) {
            value += "px";
          }
          if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
            style[name] = "inherit";
          }
          if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
            style[name] = value;
          }
        } else {
          if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
            return ret;
          }
          return style[name];
        }
      },
      css: function(elem, name, extra, styles) {
        var val,
            num,
            hooks,
            origName = jQuery.camelCase(name);
        name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
        if (hooks && "get" in hooks) {
          val = hooks.get(elem, true, extra);
        }
        if (val === undefined) {
          val = curCSS(elem, name, styles);
        }
        if (val === "normal" && name in cssNormalTransform) {
          val = cssNormalTransform[name];
        }
        if (extra === "" || extra) {
          num = parseFloat(val);
          return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
        }
        return val;
      }
    });
    jQuery.each(["height", "width"], function(i, name) {
      jQuery.cssHooks[name] = {
        get: function(elem, computed, extra) {
          if (computed) {
            return rdisplayswap.test(jQuery.css(elem, "display")) && elem.offsetWidth === 0 ? jQuery.swap(elem, cssShow, function() {
              return getWidthOrHeight(elem, name, extra);
            }) : getWidthOrHeight(elem, name, extra);
          }
        },
        set: function(elem, value, extra) {
          var styles = extra && getStyles(elem);
          return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles) : 0);
        }
      };
    });
    jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(elem, computed) {
      if (computed) {
        return jQuery.swap(elem, {"display": "inline-block"}, curCSS, [elem, "marginRight"]);
      }
    });
    jQuery.each({
      margin: "",
      padding: "",
      border: "Width"
    }, function(prefix, suffix) {
      jQuery.cssHooks[prefix + suffix] = {expand: function(value) {
          var i = 0,
              expanded = {},
              parts = typeof value === "string" ? value.split(" ") : [value];
          for (; i < 4; i++) {
            expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
          }
          return expanded;
        }};
      if (!rmargin.test(prefix)) {
        jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
      }
    });
    jQuery.fn.extend({
      css: function(name, value) {
        return access(this, function(elem, name, value) {
          var styles,
              len,
              map = {},
              i = 0;
          if (jQuery.isArray(name)) {
            styles = getStyles(elem);
            len = name.length;
            for (; i < len; i++) {
              map[name[i]] = jQuery.css(elem, name[i], false, styles);
            }
            return map;
          }
          return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
        }, name, value, arguments.length > 1);
      },
      show: function() {
        return showHide(this, true);
      },
      hide: function() {
        return showHide(this);
      },
      toggle: function(state) {
        if (typeof state === "boolean") {
          return state ? this.show() : this.hide();
        }
        return this.each(function() {
          if (isHidden(this)) {
            jQuery(this).show();
          } else {
            jQuery(this).hide();
          }
        });
      }
    });
    jQuery.fn.delay = function(time, type) {
      time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
      type = type || "fx";
      return this.queue(type, function(next, hooks) {
        var timeout = setTimeout(next, time);
        hooks.stop = function() {
          clearTimeout(timeout);
        };
      });
    };
    (function() {
      var input = document.createElement("input"),
          select = document.createElement("select"),
          opt = select.appendChild(document.createElement("option"));
      input.type = "checkbox";
      support.checkOn = input.value !== "";
      support.optSelected = opt.selected;
      select.disabled = true;
      support.optDisabled = !opt.disabled;
      input = document.createElement("input");
      input.value = "t";
      input.type = "radio";
      support.radioValue = input.value === "t";
    })();
    var nodeHook,
        boolHook,
        attrHandle = jQuery.expr.attrHandle;
    jQuery.fn.extend({
      attr: function(name, value) {
        return access(this, jQuery.attr, name, value, arguments.length > 1);
      },
      removeAttr: function(name) {
        return this.each(function() {
          jQuery.removeAttr(this, name);
        });
      }
    });
    jQuery.extend({
      attr: function(elem, name, value) {
        var hooks,
            ret,
            nType = elem.nodeType;
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
          return;
        }
        if (typeof elem.getAttribute === strundefined) {
          return jQuery.prop(elem, name, value);
        }
        if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
          name = name.toLowerCase();
          hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
        }
        if (value !== undefined) {
          if (value === null) {
            jQuery.removeAttr(elem, name);
          } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
            return ret;
          } else {
            elem.setAttribute(name, value + "");
            return value;
          }
        } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
          return ret;
        } else {
          ret = jQuery.find.attr(elem, name);
          return ret == null ? undefined : ret;
        }
      },
      removeAttr: function(elem, value) {
        var name,
            propName,
            i = 0,
            attrNames = value && value.match(rnotwhite);
        if (attrNames && elem.nodeType === 1) {
          while ((name = attrNames[i++])) {
            propName = jQuery.propFix[name] || name;
            if (jQuery.expr.match.bool.test(name)) {
              elem[propName] = false;
            }
            elem.removeAttribute(name);
          }
        }
      },
      attrHooks: {type: {set: function(elem, value) {
            if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
              var val = elem.value;
              elem.setAttribute("type", value);
              if (val) {
                elem.value = val;
              }
              return value;
            }
          }}}
    });
    boolHook = {set: function(elem, value, name) {
        if (value === false) {
          jQuery.removeAttr(elem, name);
        } else {
          elem.setAttribute(name, name);
        }
        return name;
      }};
    jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
      var getter = attrHandle[name] || jQuery.find.attr;
      attrHandle[name] = function(elem, name, isXML) {
        var ret,
            handle;
        if (!isXML) {
          handle = attrHandle[name];
          attrHandle[name] = ret;
          ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
          attrHandle[name] = handle;
        }
        return ret;
      };
    });
    var rfocusable = /^(?:input|select|textarea|button)$/i;
    jQuery.fn.extend({
      prop: function(name, value) {
        return access(this, jQuery.prop, name, value, arguments.length > 1);
      },
      removeProp: function(name) {
        return this.each(function() {
          delete this[jQuery.propFix[name] || name];
        });
      }
    });
    jQuery.extend({
      propFix: {
        "for": "htmlFor",
        "class": "className"
      },
      prop: function(elem, name, value) {
        var ret,
            hooks,
            notxml,
            nType = elem.nodeType;
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
          return;
        }
        notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
        if (notxml) {
          name = jQuery.propFix[name] || name;
          hooks = jQuery.propHooks[name];
        }
        if (value !== undefined) {
          return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : (elem[name] = value);
        } else {
          return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
        }
      },
      propHooks: {tabIndex: {get: function(elem) {
            return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
          }}}
    });
    if (!support.optSelected) {
      jQuery.propHooks.selected = {get: function(elem) {
          var parent = elem.parentNode;
          if (parent && parent.parentNode) {
            parent.parentNode.selectedIndex;
          }
          return null;
        }};
    }
    jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
      jQuery.propFix[this.toLowerCase()] = this;
    });
    var rclass = /[\t\r\n\f]/g;
    jQuery.fn.extend({
      addClass: function(value) {
        var classes,
            elem,
            cur,
            clazz,
            j,
            finalValue,
            proceed = typeof value === "string" && value,
            i = 0,
            len = this.length;
        if (jQuery.isFunction(value)) {
          return this.each(function(j) {
            jQuery(this).addClass(value.call(this, j, this.className));
          });
        }
        if (proceed) {
          classes = (value || "").match(rnotwhite) || [];
          for (; i < len; i++) {
            elem = this[i];
            cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");
            if (cur) {
              j = 0;
              while ((clazz = classes[j++])) {
                if (cur.indexOf(" " + clazz + " ") < 0) {
                  cur += clazz + " ";
                }
              }
              finalValue = jQuery.trim(cur);
              if (elem.className !== finalValue) {
                elem.className = finalValue;
              }
            }
          }
        }
        return this;
      },
      removeClass: function(value) {
        var classes,
            elem,
            cur,
            clazz,
            j,
            finalValue,
            proceed = arguments.length === 0 || typeof value === "string" && value,
            i = 0,
            len = this.length;
        if (jQuery.isFunction(value)) {
          return this.each(function(j) {
            jQuery(this).removeClass(value.call(this, j, this.className));
          });
        }
        if (proceed) {
          classes = (value || "").match(rnotwhite) || [];
          for (; i < len; i++) {
            elem = this[i];
            cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");
            if (cur) {
              j = 0;
              while ((clazz = classes[j++])) {
                while (cur.indexOf(" " + clazz + " ") >= 0) {
                  cur = cur.replace(" " + clazz + " ", " ");
                }
              }
              finalValue = value ? jQuery.trim(cur) : "";
              if (elem.className !== finalValue) {
                elem.className = finalValue;
              }
            }
          }
        }
        return this;
      },
      toggleClass: function(value, stateVal) {
        var type = typeof value;
        if (typeof stateVal === "boolean" && type === "string") {
          return stateVal ? this.addClass(value) : this.removeClass(value);
        }
        if (jQuery.isFunction(value)) {
          return this.each(function(i) {
            jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
          });
        }
        return this.each(function() {
          if (type === "string") {
            var className,
                i = 0,
                self = jQuery(this),
                classNames = value.match(rnotwhite) || [];
            while ((className = classNames[i++])) {
              if (self.hasClass(className)) {
                self.removeClass(className);
              } else {
                self.addClass(className);
              }
            }
          } else if (type === strundefined || type === "boolean") {
            if (this.className) {
              data_priv.set(this, "__className__", this.className);
            }
            this.className = this.className || value === false ? "" : data_priv.get(this, "__className__") || "";
          }
        });
      },
      hasClass: function(selector) {
        var className = " " + selector + " ",
            i = 0,
            l = this.length;
        for (; i < l; i++) {
          if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
            return true;
          }
        }
        return false;
      }
    });
    var rreturn = /\r/g;
    jQuery.fn.extend({val: function(value) {
        var hooks,
            ret,
            isFunction,
            elem = this[0];
        if (!arguments.length) {
          if (elem) {
            hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
            if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
              return ret;
            }
            ret = elem.value;
            return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
          }
          return;
        }
        isFunction = jQuery.isFunction(value);
        return this.each(function(i) {
          var val;
          if (this.nodeType !== 1) {
            return;
          }
          if (isFunction) {
            val = value.call(this, i, jQuery(this).val());
          } else {
            val = value;
          }
          if (val == null) {
            val = "";
          } else if (typeof val === "number") {
            val += "";
          } else if (jQuery.isArray(val)) {
            val = jQuery.map(val, function(value) {
              return value == null ? "" : value + "";
            });
          }
          hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
          if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
            this.value = val;
          }
        });
      }});
    jQuery.extend({valHooks: {
        option: {get: function(elem) {
            var val = jQuery.find.attr(elem, "value");
            return val != null ? val : jQuery.trim(jQuery.text(elem));
          }},
        select: {
          get: function(elem) {
            var value,
                option,
                options = elem.options,
                index = elem.selectedIndex,
                one = elem.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0;
            for (; i < max; i++) {
              option = options[i];
              if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                value = jQuery(option).val();
                if (one) {
                  return value;
                }
                values.push(value);
              }
            }
            return values;
          },
          set: function(elem, value) {
            var optionSet,
                option,
                options = elem.options,
                values = jQuery.makeArray(value),
                i = options.length;
            while (i--) {
              option = options[i];
              if ((option.selected = jQuery.inArray(option.value, values) >= 0)) {
                optionSet = true;
              }
            }
            if (!optionSet) {
              elem.selectedIndex = -1;
            }
            return values;
          }
        }
      }});
    jQuery.each(["radio", "checkbox"], function() {
      jQuery.valHooks[this] = {set: function(elem, value) {
          if (jQuery.isArray(value)) {
            return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
          }
        }};
      if (!support.checkOn) {
        jQuery.valHooks[this].get = function(elem) {
          return elem.getAttribute("value") === null ? "on" : elem.value;
        };
      }
    });
    var nonce = jQuery.now();
    var rquery = (/\?/);
    jQuery.parseJSON = function(data) {
      return JSON.parse(data + "");
    };
    jQuery.parseXML = function(data) {
      var xml,
          tmp;
      if (!data || typeof data !== "string") {
        return null;
      }
      try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, "text/xml");
      } catch (e) {
        xml = undefined;
      }
      if (!xml || xml.getElementsByTagName("parsererror").length) {
        jQuery.error("Invalid XML: " + data);
      }
      return xml;
    };
    var ajaxLocParts,
        ajaxLocation,
        rhash = /#.*$/,
        rts = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        prefilters = {},
        transports = {},
        allTypes = "*/".concat("*");
    try {
      ajaxLocation = location.href;
    } catch (e) {
      ajaxLocation = document.createElement("a");
      ajaxLocation.href = "";
      ajaxLocation = ajaxLocation.href;
    }
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
    function addToPrefiltersOrTransports(structure) {
      return function(dataTypeExpression, func) {
        if (typeof dataTypeExpression !== "string") {
          func = dataTypeExpression;
          dataTypeExpression = "*";
        }
        var dataType,
            i = 0,
            dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
        if (jQuery.isFunction(func)) {
          while ((dataType = dataTypes[i++])) {
            if (dataType[0] === "+") {
              dataType = dataType.slice(1) || "*";
              (structure[dataType] = structure[dataType] || []).unshift(func);
            } else {
              (structure[dataType] = structure[dataType] || []).push(func);
            }
          }
        }
      };
    }
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
      var inspected = {},
          seekingTransport = (structure === transports);
      function inspect(dataType) {
        var selected;
        inspected[dataType] = true;
        jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
          var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
          if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
            options.dataTypes.unshift(dataTypeOrTransport);
            inspect(dataTypeOrTransport);
            return false;
          } else if (seekingTransport) {
            return !(selected = dataTypeOrTransport);
          }
        });
        return selected;
      }
      return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
    }
    function ajaxExtend(target, src) {
      var key,
          deep,
          flatOptions = jQuery.ajaxSettings.flatOptions || {};
      for (key in src) {
        if (src[key] !== undefined) {
          (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
        }
      }
      if (deep) {
        jQuery.extend(true, target, deep);
      }
      return target;
    }
    function ajaxHandleResponses(s, jqXHR, responses) {
      var ct,
          type,
          finalDataType,
          firstDataType,
          contents = s.contents,
          dataTypes = s.dataTypes;
      while (dataTypes[0] === "*") {
        dataTypes.shift();
        if (ct === undefined) {
          ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
        }
      }
      if (ct) {
        for (type in contents) {
          if (contents[type] && contents[type].test(ct)) {
            dataTypes.unshift(type);
            break;
          }
        }
      }
      if (dataTypes[0] in responses) {
        finalDataType = dataTypes[0];
      } else {
        for (type in responses) {
          if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
            finalDataType = type;
            break;
          }
          if (!firstDataType) {
            firstDataType = type;
          }
        }
        finalDataType = finalDataType || firstDataType;
      }
      if (finalDataType) {
        if (finalDataType !== dataTypes[0]) {
          dataTypes.unshift(finalDataType);
        }
        return responses[finalDataType];
      }
    }
    function ajaxConvert(s, response, jqXHR, isSuccess) {
      var conv2,
          current,
          conv,
          tmp,
          prev,
          converters = {},
          dataTypes = s.dataTypes.slice();
      if (dataTypes[1]) {
        for (conv in s.converters) {
          converters[conv.toLowerCase()] = s.converters[conv];
        }
      }
      current = dataTypes.shift();
      while (current) {
        if (s.responseFields[current]) {
          jqXHR[s.responseFields[current]] = response;
        }
        if (!prev && isSuccess && s.dataFilter) {
          response = s.dataFilter(response, s.dataType);
        }
        prev = current;
        current = dataTypes.shift();
        if (current) {
          if (current === "*") {
            current = prev;
          } else if (prev !== "*" && prev !== current) {
            conv = converters[prev + " " + current] || converters["* " + current];
            if (!conv) {
              for (conv2 in converters) {
                tmp = conv2.split(" ");
                if (tmp[1] === current) {
                  conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                  if (conv) {
                    if (conv === true) {
                      conv = converters[conv2];
                    } else if (converters[conv2] !== true) {
                      current = tmp[0];
                      dataTypes.unshift(tmp[1]);
                    }
                    break;
                  }
                }
              }
            }
            if (conv !== true) {
              if (conv && s["throws"]) {
                response = conv(response);
              } else {
                try {
                  response = conv(response);
                } catch (e) {
                  return {
                    state: "parsererror",
                    error: conv ? e : "No conversion from " + prev + " to " + current
                  };
                }
              }
            }
          }
        }
      }
      return {
        state: "success",
        data: response
      };
    }
    jQuery.extend({
      active: 0,
      lastModified: {},
      etag: {},
      ajaxSettings: {
        url: ajaxLocation,
        type: "GET",
        isLocal: rlocalProtocol.test(ajaxLocParts[1]),
        global: true,
        processData: true,
        async: true,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        accepts: {
          "*": allTypes,
          text: "text/plain",
          html: "text/html",
          xml: "application/xml, text/xml",
          json: "application/json, text/javascript"
        },
        contents: {
          xml: /xml/,
          html: /html/,
          json: /json/
        },
        responseFields: {
          xml: "responseXML",
          text: "responseText",
          json: "responseJSON"
        },
        converters: {
          "* text": String,
          "text html": true,
          "text json": jQuery.parseJSON,
          "text xml": jQuery.parseXML
        },
        flatOptions: {
          url: true,
          context: true
        }
      },
      ajaxSetup: function(target, settings) {
        return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
      },
      ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
      ajaxTransport: addToPrefiltersOrTransports(transports),
      ajax: function(url, options) {
        if (typeof url === "object") {
          options = url;
          url = undefined;
        }
        options = options || {};
        var transport,
            cacheURL,
            responseHeadersString,
            responseHeaders,
            timeoutTimer,
            parts,
            fireGlobals,
            i,
            s = jQuery.ajaxSetup({}, options),
            callbackContext = s.context || s,
            globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,
            deferred = jQuery.Deferred(),
            completeDeferred = jQuery.Callbacks("once memory"),
            statusCode = s.statusCode || {},
            requestHeaders = {},
            requestHeadersNames = {},
            state = 0,
            strAbort = "canceled",
            jqXHR = {
              readyState: 0,
              getResponseHeader: function(key) {
                var match;
                if (state === 2) {
                  if (!responseHeaders) {
                    responseHeaders = {};
                    while ((match = rheaders.exec(responseHeadersString))) {
                      responseHeaders[match[1].toLowerCase()] = match[2];
                    }
                  }
                  match = responseHeaders[key.toLowerCase()];
                }
                return match == null ? null : match;
              },
              getAllResponseHeaders: function() {
                return state === 2 ? responseHeadersString : null;
              },
              setRequestHeader: function(name, value) {
                var lname = name.toLowerCase();
                if (!state) {
                  name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                  requestHeaders[name] = value;
                }
                return this;
              },
              overrideMimeType: function(type) {
                if (!state) {
                  s.mimeType = type;
                }
                return this;
              },
              statusCode: function(map) {
                var code;
                if (map) {
                  if (state < 2) {
                    for (code in map) {
                      statusCode[code] = [statusCode[code], map[code]];
                    }
                  } else {
                    jqXHR.always(map[jqXHR.status]);
                  }
                }
                return this;
              },
              abort: function(statusText) {
                var finalText = statusText || strAbort;
                if (transport) {
                  transport.abort(finalText);
                }
                done(0, finalText);
                return this;
              }
            };
        deferred.promise(jqXHR).complete = completeDeferred.add;
        jqXHR.success = jqXHR.done;
        jqXHR.error = jqXHR.fail;
        s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
        s.type = options.method || options.type || s.method || s.type;
        s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];
        if (s.crossDomain == null) {
          parts = rurl.exec(s.url.toLowerCase());
          s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
        }
        if (s.data && s.processData && typeof s.data !== "string") {
          s.data = jQuery.param(s.data, s.traditional);
        }
        inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
        if (state === 2) {
          return jqXHR;
        }
        fireGlobals = s.global;
        if (fireGlobals && jQuery.active++ === 0) {
          jQuery.event.trigger("ajaxStart");
        }
        s.type = s.type.toUpperCase();
        s.hasContent = !rnoContent.test(s.type);
        cacheURL = s.url;
        if (!s.hasContent) {
          if (s.data) {
            cacheURL = (s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data);
            delete s.data;
          }
          if (s.cache === false) {
            s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
          }
        }
        if (s.ifModified) {
          if (jQuery.lastModified[cacheURL]) {
            jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
          }
          if (jQuery.etag[cacheURL]) {
            jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
          }
        }
        if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
          jqXHR.setRequestHeader("Content-Type", s.contentType);
        }
        jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
        for (i in s.headers) {
          jqXHR.setRequestHeader(i, s.headers[i]);
        }
        if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
          return jqXHR.abort();
        }
        strAbort = "abort";
        for (i in {
          success: 1,
          error: 1,
          complete: 1
        }) {
          jqXHR[i](s[i]);
        }
        transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
        if (!transport) {
          done(-1, "No Transport");
        } else {
          jqXHR.readyState = 1;
          if (fireGlobals) {
            globalEventContext.trigger("ajaxSend", [jqXHR, s]);
          }
          if (s.async && s.timeout > 0) {
            timeoutTimer = setTimeout(function() {
              jqXHR.abort("timeout");
            }, s.timeout);
          }
          try {
            state = 1;
            transport.send(requestHeaders, done);
          } catch (e) {
            if (state < 2) {
              done(-1, e);
            } else {
              throw e;
            }
          }
        }
        function done(status, nativeStatusText, responses, headers) {
          var isSuccess,
              success,
              error,
              response,
              modified,
              statusText = nativeStatusText;
          if (state === 2) {
            return;
          }
          state = 2;
          if (timeoutTimer) {
            clearTimeout(timeoutTimer);
          }
          transport = undefined;
          responseHeadersString = headers || "";
          jqXHR.readyState = status > 0 ? 4 : 0;
          isSuccess = status >= 200 && status < 300 || status === 304;
          if (responses) {
            response = ajaxHandleResponses(s, jqXHR, responses);
          }
          response = ajaxConvert(s, response, jqXHR, isSuccess);
          if (isSuccess) {
            if (s.ifModified) {
              modified = jqXHR.getResponseHeader("Last-Modified");
              if (modified) {
                jQuery.lastModified[cacheURL] = modified;
              }
              modified = jqXHR.getResponseHeader("etag");
              if (modified) {
                jQuery.etag[cacheURL] = modified;
              }
            }
            if (status === 204 || s.type === "HEAD") {
              statusText = "nocontent";
            } else if (status === 304) {
              statusText = "notmodified";
            } else {
              statusText = response.state;
              success = response.data;
              error = response.error;
              isSuccess = !error;
            }
          } else {
            error = statusText;
            if (status || !statusText) {
              statusText = "error";
              if (status < 0) {
                status = 0;
              }
            }
          }
          jqXHR.status = status;
          jqXHR.statusText = (nativeStatusText || statusText) + "";
          if (isSuccess) {
            deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
          } else {
            deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
          }
          jqXHR.statusCode(statusCode);
          statusCode = undefined;
          if (fireGlobals) {
            globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
          }
          completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
          if (fireGlobals) {
            globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
            if (!(--jQuery.active)) {
              jQuery.event.trigger("ajaxStop");
            }
          }
        }
        return jqXHR;
      },
      getJSON: function(url, data, callback) {
        return jQuery.get(url, data, callback, "json");
      },
      getScript: function(url, callback) {
        return jQuery.get(url, undefined, callback, "script");
      }
    });
    jQuery.each(["get", "post"], function(i, method) {
      jQuery[method] = function(url, data, callback, type) {
        if (jQuery.isFunction(data)) {
          type = type || callback;
          callback = data;
          data = undefined;
        }
        return jQuery.ajax({
          url: url,
          type: method,
          dataType: type,
          data: data,
          success: callback
        });
      };
    });
    jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
      jQuery.fn[type] = function(fn) {
        return this.on(type, fn);
      };
    });
    jQuery._evalUrl = function(url) {
      return jQuery.ajax({
        url: url,
        type: "GET",
        dataType: "script",
        async: false,
        global: false,
        "throws": true
      });
    };
    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
        rsubmittable = /^(?:input|select|textarea|keygen)/i;
    function buildParams(prefix, obj, traditional, add) {
      var name;
      if (jQuery.isArray(obj)) {
        jQuery.each(obj, function(i, v) {
          if (traditional || rbracket.test(prefix)) {
            add(prefix, v);
          } else {
            buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
          }
        });
      } else if (!traditional && jQuery.type(obj) === "object") {
        for (name in obj) {
          buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
        }
      } else {
        add(prefix, obj);
      }
    }
    jQuery.param = function(a, traditional) {
      var prefix,
          s = [],
          add = function(key, value) {
            value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
          };
      if (traditional === undefined) {
        traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
      }
      if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
        jQuery.each(a, function() {
          add(this.name, this.value);
        });
      } else {
        for (prefix in a) {
          buildParams(prefix, a[prefix], traditional, add);
        }
      }
      return s.join("&").replace(r20, "+");
    };
    jQuery.fn.extend({
      serialize: function() {
        return jQuery.param(this.serializeArray());
      },
      serializeArray: function() {
        return this.map(function() {
          var elements = jQuery.prop(this, "elements");
          return elements ? jQuery.makeArray(elements) : this;
        }).filter(function() {
          var type = this.type;
          return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
        }).map(function(i, elem) {
          var val = jQuery(this).val();
          return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
            return {
              name: elem.name,
              value: val.replace(rCRLF, "\r\n")
            };
          }) : {
            name: elem.name,
            value: val.replace(rCRLF, "\r\n")
          };
        }).get();
      }
    });
    jQuery.ajaxSettings.xhr = function() {
      try {
        return new XMLHttpRequest();
      } catch (e) {}
    };
    var xhrId = 0,
        xhrCallbacks = {},
        xhrSuccessStatus = {
          0: 200,
          1223: 204
        },
        xhrSupported = jQuery.ajaxSettings.xhr();
    if (window.ActiveXObject) {
      jQuery(window).on("unload", function() {
        for (var key in xhrCallbacks) {
          xhrCallbacks[key]();
        }
      });
    }
    support.cors = !!xhrSupported && ("withCredentials" in xhrSupported);
    support.ajax = xhrSupported = !!xhrSupported;
    jQuery.ajaxTransport(function(options) {
      var callback;
      if (support.cors || xhrSupported && !options.crossDomain) {
        return {
          send: function(headers, complete) {
            var i,
                xhr = options.xhr(),
                id = ++xhrId;
            xhr.open(options.type, options.url, options.async, options.username, options.password);
            if (options.xhrFields) {
              for (i in options.xhrFields) {
                xhr[i] = options.xhrFields[i];
              }
            }
            if (options.mimeType && xhr.overrideMimeType) {
              xhr.overrideMimeType(options.mimeType);
            }
            if (!options.crossDomain && !headers["X-Requested-With"]) {
              headers["X-Requested-With"] = "XMLHttpRequest";
            }
            for (i in headers) {
              xhr.setRequestHeader(i, headers[i]);
            }
            callback = function(type) {
              return function() {
                if (callback) {
                  delete xhrCallbacks[id];
                  callback = xhr.onload = xhr.onerror = null;
                  if (type === "abort") {
                    xhr.abort();
                  } else if (type === "error") {
                    complete(xhr.status, xhr.statusText);
                  } else {
                    complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, typeof xhr.responseText === "string" ? {text: xhr.responseText} : undefined, xhr.getAllResponseHeaders());
                  }
                }
              };
            };
            xhr.onload = callback();
            xhr.onerror = callback("error");
            callback = xhrCallbacks[id] = callback("abort");
            try {
              xhr.send(options.hasContent && options.data || null);
            } catch (e) {
              if (callback) {
                throw e;
              }
            }
          },
          abort: function() {
            if (callback) {
              callback();
            }
          }
        };
      }
    });
    jQuery.ajaxSetup({
      accepts: {script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},
      contents: {script: /(?:java|ecma)script/},
      converters: {"text script": function(text) {
          jQuery.globalEval(text);
          return text;
        }}
    });
    jQuery.ajaxPrefilter("script", function(s) {
      if (s.cache === undefined) {
        s.cache = false;
      }
      if (s.crossDomain) {
        s.type = "GET";
      }
    });
    jQuery.ajaxTransport("script", function(s) {
      if (s.crossDomain) {
        var script,
            callback;
        return {
          send: function(_, complete) {
            script = jQuery("<script>").prop({
              async: true,
              charset: s.scriptCharset,
              src: s.url
            }).on("load error", callback = function(evt) {
              script.remove();
              callback = null;
              if (evt) {
                complete(evt.type === "error" ? 404 : 200, evt.type);
              }
            });
            document.head.appendChild(script[0]);
          },
          abort: function() {
            if (callback) {
              callback();
            }
          }
        };
      }
    });
    var oldCallbacks = [],
        rjsonp = /(=)\?(?=&|$)|\?\?/;
    jQuery.ajaxSetup({
      jsonp: "callback",
      jsonpCallback: function() {
        var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (nonce++));
        this[callback] = true;
        return callback;
      }
    });
    jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
      var callbackName,
          overwritten,
          responseContainer,
          jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
      if (jsonProp || s.dataTypes[0] === "jsonp") {
        callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
        if (jsonProp) {
          s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
        } else if (s.jsonp !== false) {
          s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
        }
        s.converters["script json"] = function() {
          if (!responseContainer) {
            jQuery.error(callbackName + " was not called");
          }
          return responseContainer[0];
        };
        s.dataTypes[0] = "json";
        overwritten = window[callbackName];
        window[callbackName] = function() {
          responseContainer = arguments;
        };
        jqXHR.always(function() {
          window[callbackName] = overwritten;
          if (s[callbackName]) {
            s.jsonpCallback = originalSettings.jsonpCallback;
            oldCallbacks.push(callbackName);
          }
          if (responseContainer && jQuery.isFunction(overwritten)) {
            overwritten(responseContainer[0]);
          }
          responseContainer = overwritten = undefined;
        });
        return "script";
      }
    });
    jQuery.parseHTML = function(data, context, keepScripts) {
      if (!data || typeof data !== "string") {
        return null;
      }
      if (typeof context === "boolean") {
        keepScripts = context;
        context = false;
      }
      context = context || document;
      var parsed = rsingleTag.exec(data),
          scripts = !keepScripts && [];
      if (parsed) {
        return [context.createElement(parsed[1])];
      }
      parsed = jQuery.buildFragment([data], context, scripts);
      if (scripts && scripts.length) {
        jQuery(scripts).remove();
      }
      return jQuery.merge([], parsed.childNodes);
    };
    var _load = jQuery.fn.load;
    jQuery.fn.load = function(url, params, callback) {
      if (typeof url !== "string" && _load) {
        return _load.apply(this, arguments);
      }
      var selector,
          type,
          response,
          self = this,
          off = url.indexOf(" ");
      if (off >= 0) {
        selector = jQuery.trim(url.slice(off));
        url = url.slice(0, off);
      }
      if (jQuery.isFunction(params)) {
        callback = params;
        params = undefined;
      } else if (params && typeof params === "object") {
        type = "POST";
      }
      if (self.length > 0) {
        jQuery.ajax({
          url: url,
          type: type,
          dataType: "html",
          data: params
        }).done(function(responseText) {
          response = arguments;
          self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
        }).complete(callback && function(jqXHR, status) {
          self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
        });
      }
      return this;
    };
    var docElem = window.document.documentElement;
    function getWindow(elem) {
      return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }
    jQuery.offset = {setOffset: function(elem, options, i) {
        var curPosition,
            curLeft,
            curCSSTop,
            curTop,
            curOffset,
            curCSSLeft,
            calculatePosition,
            position = jQuery.css(elem, "position"),
            curElem = jQuery(elem),
            props = {};
        if (position === "static") {
          elem.style.position = "relative";
        }
        curOffset = curElem.offset();
        curCSSTop = jQuery.css(elem, "top");
        curCSSLeft = jQuery.css(elem, "left");
        calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
        if (calculatePosition) {
          curPosition = curElem.position();
          curTop = curPosition.top;
          curLeft = curPosition.left;
        } else {
          curTop = parseFloat(curCSSTop) || 0;
          curLeft = parseFloat(curCSSLeft) || 0;
        }
        if (jQuery.isFunction(options)) {
          options = options.call(elem, i, curOffset);
        }
        if (options.top != null) {
          props.top = (options.top - curOffset.top) + curTop;
        }
        if (options.left != null) {
          props.left = (options.left - curOffset.left) + curLeft;
        }
        if ("using" in options) {
          options.using.call(elem, props);
        } else {
          curElem.css(props);
        }
      }};
    jQuery.fn.extend({
      offset: function(options) {
        if (arguments.length) {
          return options === undefined ? this : this.each(function(i) {
            jQuery.offset.setOffset(this, options, i);
          });
        }
        var docElem,
            win,
            elem = this[0],
            box = {
              top: 0,
              left: 0
            },
            doc = elem && elem.ownerDocument;
        if (!doc) {
          return;
        }
        docElem = doc.documentElement;
        if (!jQuery.contains(docElem, elem)) {
          return box;
        }
        if (typeof elem.getBoundingClientRect !== strundefined) {
          box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
          top: box.top + win.pageYOffset - docElem.clientTop,
          left: box.left + win.pageXOffset - docElem.clientLeft
        };
      },
      position: function() {
        if (!this[0]) {
          return;
        }
        var offsetParent,
            offset,
            elem = this[0],
            parentOffset = {
              top: 0,
              left: 0
            };
        if (jQuery.css(elem, "position") === "fixed") {
          offset = elem.getBoundingClientRect();
        } else {
          offsetParent = this.offsetParent();
          offset = this.offset();
          if (!jQuery.nodeName(offsetParent[0], "html")) {
            parentOffset = offsetParent.offset();
          }
          parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
          parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
        }
        return {
          top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
          left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
        };
      },
      offsetParent: function() {
        return this.map(function() {
          var offsetParent = this.offsetParent || docElem;
          while (offsetParent && (!jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static")) {
            offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || docElem;
        });
      }
    });
    jQuery.each({
      scrollLeft: "pageXOffset",
      scrollTop: "pageYOffset"
    }, function(method, prop) {
      var top = "pageYOffset" === prop;
      jQuery.fn[method] = function(val) {
        return access(this, function(elem, method, val) {
          var win = getWindow(elem);
          if (val === undefined) {
            return win ? win[prop] : elem[method];
          }
          if (win) {
            win.scrollTo(!top ? val : window.pageXOffset, top ? val : window.pageYOffset);
          } else {
            elem[method] = val;
          }
        }, method, val, arguments.length, null);
      };
    });
    jQuery.each(["top", "left"], function(i, prop) {
      jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
        if (computed) {
          computed = curCSS(elem, prop);
          return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
        }
      });
    });
    jQuery.each({
      Height: "height",
      Width: "width"
    }, function(name, type) {
      jQuery.each({
        padding: "inner" + name,
        content: type,
        "": "outer" + name
      }, function(defaultExtra, funcName) {
        jQuery.fn[funcName] = function(margin, value) {
          var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
              extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
          return access(this, function(elem, type, value) {
            var doc;
            if (jQuery.isWindow(elem)) {
              return elem.document.documentElement["client" + name];
            }
            if (elem.nodeType === 9) {
              doc = elem.documentElement;
              return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
            }
            return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
          }, type, chainable ? margin : undefined, chainable, null);
        };
      });
    });
    if (typeof define === "function" && define.amd) {
      define("jquery", [], function() {
        return jQuery;
      });
    }
    var _jQuery = window.jQuery,
        _$ = window.$;
    jQuery.noConflict = function(deep) {
      if (window.$ === jQuery) {
        window.$ = _$;
      }
      if (deep && window.jQuery === jQuery) {
        window.jQuery = _jQuery;
      }
      return jQuery;
    };
    if (typeof noGlobal === strundefined) {
      window.jQuery = window.$ = jQuery;
    }
    return jQuery;
  }));
})(require("process"));
