/* */ 
"format cjs";
(function(process) {
  (function(exports, undefined) {
    "use strict";
    var modules = {};
    function require(ids, callback) {
      var module,
          defs = [];
      for (var i = 0; i < ids.length; ++i) {
        module = modules[ids[i]] || resolve(ids[i]);
        if (!module) {
          throw 'module definition dependecy not found: ' + ids[i];
        }
        defs.push(module);
      }
      callback.apply(null, defs);
    }
    function define(id, dependencies, definition) {
      if (typeof id !== 'string') {
        throw 'invalid module definition, module id must be defined and be a string';
      }
      if (dependencies === undefined) {
        throw 'invalid module definition, dependencies must be specified';
      }
      if (definition === undefined) {
        throw 'invalid module definition, definition function must be specified';
      }
      require(dependencies, function() {
        modules[id] = definition.apply(null, arguments);
      });
    }
    function defined(id) {
      return !!modules[id];
    }
    function resolve(id) {
      var target = exports;
      var fragments = id.split(/[.\/]/);
      for (var fi = 0; fi < fragments.length; ++fi) {
        if (!target[fragments[fi]]) {
          return;
        }
        target = target[fragments[fi]];
      }
      return target;
    }
    function expose(ids) {
      for (var i = 0; i < ids.length; i++) {
        var target = exports;
        var id = ids[i];
        var fragments = id.split(/[.\/]/);
        for (var fi = 0; fi < fragments.length - 1; ++fi) {
          if (target[fragments[fi]] === undefined) {
            target[fragments[fi]] = {};
          }
          target = target[fragments[fi]];
        }
        target[fragments[fragments.length - 1]] = modules[id];
      }
    }
    define('moxie/core/utils/Basic', [], function() {
      var typeOf = function(o) {
        var undef;
        if (o === undef) {
          return 'undefined';
        } else if (o === null) {
          return 'null';
        } else if (o.nodeType) {
          return 'node';
        }
        return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
      };
      var extend = function(target) {
        var undef;
        each(arguments, function(arg, i) {
          if (i > 0) {
            each(arg, function(value, key) {
              if (value !== undef) {
                if (typeOf(target[key]) === typeOf(value) && !!~inArray(typeOf(value), ['array', 'object'])) {
                  extend(target[key], value);
                } else {
                  target[key] = value;
                }
              }
            });
          }
        });
        return target;
      };
      var each = function(obj, callback) {
        var length,
            key,
            i,
            undef;
        if (obj) {
          try {
            length = obj.length;
          } catch (ex) {
            length = undef;
          }
          if (length === undef) {
            for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                if (callback(obj[key], key) === false) {
                  return;
                }
              }
            }
          } else {
            for (i = 0; i < length; i++) {
              if (callback(obj[i], i) === false) {
                return;
              }
            }
          }
        }
      };
      var isEmptyObj = function(obj) {
        var prop;
        if (!obj || typeOf(obj) !== 'object') {
          return true;
        }
        for (prop in obj) {
          return false;
        }
        return true;
      };
      var inSeries = function(queue, cb) {
        var i = 0,
            length = queue.length;
        if (typeOf(cb) !== 'function') {
          cb = function() {};
        }
        if (!queue || !queue.length) {
          cb();
        }
        function callNext(i) {
          if (typeOf(queue[i]) === 'function') {
            queue[i](function(error) {
              ++i < length && !error ? callNext(i) : cb(error);
            });
          }
        }
        callNext(i);
      };
      var inParallel = function(queue, cb) {
        var count = 0,
            num = queue.length,
            cbArgs = new Array(num);
        each(queue, function(fn, i) {
          fn(function(error) {
            if (error) {
              return cb(error);
            }
            var args = [].slice.call(arguments);
            args.shift();
            cbArgs[i] = args;
            count++;
            if (count === num) {
              cbArgs.unshift(null);
              cb.apply(this, cbArgs);
            }
          });
        });
      };
      var inArray = function(needle, array) {
        if (array) {
          if (Array.prototype.indexOf) {
            return Array.prototype.indexOf.call(array, needle);
          }
          for (var i = 0,
              length = array.length; i < length; i++) {
            if (array[i] === needle) {
              return i;
            }
          }
        }
        return -1;
      };
      var arrayDiff = function(needles, array) {
        var diff = [];
        if (typeOf(needles) !== 'array') {
          needles = [needles];
        }
        if (typeOf(array) !== 'array') {
          array = [array];
        }
        for (var i in needles) {
          if (inArray(needles[i], array) === -1) {
            diff.push(needles[i]);
          }
        }
        return diff.length ? diff : false;
      };
      var arrayIntersect = function(array1, array2) {
        var result = [];
        each(array1, function(item) {
          if (inArray(item, array2) !== -1) {
            result.push(item);
          }
        });
        return result.length ? result : null;
      };
      var toArray = function(obj) {
        var i,
            arr = [];
        for (i = 0; i < obj.length; i++) {
          arr[i] = obj[i];
        }
        return arr;
      };
      var guid = (function() {
        var counter = 0;
        return function(prefix) {
          var guid = new Date().getTime().toString(32),
              i;
          for (i = 0; i < 5; i++) {
            guid += Math.floor(Math.random() * 65535).toString(32);
          }
          return (prefix || 'o_') + guid + (counter++).toString(32);
        };
      }());
      var trim = function(str) {
        if (!str) {
          return str;
        }
        return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
      };
      var parseSizeStr = function(size) {
        if (typeof(size) !== 'string') {
          return size;
        }
        var muls = {
          t: 1099511627776,
          g: 1073741824,
          m: 1048576,
          k: 1024
        },
            mul;
        size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
        mul = size[2];
        size = +size[1];
        if (muls.hasOwnProperty(mul)) {
          size *= muls[mul];
        }
        return size;
      };
      return {
        guid: guid,
        typeOf: typeOf,
        extend: extend,
        each: each,
        isEmptyObj: isEmptyObj,
        inSeries: inSeries,
        inParallel: inParallel,
        inArray: inArray,
        arrayDiff: arrayDiff,
        arrayIntersect: arrayIntersect,
        toArray: toArray,
        trim: trim,
        parseSizeStr: parseSizeStr
      };
    });
    define("moxie/core/I18n", ["moxie/core/utils/Basic"], function(Basic) {
      var i18n = {};
      return {
        addI18n: function(pack) {
          return Basic.extend(i18n, pack);
        },
        translate: function(str) {
          return i18n[str] || str;
        },
        _: function(str) {
          return this.translate(str);
        },
        sprintf: function(str) {
          var args = [].slice.call(arguments, 1);
          return str.replace(/%[a-z]/g, function() {
            var value = args.shift();
            return Basic.typeOf(value) !== 'undefined' ? value : '';
          });
        }
      };
    });
    define("moxie/core/utils/Mime", ["moxie/core/utils/Basic", "moxie/core/I18n"], function(Basic, I18n) {
      var mimeData = "" + "application/msword,doc dot," + "application/pdf,pdf," + "application/pgp-signature,pgp," + "application/postscript,ps ai eps," + "application/rtf,rtf," + "application/vnd.ms-excel,xls xlb," + "application/vnd.ms-powerpoint,ppt pps pot," + "application/zip,zip," + "application/x-shockwave-flash,swf swfl," + "application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," + "application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," + "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," + "application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," + "application/vnd.openxmlformats-officedocument.presentationml.template,potx," + "application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," + "application/x-javascript,js," + "application/json,json," + "audio/mpeg,mp3 mpga mpega mp2," + "audio/x-wav,wav," + "audio/x-m4a,m4a," + "audio/ogg,oga ogg," + "audio/aiff,aiff aif," + "audio/flac,flac," + "audio/aac,aac," + "audio/ac3,ac3," + "audio/x-ms-wma,wma," + "image/bmp,bmp," + "image/gif,gif," + "image/jpeg,jpg jpeg jpe," + "image/photoshop,psd," + "image/png,png," + "image/svg+xml,svg svgz," + "image/tiff,tiff tif," + "text/plain,asc txt text diff log," + "text/html,htm html xhtml," + "text/css,css," + "text/csv,csv," + "text/rtf,rtf," + "video/mpeg,mpeg mpg mpe m2v," + "video/quicktime,qt mov," + "video/mp4,mp4," + "video/x-m4v,m4v," + "video/x-flv,flv," + "video/x-ms-wmv,wmv," + "video/avi,avi," + "video/webm,webm," + "video/3gpp,3gpp 3gp," + "video/3gpp2,3g2," + "video/vnd.rn-realvideo,rv," + "video/ogg,ogv," + "video/x-matroska,mkv," + "application/vnd.oasis.opendocument.formula-template,otf," + "application/octet-stream,exe";
      var Mime = {
        mimes: {},
        extensions: {},
        addMimeType: function(mimeData) {
          var items = mimeData.split(/,/),
              i,
              ii,
              ext;
          for (i = 0; i < items.length; i += 2) {
            ext = items[i + 1].split(/ /);
            for (ii = 0; ii < ext.length; ii++) {
              this.mimes[ext[ii]] = items[i];
            }
            this.extensions[items[i]] = ext;
          }
        },
        extList2mimes: function(filters, addMissingExtensions) {
          var self = this,
              ext,
              i,
              ii,
              type,
              mimes = [];
          for (i = 0; i < filters.length; i++) {
            ext = filters[i].extensions.split(/\s*,\s*/);
            for (ii = 0; ii < ext.length; ii++) {
              if (ext[ii] === '*') {
                return [];
              }
              type = self.mimes[ext[ii]];
              if (!type) {
                if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
                  mimes.push('.' + ext[ii]);
                } else {
                  return [];
                }
              } else if (Basic.inArray(type, mimes) === -1) {
                mimes.push(type);
              }
            }
          }
          return mimes;
        },
        mimes2exts: function(mimes) {
          var self = this,
              exts = [];
          Basic.each(mimes, function(mime) {
            if (mime === '*') {
              exts = [];
              return false;
            }
            var m = mime.match(/^(\w+)\/(\*|\w+)$/);
            if (m) {
              if (m[2] === '*') {
                Basic.each(self.extensions, function(arr, mime) {
                  if ((new RegExp('^' + m[1] + '/')).test(mime)) {
                    [].push.apply(exts, self.extensions[mime]);
                  }
                });
              } else if (self.extensions[mime]) {
                [].push.apply(exts, self.extensions[mime]);
              }
            }
          });
          return exts;
        },
        mimes2extList: function(mimes) {
          var accept = [],
              exts = [];
          if (Basic.typeOf(mimes) === 'string') {
            mimes = Basic.trim(mimes).split(/\s*,\s*/);
          }
          exts = this.mimes2exts(mimes);
          accept.push({
            title: I18n.translate('Files'),
            extensions: exts.length ? exts.join(',') : '*'
          });
          accept.mimes = mimes;
          return accept;
        },
        getFileExtension: function(fileName) {
          var matches = fileName && fileName.match(/\.([^.]+)$/);
          if (matches) {
            return matches[1].toLowerCase();
          }
          return '';
        },
        getFileMime: function(fileName) {
          return this.mimes[this.getFileExtension(fileName)] || '';
        }
      };
      Mime.addMimeType(mimeData);
      return Mime;
    });
    define("moxie/core/utils/Env", ["moxie/core/utils/Basic"], function(Basic) {
      var UAParser = (function(undefined) {
        var EMPTY = '',
            UNKNOWN = '?',
            FUNC_TYPE = 'function',
            UNDEF_TYPE = 'undefined',
            OBJ_TYPE = 'object',
            MAJOR = 'major',
            MODEL = 'model',
            NAME = 'name',
            TYPE = 'type',
            VENDOR = 'vendor',
            VERSION = 'version',
            ARCHITECTURE = 'architecture',
            CONSOLE = 'console',
            MOBILE = 'mobile',
            TABLET = 'tablet';
        var util = {
          has: function(str1, str2) {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
          },
          lowerize: function(str) {
            return str.toLowerCase();
          }
        };
        var mapper = {
          rgx: function() {
            for (var result,
                i = 0,
                j,
                k,
                p,
                q,
                matches,
                match,
                args = arguments; i < args.length; i += 2) {
              var regex = args[i],
                  props = args[i + 1];
              if (typeof(result) === UNDEF_TYPE) {
                result = {};
                for (p in props) {
                  q = props[p];
                  if (typeof(q) === OBJ_TYPE) {
                    result[q[0]] = undefined;
                  } else {
                    result[q] = undefined;
                  }
                }
              }
              for (j = k = 0; j < regex.length; j++) {
                matches = regex[j].exec(this.getUA());
                if (!!matches) {
                  for (p = 0; p < props.length; p++) {
                    match = matches[++k];
                    q = props[p];
                    if (typeof(q) === OBJ_TYPE && q.length > 0) {
                      if (q.length == 2) {
                        if (typeof(q[1]) == FUNC_TYPE) {
                          result[q[0]] = q[1].call(this, match);
                        } else {
                          result[q[0]] = q[1];
                        }
                      } else if (q.length == 3) {
                        if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                          result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                        } else {
                          result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                        }
                      } else if (q.length == 4) {
                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                      }
                    } else {
                      result[q] = match ? match : undefined;
                    }
                  }
                  break;
                }
              }
              if (!!matches)
                break;
            }
            return result;
          },
          str: function(str, map) {
            for (var i in map) {
              if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
                for (var j = 0; j < map[i].length; j++) {
                  if (util.has(map[i][j], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                  }
                }
              } else if (util.has(map[i], str)) {
                return (i === UNKNOWN) ? undefined : i;
              }
            }
            return str;
          }
        };
        var maps = {
          browser: {oldsafari: {
              major: {
                '1': ['/8', '/1', '/3'],
                '2': '/4',
                '?': '/'
              },
              version: {
                '1.0': '/8',
                '1.2': '/1',
                '1.3': '/3',
                '2.0': '/412',
                '2.0.2': '/416',
                '2.0.3': '/417',
                '2.0.4': '/419',
                '?': '/'
              }
            }},
          device: {sprint: {
              model: {'Evo Shift 4G': '7373KT'},
              vendor: {
                'HTC': 'APA',
                'Sprint': 'Sprint'
              }
            }},
          os: {windows: {version: {
                'ME': '4.90',
                'NT 3.11': 'NT3.51',
                'NT 4.0': 'NT4.0',
                '2000': 'NT 5.0',
                'XP': ['NT 5.1', 'NT 5.2'],
                'Vista': 'NT 6.0',
                '7': 'NT 6.1',
                '8': 'NT 6.2',
                '8.1': 'NT 6.3',
                'RT': 'ARM'
              }}}
        };
        var regexes = {
          browser: [[/(opera\smini)\/((\d+)?[\w\.-]+)/i, /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i, /(opera).+version\/((\d+)?[\w\.]+)/i, /(opera)[\/\s]+((\d+)?[\w\.]+)/i], [NAME, VERSION, MAJOR], [/\s(opr)\/((\d+)?[\w\.]+)/i], [[NAME, 'Opera'], VERSION, MAJOR], [/(kindle)\/((\d+)?[\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i, /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i, /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i, /(rekonq)((?:\/)[\w\.]+)*/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i], [NAME, VERSION, MAJOR], [/(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i], [[NAME, 'IE'], VERSION, MAJOR], [/(yabrowser)\/((\d+)?[\w\.]+)/i], [[NAME, 'Yandex'], VERSION, MAJOR], [/(comodo_dragon)\/((\d+)?[\w\.]+)/i], [[NAME, /_/g, ' '], VERSION, MAJOR], [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i], [NAME, VERSION, MAJOR], [/(dolfin)\/((\d+)?[\w\.]+)/i], [[NAME, 'Dolphin'], VERSION, MAJOR], [/((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i], [[NAME, 'Chrome'], VERSION, MAJOR], [/((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i], [[NAME, 'Android Browser'], VERSION, MAJOR], [/version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [/version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i], [VERSION, MAJOR, NAME], [/webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [/(konqueror)\/((\d+)?[\w\.]+)/i, /(webkit|khtml)\/((\d+)?[\w\.]+)/i], [NAME, VERSION, MAJOR], [/(navigator|netscape)\/((\d+)?[\w\.-]+)/i], [[NAME, 'Netscape'], VERSION, MAJOR], [/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i, /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i, /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i, /(links)\s\(((\d+)?[\w\.]+)/i, /(gobrowser)\/?((\d+)?[\w\.]+)*/i, /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i, /(mosaic)[\/\s]((\d+)?[\w\.]+)/i], [NAME, VERSION, MAJOR]],
          engine: [[/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, /(icab)[\/\s]([23]\.[\d\.]+)/i], [NAME, VERSION], [/rv\:([\w\.]+).*(gecko)/i], [VERSION, NAME]],
          os: [[/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [/\((bb)(10);/i], [[NAME, 'BlackBerry'], VERSION], [/(blackberry)\w*\/?([\w\.]+)*/i, /(tizen)\/([\w\.]+)/i, /(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i], [NAME, VERSION], [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i], [[NAME, 'Symbian'], VERSION], [/mozilla.+\(mobile;.+gecko.+firefox/i], [[NAME, 'Firefox OS'], VERSION], [/(nintendo|playstation)\s([wids3portablevu]+)/i, /(mint)[\/\s\(]?(\w+)*/i, /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i, /(hurd|linux)\s?([\w\.]+)*/i, /(gnu)\s?([\w\.]+)*/i], [NAME, VERSION], [/(cros)\s[\w]+\s([\w\.]+\w)/i], [[NAME, 'Chromium OS'], VERSION], [/(sunos)\s?([\w\.]+\d)*/i], [[NAME, 'Solaris'], VERSION], [/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i], [NAME, VERSION], [/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [/(mac\sos\sx)\s?([\w\s\.]+\w)*/i], [NAME, [VERSION, /_/g, '.']], [/(haiku)\s(\w+)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, /(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i, /(unix)\s?([\w\.]+)*/i], [NAME, VERSION]]
        };
        var UAParser = function(uastring) {
          var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
          this.getBrowser = function() {
            return mapper.rgx.apply(this, regexes.browser);
          };
          this.getEngine = function() {
            return mapper.rgx.apply(this, regexes.engine);
          };
          this.getOS = function() {
            return mapper.rgx.apply(this, regexes.os);
          };
          this.getResult = function() {
            return {
              ua: this.getUA(),
              browser: this.getBrowser(),
              engine: this.getEngine(),
              os: this.getOS()
            };
          };
          this.getUA = function() {
            return ua;
          };
          this.setUA = function(uastring) {
            ua = uastring;
            return this;
          };
          this.setUA(ua);
        };
        return new UAParser().getResult();
      })();
      function version_compare(v1, v2, operator) {
        var i = 0,
            x = 0,
            compare = 0,
            vm = {
              'dev': -6,
              'alpha': -5,
              'a': -5,
              'beta': -4,
              'b': -4,
              'RC': -3,
              'rc': -3,
              '#': -2,
              'p': 1,
              'pl': 1
            },
            prepVersion = function(v) {
              v = ('' + v).replace(/[_\-+]/g, '.');
              v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.');
              return (!v.length ? [-8] : v.split('.'));
            },
            numVersion = function(v) {
              return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10));
            };
        v1 = prepVersion(v1);
        v2 = prepVersion(v2);
        x = Math.max(v1.length, v2.length);
        for (i = 0; i < x; i++) {
          if (v1[i] == v2[i]) {
            continue;
          }
          v1[i] = numVersion(v1[i]);
          v2[i] = numVersion(v2[i]);
          if (v1[i] < v2[i]) {
            compare = -1;
            break;
          } else if (v1[i] > v2[i]) {
            compare = 1;
            break;
          }
        }
        if (!operator) {
          return compare;
        }
        switch (operator) {
          case '>':
          case 'gt':
            return (compare > 0);
          case '>=':
          case 'ge':
            return (compare >= 0);
          case '<=':
          case 'le':
            return (compare <= 0);
          case '==':
          case '=':
          case 'eq':
            return (compare === 0);
          case '<>':
          case '!=':
          case 'ne':
            return (compare !== 0);
          case '':
          case '<':
          case 'lt':
            return (compare < 0);
          default:
            return null;
        }
      }
      var can = (function() {
        var caps = {
          define_property: (function() {
            return false;
          }()),
          create_canvas: (function() {
            var el = document.createElement('canvas');
            return !!(el.getContext && el.getContext('2d'));
          }()),
          return_response_type: function(responseType) {
            try {
              if (Basic.inArray(responseType, ['', 'text', 'document']) !== -1) {
                return true;
              } else if (window.XMLHttpRequest) {
                var xhr = new XMLHttpRequest();
                xhr.open('get', '/');
                if ('responseType' in xhr) {
                  xhr.responseType = responseType;
                  if (xhr.responseType !== responseType) {
                    return false;
                  }
                  return true;
                }
              }
            } catch (ex) {}
            return false;
          },
          use_data_uri: (function() {
            var du = new Image();
            du.onload = function() {
              caps.use_data_uri = (du.width === 1 && du.height === 1);
            };
            setTimeout(function() {
              du.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP8AAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
            }, 1);
            return false;
          }()),
          use_data_uri_over32kb: function() {
            return caps.use_data_uri && (Env.browser !== 'IE' || Env.version >= 9);
          },
          use_data_uri_of: function(bytes) {
            return (caps.use_data_uri && bytes < 33000 || caps.use_data_uri_over32kb());
          },
          use_fileinput: function() {
            var el = document.createElement('input');
            el.setAttribute('type', 'file');
            return !el.disabled;
          }
        };
        return function(cap) {
          var args = [].slice.call(arguments);
          args.shift();
          return Basic.typeOf(caps[cap]) === 'function' ? caps[cap].apply(this, args) : !!caps[cap];
        };
      }());
      var Env = {
        can: can,
        browser: UAParser.browser.name,
        version: parseFloat(UAParser.browser.major),
        os: UAParser.os.name,
        osVersion: UAParser.os.version,
        verComp: version_compare,
        swf_url: "../flash/Moxie.swf",
        xap_url: "../silverlight/Moxie.xap",
        global_event_dispatcher: "moxie.core.EventTarget.instance.dispatchEvent"
      };
      Env.OS = Env.os;
      return Env;
    });
    define('moxie/core/utils/Dom', ['moxie/core/utils/Env'], function(Env) {
      var get = function(id) {
        if (typeof id !== 'string') {
          return id;
        }
        return document.getElementById(id);
      };
      var hasClass = function(obj, name) {
        if (!obj.className) {
          return false;
        }
        var regExp = new RegExp("(^|\\s+)" + name + "(\\s+|$)");
        return regExp.test(obj.className);
      };
      var addClass = function(obj, name) {
        if (!hasClass(obj, name)) {
          obj.className = !obj.className ? name : obj.className.replace(/\s+$/, '') + ' ' + name;
        }
      };
      var removeClass = function(obj, name) {
        if (obj.className) {
          var regExp = new RegExp("(^|\\s+)" + name + "(\\s+|$)");
          obj.className = obj.className.replace(regExp, function($0, $1, $2) {
            return $1 === ' ' && $2 === ' ' ? ' ' : '';
          });
        }
      };
      var getStyle = function(obj, name) {
        if (obj.currentStyle) {
          return obj.currentStyle[name];
        } else if (window.getComputedStyle) {
          return window.getComputedStyle(obj, null)[name];
        }
      };
      var getPos = function(node, root) {
        var x = 0,
            y = 0,
            parent,
            doc = document,
            nodeRect,
            rootRect;
        node = node;
        root = root || doc.body;
        function getIEPos(node) {
          var bodyElm,
              rect,
              x = 0,
              y = 0;
          if (node) {
            rect = node.getBoundingClientRect();
            bodyElm = doc.compatMode === "CSS1Compat" ? doc.documentElement : doc.body;
            x = rect.left + bodyElm.scrollLeft;
            y = rect.top + bodyElm.scrollTop;
          }
          return {
            x: x,
            y: y
          };
        }
        if (node && node.getBoundingClientRect && Env.browser === 'IE' && (!doc.documentMode || doc.documentMode < 8)) {
          nodeRect = getIEPos(node);
          rootRect = getIEPos(root);
          return {
            x: nodeRect.x - rootRect.x,
            y: nodeRect.y - rootRect.y
          };
        }
        parent = node;
        while (parent && parent != root && parent.nodeType) {
          x += parent.offsetLeft || 0;
          y += parent.offsetTop || 0;
          parent = parent.offsetParent;
        }
        parent = node.parentNode;
        while (parent && parent != root && parent.nodeType) {
          x -= parent.scrollLeft || 0;
          y -= parent.scrollTop || 0;
          parent = parent.parentNode;
        }
        return {
          x: x,
          y: y
        };
      };
      var getSize = function(node) {
        return {
          w: node.offsetWidth || node.clientWidth,
          h: node.offsetHeight || node.clientHeight
        };
      };
      return {
        get: get,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        getStyle: getStyle,
        getPos: getPos,
        getSize: getSize
      };
    });
    define('moxie/core/Exceptions', ['moxie/core/utils/Basic'], function(Basic) {
      function _findKey(obj, value) {
        var key;
        for (key in obj) {
          if (obj[key] === value) {
            return key;
          }
        }
        return null;
      }
      return {
        RuntimeError: (function() {
          var namecodes = {
            NOT_INIT_ERR: 1,
            NOT_SUPPORTED_ERR: 9,
            JS_ERR: 4
          };
          function RuntimeError(code) {
            this.code = code;
            this.name = _findKey(namecodes, code);
            this.message = this.name + ": RuntimeError " + this.code;
          }
          Basic.extend(RuntimeError, namecodes);
          RuntimeError.prototype = Error.prototype;
          return RuntimeError;
        }()),
        OperationNotAllowedException: (function() {
          function OperationNotAllowedException(code) {
            this.code = code;
            this.name = 'OperationNotAllowedException';
          }
          Basic.extend(OperationNotAllowedException, {NOT_ALLOWED_ERR: 1});
          OperationNotAllowedException.prototype = Error.prototype;
          return OperationNotAllowedException;
        }()),
        ImageError: (function() {
          var namecodes = {
            WRONG_FORMAT: 1,
            MAX_RESOLUTION_ERR: 2
          };
          function ImageError(code) {
            this.code = code;
            this.name = _findKey(namecodes, code);
            this.message = this.name + ": ImageError " + this.code;
          }
          Basic.extend(ImageError, namecodes);
          ImageError.prototype = Error.prototype;
          return ImageError;
        }()),
        FileException: (function() {
          var namecodes = {
            NOT_FOUND_ERR: 1,
            SECURITY_ERR: 2,
            ABORT_ERR: 3,
            NOT_READABLE_ERR: 4,
            ENCODING_ERR: 5,
            NO_MODIFICATION_ALLOWED_ERR: 6,
            INVALID_STATE_ERR: 7,
            SYNTAX_ERR: 8
          };
          function FileException(code) {
            this.code = code;
            this.name = _findKey(namecodes, code);
            this.message = this.name + ": FileException " + this.code;
          }
          Basic.extend(FileException, namecodes);
          FileException.prototype = Error.prototype;
          return FileException;
        }()),
        DOMException: (function() {
          var namecodes = {
            INDEX_SIZE_ERR: 1,
            DOMSTRING_SIZE_ERR: 2,
            HIERARCHY_REQUEST_ERR: 3,
            WRONG_DOCUMENT_ERR: 4,
            INVALID_CHARACTER_ERR: 5,
            NO_DATA_ALLOWED_ERR: 6,
            NO_MODIFICATION_ALLOWED_ERR: 7,
            NOT_FOUND_ERR: 8,
            NOT_SUPPORTED_ERR: 9,
            INUSE_ATTRIBUTE_ERR: 10,
            INVALID_STATE_ERR: 11,
            SYNTAX_ERR: 12,
            INVALID_MODIFICATION_ERR: 13,
            NAMESPACE_ERR: 14,
            INVALID_ACCESS_ERR: 15,
            VALIDATION_ERR: 16,
            TYPE_MISMATCH_ERR: 17,
            SECURITY_ERR: 18,
            NETWORK_ERR: 19,
            ABORT_ERR: 20,
            URL_MISMATCH_ERR: 21,
            QUOTA_EXCEEDED_ERR: 22,
            TIMEOUT_ERR: 23,
            INVALID_NODE_TYPE_ERR: 24,
            DATA_CLONE_ERR: 25
          };
          function DOMException(code) {
            this.code = code;
            this.name = _findKey(namecodes, code);
            this.message = this.name + ": DOMException " + this.code;
          }
          Basic.extend(DOMException, namecodes);
          DOMException.prototype = Error.prototype;
          return DOMException;
        }()),
        EventException: (function() {
          function EventException(code) {
            this.code = code;
            this.name = 'EventException';
          }
          Basic.extend(EventException, {UNSPECIFIED_EVENT_TYPE_ERR: 0});
          EventException.prototype = Error.prototype;
          return EventException;
        }())
      };
    });
    define('moxie/core/EventTarget', ['moxie/core/Exceptions', 'moxie/core/utils/Basic'], function(x, Basic) {
      function EventTarget() {
        var eventpool = {};
        Basic.extend(this, {
          uid: null,
          init: function() {
            if (!this.uid) {
              this.uid = Basic.guid('uid_');
            }
          },
          addEventListener: function(type, fn, priority, scope) {
            var self = this,
                list;
            type = Basic.trim(type);
            if (/\s/.test(type)) {
              Basic.each(type.split(/\s+/), function(type) {
                self.addEventListener(type, fn, priority, scope);
              });
              return;
            }
            type = type.toLowerCase();
            priority = parseInt(priority, 10) || 0;
            list = eventpool[this.uid] && eventpool[this.uid][type] || [];
            list.push({
              fn: fn,
              priority: priority,
              scope: scope || this
            });
            if (!eventpool[this.uid]) {
              eventpool[this.uid] = {};
            }
            eventpool[this.uid][type] = list;
          },
          hasEventListener: function(type) {
            return type ? !!(eventpool[this.uid] && eventpool[this.uid][type]) : !!eventpool[this.uid];
          },
          removeEventListener: function(type, fn) {
            type = type.toLowerCase();
            var list = eventpool[this.uid] && eventpool[this.uid][type],
                i;
            if (list) {
              if (fn) {
                for (i = list.length - 1; i >= 0; i--) {
                  if (list[i].fn === fn) {
                    list.splice(i, 1);
                    break;
                  }
                }
              } else {
                list = [];
              }
              if (!list.length) {
                delete eventpool[this.uid][type];
                if (Basic.isEmptyObj(eventpool[this.uid])) {
                  delete eventpool[this.uid];
                }
              }
            }
          },
          removeAllEventListeners: function() {
            if (eventpool[this.uid]) {
              delete eventpool[this.uid];
            }
          },
          dispatchEvent: function(type) {
            var uid,
                list,
                args,
                tmpEvt,
                evt = {},
                result = true,
                undef;
            if (Basic.typeOf(type) !== 'string') {
              tmpEvt = type;
              if (Basic.typeOf(tmpEvt.type) === 'string') {
                type = tmpEvt.type;
                if (tmpEvt.total !== undef && tmpEvt.loaded !== undef) {
                  evt.total = tmpEvt.total;
                  evt.loaded = tmpEvt.loaded;
                }
                evt.async = tmpEvt.async || false;
              } else {
                throw new x.EventException(x.EventException.UNSPECIFIED_EVENT_TYPE_ERR);
              }
            }
            if (type.indexOf('::') !== -1) {
              (function(arr) {
                uid = arr[0];
                type = arr[1];
              }(type.split('::')));
            } else {
              uid = this.uid;
            }
            type = type.toLowerCase();
            list = eventpool[uid] && eventpool[uid][type];
            if (list) {
              list.sort(function(a, b) {
                return b.priority - a.priority;
              });
              args = [].slice.call(arguments);
              args.shift();
              evt.type = type;
              args.unshift(evt);
              var queue = [];
              Basic.each(list, function(handler) {
                args[0].target = handler.scope;
                if (evt.async) {
                  queue.push(function(cb) {
                    setTimeout(function() {
                      cb(handler.fn.apply(handler.scope, args) === false);
                    }, 1);
                  });
                } else {
                  queue.push(function(cb) {
                    cb(handler.fn.apply(handler.scope, args) === false);
                  });
                }
              });
              if (queue.length) {
                Basic.inSeries(queue, function(err) {
                  result = !err;
                });
              }
            }
            return result;
          },
          bind: function() {
            this.addEventListener.apply(this, arguments);
          },
          unbind: function() {
            this.removeEventListener.apply(this, arguments);
          },
          unbindAll: function() {
            this.removeAllEventListeners.apply(this, arguments);
          },
          trigger: function() {
            return this.dispatchEvent.apply(this, arguments);
          },
          convertEventPropsToHandlers: function(handlers) {
            var h;
            if (Basic.typeOf(handlers) !== 'array') {
              handlers = [handlers];
            }
            for (var i = 0; i < handlers.length; i++) {
              h = 'on' + handlers[i];
              if (Basic.typeOf(this[h]) === 'function') {
                this.addEventListener(handlers[i], this[h]);
              } else if (Basic.typeOf(this[h]) === 'undefined') {
                this[h] = null;
              }
            }
          }
        });
      }
      EventTarget.instance = new EventTarget();
      return EventTarget;
    });
    define('moxie/core/utils/Encode', [], function() {
      var utf8_encode = function(str) {
        return unescape(encodeURIComponent(str));
      };
      var utf8_decode = function(str_data) {
        return decodeURIComponent(escape(str_data));
      };
      var atob = function(data, utf8) {
        if (typeof(window.atob) === 'function') {
          return utf8 ? utf8_decode(window.atob(data)) : window.atob(data);
        }
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1,
            o2,
            o3,
            h1,
            h2,
            h3,
            h4,
            bits,
            i = 0,
            ac = 0,
            dec = "",
            tmp_arr = [];
        if (!data) {
          return data;
        }
        data += '';
        do {
          h1 = b64.indexOf(data.charAt(i++));
          h2 = b64.indexOf(data.charAt(i++));
          h3 = b64.indexOf(data.charAt(i++));
          h4 = b64.indexOf(data.charAt(i++));
          bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
          o1 = bits >> 16 & 0xff;
          o2 = bits >> 8 & 0xff;
          o3 = bits & 0xff;
          if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
          } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
          } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
          }
        } while (i < data.length);
        dec = tmp_arr.join('');
        return utf8 ? utf8_decode(dec) : dec;
      };
      var btoa = function(data, utf8) {
        if (utf8) {
          utf8_encode(data);
        }
        if (typeof(window.btoa) === 'function') {
          return window.btoa(data);
        }
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1,
            o2,
            o3,
            h1,
            h2,
            h3,
            h4,
            bits,
            i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];
        if (!data) {
          return data;
        }
        do {
          o1 = data.charCodeAt(i++);
          o2 = data.charCodeAt(i++);
          o3 = data.charCodeAt(i++);
          bits = o1 << 16 | o2 << 8 | o3;
          h1 = bits >> 18 & 0x3f;
          h2 = bits >> 12 & 0x3f;
          h3 = bits >> 6 & 0x3f;
          h4 = bits & 0x3f;
          tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);
        enc = tmp_arr.join('');
        var r = data.length % 3;
        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
      };
      return {
        utf8_encode: utf8_encode,
        utf8_decode: utf8_decode,
        atob: atob,
        btoa: btoa
      };
    });
    define('moxie/runtime/Runtime', ["moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/EventTarget"], function(Basic, Dom, EventTarget) {
      var runtimeConstructors = {},
          runtimes = {};
      function Runtime(options, type, caps, modeCaps, preferredMode) {
        var self = this,
            _shim,
            _uid = Basic.guid(type + '_'),
            defaultMode = preferredMode || 'browser';
        ;
        options = options || {};
        runtimes[_uid] = this;
        caps = Basic.extend({
          access_binary: false,
          access_image_binary: false,
          display_media: false,
          do_cors: false,
          drag_and_drop: false,
          filter_by_extension: true,
          resize_image: false,
          report_upload_progress: false,
          return_response_headers: false,
          return_response_type: false,
          return_status_code: true,
          send_custom_headers: false,
          select_file: false,
          select_folder: false,
          select_multiple: true,
          send_binary_string: false,
          send_browser_cookies: true,
          send_multipart: true,
          slice_blob: false,
          stream_upload: false,
          summon_file_dialog: false,
          upload_filesize: true,
          use_http_method: true
        }, caps);
        if (options.preferred_caps) {
          defaultMode = Runtime.getMode(modeCaps, options.preferred_caps, defaultMode);
        }
        _shim = (function() {
          var objpool = {};
          return {
            exec: function(uid, comp, fn, args) {
              if (_shim[comp]) {
                if (!objpool[uid]) {
                  objpool[uid] = {
                    context: this,
                    instance: new _shim[comp]()
                  };
                }
                if (objpool[uid].instance[fn]) {
                  return objpool[uid].instance[fn].apply(this, args);
                }
              }
            },
            removeInstance: function(uid) {
              delete objpool[uid];
            },
            removeAllInstances: function() {
              var self = this;
              Basic.each(objpool, function(obj, uid) {
                if (Basic.typeOf(obj.instance.destroy) === 'function') {
                  obj.instance.destroy.call(obj.context);
                }
                self.removeInstance(uid);
              });
            }
          };
        }());
        Basic.extend(this, {
          initialized: false,
          uid: _uid,
          type: type,
          mode: Runtime.getMode(modeCaps, (options.required_caps), defaultMode),
          shimid: _uid + '_container',
          clients: 0,
          options: options,
          can: function(cap, value) {
            var refCaps = arguments[2] || caps;
            if (Basic.typeOf(cap) === 'string' && Basic.typeOf(value) === 'undefined') {
              cap = Runtime.parseCaps(cap);
            }
            if (Basic.typeOf(cap) === 'object') {
              for (var key in cap) {
                if (!this.can(key, cap[key], refCaps)) {
                  return false;
                }
              }
              return true;
            }
            if (Basic.typeOf(refCaps[cap]) === 'function') {
              return refCaps[cap].call(this, value);
            } else {
              return (value === refCaps[cap]);
            }
          },
          getShimContainer: function() {
            var container,
                shimContainer = Dom.get(this.shimid);
            if (!shimContainer) {
              container = this.options.container ? Dom.get(this.options.container) : document.body;
              shimContainer = document.createElement('div');
              shimContainer.id = this.shimid;
              shimContainer.className = 'moxie-shim moxie-shim-' + this.type;
              Basic.extend(shimContainer.style, {
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
              });
              container.appendChild(shimContainer);
              container = null;
            }
            return shimContainer;
          },
          getShim: function() {
            return _shim;
          },
          shimExec: function(component, action) {
            var args = [].slice.call(arguments, 2);
            return self.getShim().exec.call(this, this.uid, component, action, args);
          },
          exec: function(component, action) {
            var args = [].slice.call(arguments, 2);
            if (self[component] && self[component][action]) {
              return self[component][action].apply(this, args);
            }
            return self.shimExec.apply(this, arguments);
          },
          destroy: function() {
            if (!self) {
              return;
            }
            var shimContainer = Dom.get(this.shimid);
            if (shimContainer) {
              shimContainer.parentNode.removeChild(shimContainer);
            }
            if (_shim) {
              _shim.removeAllInstances();
            }
            this.unbindAll();
            delete runtimes[this.uid];
            this.uid = null;
            _uid = self = _shim = shimContainer = null;
          }
        });
        if (this.mode && options.required_caps && !this.can(options.required_caps)) {
          this.mode = false;
        }
      }
      Runtime.order = 'html5,flash,silverlight,html4';
      Runtime.getRuntime = function(uid) {
        return runtimes[uid] ? runtimes[uid] : false;
      };
      Runtime.addConstructor = function(type, constructor) {
        constructor.prototype = EventTarget.instance;
        runtimeConstructors[type] = constructor;
      };
      Runtime.getConstructor = function(type) {
        return runtimeConstructors[type] || null;
      };
      Runtime.getInfo = function(uid) {
        var runtime = Runtime.getRuntime(uid);
        if (runtime) {
          return {
            uid: runtime.uid,
            type: runtime.type,
            mode: runtime.mode,
            can: function() {
              return runtime.can.apply(runtime, arguments);
            }
          };
        }
        return null;
      };
      Runtime.parseCaps = function(capStr) {
        var capObj = {};
        if (Basic.typeOf(capStr) !== 'string') {
          return capStr || {};
        }
        Basic.each(capStr.split(','), function(key) {
          capObj[key] = true;
        });
        return capObj;
      };
      Runtime.can = function(type, caps) {
        var runtime,
            constructor = Runtime.getConstructor(type),
            mode;
        ;
        if (constructor) {
          runtime = new constructor({required_caps: caps});
          mode = runtime.mode;
          runtime.destroy();
          return !!mode;
        }
        return false;
      };
      Runtime.thatCan = function(caps, runtimeOrder) {
        var types = (runtimeOrder || Runtime.order).split(/\s*,\s*/);
        for (var i in types) {
          if (Runtime.can(types[i], caps)) {
            return types[i];
          }
        }
        return null;
      };
      Runtime.getMode = function(modeCaps, requiredCaps, defaultMode) {
        var mode = null;
        if (Basic.typeOf(defaultMode) === 'undefined') {
          defaultMode = 'browser';
        }
        if (requiredCaps && !Basic.isEmptyObj(modeCaps)) {
          Basic.each(requiredCaps, function(value, cap) {
            if (modeCaps.hasOwnProperty(cap)) {
              var capMode = modeCaps[cap](value);
              if (typeof(capMode) === 'string') {
                capMode = [capMode];
              }
              if (!mode) {
                mode = capMode;
              } else if (!(mode = Basic.arrayIntersect(mode, capMode))) {
                return (mode = false);
              }
            }
          });
          if (mode) {
            return Basic.inArray(defaultMode, mode) !== -1 ? defaultMode : mode[0];
          } else if (mode === false) {
            return false;
          }
        }
        return defaultMode;
      };
      Runtime.capTrue = function() {
        return true;
      };
      Runtime.capFalse = function() {
        return false;
      };
      Runtime.capTest = function(expr) {
        return function() {
          return !!expr;
        };
      };
      return Runtime;
    });
    define('moxie/runtime/RuntimeClient', ['moxie/core/Exceptions', 'moxie/core/utils/Basic', 'moxie/runtime/Runtime'], function(x, Basic, Runtime) {
      return function RuntimeClient() {
        var runtime;
        Basic.extend(this, {
          connectRuntime: function(options) {
            var comp = this,
                ruid;
            function initialize(items) {
              var type,
                  constructor;
              if (!items.length) {
                comp.trigger('RuntimeError', new x.RuntimeError(x.RuntimeError.NOT_INIT_ERR));
                runtime = null;
                return;
              }
              type = items.shift();
              constructor = Runtime.getConstructor(type);
              if (!constructor) {
                initialize(items);
                return;
              }
              runtime = new constructor(options);
              runtime.bind('Init', function() {
                runtime.initialized = true;
                setTimeout(function() {
                  runtime.clients++;
                  comp.trigger('RuntimeInit', runtime);
                }, 1);
              });
              runtime.bind('Error', function() {
                runtime.destroy();
                initialize(items);
              });
              if (!runtime.mode) {
                runtime.trigger('Error');
                return;
              }
              runtime.init();
            }
            if (Basic.typeOf(options) === 'string') {
              ruid = options;
            } else if (Basic.typeOf(options.ruid) === 'string') {
              ruid = options.ruid;
            }
            if (ruid) {
              runtime = Runtime.getRuntime(ruid);
              if (runtime) {
                runtime.clients++;
                return runtime;
              } else {
                throw new x.RuntimeError(x.RuntimeError.NOT_INIT_ERR);
              }
            }
            initialize((options.runtime_order || Runtime.order).split(/\s*,\s*/));
          },
          getRuntime: function() {
            if (runtime && runtime.uid) {
              return runtime;
            }
            runtime = null;
            return null;
          },
          disconnectRuntime: function() {
            if (runtime && --runtime.clients <= 0) {
              runtime.destroy();
              runtime = null;
            }
          }
        });
      };
    });
    define('moxie/file/Blob', ['moxie/core/utils/Basic', 'moxie/core/utils/Encode', 'moxie/runtime/RuntimeClient'], function(Basic, Encode, RuntimeClient) {
      var blobpool = {};
      function Blob(ruid, blob) {
        function _sliceDetached(start, end, type) {
          var blob,
              data = blobpool[this.uid];
          if (Basic.typeOf(data) !== 'string' || !data.length) {
            return null;
          }
          blob = new Blob(null, {
            type: type,
            size: end - start
          });
          blob.detach(data.substr(start, blob.size));
          return blob;
        }
        RuntimeClient.call(this);
        if (ruid) {
          this.connectRuntime(ruid);
        }
        if (!blob) {
          blob = {};
        } else if (Basic.typeOf(blob) === 'string') {
          blob = {data: blob};
        }
        Basic.extend(this, {
          uid: blob.uid || Basic.guid('uid_'),
          ruid: ruid,
          size: blob.size || 0,
          type: blob.type || '',
          slice: function(start, end, type) {
            if (this.isDetached()) {
              return _sliceDetached.apply(this, arguments);
            }
            return this.getRuntime().exec.call(this, 'Blob', 'slice', this.getSource(), start, end, type);
          },
          getSource: function() {
            if (!blobpool[this.uid]) {
              return null;
            }
            return blobpool[this.uid];
          },
          detach: function(data) {
            if (this.ruid) {
              this.getRuntime().exec.call(this, 'Blob', 'destroy');
              this.disconnectRuntime();
              this.ruid = null;
            }
            data = data || '';
            var matches = data.match(/^data:([^;]*);base64,/);
            if (matches) {
              this.type = matches[1];
              data = Encode.atob(data.substring(data.indexOf('base64,') + 7));
            }
            this.size = data.length;
            blobpool[this.uid] = data;
          },
          isDetached: function() {
            return !this.ruid && Basic.typeOf(blobpool[this.uid]) === 'string';
          },
          destroy: function() {
            this.detach();
            delete blobpool[this.uid];
          }
        });
        if (blob.data) {
          this.detach(blob.data);
        } else {
          blobpool[this.uid] = blob;
        }
      }
      return Blob;
    });
    define('moxie/file/File', ['moxie/core/utils/Basic', 'moxie/core/utils/Mime', 'moxie/file/Blob'], function(Basic, Mime, Blob) {
      function File(ruid, file) {
        var name,
            type;
        if (!file) {
          file = {};
        }
        if (file.type && file.type !== '') {
          type = file.type;
        } else {
          type = Mime.getFileMime(file.name);
        }
        if (file.name) {
          name = file.name.replace(/\\/g, '/');
          name = name.substr(name.lastIndexOf('/') + 1);
        } else {
          var prefix = type.split('/')[0];
          name = Basic.guid((prefix !== '' ? prefix : 'file') + '_');
          if (Mime.extensions[type]) {
            name += '.' + Mime.extensions[type][0];
          }
        }
        Blob.apply(this, arguments);
        Basic.extend(this, {
          type: type || '',
          name: name || Basic.guid('file_'),
          relativePath: '',
          lastModifiedDate: file.lastModifiedDate || (new Date()).toLocaleString()
        });
      }
      File.prototype = Blob.prototype;
      return File;
    });
    define('moxie/file/FileInput', ['moxie/core/utils/Basic', 'moxie/core/utils/Mime', 'moxie/core/utils/Dom', 'moxie/core/Exceptions', 'moxie/core/EventTarget', 'moxie/core/I18n', 'moxie/file/File', 'moxie/runtime/Runtime', 'moxie/runtime/RuntimeClient'], function(Basic, Mime, Dom, x, EventTarget, I18n, File, Runtime, RuntimeClient) {
      var dispatches = ['ready', 'change', 'cancel', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup'];
      function FileInput(options) {
        var self = this,
            container,
            browseButton,
            defaults;
        if (Basic.inArray(Basic.typeOf(options), ['string', 'node']) !== -1) {
          options = {browse_button: options};
        }
        browseButton = Dom.get(options.browse_button);
        if (!browseButton) {
          throw new x.DOMException(x.DOMException.NOT_FOUND_ERR);
        }
        defaults = {
          accept: [{
            title: I18n.translate('All Files'),
            extensions: '*'
          }],
          name: 'file',
          multiple: false,
          required_caps: false,
          container: browseButton.parentNode || document.body
        };
        options = Basic.extend({}, defaults, options);
        if (typeof(options.required_caps) === 'string') {
          options.required_caps = Runtime.parseCaps(options.required_caps);
        }
        if (typeof(options.accept) === 'string') {
          options.accept = Mime.mimes2extList(options.accept);
        }
        container = Dom.get(options.container);
        if (!container) {
          container = document.body;
        }
        if (Dom.getStyle(container, 'position') === 'static') {
          container.style.position = 'relative';
        }
        container = browseButton = null;
        RuntimeClient.call(self);
        Basic.extend(self, {
          uid: Basic.guid('uid_'),
          ruid: null,
          shimid: null,
          files: null,
          init: function() {
            self.convertEventPropsToHandlers(dispatches);
            self.bind('RuntimeInit', function(e, runtime) {
              self.ruid = runtime.uid;
              self.shimid = runtime.shimid;
              self.bind("Ready", function() {
                self.trigger("Refresh");
              }, 999);
              self.bind("Change", function() {
                var files = runtime.exec.call(self, 'FileInput', 'getFiles');
                self.files = [];
                Basic.each(files, function(file) {
                  if (file.size === 0) {
                    return true;
                  }
                  self.files.push(new File(self.ruid, file));
                });
              }, 999);
              self.bind('Refresh', function() {
                var pos,
                    size,
                    browseButton,
                    shimContainer;
                browseButton = Dom.get(options.browse_button);
                shimContainer = Dom.get(runtime.shimid);
                if (browseButton) {
                  pos = Dom.getPos(browseButton, Dom.get(options.container));
                  size = Dom.getSize(browseButton);
                  if (shimContainer) {
                    Basic.extend(shimContainer.style, {
                      top: pos.y + 'px',
                      left: pos.x + 'px',
                      width: size.w + 'px',
                      height: size.h + 'px'
                    });
                  }
                }
                shimContainer = browseButton = null;
              });
              runtime.exec.call(self, 'FileInput', 'init', options);
            });
            self.connectRuntime(Basic.extend({}, options, {required_caps: {select_file: true}}));
          },
          disable: function(state) {
            var runtime = this.getRuntime();
            if (runtime) {
              runtime.exec.call(this, 'FileInput', 'disable', Basic.typeOf(state) === 'undefined' ? true : state);
            }
          },
          refresh: function() {
            self.trigger("Refresh");
          },
          destroy: function() {
            var runtime = this.getRuntime();
            if (runtime) {
              runtime.exec.call(this, 'FileInput', 'destroy');
              this.disconnectRuntime();
            }
            if (Basic.typeOf(this.files) === 'array') {
              Basic.each(this.files, function(file) {
                file.destroy();
              });
            }
            this.files = null;
          }
        });
      }
      FileInput.prototype = EventTarget.instance;
      return FileInput;
    });
    define('moxie/runtime/RuntimeTarget', ['moxie/core/utils/Basic', 'moxie/runtime/RuntimeClient', "moxie/core/EventTarget"], function(Basic, RuntimeClient, EventTarget) {
      function RuntimeTarget() {
        this.uid = Basic.guid('uid_');
        RuntimeClient.call(this);
        this.destroy = function() {
          this.disconnectRuntime();
          this.unbindAll();
        };
      }
      RuntimeTarget.prototype = EventTarget.instance;
      return RuntimeTarget;
    });
    define('moxie/file/FileReader', ['moxie/core/utils/Basic', 'moxie/core/utils/Encode', 'moxie/core/Exceptions', 'moxie/core/EventTarget', 'moxie/file/Blob', 'moxie/file/File', 'moxie/runtime/RuntimeTarget'], function(Basic, Encode, x, EventTarget, Blob, File, RuntimeTarget) {
      var dispatches = ['loadstart', 'progress', 'load', 'abort', 'error', 'loadend'];
      function FileReader() {
        var self = this,
            _fr;
        Basic.extend(this, {
          uid: Basic.guid('uid_'),
          readyState: FileReader.EMPTY,
          result: null,
          error: null,
          readAsBinaryString: function(blob) {
            _read.call(this, 'readAsBinaryString', blob);
          },
          readAsDataURL: function(blob) {
            _read.call(this, 'readAsDataURL', blob);
          },
          readAsText: function(blob) {
            _read.call(this, 'readAsText', blob);
          },
          abort: function() {
            this.result = null;
            if (Basic.inArray(this.readyState, [FileReader.EMPTY, FileReader.DONE]) !== -1) {
              return;
            } else if (this.readyState === FileReader.LOADING) {
              this.readyState = FileReader.DONE;
            }
            if (_fr) {
              _fr.getRuntime().exec.call(this, 'FileReader', 'abort');
            }
            this.trigger('abort');
            this.trigger('loadend');
          },
          destroy: function() {
            this.abort();
            if (_fr) {
              _fr.getRuntime().exec.call(this, 'FileReader', 'destroy');
              _fr.disconnectRuntime();
            }
            self = _fr = null;
          }
        });
        function _read(op, blob) {
          _fr = new RuntimeTarget();
          function error(err) {
            self.readyState = FileReader.DONE;
            self.error = err;
            self.trigger('error');
            loadEnd();
          }
          function loadEnd() {
            _fr.destroy();
            _fr = null;
            self.trigger('loadend');
          }
          function exec(runtime) {
            _fr.bind('Error', function(e, err) {
              error(err);
            });
            _fr.bind('Progress', function(e) {
              self.result = runtime.exec.call(_fr, 'FileReader', 'getResult');
              self.trigger(e);
            });
            _fr.bind('Load', function(e) {
              self.readyState = FileReader.DONE;
              self.result = runtime.exec.call(_fr, 'FileReader', 'getResult');
              self.trigger(e);
              loadEnd();
            });
            runtime.exec.call(_fr, 'FileReader', 'read', op, blob);
          }
          this.convertEventPropsToHandlers(dispatches);
          if (this.readyState === FileReader.LOADING) {
            return error(new x.DOMException(x.DOMException.INVALID_STATE_ERR));
          }
          this.readyState = FileReader.LOADING;
          this.trigger('loadstart');
          if (blob instanceof Blob) {
            if (blob.isDetached()) {
              var src = blob.getSource();
              switch (op) {
                case 'readAsText':
                case 'readAsBinaryString':
                  this.result = src;
                  break;
                case 'readAsDataURL':
                  this.result = 'data:' + blob.type + ';base64,' + Encode.btoa(src);
                  break;
              }
              this.readyState = FileReader.DONE;
              this.trigger('load');
              loadEnd();
            } else {
              exec(_fr.connectRuntime(blob.ruid));
            }
          } else {
            error(new x.DOMException(x.DOMException.NOT_FOUND_ERR));
          }
        }
      }
      FileReader.EMPTY = 0;
      FileReader.LOADING = 1;
      FileReader.DONE = 2;
      FileReader.prototype = EventTarget.instance;
      return FileReader;
    });
    define('moxie/core/utils/Url', [], function() {
      var parseUrl = function(url, currentUrl) {
        var key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'],
            i = key.length,
            ports = {
              http: 80,
              https: 443
            },
            uri = {},
            regex = /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\\?([^#]*))?(?:#(.*))?)/,
            m = regex.exec(url || '');
        ;
        while (i--) {
          if (m[i]) {
            uri[key[i]] = m[i];
          }
        }
        if (!uri.scheme) {
          if (!currentUrl || typeof(currentUrl) === 'string') {
            currentUrl = parseUrl(currentUrl || document.location.href);
          }
          uri.scheme = currentUrl.scheme;
          uri.host = currentUrl.host;
          uri.port = currentUrl.port;
          var path = '';
          if (/^[^\/]/.test(uri.path)) {
            path = currentUrl.path;
            if (!/(\/|\/[^\.]+)$/.test(path)) {
              path = path.replace(/\/[^\/]+$/, '/');
            } else {
              path += '/';
            }
          }
          uri.path = path + (uri.path || '');
        }
        if (!uri.port) {
          uri.port = ports[uri.scheme] || 80;
        }
        uri.port = parseInt(uri.port, 10);
        if (!uri.path) {
          uri.path = "/";
        }
        delete uri.source;
        return uri;
      };
      var resolveUrl = function(url) {
        var ports = {
          http: 80,
          https: 443
        },
            urlp = parseUrl(url);
        ;
        return urlp.scheme + '://' + urlp.host + (urlp.port !== ports[urlp.scheme] ? ':' + urlp.port : '') + urlp.path + (urlp.query ? urlp.query : '');
      };
      var hasSameOrigin = function(url) {
        function origin(url) {
          return [url.scheme, url.host, url.port].join('/');
        }
        if (typeof url === 'string') {
          url = parseUrl(url);
        }
        return origin(parseUrl()) === origin(url);
      };
      return {
        parseUrl: parseUrl,
        resolveUrl: resolveUrl,
        hasSameOrigin: hasSameOrigin
      };
    });
    define('moxie/file/FileReaderSync', ['moxie/core/utils/Basic', 'moxie/runtime/RuntimeClient', 'moxie/core/utils/Encode'], function(Basic, RuntimeClient, Encode) {
      return function() {
        RuntimeClient.call(this);
        Basic.extend(this, {
          uid: Basic.guid('uid_'),
          readAsBinaryString: function(blob) {
            return _read.call(this, 'readAsBinaryString', blob);
          },
          readAsDataURL: function(blob) {
            return _read.call(this, 'readAsDataURL', blob);
          },
          readAsText: function(blob) {
            return _read.call(this, 'readAsText', blob);
          }
        });
        function _read(op, blob) {
          if (blob.isDetached()) {
            var src = blob.getSource();
            switch (op) {
              case 'readAsBinaryString':
                return src;
              case 'readAsDataURL':
                return 'data:' + blob.type + ';base64,' + Encode.btoa(src);
              case 'readAsText':
                var txt = '';
                for (var i = 0,
                    length = src.length; i < length; i++) {
                  txt += String.fromCharCode(src[i]);
                }
                return txt;
            }
          } else {
            var result = this.connectRuntime(blob.ruid).exec.call(this, 'FileReaderSync', 'read', op, blob);
            this.disconnectRuntime();
            return result;
          }
        }
      };
    });
    define("moxie/xhr/FormData", ["moxie/core/Exceptions", "moxie/core/utils/Basic", "moxie/file/Blob"], function(x, Basic, Blob) {
      function FormData() {
        var _blob,
            _fields = [];
        Basic.extend(this, {
          append: function(name, value) {
            var self = this,
                valueType = Basic.typeOf(value);
            if (value instanceof Blob) {
              _blob = {
                name: name,
                value: value
              };
            } else if ('array' === valueType) {
              name += '[]';
              Basic.each(value, function(value) {
                self.append(name, value);
              });
            } else if ('object' === valueType) {
              Basic.each(value, function(value, key) {
                self.append(name + '[' + key + ']', value);
              });
            } else if ('null' === valueType || 'undefined' === valueType || 'number' === valueType && isNaN(value)) {
              self.append(name, "false");
            } else {
              _fields.push({
                name: name,
                value: value.toString()
              });
            }
          },
          hasBlob: function() {
            return !!this.getBlob();
          },
          getBlob: function() {
            return _blob && _blob.value || null;
          },
          getBlobName: function() {
            return _blob && _blob.name || null;
          },
          each: function(cb) {
            Basic.each(_fields, function(field) {
              cb(field.value, field.name);
            });
            if (_blob) {
              cb(_blob.value, _blob.name);
            }
          },
          destroy: function() {
            _blob = null;
            _fields = [];
          }
        });
      }
      return FormData;
    });
    define("moxie/xhr/XMLHttpRequest", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/core/utils/Encode", "moxie/core/utils/Url", "moxie/runtime/Runtime", "moxie/runtime/RuntimeTarget", "moxie/file/Blob", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/core/utils/Env", "moxie/core/utils/Mime"], function(Basic, x, EventTarget, Encode, Url, Runtime, RuntimeTarget, Blob, FileReaderSync, FormData, Env, Mime) {
      var httpCode = {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-Status',
        226: 'IM Used',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        306: 'Reserved',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        426: 'Upgrade Required',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        510: 'Not Extended'
      };
      function XMLHttpRequestUpload() {
        this.uid = Basic.guid('uid_');
      }
      XMLHttpRequestUpload.prototype = EventTarget.instance;
      var dispatches = ['loadstart', 'progress', 'abort', 'error', 'load', 'timeout', 'loadend'];
      var NATIVE = 1,
          RUNTIME = 2;
      function XMLHttpRequest() {
        var self = this,
            props = {
              timeout: 0,
              readyState: XMLHttpRequest.UNSENT,
              withCredentials: false,
              status: 0,
              statusText: "",
              responseType: "",
              responseXML: null,
              responseText: null,
              response: null
            },
            _async = true,
            _url,
            _method,
            _headers = {},
            _user,
            _password,
            _encoding = null,
            _mimeType = null,
            _sync_flag = false,
            _send_flag = false,
            _upload_events_flag = false,
            _upload_complete_flag = false,
            _error_flag = false,
            _same_origin_flag = false,
            _start_time,
            _timeoutset_time,
            _finalMime = null,
            _finalCharset = null,
            _options = {},
            _xhr,
            _responseHeaders = '',
            _responseHeadersBag;
        ;
        Basic.extend(this, props, {
          uid: Basic.guid('uid_'),
          upload: new XMLHttpRequestUpload(),
          open: function(method, url, async, user, password) {
            var urlp;
            if (!method || !url) {
              throw new x.DOMException(x.DOMException.SYNTAX_ERR);
            }
            if (/[\u0100-\uffff]/.test(method) || Encode.utf8_encode(method) !== method) {
              throw new x.DOMException(x.DOMException.SYNTAX_ERR);
            }
            if (!!~Basic.inArray(method.toUpperCase(), ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'TRACE', 'TRACK'])) {
              _method = method.toUpperCase();
            }
            if (!!~Basic.inArray(_method, ['CONNECT', 'TRACE', 'TRACK'])) {
              throw new x.DOMException(x.DOMException.SECURITY_ERR);
            }
            url = Encode.utf8_encode(url);
            urlp = Url.parseUrl(url);
            _same_origin_flag = Url.hasSameOrigin(urlp);
            _url = Url.resolveUrl(url);
            if ((user || password) && !_same_origin_flag) {
              throw new x.DOMException(x.DOMException.INVALID_ACCESS_ERR);
            }
            _user = user || urlp.user;
            _password = password || urlp.pass;
            _async = async || true;
            if (_async === false && (_p('timeout') || _p('withCredentials') || _p('responseType') !== "")) {
              throw new x.DOMException(x.DOMException.INVALID_ACCESS_ERR);
            }
            _sync_flag = !_async;
            _send_flag = false;
            _headers = {};
            _reset.call(this);
            _p('readyState', XMLHttpRequest.OPENED);
            this.convertEventPropsToHandlers(['readystatechange']);
            this.dispatchEvent('readystatechange');
          },
          setRequestHeader: function(header, value) {
            var uaHeaders = ["accept-charset", "accept-encoding", "access-control-request-headers", "access-control-request-method", "connection", "content-length", "cookie", "cookie2", "content-transfer-encoding", "date", "expect", "host", "keep-alive", "origin", "referer", "te", "trailer", "transfer-encoding", "upgrade", "user-agent", "via"];
            if (_p('readyState') !== XMLHttpRequest.OPENED || _send_flag) {
              throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
            }
            if (/[\u0100-\uffff]/.test(header) || Encode.utf8_encode(header) !== header) {
              throw new x.DOMException(x.DOMException.SYNTAX_ERR);
            }
            header = Basic.trim(header).toLowerCase();
            if (!!~Basic.inArray(header, uaHeaders) || /^(proxy\-|sec\-)/.test(header)) {
              return false;
            }
            if (!_headers[header]) {
              _headers[header] = value;
            } else {
              _headers[header] += ', ' + value;
            }
            return true;
          },
          getAllResponseHeaders: function() {
            return _responseHeaders || '';
          },
          getResponseHeader: function(header) {
            header = header.toLowerCase();
            if (_error_flag || !!~Basic.inArray(header, ['set-cookie', 'set-cookie2'])) {
              return null;
            }
            if (_responseHeaders && _responseHeaders !== '') {
              if (!_responseHeadersBag) {
                _responseHeadersBag = {};
                Basic.each(_responseHeaders.split(/\r\n/), function(line) {
                  var pair = line.split(/:\s+/);
                  if (pair.length === 2) {
                    pair[0] = Basic.trim(pair[0]);
                    _responseHeadersBag[pair[0].toLowerCase()] = {
                      header: pair[0],
                      value: Basic.trim(pair[1])
                    };
                  }
                });
              }
              if (_responseHeadersBag.hasOwnProperty(header)) {
                return _responseHeadersBag[header].header + ': ' + _responseHeadersBag[header].value;
              }
            }
            return null;
          },
          overrideMimeType: function(mime) {
            var matches,
                charset;
            if (!!~Basic.inArray(_p('readyState'), [XMLHttpRequest.LOADING, XMLHttpRequest.DONE])) {
              throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
            }
            mime = Basic.trim(mime.toLowerCase());
            if (/;/.test(mime) && (matches = mime.match(/^([^;]+)(?:;\scharset\=)?(.*)$/))) {
              mime = matches[1];
              if (matches[2]) {
                charset = matches[2];
              }
            }
            if (!Mime.mimes[mime]) {
              throw new x.DOMException(x.DOMException.SYNTAX_ERR);
            }
            _finalMime = mime;
            _finalCharset = charset;
          },
          send: function(data, options) {
            if (Basic.typeOf(options) === 'string') {
              _options = {ruid: options};
            } else if (!options) {
              _options = {};
            } else {
              _options = options;
            }
            this.convertEventPropsToHandlers(dispatches);
            this.upload.convertEventPropsToHandlers(dispatches);
            if (this.readyState !== XMLHttpRequest.OPENED || _send_flag) {
              throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
            }
            if (data instanceof Blob) {
              _options.ruid = data.ruid;
              _mimeType = data.type || 'application/octet-stream';
            } else if (data instanceof FormData) {
              if (data.hasBlob()) {
                var blob = data.getBlob();
                _options.ruid = blob.ruid;
                _mimeType = blob.type || 'application/octet-stream';
              }
            } else if (typeof data === 'string') {
              _encoding = 'UTF-8';
              _mimeType = 'text/plain;charset=UTF-8';
              data = Encode.utf8_encode(data);
            }
            if (!this.withCredentials) {
              this.withCredentials = (_options.required_caps && _options.required_caps.send_browser_cookies) && !_same_origin_flag;
            }
            _upload_events_flag = (!_sync_flag && this.upload.hasEventListener());
            _error_flag = false;
            _upload_complete_flag = !data;
            if (!_sync_flag) {
              _send_flag = true;
            }
            _doXHR.call(this, data);
          },
          abort: function() {
            _error_flag = true;
            _sync_flag = false;
            if (!~Basic.inArray(_p('readyState'), [XMLHttpRequest.UNSENT, XMLHttpRequest.OPENED, XMLHttpRequest.DONE])) {
              _p('readyState', XMLHttpRequest.DONE);
              _send_flag = false;
              if (_xhr) {
                _xhr.getRuntime().exec.call(_xhr, 'XMLHttpRequest', 'abort', _upload_complete_flag);
              } else {
                throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
              }
              _upload_complete_flag = true;
            } else {
              _p('readyState', XMLHttpRequest.UNSENT);
            }
          },
          destroy: function() {
            if (_xhr) {
              if (Basic.typeOf(_xhr.destroy) === 'function') {
                _xhr.destroy();
              }
              _xhr = null;
            }
            this.unbindAll();
            if (this.upload) {
              this.upload.unbindAll();
              this.upload = null;
            }
          }
        });
        function _p(prop, value) {
          if (!props.hasOwnProperty(prop)) {
            return;
          }
          if (arguments.length === 1) {
            return Env.can('define_property') ? props[prop] : self[prop];
          } else {
            if (Env.can('define_property')) {
              props[prop] = value;
            } else {
              self[prop] = value;
            }
          }
        }
        function _doXHR(data) {
          var self = this;
          _start_time = new Date().getTime();
          _xhr = new RuntimeTarget();
          function loadEnd() {
            if (_xhr) {
              _xhr.destroy();
              _xhr = null;
            }
            self.dispatchEvent('loadend');
            self = null;
          }
          function exec(runtime) {
            _xhr.bind('LoadStart', function(e) {
              _p('readyState', XMLHttpRequest.LOADING);
              self.dispatchEvent('readystatechange');
              self.dispatchEvent(e);
              if (_upload_events_flag) {
                self.upload.dispatchEvent(e);
              }
            });
            _xhr.bind('Progress', function(e) {
              if (_p('readyState') !== XMLHttpRequest.LOADING) {
                _p('readyState', XMLHttpRequest.LOADING);
                self.dispatchEvent('readystatechange');
              }
              self.dispatchEvent(e);
            });
            _xhr.bind('UploadProgress', function(e) {
              if (_upload_events_flag) {
                self.upload.dispatchEvent({
                  type: 'progress',
                  lengthComputable: false,
                  total: e.total,
                  loaded: e.loaded
                });
              }
            });
            _xhr.bind('Load', function(e) {
              _p('readyState', XMLHttpRequest.DONE);
              _p('status', Number(runtime.exec.call(_xhr, 'XMLHttpRequest', 'getStatus') || 0));
              _p('statusText', httpCode[_p('status')] || "");
              _p('response', runtime.exec.call(_xhr, 'XMLHttpRequest', 'getResponse', _p('responseType')));
              if (!!~Basic.inArray(_p('responseType'), ['text', ''])) {
                _p('responseText', _p('response'));
              } else if (_p('responseType') === 'document') {
                _p('responseXML', _p('response'));
              }
              _responseHeaders = runtime.exec.call(_xhr, 'XMLHttpRequest', 'getAllResponseHeaders');
              self.dispatchEvent('readystatechange');
              if (_p('status') > 0) {
                if (_upload_events_flag) {
                  self.upload.dispatchEvent(e);
                }
                self.dispatchEvent(e);
              } else {
                _error_flag = true;
                self.dispatchEvent('error');
              }
              loadEnd();
            });
            _xhr.bind('Abort', function(e) {
              self.dispatchEvent(e);
              loadEnd();
            });
            _xhr.bind('Error', function(e) {
              _error_flag = true;
              _p('readyState', XMLHttpRequest.DONE);
              self.dispatchEvent('readystatechange');
              _upload_complete_flag = true;
              self.dispatchEvent(e);
              loadEnd();
            });
            runtime.exec.call(_xhr, 'XMLHttpRequest', 'send', {
              url: _url,
              method: _method,
              async: _async,
              user: _user,
              password: _password,
              headers: _headers,
              mimeType: _mimeType,
              encoding: _encoding,
              responseType: self.responseType,
              withCredentials: self.withCredentials,
              options: _options
            }, data);
          }
          if (typeof(_options.required_caps) === 'string') {
            _options.required_caps = Runtime.parseCaps(_options.required_caps);
          }
          _options.required_caps = Basic.extend({}, _options.required_caps, {return_response_type: self.responseType});
          if (data instanceof FormData) {
            _options.required_caps.send_multipart = true;
          }
          if (!_same_origin_flag) {
            _options.required_caps.do_cors = true;
          }
          if (_options.ruid) {
            exec(_xhr.connectRuntime(_options));
          } else {
            _xhr.bind('RuntimeInit', function(e, runtime) {
              exec(runtime);
            });
            _xhr.bind('RuntimeError', function(e, err) {
              self.dispatchEvent('RuntimeError', err);
            });
            _xhr.connectRuntime(_options);
          }
        }
        function _reset() {
          _p('responseText', "");
          _p('responseXML', null);
          _p('response', null);
          _p('status', 0);
          _p('statusText', "");
          _start_time = _timeoutset_time = null;
        }
      }
      XMLHttpRequest.UNSENT = 0;
      XMLHttpRequest.OPENED = 1;
      XMLHttpRequest.HEADERS_RECEIVED = 2;
      XMLHttpRequest.LOADING = 3;
      XMLHttpRequest.DONE = 4;
      XMLHttpRequest.prototype = EventTarget.instance;
      return XMLHttpRequest;
    });
    define("moxie/runtime/Transporter", ["moxie/core/utils/Basic", "moxie/core/utils/Encode", "moxie/runtime/RuntimeClient", "moxie/core/EventTarget"], function(Basic, Encode, RuntimeClient, EventTarget) {
      function Transporter() {
        var mod,
            _runtime,
            _data,
            _size,
            _pos,
            _chunk_size;
        RuntimeClient.call(this);
        Basic.extend(this, {
          uid: Basic.guid('uid_'),
          state: Transporter.IDLE,
          result: null,
          transport: function(data, type, options) {
            var self = this;
            options = Basic.extend({chunk_size: 204798}, options);
            if ((mod = options.chunk_size % 3)) {
              options.chunk_size += 3 - mod;
            }
            _chunk_size = options.chunk_size;
            _reset.call(this);
            _data = data;
            _size = data.length;
            if (Basic.typeOf(options) === 'string' || options.ruid) {
              _run.call(self, type, this.connectRuntime(options));
            } else {
              var cb = function(e, runtime) {
                self.unbind("RuntimeInit", cb);
                _run.call(self, type, runtime);
              };
              this.bind("RuntimeInit", cb);
              this.connectRuntime(options);
            }
          },
          abort: function() {
            var self = this;
            self.state = Transporter.IDLE;
            if (_runtime) {
              _runtime.exec.call(self, 'Transporter', 'clear');
              self.trigger("TransportingAborted");
            }
            _reset.call(self);
          },
          destroy: function() {
            this.unbindAll();
            _runtime = null;
            this.disconnectRuntime();
            _reset.call(this);
          }
        });
        function _reset() {
          _size = _pos = 0;
          _data = this.result = null;
        }
        function _run(type, runtime) {
          var self = this;
          _runtime = runtime;
          self.bind("TransportingProgress", function(e) {
            _pos = e.loaded;
            if (_pos < _size && Basic.inArray(self.state, [Transporter.IDLE, Transporter.DONE]) === -1) {
              _transport.call(self);
            }
          }, 999);
          self.bind("TransportingComplete", function() {
            _pos = _size;
            self.state = Transporter.DONE;
            _data = null;
            self.result = _runtime.exec.call(self, 'Transporter', 'getAsBlob', type || '');
          }, 999);
          self.state = Transporter.BUSY;
          self.trigger("TransportingStarted");
          _transport.call(self);
        }
        function _transport() {
          var self = this,
              chunk,
              bytesLeft = _size - _pos;
          if (_chunk_size > bytesLeft) {
            _chunk_size = bytesLeft;
          }
          chunk = Encode.btoa(_data.substr(_pos, _chunk_size));
          _runtime.exec.call(self, 'Transporter', 'receive', chunk, _size);
        }
      }
      Transporter.IDLE = 0;
      Transporter.BUSY = 1;
      Transporter.DONE = 2;
      Transporter.prototype = EventTarget.instance;
      return Transporter;
    });
    define("moxie/image/Image", ["moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/file/FileReaderSync", "moxie/xhr/XMLHttpRequest", "moxie/runtime/Runtime", "moxie/runtime/RuntimeClient", "moxie/runtime/Transporter", "moxie/core/utils/Env", "moxie/core/EventTarget", "moxie/file/Blob", "moxie/file/File", "moxie/core/utils/Encode"], function(Basic, Dom, x, FileReaderSync, XMLHttpRequest, Runtime, RuntimeClient, Transporter, Env, EventTarget, Blob, File, Encode) {
      var dispatches = ['progress', 'load', 'error', 'resize', 'embedded'];
      function Image() {
        RuntimeClient.call(this);
        Basic.extend(this, {
          uid: Basic.guid('uid_'),
          ruid: null,
          name: "",
          size: 0,
          width: 0,
          height: 0,
          type: "",
          meta: {},
          clone: function() {
            this.load.apply(this, arguments);
          },
          load: function() {
            this.bind('Load Resize', function() {
              _updateInfo.call(this);
            }, 999);
            this.convertEventPropsToHandlers(dispatches);
            _load.apply(this, arguments);
          },
          downsize: function(opts) {
            var defaults = {
              width: this.width,
              height: this.height,
              crop: false,
              preserveHeaders: true
            };
            if (typeof(opts) === 'object') {
              opts = Basic.extend(defaults, opts);
            } else {
              opts = Basic.extend(defaults, {
                width: arguments[0],
                height: arguments[1],
                crop: arguments[2],
                preserveHeaders: arguments[3]
              });
            }
            try {
              if (!this.size) {
                throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
              }
              if (this.width > Image.MAX_RESIZE_WIDTH || this.height > Image.MAX_RESIZE_HEIGHT) {
                throw new x.ImageError(x.ImageError.MAX_RESOLUTION_ERR);
              }
              this.getRuntime().exec.call(this, 'Image', 'downsize', opts.width, opts.height, opts.crop, opts.preserveHeaders);
            } catch (ex) {
              this.trigger('error', ex.code);
            }
          },
          crop: function(width, height, preserveHeaders) {
            this.downsize(width, height, true, preserveHeaders);
          },
          getAsCanvas: function() {
            if (!Env.can('create_canvas')) {
              throw new x.RuntimeError(x.RuntimeError.NOT_SUPPORTED_ERR);
            }
            var runtime = this.connectRuntime(this.ruid);
            return runtime.exec.call(this, 'Image', 'getAsCanvas');
          },
          getAsBlob: function(type, quality) {
            if (!this.size) {
              throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
            }
            if (!type) {
              type = 'image/jpeg';
            }
            if (type === 'image/jpeg' && !quality) {
              quality = 90;
            }
            return this.getRuntime().exec.call(this, 'Image', 'getAsBlob', type, quality);
          },
          getAsDataURL: function(type, quality) {
            if (!this.size) {
              throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
            }
            return this.getRuntime().exec.call(this, 'Image', 'getAsDataURL', type, quality);
          },
          getAsBinaryString: function(type, quality) {
            var dataUrl = this.getAsDataURL(type, quality);
            return Encode.atob(dataUrl.substring(dataUrl.indexOf('base64,') + 7));
          },
          embed: function(el) {
            var self = this,
                imgCopy,
                type,
                quality,
                crop,
                options = arguments[1] || {},
                width = this.width,
                height = this.height,
                runtime;
            ;
            function onResize() {
              if (Env.can('create_canvas')) {
                var canvas = imgCopy.getAsCanvas();
                if (canvas) {
                  el.appendChild(canvas);
                  canvas = null;
                  imgCopy.destroy();
                  self.trigger('embedded');
                  return;
                }
              }
              var dataUrl = imgCopy.getAsDataURL(type, quality);
              if (!dataUrl) {
                throw new x.ImageError(x.ImageError.WRONG_FORMAT);
              }
              if (Env.can('use_data_uri_of', dataUrl.length)) {
                el.innerHTML = '<img src="' + dataUrl + '" width="' + imgCopy.width + '" height="' + imgCopy.height + '" />';
                imgCopy.destroy();
                self.trigger('embedded');
              } else {
                var tr = new Transporter();
                tr.bind("TransportingComplete", function() {
                  runtime = self.connectRuntime(this.result.ruid);
                  self.bind("Embedded", function() {
                    Basic.extend(runtime.getShimContainer().style, {
                      top: '0px',
                      left: '0px',
                      width: imgCopy.width + 'px',
                      height: imgCopy.height + 'px'
                    });
                    runtime = null;
                  }, 999);
                  runtime.exec.call(self, "ImageView", "display", this.result.uid, width, height);
                  imgCopy.destroy();
                });
                tr.transport(Encode.atob(dataUrl.substring(dataUrl.indexOf('base64,') + 7)), type, Basic.extend({}, options, {
                  required_caps: {display_media: true},
                  runtime_order: 'flash,silverlight',
                  container: el
                }));
              }
            }
            try {
              if (!(el = Dom.get(el))) {
                throw new x.DOMException(x.DOMException.INVALID_NODE_TYPE_ERR);
              }
              if (!this.size) {
                throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
              }
              if (this.width > Image.MAX_RESIZE_WIDTH || this.height > Image.MAX_RESIZE_HEIGHT) {
                throw new x.ImageError(x.ImageError.MAX_RESOLUTION_ERR);
              }
              type = options.type || this.type || 'image/jpeg';
              quality = options.quality || 90;
              crop = Basic.typeOf(options.crop) !== 'undefined' ? options.crop : false;
              if (options.width) {
                width = options.width;
                height = options.height || width;
              } else {
                var dimensions = Dom.getSize(el);
                if (dimensions.w && dimensions.h) {
                  width = dimensions.w;
                  height = dimensions.h;
                }
              }
              imgCopy = new Image();
              imgCopy.bind("Resize", function() {
                onResize.call(self);
              });
              imgCopy.bind("Load", function() {
                imgCopy.downsize(width, height, crop, false);
              });
              imgCopy.clone(this, false);
              return imgCopy;
            } catch (ex) {
              this.trigger('error', ex.code);
            }
          },
          destroy: function() {
            if (this.ruid) {
              this.getRuntime().exec.call(this, 'Image', 'destroy');
              this.disconnectRuntime();
            }
            this.unbindAll();
          }
        });
        function _updateInfo(info) {
          if (!info) {
            info = this.getRuntime().exec.call(this, 'Image', 'getInfo');
          }
          this.size = info.size;
          this.width = info.width;
          this.height = info.height;
          this.type = info.type;
          this.meta = info.meta;
          if (this.name === '') {
            this.name = info.name;
          }
        }
        function _load(src) {
          var srcType = Basic.typeOf(src);
          try {
            if (src instanceof Image) {
              if (!src.size) {
                throw new x.DOMException(x.DOMException.INVALID_STATE_ERR);
              }
              _loadFromImage.apply(this, arguments);
            } else if (src instanceof Blob) {
              if (!~Basic.inArray(src.type, ['image/jpeg', 'image/png'])) {
                throw new x.ImageError(x.ImageError.WRONG_FORMAT);
              }
              _loadFromBlob.apply(this, arguments);
            } else if (Basic.inArray(srcType, ['blob', 'file']) !== -1) {
              _load.call(this, new File(null, src), arguments[1]);
            } else if (srcType === 'string') {
              if (/^data:[^;]*;base64,/.test(src)) {
                _load.call(this, new Blob(null, {data: src}), arguments[1]);
              } else {
                _loadFromUrl.apply(this, arguments);
              }
            } else if (srcType === 'node' && src.nodeName.toLowerCase() === 'img') {
              _load.call(this, src.src, arguments[1]);
            } else {
              throw new x.DOMException(x.DOMException.TYPE_MISMATCH_ERR);
            }
          } catch (ex) {
            this.trigger('error', ex.code);
          }
        }
        function _loadFromImage(img, exact) {
          var runtime = this.connectRuntime(img.ruid);
          this.ruid = runtime.uid;
          runtime.exec.call(this, 'Image', 'loadFromImage', img, (Basic.typeOf(exact) === 'undefined' ? true : exact));
        }
        function _loadFromBlob(blob, options) {
          var self = this;
          self.name = blob.name || '';
          function exec(runtime) {
            self.ruid = runtime.uid;
            runtime.exec.call(self, 'Image', 'loadFromBlob', blob);
          }
          if (blob.isDetached()) {
            this.bind('RuntimeInit', function(e, runtime) {
              exec(runtime);
            });
            if (options && typeof(options.required_caps) === 'string') {
              options.required_caps = Runtime.parseCaps(options.required_caps);
            }
            this.connectRuntime(Basic.extend({required_caps: {
                access_image_binary: true,
                resize_image: true
              }}, options));
          } else {
            exec(this.connectRuntime(blob.ruid));
          }
        }
        function _loadFromUrl(url, options) {
          var self = this,
              xhr;
          xhr = new XMLHttpRequest();
          xhr.open('get', url);
          xhr.responseType = 'blob';
          xhr.onprogress = function(e) {
            self.trigger(e);
          };
          xhr.onload = function() {
            _loadFromBlob.call(self, xhr.response, true);
          };
          xhr.onerror = function(e) {
            self.trigger(e);
          };
          xhr.onloadend = function() {
            xhr.destroy();
          };
          xhr.bind('RuntimeError', function(e, err) {
            self.trigger('RuntimeError', err);
          });
          xhr.send(null, options);
        }
      }
      Image.MAX_RESIZE_WIDTH = 6500;
      Image.MAX_RESIZE_HEIGHT = 6500;
      Image.prototype = EventTarget.instance;
      return Image;
    });
    define("moxie/runtime/flash/Runtime", ["moxie/core/utils/Basic", "moxie/core/utils/Env", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/runtime/Runtime"], function(Basic, Env, Dom, x, Runtime) {
      var type = 'flash',
          extensions = {};
      function getShimVersion() {
        var version;
        try {
          version = navigator.plugins['Shockwave Flash'];
          version = version.description;
        } catch (e1) {
          try {
            version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
          } catch (e2) {
            version = '0.0';
          }
        }
        version = version.match(/\d+/g);
        return parseFloat(version[0] + '.' + version[1]);
      }
      function FlashRuntime(options) {
        var I = this,
            initTimer;
        options = Basic.extend({swf_url: Env.swf_url}, options);
        Runtime.call(this, options, type, {
          access_binary: function(value) {
            return value && I.mode === 'browser';
          },
          access_image_binary: function(value) {
            return value && I.mode === 'browser';
          },
          display_media: Runtime.capTrue,
          do_cors: Runtime.capTrue,
          drag_and_drop: false,
          report_upload_progress: function() {
            return I.mode === 'client';
          },
          resize_image: Runtime.capTrue,
          return_response_headers: false,
          return_response_type: function(responseType) {
            if (responseType === 'json' && !!window.JSON) {
              return true;
            }
            return !Basic.arrayDiff(responseType, ['', 'text', 'document']) || I.mode === 'browser';
          },
          return_status_code: function(code) {
            return I.mode === 'browser' || !Basic.arrayDiff(code, [200, 404]);
          },
          select_file: Runtime.capTrue,
          select_multiple: Runtime.capTrue,
          send_binary_string: function(value) {
            return value && I.mode === 'browser';
          },
          send_browser_cookies: function(value) {
            return value && I.mode === 'browser';
          },
          send_custom_headers: function(value) {
            return value && I.mode === 'browser';
          },
          send_multipart: Runtime.capTrue,
          slice_blob: function(value) {
            return value && I.mode === 'browser';
          },
          stream_upload: function(value) {
            return value && I.mode === 'browser';
          },
          summon_file_dialog: false,
          upload_filesize: function(size) {
            return Basic.parseSizeStr(size) <= 2097152 || I.mode === 'client';
          },
          use_http_method: function(methods) {
            return !Basic.arrayDiff(methods, ['GET', 'POST']);
          }
        }, {
          access_binary: function(value) {
            return value ? 'browser' : 'client';
          },
          access_image_binary: function(value) {
            return value ? 'browser' : 'client';
          },
          report_upload_progress: function(value) {
            return value ? 'browser' : 'client';
          },
          return_response_type: function(responseType) {
            return Basic.arrayDiff(responseType, ['', 'text', 'json', 'document']) ? 'browser' : ['client', 'browser'];
          },
          return_status_code: function(code) {
            return Basic.arrayDiff(code, [200, 404]) ? 'browser' : ['client', 'browser'];
          },
          send_binary_string: function(value) {
            return value ? 'browser' : 'client';
          },
          send_browser_cookies: function(value) {
            return value ? 'browser' : 'client';
          },
          send_custom_headers: function(value) {
            return value ? 'browser' : 'client';
          },
          stream_upload: function(value) {
            return value ? 'client' : 'browser';
          },
          upload_filesize: function(size) {
            return Basic.parseSizeStr(size) >= 2097152 ? 'client' : 'browser';
          }
        }, 'client');
        if (getShimVersion() < 10) {
          this.mode = false;
        }
        Basic.extend(this, {
          getShim: function() {
            return Dom.get(this.uid);
          },
          shimExec: function(component, action) {
            var args = [].slice.call(arguments, 2);
            return I.getShim().exec(this.uid, component, action, args);
          },
          init: function() {
            var html,
                el,
                container;
            container = this.getShimContainer();
            Basic.extend(container.style, {
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              width: '9px',
              height: '9px',
              overflow: 'hidden'
            });
            html = '<object id="' + this.uid + '" type="application/x-shockwave-flash" data="' + options.swf_url + '" ';
            if (Env.browser === 'IE') {
              html += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
            }
            html += 'width="100%" height="100%" style="outline:0">' + '<param name="movie" value="' + options.swf_url + '" />' + '<param name="flashvars" value="uid=' + escape(this.uid) + '&target=' + Env.global_event_dispatcher + '" />' + '<param name="wmode" value="transparent" />' + '<param name="allowscriptaccess" value="always" />' + '</object>';
            if (Env.browser === 'IE') {
              el = document.createElement('div');
              container.appendChild(el);
              el.outerHTML = html;
              el = container = null;
            } else {
              container.innerHTML = html;
            }
            initTimer = setTimeout(function() {
              if (I && !I.initialized) {
                I.trigger("Error", new x.RuntimeError(x.RuntimeError.NOT_INIT_ERR));
              }
            }, 5000);
          },
          destroy: (function(destroy) {
            return function() {
              destroy.call(I);
              clearTimeout(initTimer);
              options = initTimer = destroy = I = null;
            };
          }(this.destroy))
        }, extensions);
      }
      Runtime.addConstructor(type, FlashRuntime);
      return extensions;
    });
    define("moxie/runtime/flash/file/Blob", ["moxie/runtime/flash/Runtime", "moxie/file/Blob"], function(extensions, Blob) {
      var FlashBlob = {slice: function(blob, start, end, type) {
          var self = this.getRuntime();
          if (start < 0) {
            start = Math.max(blob.size + start, 0);
          } else if (start > 0) {
            start = Math.min(start, blob.size);
          }
          if (end < 0) {
            end = Math.max(blob.size + end, 0);
          } else if (end > 0) {
            end = Math.min(end, blob.size);
          }
          blob = self.shimExec.call(this, 'Blob', 'slice', start, end, type || '');
          if (blob) {
            blob = new Blob(self.uid, blob);
          }
          return blob;
        }};
      return (extensions.Blob = FlashBlob);
    });
    define("moxie/runtime/flash/file/FileInput", ["moxie/runtime/flash/Runtime"], function(extensions) {
      var FileInput = {init: function(options) {
          this.getRuntime().shimExec.call(this, 'FileInput', 'init', {
            name: options.name,
            accept: options.accept,
            multiple: options.multiple
          });
          this.trigger('ready');
        }};
      return (extensions.FileInput = FileInput);
    });
    define("moxie/runtime/flash/file/FileReader", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Encode"], function(extensions, Encode) {
      var _result = '';
      function _formatData(data, op) {
        switch (op) {
          case 'readAsText':
            return Encode.atob(data, 'utf8');
          case 'readAsBinaryString':
            return Encode.atob(data);
          case 'readAsDataURL':
            return data;
        }
        return null;
      }
      var FileReader = {
        read: function(op, blob) {
          var target = this,
              self = target.getRuntime();
          if (op === 'readAsDataURL') {
            _result = 'data:' + (blob.type || '') + ';base64,';
          }
          target.bind('Progress', function(e, data) {
            if (data) {
              _result += _formatData(data, op);
            }
          });
          return self.shimExec.call(this, 'FileReader', 'readAsBase64', blob.uid);
        },
        getResult: function() {
          return _result;
        },
        destroy: function() {
          _result = null;
        }
      };
      return (extensions.FileReader = FileReader);
    });
    define("moxie/runtime/flash/file/FileReaderSync", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Encode"], function(extensions, Encode) {
      function _formatData(data, op) {
        switch (op) {
          case 'readAsText':
            return Encode.atob(data, 'utf8');
          case 'readAsBinaryString':
            return Encode.atob(data);
          case 'readAsDataURL':
            return data;
        }
        return null;
      }
      var FileReaderSync = {read: function(op, blob) {
          var result,
              self = this.getRuntime();
          result = self.shimExec.call(this, 'FileReaderSync', 'readAsBase64', blob.uid);
          if (!result) {
            return null;
          }
          if (op === 'readAsDataURL') {
            result = 'data:' + (blob.type || '') + ';base64,' + result;
          }
          return _formatData(result, op, blob.type);
        }};
      return (extensions.FileReaderSync = FileReaderSync);
    });
    define("moxie/runtime/flash/xhr/XMLHttpRequest", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Basic", "moxie/file/Blob", "moxie/file/File", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/runtime/Transporter"], function(extensions, Basic, Blob, File, FileReaderSync, FormData, Transporter) {
      var XMLHttpRequest = {
        send: function(meta, data) {
          var target = this,
              self = target.getRuntime();
          function send() {
            meta.transport = self.mode;
            self.shimExec.call(target, 'XMLHttpRequest', 'send', meta, data);
          }
          function appendBlob(name, blob) {
            self.shimExec.call(target, 'XMLHttpRequest', 'appendBlob', name, blob.uid);
            data = null;
            send();
          }
          function attachBlob(blob, cb) {
            var tr = new Transporter();
            tr.bind("TransportingComplete", function() {
              cb(this.result);
            });
            tr.transport(blob.getSource(), blob.type, {ruid: self.uid});
          }
          if (!Basic.isEmptyObj(meta.headers)) {
            Basic.each(meta.headers, function(value, header) {
              self.shimExec.call(target, 'XMLHttpRequest', 'setRequestHeader', header, value.toString());
            });
          }
          if (data instanceof FormData) {
            var blobField;
            data.each(function(value, name) {
              if (value instanceof Blob) {
                blobField = name;
              } else {
                self.shimExec.call(target, 'XMLHttpRequest', 'append', name, value);
              }
            });
            if (!data.hasBlob()) {
              data = null;
              send();
            } else {
              var blob = data.getBlob();
              if (blob.isDetached()) {
                attachBlob(blob, function(attachedBlob) {
                  blob.destroy();
                  appendBlob(blobField, attachedBlob);
                });
              } else {
                appendBlob(blobField, blob);
              }
            }
          } else if (data instanceof Blob) {
            if (data.isDetached()) {
              attachBlob(data, function(attachedBlob) {
                data.destroy();
                data = attachedBlob.uid;
                send();
              });
            } else {
              data = data.uid;
              send();
            }
          } else {
            send();
          }
        },
        getResponse: function(responseType) {
          var frs,
              blob,
              self = this.getRuntime();
          blob = self.shimExec.call(this, 'XMLHttpRequest', 'getResponseAsBlob');
          if (blob) {
            blob = new File(self.uid, blob);
            if ('blob' === responseType) {
              return blob;
            }
            try {
              frs = new FileReaderSync();
              if (!!~Basic.inArray(responseType, ["", "text"])) {
                return frs.readAsText(blob);
              } else if ('json' === responseType && !!window.JSON) {
                return JSON.parse(frs.readAsText(blob));
              }
            } finally {
              blob.destroy();
            }
          }
          return null;
        },
        abort: function(upload_complete_flag) {
          var self = this.getRuntime();
          self.shimExec.call(this, 'XMLHttpRequest', 'abort');
          this.dispatchEvent('readystatechange');
          this.dispatchEvent('abort');
        }
      };
      return (extensions.XMLHttpRequest = XMLHttpRequest);
    });
    define("moxie/runtime/flash/runtime/Transporter", ["moxie/runtime/flash/Runtime", "moxie/file/Blob"], function(extensions, Blob) {
      var Transporter = {getAsBlob: function(type) {
          var self = this.getRuntime(),
              blob = self.shimExec.call(this, 'Transporter', 'getAsBlob', type);
          ;
          if (blob) {
            return new Blob(self.uid, blob);
          }
          return null;
        }};
      return (extensions.Transporter = Transporter);
    });
    define("moxie/runtime/flash/image/Image", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Basic", "moxie/runtime/Transporter", "moxie/file/Blob", "moxie/file/FileReaderSync"], function(extensions, Basic, Transporter, Blob, FileReaderSync) {
      var Image = {
        loadFromBlob: function(blob) {
          var comp = this,
              self = comp.getRuntime();
          function exec(srcBlob) {
            self.shimExec.call(comp, 'Image', 'loadFromBlob', srcBlob.uid);
            comp = self = null;
          }
          if (blob.isDetached()) {
            var tr = new Transporter();
            tr.bind("TransportingComplete", function() {
              exec(tr.result.getSource());
            });
            tr.transport(blob.getSource(), blob.type, {ruid: self.uid});
          } else {
            exec(blob.getSource());
          }
        },
        loadFromImage: function(img) {
          var self = this.getRuntime();
          return self.shimExec.call(this, 'Image', 'loadFromImage', img.uid);
        },
        getAsBlob: function(type, quality) {
          var self = this.getRuntime(),
              blob = self.shimExec.call(this, 'Image', 'getAsBlob', type, quality);
          ;
          if (blob) {
            return new Blob(self.uid, blob);
          }
          return null;
        },
        getAsDataURL: function() {
          var self = this.getRuntime(),
              blob = self.Image.getAsBlob.apply(this, arguments),
              frs;
          ;
          if (!blob) {
            return null;
          }
          frs = new FileReaderSync();
          return frs.readAsDataURL(blob);
        }
      };
      return (extensions.Image = Image);
    });
    expose(["moxie/core/utils/Basic", "moxie/core/I18n", "moxie/core/utils/Mime", "moxie/core/utils/Env", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/core/utils/Encode", "moxie/runtime/Runtime", "moxie/runtime/RuntimeClient", "moxie/file/Blob", "moxie/file/File", "moxie/file/FileInput", "moxie/runtime/RuntimeTarget", "moxie/file/FileReader", "moxie/core/utils/Url", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/xhr/XMLHttpRequest", "moxie/runtime/Transporter", "moxie/image/Image"]);
  })(this);
  (function(exports) {
    "use strict";
    var o = {},
        inArray = exports.moxie.core.utils.Basic.inArray;
    (function addAlias(ns) {
      var name,
          itemType;
      for (name in ns) {
        itemType = typeof(ns[name]);
        if (itemType === 'object' && !~inArray(name, ['Exceptions', 'Env', 'Mime'])) {
          addAlias(ns[name]);
        } else if (itemType === 'function') {
          o[name] = ns[name];
        }
      }
    })(exports.moxie);
    o.Env = exports.moxie.core.utils.Env;
    o.Mime = exports.moxie.core.utils.Mime;
    o.Exceptions = exports.moxie.core.Exceptions;
    exports.mOxie = o;
    if (!exports.o) {
      exports.o = o;
    }
    return o;
  })(this);
})(require("process"));
