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
    define("moxie/runtime/html4/Runtime", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/Runtime", "moxie/core/utils/Env"], function(Basic, x, Runtime, Env) {
      var type = 'html4',
          extensions = {};
      function Html4Runtime(options) {
        var I = this,
            Test = Runtime.capTest,
            True = Runtime.capTrue;
        ;
        Runtime.call(this, options, type, {
          access_binary: Test(window.FileReader || window.File && File.getAsDataURL),
          access_image_binary: false,
          display_media: Test(extensions.Image && (Env.can('create_canvas') || Env.can('use_data_uri_over32kb'))),
          do_cors: false,
          drag_and_drop: false,
          filter_by_extension: Test(function() {
            return (Env.browser === 'Chrome' && Env.version >= 28) || (Env.browser === 'IE' && Env.version >= 10);
          }()),
          resize_image: function() {
            return extensions.Image && I.can('access_binary') && Env.can('create_canvas');
          },
          report_upload_progress: false,
          return_response_headers: false,
          return_response_type: function(responseType) {
            if (responseType === 'json' && !!window.JSON) {
              return true;
            }
            return !!~Basic.inArray(responseType, ['text', 'document', '']);
          },
          return_status_code: function(code) {
            return !Basic.arrayDiff(code, [200, 404]);
          },
          select_file: function() {
            return Env.can('use_fileinput');
          },
          select_multiple: false,
          send_binary_string: false,
          send_custom_headers: false,
          send_multipart: true,
          slice_blob: false,
          stream_upload: function() {
            return I.can('select_file');
          },
          summon_file_dialog: Test(function() {
            return (Env.browser === 'Firefox' && Env.version >= 4) || (Env.browser === 'Opera' && Env.version >= 12) || !!~Basic.inArray(Env.browser, ['Chrome', 'Safari']);
          }()),
          upload_filesize: True,
          use_http_method: function(methods) {
            return !Basic.arrayDiff(methods, ['GET', 'POST']);
          }
        });
        Basic.extend(this, {
          init: function() {
            this.trigger("Init");
          },
          destroy: (function(destroy) {
            return function() {
              destroy.call(I);
              destroy = I = null;
            };
          }(this.destroy))
        });
        Basic.extend(this.getShim(), extensions);
      }
      Runtime.addConstructor(type, Html4Runtime);
      return extensions;
    });
    define('moxie/core/utils/Events', ['moxie/core/utils/Basic'], function(Basic) {
      var eventhash = {},
          uid = 'moxie_' + Basic.guid();
      function preventDefault() {
        this.returnValue = false;
      }
      function stopPropagation() {
        this.cancelBubble = true;
      }
      var addEvent = function(obj, name, callback, key) {
        var func,
            events;
        name = name.toLowerCase();
        if (obj.addEventListener) {
          func = callback;
          obj.addEventListener(name, func, false);
        } else if (obj.attachEvent) {
          func = function() {
            var evt = window.event;
            if (!evt.target) {
              evt.target = evt.srcElement;
            }
            evt.preventDefault = preventDefault;
            evt.stopPropagation = stopPropagation;
            callback(evt);
          };
          obj.attachEvent('on' + name, func);
        }
        if (!obj[uid]) {
          obj[uid] = Basic.guid();
        }
        if (!eventhash.hasOwnProperty(obj[uid])) {
          eventhash[obj[uid]] = {};
        }
        events = eventhash[obj[uid]];
        if (!events.hasOwnProperty(name)) {
          events[name] = [];
        }
        events[name].push({
          func: func,
          orig: callback,
          key: key
        });
      };
      var removeEvent = function(obj, name, callback) {
        var type,
            undef;
        name = name.toLowerCase();
        if (obj[uid] && eventhash[obj[uid]] && eventhash[obj[uid]][name]) {
          type = eventhash[obj[uid]][name];
        } else {
          return;
        }
        for (var i = type.length - 1; i >= 0; i--) {
          if (type[i].orig === callback || type[i].key === callback) {
            if (obj.removeEventListener) {
              obj.removeEventListener(name, type[i].func, false);
            } else if (obj.detachEvent) {
              obj.detachEvent('on' + name, type[i].func);
            }
            type[i].orig = null;
            type[i].func = null;
            type.splice(i, 1);
            if (callback !== undef) {
              break;
            }
          }
        }
        if (!type.length) {
          delete eventhash[obj[uid]][name];
        }
        if (Basic.isEmptyObj(eventhash[obj[uid]])) {
          delete eventhash[obj[uid]];
          try {
            delete obj[uid];
          } catch (e) {
            obj[uid] = undef;
          }
        }
      };
      var removeAllEvents = function(obj, key) {
        if (!obj || !obj[uid]) {
          return;
        }
        Basic.each(eventhash[obj[uid]], function(events, name) {
          removeEvent(obj, name, key);
        });
      };
      return {
        addEvent: addEvent,
        removeEvent: removeEvent,
        removeAllEvents: removeAllEvents
      };
    });
    define("moxie/runtime/html4/file/FileInput", ["moxie/runtime/html4/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/utils/Events", "moxie/core/utils/Mime", "moxie/core/utils/Env"], function(extensions, Basic, Dom, Events, Mime, Env) {
      function FileInput() {
        var _uid,
            _files = [],
            _mimes = [],
            _options;
        function addInput() {
          var comp = this,
              I = comp.getRuntime(),
              shimContainer,
              browseButton,
              currForm,
              form,
              input,
              uid;
          uid = Basic.guid('uid_');
          shimContainer = I.getShimContainer();
          if (_uid) {
            currForm = Dom.get(_uid + '_form');
            if (currForm) {
              Basic.extend(currForm.style, {top: '100%'});
            }
          }
          form = document.createElement('form');
          form.setAttribute('id', uid + '_form');
          form.setAttribute('method', 'post');
          form.setAttribute('enctype', 'multipart/form-data');
          form.setAttribute('encoding', 'multipart/form-data');
          Basic.extend(form.style, {
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          });
          input = document.createElement('input');
          input.setAttribute('id', uid);
          input.setAttribute('type', 'file');
          input.setAttribute('name', _options.name || 'Filedata');
          input.setAttribute('accept', _mimes.join(','));
          Basic.extend(input.style, {
            fontSize: '999px',
            opacity: 0
          });
          form.appendChild(input);
          shimContainer.appendChild(form);
          Basic.extend(input.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          });
          if (Env.browser === 'IE' && Env.version < 10) {
            Basic.extend(input.style, {filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=0)"});
          }
          input.onchange = function() {
            var file;
            if (!this.value) {
              return;
            }
            if (this.files) {
              file = this.files[0];
            } else {
              file = {name: this.value};
            }
            _files = [file];
            this.onchange = function() {};
            addInput.call(comp);
            comp.bind('change', function onChange() {
              var input = Dom.get(uid),
                  form = Dom.get(uid + '_form'),
                  file;
              comp.unbind('change', onChange);
              if (comp.files.length && input && form) {
                file = comp.files[0];
                input.setAttribute('id', file.uid);
                form.setAttribute('id', file.uid + '_form');
                form.setAttribute('target', file.uid + '_iframe');
              }
              input = form = null;
            }, 998);
            input = form = null;
            comp.trigger('change');
          };
          if (I.can('summon_file_dialog')) {
            browseButton = Dom.get(_options.browse_button);
            Events.removeEvent(browseButton, 'click', comp.uid);
            Events.addEvent(browseButton, 'click', function(e) {
              if (input && !input.disabled) {
                input.click();
              }
              e.preventDefault();
            }, comp.uid);
          }
          _uid = uid;
          shimContainer = currForm = browseButton = null;
        }
        Basic.extend(this, {
          init: function(options) {
            var comp = this,
                I = comp.getRuntime(),
                shimContainer;
            _options = options;
            _mimes = options.accept.mimes || Mime.extList2mimes(options.accept, I.can('filter_by_extension'));
            shimContainer = I.getShimContainer();
            (function() {
              var browseButton,
                  zIndex,
                  top;
              browseButton = Dom.get(options.browse_button);
              if (I.can('summon_file_dialog')) {
                if (Dom.getStyle(browseButton, 'position') === 'static') {
                  browseButton.style.position = 'relative';
                }
                zIndex = parseInt(Dom.getStyle(browseButton, 'z-index'), 10) || 1;
                browseButton.style.zIndex = zIndex;
                shimContainer.style.zIndex = zIndex - 1;
              }
              top = I.can('summon_file_dialog') ? browseButton : shimContainer;
              Events.addEvent(top, 'mouseover', function() {
                comp.trigger('mouseenter');
              }, comp.uid);
              Events.addEvent(top, 'mouseout', function() {
                comp.trigger('mouseleave');
              }, comp.uid);
              Events.addEvent(top, 'mousedown', function() {
                comp.trigger('mousedown');
              }, comp.uid);
              Events.addEvent(Dom.get(options.container), 'mouseup', function() {
                comp.trigger('mouseup');
              }, comp.uid);
              browseButton = null;
            }());
            addInput.call(this);
            shimContainer = null;
            comp.trigger({
              type: 'ready',
              async: true
            });
          },
          getFiles: function() {
            return _files;
          },
          disable: function(state) {
            var input;
            if ((input = Dom.get(_uid))) {
              input.disabled = !!state;
            }
          },
          destroy: function() {
            var I = this.getRuntime(),
                shim = I.getShim(),
                shimContainer = I.getShimContainer();
            ;
            Events.removeAllEvents(shimContainer, this.uid);
            Events.removeAllEvents(_options && Dom.get(_options.container), this.uid);
            Events.removeAllEvents(_options && Dom.get(_options.browse_button), this.uid);
            if (shimContainer) {
              shimContainer.innerHTML = '';
            }
            shim.removeInstance(this.uid);
            _uid = _files = _mimes = _options = shimContainer = shim = null;
          }
        });
      }
      return (extensions.FileInput = FileInput);
    });
    define("moxie/runtime/html5/Runtime", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/Runtime", "moxie/core/utils/Env"], function(Basic, x, Runtime, Env) {
      var type = "html5",
          extensions = {};
      function Html5Runtime(options) {
        var I = this,
            Test = Runtime.capTest,
            True = Runtime.capTrue;
        ;
        var caps = Basic.extend({
          access_binary: Test(window.FileReader || window.File && window.File.getAsDataURL),
          access_image_binary: function() {
            return I.can('access_binary') && !!extensions.Image;
          },
          display_media: Test(Env.can('create_canvas') || Env.can('use_data_uri_over32kb')),
          do_cors: Test(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()),
          drag_and_drop: Test(function() {
            var div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && (Env.browser !== 'IE' || Env.version > 9);
          }()),
          filter_by_extension: Test(function() {
            return (Env.browser === 'Chrome' && Env.version >= 28) || (Env.browser === 'IE' && Env.version >= 10);
          }()),
          return_response_headers: True,
          return_response_type: function(responseType) {
            if (responseType === 'json' && !!window.JSON) {
              return true;
            }
            return Env.can('return_response_type', responseType);
          },
          return_status_code: True,
          report_upload_progress: Test(window.XMLHttpRequest && new XMLHttpRequest().upload),
          resize_image: function() {
            return I.can('access_binary') && Env.can('create_canvas');
          },
          select_file: function() {
            return Env.can('use_fileinput') && window.File;
          },
          select_folder: function() {
            return I.can('select_file') && Env.browser === 'Chrome' && Env.version >= 21;
          },
          select_multiple: function() {
            return I.can('select_file') && !(Env.browser === 'Safari' && Env.os === 'Windows') && !(Env.os === 'iOS' && Env.verComp(Env.osVersion, "7.0.4", '<'));
          },
          send_binary_string: Test(window.XMLHttpRequest && (new XMLHttpRequest().sendAsBinary || (window.Uint8Array && window.ArrayBuffer))),
          send_custom_headers: Test(window.XMLHttpRequest),
          send_multipart: function() {
            return !!(window.XMLHttpRequest && new XMLHttpRequest().upload && window.FormData) || I.can('send_binary_string');
          },
          slice_blob: Test(window.File && (File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice)),
          stream_upload: function() {
            return I.can('slice_blob') && I.can('send_multipart');
          },
          summon_file_dialog: Test(function() {
            return (Env.browser === 'Firefox' && Env.version >= 4) || (Env.browser === 'Opera' && Env.version >= 12) || (Env.browser === 'IE' && Env.version >= 10) || !!~Basic.inArray(Env.browser, ['Chrome', 'Safari']);
          }()),
          upload_filesize: True
        }, arguments[2]);
        Runtime.call(this, options, (arguments[1] || type), caps);
        Basic.extend(this, {
          init: function() {
            this.trigger("Init");
          },
          destroy: (function(destroy) {
            return function() {
              destroy.call(I);
              destroy = I = null;
            };
          }(this.destroy))
        });
        Basic.extend(this.getShim(), extensions);
      }
      Runtime.addConstructor(type, Html5Runtime);
      return extensions;
    });
    define("moxie/runtime/html5/file/FileReader", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Encode", "moxie/core/utils/Basic"], function(extensions, Encode, Basic) {
      function FileReader() {
        var _fr,
            _convertToBinary = false;
        Basic.extend(this, {
          read: function(op, blob) {
            var target = this;
            _fr = new window.FileReader();
            _fr.addEventListener('progress', function(e) {
              target.trigger(e);
            });
            _fr.addEventListener('load', function(e) {
              target.trigger(e);
            });
            _fr.addEventListener('error', function(e) {
              target.trigger(e, _fr.error);
            });
            _fr.addEventListener('loadend', function() {
              _fr = null;
            });
            if (Basic.typeOf(_fr[op]) === 'function') {
              _convertToBinary = false;
              _fr[op](blob.getSource());
            } else if (op === 'readAsBinaryString') {
              _convertToBinary = true;
              _fr.readAsDataURL(blob.getSource());
            }
          },
          getResult: function() {
            return _fr && _fr.result ? (_convertToBinary ? _toBinary(_fr.result) : _fr.result) : null;
          },
          abort: function() {
            if (_fr) {
              _fr.abort();
            }
          },
          destroy: function() {
            _fr = null;
          }
        });
        function _toBinary(str) {
          return Encode.atob(str.substring(str.indexOf('base64,') + 7));
        }
      }
      return (extensions.FileReader = FileReader);
    });
    define("moxie/runtime/html4/file/FileReader", ["moxie/runtime/html4/Runtime", "moxie/runtime/html5/file/FileReader"], function(extensions, FileReader) {
      return (extensions.FileReader = FileReader);
    });
    define("moxie/runtime/html4/xhr/XMLHttpRequest", ["moxie/runtime/html4/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/utils/Url", "moxie/core/Exceptions", "moxie/core/utils/Events", "moxie/file/Blob", "moxie/xhr/FormData"], function(extensions, Basic, Dom, Url, x, Events, Blob, FormData) {
      function XMLHttpRequest() {
        var _status,
            _response,
            _iframe;
        function cleanup(cb) {
          var target = this,
              uid,
              form,
              inputs,
              i,
              hasFile = false;
          if (!_iframe) {
            return;
          }
          uid = _iframe.id.replace(/_iframe$/, '');
          form = Dom.get(uid + '_form');
          if (form) {
            inputs = form.getElementsByTagName('input');
            i = inputs.length;
            while (i--) {
              switch (inputs[i].getAttribute('type')) {
                case 'hidden':
                  inputs[i].parentNode.removeChild(inputs[i]);
                  break;
                case 'file':
                  hasFile = true;
                  break;
              }
            }
            inputs = [];
            if (!hasFile) {
              form.parentNode.removeChild(form);
            }
            form = null;
          }
          setTimeout(function() {
            Events.removeEvent(_iframe, 'load', target.uid);
            if (_iframe.parentNode) {
              _iframe.parentNode.removeChild(_iframe);
            }
            var shimContainer = target.getRuntime().getShimContainer();
            if (!shimContainer.children.length) {
              shimContainer.parentNode.removeChild(shimContainer);
            }
            shimContainer = _iframe = null;
            cb();
          }, 1);
        }
        Basic.extend(this, {
          send: function(meta, data) {
            var target = this,
                I = target.getRuntime(),
                uid,
                form,
                input,
                blob;
            _status = _response = null;
            function createIframe() {
              var container = I.getShimContainer() || document.body,
                  temp = document.createElement('div');
              ;
              temp.innerHTML = '<iframe id="' + uid + '_iframe" name="' + uid + '_iframe" src="javascript:&quot;&quot;" style="display:none"></iframe>';
              _iframe = temp.firstChild;
              container.appendChild(_iframe);
              Events.addEvent(_iframe, 'load', function() {
                var el;
                try {
                  el = _iframe.contentWindow.document || _iframe.contentDocument || window.frames[_iframe.id].document;
                  if (/^4(0[0-9]|1[0-7]|2[2346])\s/.test(el.title)) {
                    _status = el.title.replace(/^(\d+).*$/, '$1');
                  } else {
                    _status = 200;
                    _response = Basic.trim(el.body.innerHTML);
                    target.trigger({
                      type: 'progress',
                      loaded: _response.length,
                      total: _response.length
                    });
                    if (blob) {
                      target.trigger({
                        type: 'uploadprogress',
                        loaded: blob.size || 1025,
                        total: blob.size || 1025
                      });
                    }
                  }
                } catch (ex) {
                  if (Url.hasSameOrigin(meta.url)) {
                    _status = 404;
                  } else {
                    cleanup.call(target, function() {
                      target.trigger('error');
                    });
                    return;
                  }
                }
                cleanup.call(target, function() {
                  target.trigger('load');
                });
              }, target.uid);
            }
            if (data instanceof FormData && data.hasBlob()) {
              blob = data.getBlob();
              uid = blob.uid;
              input = Dom.get(uid);
              form = Dom.get(uid + '_form');
              if (!form) {
                throw new x.DOMException(x.DOMException.NOT_FOUND_ERR);
              }
            } else {
              uid = Basic.guid('uid_');
              form = document.createElement('form');
              form.setAttribute('id', uid + '_form');
              form.setAttribute('method', meta.method);
              form.setAttribute('enctype', 'multipart/form-data');
              form.setAttribute('encoding', 'multipart/form-data');
              form.setAttribute('target', uid + '_iframe');
              I.getShimContainer().appendChild(form);
            }
            if (data instanceof FormData) {
              data.each(function(value, name) {
                if (value instanceof Blob) {
                  if (input) {
                    input.setAttribute('name', name);
                  }
                } else {
                  var hidden = document.createElement('input');
                  Basic.extend(hidden, {
                    type: 'hidden',
                    name: name,
                    value: value
                  });
                  if (input) {
                    form.insertBefore(hidden, input);
                  } else {
                    form.appendChild(hidden);
                  }
                }
              });
            }
            form.setAttribute("action", meta.url);
            createIframe();
            form.submit();
            target.trigger('loadstart');
          },
          getStatus: function() {
            return _status;
          },
          getResponse: function(responseType) {
            if ('json' === responseType) {
              if (Basic.typeOf(_response) === 'string' && !!window.JSON) {
                try {
                  return JSON.parse(_response.replace(/^\s*<pre[^>]*>/, '').replace(/<\/pre>\s*$/, ''));
                } catch (ex) {
                  return null;
                }
              }
            } else if ('document' === responseType) {}
            return _response;
          },
          abort: function() {
            var target = this;
            if (_iframe && _iframe.contentWindow) {
              if (_iframe.contentWindow.stop) {
                _iframe.contentWindow.stop();
              } else if (_iframe.contentWindow.document.execCommand) {
                _iframe.contentWindow.document.execCommand('Stop');
              } else {
                _iframe.src = "about:blank";
              }
            }
            cleanup.call(this, function() {
              target.dispatchEvent('abort');
            });
          }
        });
      }
      return (extensions.XMLHttpRequest = XMLHttpRequest);
    });
    define("moxie/runtime/html5/utils/BinaryReader", [], function() {
      return function() {
        var II = false,
            bin;
        function read(idx, size) {
          var mv = II ? 0 : -8 * (size - 1),
              sum = 0,
              i;
          for (i = 0; i < size; i++) {
            sum |= (bin.charCodeAt(idx + i) << Math.abs(mv + i * 8));
          }
          return sum;
        }
        function putstr(segment, idx, length) {
          length = arguments.length === 3 ? length : bin.length - idx - 1;
          bin = bin.substr(0, idx) + segment + bin.substr(length + idx);
        }
        function write(idx, num, size) {
          var str = '',
              mv = II ? 0 : -8 * (size - 1),
              i;
          for (i = 0; i < size; i++) {
            str += String.fromCharCode((num >> Math.abs(mv + i * 8)) & 255);
          }
          putstr(str, idx, size);
        }
        return {
          II: function(order) {
            if (order === undefined) {
              return II;
            } else {
              II = order;
            }
          },
          init: function(binData) {
            II = false;
            bin = binData;
          },
          SEGMENT: function(idx, length, segment) {
            switch (arguments.length) {
              case 1:
                return bin.substr(idx, bin.length - idx - 1);
              case 2:
                return bin.substr(idx, length);
              case 3:
                putstr(segment, idx, length);
                break;
              default:
                return bin;
            }
          },
          BYTE: function(idx) {
            return read(idx, 1);
          },
          SHORT: function(idx) {
            return read(idx, 2);
          },
          LONG: function(idx, num) {
            if (num === undefined) {
              return read(idx, 4);
            } else {
              write(idx, num, 4);
            }
          },
          SLONG: function(idx) {
            var num = read(idx, 4);
            return (num > 2147483647 ? num - 4294967296 : num);
          },
          STRING: function(idx, size) {
            var str = '';
            for (size += idx; idx < size; idx++) {
              str += String.fromCharCode(read(idx, 1));
            }
            return str;
          }
        };
      };
    });
    define("moxie/runtime/html5/image/JPEGHeaders", ["moxie/runtime/html5/utils/BinaryReader"], function(BinaryReader) {
      return function JPEGHeaders(data) {
        var headers = [],
            read,
            idx,
            marker,
            length = 0;
        read = new BinaryReader();
        read.init(data);
        if (read.SHORT(0) !== 0xFFD8) {
          return;
        }
        idx = 2;
        while (idx <= data.length) {
          marker = read.SHORT(idx);
          if (marker >= 0xFFD0 && marker <= 0xFFD7) {
            idx += 2;
            continue;
          }
          if (marker === 0xFFDA || marker === 0xFFD9) {
            break;
          }
          length = read.SHORT(idx + 2) + 2;
          if (marker >= 0xFFE1 && marker <= 0xFFEF) {
            headers.push({
              hex: marker,
              name: 'APP' + (marker & 0x000F),
              start: idx,
              length: length,
              segment: read.SEGMENT(idx, length)
            });
          }
          idx += length;
        }
        read.init(null);
        return {
          headers: headers,
          restore: function(data) {
            var max,
                i;
            read.init(data);
            idx = read.SHORT(2) == 0xFFE0 ? 4 + read.SHORT(4) : 2;
            for (i = 0, max = headers.length; i < max; i++) {
              read.SEGMENT(idx, 0, headers[i].segment);
              idx += headers[i].length;
            }
            data = read.SEGMENT();
            read.init(null);
            return data;
          },
          strip: function(data) {
            var headers,
                jpegHeaders,
                i;
            jpegHeaders = new JPEGHeaders(data);
            headers = jpegHeaders.headers;
            jpegHeaders.purge();
            read.init(data);
            i = headers.length;
            while (i--) {
              read.SEGMENT(headers[i].start, headers[i].length, '');
            }
            data = read.SEGMENT();
            read.init(null);
            return data;
          },
          get: function(name) {
            var array = [];
            for (var i = 0,
                max = headers.length; i < max; i++) {
              if (headers[i].name === name.toUpperCase()) {
                array.push(headers[i].segment);
              }
            }
            return array;
          },
          set: function(name, segment) {
            var array = [],
                i,
                ii,
                max;
            if (typeof(segment) === 'string') {
              array.push(segment);
            } else {
              array = segment;
            }
            for (i = ii = 0, max = headers.length; i < max; i++) {
              if (headers[i].name === name.toUpperCase()) {
                headers[i].segment = array[ii];
                headers[i].length = array[ii].length;
                ii++;
              }
              if (ii >= array.length) {
                break;
              }
            }
          },
          purge: function() {
            headers = [];
            read.init(null);
            read = null;
          }
        };
      };
    });
    define("moxie/runtime/html5/image/ExifParser", ["moxie/core/utils/Basic", "moxie/runtime/html5/utils/BinaryReader"], function(Basic, BinaryReader) {
      return function ExifParser() {
        var data,
            tags,
            Tiff,
            offsets = {},
            tagDescs;
        data = new BinaryReader();
        tags = {
          tiff: {
            0x0112: 'Orientation',
            0x010E: 'ImageDescription',
            0x010F: 'Make',
            0x0110: 'Model',
            0x0131: 'Software',
            0x8769: 'ExifIFDPointer',
            0x8825: 'GPSInfoIFDPointer'
          },
          exif: {
            0x9000: 'ExifVersion',
            0xA001: 'ColorSpace',
            0xA002: 'PixelXDimension',
            0xA003: 'PixelYDimension',
            0x9003: 'DateTimeOriginal',
            0x829A: 'ExposureTime',
            0x829D: 'FNumber',
            0x8827: 'ISOSpeedRatings',
            0x9201: 'ShutterSpeedValue',
            0x9202: 'ApertureValue',
            0x9207: 'MeteringMode',
            0x9208: 'LightSource',
            0x9209: 'Flash',
            0x920A: 'FocalLength',
            0xA402: 'ExposureMode',
            0xA403: 'WhiteBalance',
            0xA406: 'SceneCaptureType',
            0xA404: 'DigitalZoomRatio',
            0xA408: 'Contrast',
            0xA409: 'Saturation',
            0xA40A: 'Sharpness'
          },
          gps: {
            0x0000: 'GPSVersionID',
            0x0001: 'GPSLatitudeRef',
            0x0002: 'GPSLatitude',
            0x0003: 'GPSLongitudeRef',
            0x0004: 'GPSLongitude'
          }
        };
        tagDescs = {
          'ColorSpace': {
            1: 'sRGB',
            0: 'Uncalibrated'
          },
          'MeteringMode': {
            0: 'Unknown',
            1: 'Average',
            2: 'CenterWeightedAverage',
            3: 'Spot',
            4: 'MultiSpot',
            5: 'Pattern',
            6: 'Partial',
            255: 'Other'
          },
          'LightSource': {
            1: 'Daylight',
            2: 'Fliorescent',
            3: 'Tungsten',
            4: 'Flash',
            9: 'Fine weather',
            10: 'Cloudy weather',
            11: 'Shade',
            12: 'Daylight fluorescent (D 5700 - 7100K)',
            13: 'Day white fluorescent (N 4600 -5400K)',
            14: 'Cool white fluorescent (W 3900 - 4500K)',
            15: 'White fluorescent (WW 3200 - 3700K)',
            17: 'Standard light A',
            18: 'Standard light B',
            19: 'Standard light C',
            20: 'D55',
            21: 'D65',
            22: 'D75',
            23: 'D50',
            24: 'ISO studio tungsten',
            255: 'Other'
          },
          'Flash': {
            0x0000: 'Flash did not fire.',
            0x0001: 'Flash fired.',
            0x0005: 'Strobe return light not detected.',
            0x0007: 'Strobe return light detected.',
            0x0009: 'Flash fired, compulsory flash mode',
            0x000D: 'Flash fired, compulsory flash mode, return light not detected',
            0x000F: 'Flash fired, compulsory flash mode, return light detected',
            0x0010: 'Flash did not fire, compulsory flash mode',
            0x0018: 'Flash did not fire, auto mode',
            0x0019: 'Flash fired, auto mode',
            0x001D: 'Flash fired, auto mode, return light not detected',
            0x001F: 'Flash fired, auto mode, return light detected',
            0x0020: 'No flash function',
            0x0041: 'Flash fired, red-eye reduction mode',
            0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
            0x0047: 'Flash fired, red-eye reduction mode, return light detected',
            0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
            0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
            0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
            0x0059: 'Flash fired, auto mode, red-eye reduction mode',
            0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
            0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
          },
          'ExposureMode': {
            0: 'Auto exposure',
            1: 'Manual exposure',
            2: 'Auto bracket'
          },
          'WhiteBalance': {
            0: 'Auto white balance',
            1: 'Manual white balance'
          },
          'SceneCaptureType': {
            0: 'Standard',
            1: 'Landscape',
            2: 'Portrait',
            3: 'Night scene'
          },
          'Contrast': {
            0: 'Normal',
            1: 'Soft',
            2: 'Hard'
          },
          'Saturation': {
            0: 'Normal',
            1: 'Low saturation',
            2: 'High saturation'
          },
          'Sharpness': {
            0: 'Normal',
            1: 'Soft',
            2: 'Hard'
          },
          'GPSLatitudeRef': {
            N: 'North latitude',
            S: 'South latitude'
          },
          'GPSLongitudeRef': {
            E: 'East longitude',
            W: 'West longitude'
          }
        };
        function extractTags(IFD_offset, tags2extract) {
          var length = data.SHORT(IFD_offset),
              i,
              ii,
              tag,
              type,
              count,
              tagOffset,
              offset,
              value,
              values = [],
              hash = {};
          for (i = 0; i < length; i++) {
            offset = tagOffset = IFD_offset + 12 * i + 2;
            tag = tags2extract[data.SHORT(offset)];
            if (tag === undefined) {
              continue;
            }
            type = data.SHORT(offset += 2);
            count = data.LONG(offset += 2);
            offset += 4;
            values = [];
            switch (type) {
              case 1:
              case 7:
                if (count > 4) {
                  offset = data.LONG(offset) + offsets.tiffHeader;
                }
                for (ii = 0; ii < count; ii++) {
                  values[ii] = data.BYTE(offset + ii);
                }
                break;
              case 2:
                if (count > 4) {
                  offset = data.LONG(offset) + offsets.tiffHeader;
                }
                hash[tag] = data.STRING(offset, count - 1);
                continue;
              case 3:
                if (count > 2) {
                  offset = data.LONG(offset) + offsets.tiffHeader;
                }
                for (ii = 0; ii < count; ii++) {
                  values[ii] = data.SHORT(offset + ii * 2);
                }
                break;
              case 4:
                if (count > 1) {
                  offset = data.LONG(offset) + offsets.tiffHeader;
                }
                for (ii = 0; ii < count; ii++) {
                  values[ii] = data.LONG(offset + ii * 4);
                }
                break;
              case 5:
                offset = data.LONG(offset) + offsets.tiffHeader;
                for (ii = 0; ii < count; ii++) {
                  values[ii] = data.LONG(offset + ii * 4) / data.LONG(offset + ii * 4 + 4);
                }
                break;
              case 9:
                offset = data.LONG(offset) + offsets.tiffHeader;
                for (ii = 0; ii < count; ii++) {
                  values[ii] = data.SLONG(offset + ii * 4);
                }
                break;
              case 10:
                offset = data.LONG(offset) + offsets.tiffHeader;
                for (ii = 0; ii < count; ii++) {
                  values[ii] = data.SLONG(offset + ii * 4) / data.SLONG(offset + ii * 4 + 4);
                }
                break;
              default:
                continue;
            }
            value = (count == 1 ? values[0] : values);
            if (tagDescs.hasOwnProperty(tag) && typeof value != 'object') {
              hash[tag] = tagDescs[tag][value];
            } else {
              hash[tag] = value;
            }
          }
          return hash;
        }
        function getIFDOffsets() {
          var idx = offsets.tiffHeader;
          data.II(data.SHORT(idx) == 0x4949);
          if (data.SHORT(idx += 2) !== 0x002A) {
            return false;
          }
          offsets.IFD0 = offsets.tiffHeader + data.LONG(idx += 2);
          Tiff = extractTags(offsets.IFD0, tags.tiff);
          if ('ExifIFDPointer' in Tiff) {
            offsets.exifIFD = offsets.tiffHeader + Tiff.ExifIFDPointer;
            delete Tiff.ExifIFDPointer;
          }
          if ('GPSInfoIFDPointer' in Tiff) {
            offsets.gpsIFD = offsets.tiffHeader + Tiff.GPSInfoIFDPointer;
            delete Tiff.GPSInfoIFDPointer;
          }
          return true;
        }
        function setTag(ifd, tag, value) {
          var offset,
              length,
              tagOffset,
              valueOffset = 0;
          if (typeof(tag) === 'string') {
            var tmpTags = tags[ifd.toLowerCase()];
            for (var hex in tmpTags) {
              if (tmpTags[hex] === tag) {
                tag = hex;
                break;
              }
            }
          }
          offset = offsets[ifd.toLowerCase() + 'IFD'];
          length = data.SHORT(offset);
          for (var i = 0; i < length; i++) {
            tagOffset = offset + 12 * i + 2;
            if (data.SHORT(tagOffset) == tag) {
              valueOffset = tagOffset + 8;
              break;
            }
          }
          if (!valueOffset) {
            return false;
          }
          data.LONG(valueOffset, value);
          return true;
        }
        return {
          init: function(segment) {
            offsets = {tiffHeader: 10};
            if (segment === undefined || !segment.length) {
              return false;
            }
            data.init(segment);
            if (data.SHORT(0) === 0xFFE1 && data.STRING(4, 5).toUpperCase() === "EXIF\0") {
              return getIFDOffsets();
            }
            return false;
          },
          TIFF: function() {
            return Tiff;
          },
          EXIF: function() {
            var Exif;
            Exif = extractTags(offsets.exifIFD, tags.exif);
            if (Exif.ExifVersion && Basic.typeOf(Exif.ExifVersion) === 'array') {
              for (var i = 0,
                  exifVersion = ''; i < Exif.ExifVersion.length; i++) {
                exifVersion += String.fromCharCode(Exif.ExifVersion[i]);
              }
              Exif.ExifVersion = exifVersion;
            }
            return Exif;
          },
          GPS: function() {
            var GPS;
            GPS = extractTags(offsets.gpsIFD, tags.gps);
            if (GPS.GPSVersionID && Basic.typeOf(GPS.GPSVersionID) === 'array') {
              GPS.GPSVersionID = GPS.GPSVersionID.join('.');
            }
            return GPS;
          },
          setExif: function(tag, value) {
            if (tag !== 'PixelXDimension' && tag !== 'PixelYDimension') {
              return false;
            }
            return setTag('exif', tag, value);
          },
          getBinary: function() {
            return data.SEGMENT();
          },
          purge: function() {
            data.init(null);
            data = Tiff = null;
            offsets = {};
          }
        };
      };
    });
    define("moxie/runtime/html5/image/JPEG", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/html5/image/JPEGHeaders", "moxie/runtime/html5/utils/BinaryReader", "moxie/runtime/html5/image/ExifParser"], function(Basic, x, JPEGHeaders, BinaryReader, ExifParser) {
      function JPEG(binstr) {
        var _binstr,
            _br,
            _hm,
            _ep,
            _info,
            hasExif;
        function _getDimensions() {
          var idx = 0,
              marker,
              length;
          while (idx <= _binstr.length) {
            marker = _br.SHORT(idx += 2);
            if (marker >= 0xFFC0 && marker <= 0xFFC3) {
              idx += 5;
              return {
                height: _br.SHORT(idx),
                width: _br.SHORT(idx += 2)
              };
            }
            length = _br.SHORT(idx += 2);
            idx += length - 2;
          }
          return null;
        }
        _binstr = binstr;
        _br = new BinaryReader();
        _br.init(_binstr);
        if (_br.SHORT(0) !== 0xFFD8) {
          throw new x.ImageError(x.ImageError.WRONG_FORMAT);
        }
        _hm = new JPEGHeaders(binstr);
        _ep = new ExifParser();
        hasExif = !!_ep.init(_hm.get('app1')[0]);
        _info = _getDimensions.call(this);
        Basic.extend(this, {
          type: 'image/jpeg',
          size: _binstr.length,
          width: _info && _info.width || 0,
          height: _info && _info.height || 0,
          setExif: function(tag, value) {
            if (!hasExif) {
              return false;
            }
            if (Basic.typeOf(tag) === 'object') {
              Basic.each(tag, function(value, tag) {
                _ep.setExif(tag, value);
              });
            } else {
              _ep.setExif(tag, value);
            }
            _hm.set('app1', _ep.getBinary());
          },
          writeHeaders: function() {
            if (!arguments.length) {
              return (_binstr = _hm.restore(_binstr));
            }
            return _hm.restore(arguments[0]);
          },
          stripHeaders: function(binstr) {
            return _hm.strip(binstr);
          },
          purge: function() {
            _purge.call(this);
          }
        });
        if (hasExif) {
          this.meta = {
            tiff: _ep.TIFF(),
            exif: _ep.EXIF(),
            gps: _ep.GPS()
          };
        }
        function _purge() {
          if (!_ep || !_hm || !_br) {
            return;
          }
          _ep.purge();
          _hm.purge();
          _br.init(null);
          _binstr = _info = _hm = _ep = _br = null;
        }
      }
      return JPEG;
    });
    define("moxie/runtime/html5/image/PNG", ["moxie/core/Exceptions", "moxie/core/utils/Basic", "moxie/runtime/html5/utils/BinaryReader"], function(x, Basic, BinaryReader) {
      function PNG(binstr) {
        var _binstr,
            _br,
            _hm,
            _ep,
            _info;
        _binstr = binstr;
        _br = new BinaryReader();
        _br.init(_binstr);
        (function() {
          var idx = 0,
              i = 0,
              signature = [0x8950, 0x4E47, 0x0D0A, 0x1A0A];
          ;
          for (i = 0; i < signature.length; i++, idx += 2) {
            if (signature[i] != _br.SHORT(idx)) {
              throw new x.ImageError(x.ImageError.WRONG_FORMAT);
            }
          }
        }());
        function _getDimensions() {
          var chunk,
              idx;
          chunk = _getChunkAt.call(this, 8);
          if (chunk.type == 'IHDR') {
            idx = chunk.start;
            return {
              width: _br.LONG(idx),
              height: _br.LONG(idx += 4)
            };
          }
          return null;
        }
        function _purge() {
          if (!_br) {
            return;
          }
          _br.init(null);
          _binstr = _info = _hm = _ep = _br = null;
        }
        _info = _getDimensions.call(this);
        Basic.extend(this, {
          type: 'image/png',
          size: _binstr.length,
          width: _info.width,
          height: _info.height,
          purge: function() {
            _purge.call(this);
          }
        });
        _purge.call(this);
        function _getChunkAt(idx) {
          var length,
              type,
              start,
              CRC;
          length = _br.LONG(idx);
          type = _br.STRING(idx += 4, 4);
          start = idx += 4;
          CRC = _br.LONG(idx + length);
          return {
            length: length,
            type: type,
            start: start,
            CRC: CRC
          };
        }
      }
      return PNG;
    });
    define("moxie/runtime/html5/image/ImageInfo", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/html5/image/JPEG", "moxie/runtime/html5/image/PNG"], function(Basic, x, JPEG, PNG) {
      return function(binstr) {
        var _cs = [JPEG, PNG],
            _img;
        _img = (function() {
          for (var i = 0; i < _cs.length; i++) {
            try {
              return new _cs[i](binstr);
            } catch (ex) {}
          }
          throw new x.ImageError(x.ImageError.WRONG_FORMAT);
        }());
        Basic.extend(this, {
          type: '',
          size: 0,
          width: 0,
          height: 0,
          setExif: function() {},
          writeHeaders: function(data) {
            return data;
          },
          stripHeaders: function(data) {
            return data;
          },
          purge: function() {}
        });
        Basic.extend(this, _img);
        this.purge = function() {
          _img.purge();
          _img = null;
        };
      };
    });
    define("moxie/runtime/html5/image/MegaPixel", [], function() {
      function renderImageToCanvas(img, canvas, options) {
        var iw = img.naturalWidth,
            ih = img.naturalHeight;
        var width = options.width,
            height = options.height;
        var x = options.x || 0,
            y = options.y || 0;
        var ctx = canvas.getContext('2d');
        if (detectSubsampling(img)) {
          iw /= 2;
          ih /= 2;
        }
        var d = 1024;
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = tmpCanvas.height = d;
        var tmpCtx = tmpCanvas.getContext('2d');
        var vertSquashRatio = detectVerticalSquash(img, iw, ih);
        var sy = 0;
        while (sy < ih) {
          var sh = sy + d > ih ? ih - sy : d;
          var sx = 0;
          while (sx < iw) {
            var sw = sx + d > iw ? iw - sx : d;
            tmpCtx.clearRect(0, 0, d, d);
            tmpCtx.drawImage(img, -sx, -sy);
            var dx = (sx * width / iw + x) << 0;
            var dw = Math.ceil(sw * width / iw);
            var dy = (sy * height / ih / vertSquashRatio + y) << 0;
            var dh = Math.ceil(sh * height / ih / vertSquashRatio);
            ctx.drawImage(tmpCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
            sx += d;
          }
          sy += d;
        }
        tmpCanvas = tmpCtx = null;
      }
      function detectSubsampling(img) {
        var iw = img.naturalWidth,
            ih = img.naturalHeight;
        if (iw * ih > 1024 * 1024) {
          var canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, -iw + 1, 0);
          return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        } else {
          return false;
        }
      }
      function detectVerticalSquash(img, iw, ih) {
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = ih;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, 1, ih).data;
        var sy = 0;
        var ey = ih;
        var py = ih;
        while (py > sy) {
          var alpha = data[(py - 1) * 4 + 3];
          if (alpha === 0) {
            ey = py;
          } else {
            sy = py;
          }
          py = (ey + sy) >> 1;
        }
        canvas = null;
        var ratio = (py / ih);
        return (ratio === 0) ? 1 : ratio;
      }
      return {
        isSubsampled: detectSubsampling,
        renderTo: renderImageToCanvas
      };
    });
    define("moxie/runtime/html5/image/Image", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/core/utils/Encode", "moxie/file/File", "moxie/runtime/html5/image/ImageInfo", "moxie/runtime/html5/image/MegaPixel", "moxie/core/utils/Mime", "moxie/core/utils/Env"], function(extensions, Basic, x, Encode, File, ImageInfo, MegaPixel, Mime, Env) {
      function HTML5Image() {
        var me = this,
            _img,
            _imgInfo,
            _canvas,
            _binStr,
            _blob,
            _modified = false,
            _preserveHeaders = true;
        ;
        Basic.extend(this, {
          loadFromBlob: function(blob) {
            var comp = this,
                I = comp.getRuntime(),
                asBinary = arguments.length > 1 ? arguments[1] : true;
            ;
            if (!I.can('access_binary')) {
              throw new x.RuntimeError(x.RuntimeError.NOT_SUPPORTED_ERR);
            }
            _blob = blob;
            if (blob.isDetached()) {
              _binStr = blob.getSource();
              _preload.call(this, _binStr);
              return;
            } else {
              _readAsDataUrl.call(this, blob.getSource(), function(dataUrl) {
                if (asBinary) {
                  _binStr = _toBinary(dataUrl);
                }
                _preload.call(comp, dataUrl);
              });
            }
          },
          loadFromImage: function(img, exact) {
            this.meta = img.meta;
            _blob = new File(null, {
              name: img.name,
              size: img.size,
              type: img.type
            });
            _preload.call(this, exact ? (_binStr = img.getAsBinaryString()) : img.getAsDataURL());
          },
          getInfo: function() {
            var I = this.getRuntime(),
                info;
            if (!_imgInfo && _binStr && I.can('access_image_binary')) {
              _imgInfo = new ImageInfo(_binStr);
            }
            info = {
              width: _getImg().width || 0,
              height: _getImg().height || 0,
              type: _blob.type || Mime.getFileMime(_blob.name),
              size: _binStr && _binStr.length || _blob.size || 0,
              name: _blob.name || '',
              meta: _imgInfo && _imgInfo.meta || this.meta || {}
            };
            return info;
          },
          downsize: function() {
            _downsize.apply(this, arguments);
          },
          getAsCanvas: function() {
            if (_canvas) {
              _canvas.id = this.uid + '_canvas';
            }
            return _canvas;
          },
          getAsBlob: function(type, quality) {
            if (type !== this.type) {
              _downsize.call(this, this.width, this.height, false);
            }
            return new File(null, {
              name: _blob.name || '',
              type: type,
              data: me.getAsBinaryString.call(this, type, quality)
            });
          },
          getAsDataURL: function(type) {
            var quality = arguments[1] || 90;
            if (!_modified) {
              return _img.src;
            }
            if ('image/jpeg' !== type) {
              return _canvas.toDataURL('image/png');
            } else {
              try {
                return _canvas.toDataURL('image/jpeg', quality / 100);
              } catch (ex) {
                return _canvas.toDataURL('image/jpeg');
              }
            }
          },
          getAsBinaryString: function(type, quality) {
            if (!_modified) {
              if (!_binStr) {
                _binStr = _toBinary(me.getAsDataURL(type, quality));
              }
              return _binStr;
            }
            if ('image/jpeg' !== type) {
              _binStr = _toBinary(me.getAsDataURL(type, quality));
            } else {
              var dataUrl;
              if (!quality) {
                quality = 90;
              }
              try {
                dataUrl = _canvas.toDataURL('image/jpeg', quality / 100);
              } catch (ex) {
                dataUrl = _canvas.toDataURL('image/jpeg');
              }
              _binStr = _toBinary(dataUrl);
              if (_imgInfo) {
                _binStr = _imgInfo.stripHeaders(_binStr);
                if (_preserveHeaders) {
                  if (_imgInfo.meta && _imgInfo.meta.exif) {
                    _imgInfo.setExif({
                      PixelXDimension: this.width,
                      PixelYDimension: this.height
                    });
                  }
                  _binStr = _imgInfo.writeHeaders(_binStr);
                }
                _imgInfo.purge();
                _imgInfo = null;
              }
            }
            _modified = false;
            return _binStr;
          },
          destroy: function() {
            me = null;
            _purge.call(this);
            this.getRuntime().getShim().removeInstance(this.uid);
          }
        });
        function _getImg() {
          if (!_canvas && !_img) {
            throw new x.ImageError(x.DOMException.INVALID_STATE_ERR);
          }
          return _canvas || _img;
        }
        function _toBinary(str) {
          return Encode.atob(str.substring(str.indexOf('base64,') + 7));
        }
        function _toDataUrl(str, type) {
          return 'data:' + (type || '') + ';base64,' + Encode.btoa(str);
        }
        function _preload(str) {
          var comp = this;
          _img = new Image();
          _img.onerror = function() {
            _purge.call(this);
            comp.trigger('error', x.ImageError.WRONG_FORMAT);
          };
          _img.onload = function() {
            comp.trigger('load');
          };
          _img.src = /^data:[^;]*;base64,/.test(str) ? str : _toDataUrl(str, _blob.type);
        }
        function _readAsDataUrl(file, callback) {
          var comp = this,
              fr;
          if (window.FileReader) {
            fr = new FileReader();
            fr.onload = function() {
              callback(this.result);
            };
            fr.onerror = function() {
              comp.trigger('error', x.ImageError.WRONG_FORMAT);
            };
            fr.readAsDataURL(file);
          } else {
            return callback(file.getAsDataURL());
          }
        }
        function _downsize(width, height, crop, preserveHeaders) {
          var self = this,
              scale,
              mathFn,
              x = 0,
              y = 0,
              img,
              destWidth,
              destHeight,
              orientation;
          ;
          _preserveHeaders = preserveHeaders;
          orientation = (this.meta && this.meta.tiff && this.meta.tiff.Orientation) || 1;
          if (Basic.inArray(orientation, [5, 6, 7, 8]) !== -1) {
            var tmp = width;
            width = height;
            height = tmp;
          }
          img = _getImg();
          if (!crop) {
            scale = Math.min(width / img.width, height / img.height);
          } else {
            width = Math.min(width, img.width);
            height = Math.min(height, img.height);
            scale = Math.max(width / img.width, height / img.height);
          }
          if (scale > 1 && !crop && preserveHeaders) {
            this.trigger('Resize');
            return;
          }
          if (!_canvas) {
            _canvas = document.createElement("canvas");
          }
          destWidth = Math.round(img.width * scale);
          destHeight = Math.round(img.height * scale);
          if (crop) {
            _canvas.width = width;
            _canvas.height = height;
            if (destWidth > width) {
              x = Math.round((destWidth - width) / 2);
            }
            if (destHeight > height) {
              y = Math.round((destHeight - height) / 2);
            }
          } else {
            _canvas.width = destWidth;
            _canvas.height = destHeight;
          }
          if (!_preserveHeaders) {
            _rotateToOrientaion(_canvas.width, _canvas.height, orientation);
          }
          _drawToCanvas.call(this, img, _canvas, -x, -y, destWidth, destHeight);
          this.width = _canvas.width;
          this.height = _canvas.height;
          _modified = true;
          self.trigger('Resize');
        }
        function _drawToCanvas(img, canvas, x, y, w, h) {
          if (Env.OS === 'iOS') {
            MegaPixel.renderTo(img, canvas, {
              width: w,
              height: h,
              x: x,
              y: y
            });
          } else {
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, x, y, w, h);
          }
        }
        function _rotateToOrientaion(width, height, orientation) {
          switch (orientation) {
            case 5:
            case 6:
            case 7:
            case 8:
              _canvas.width = height;
              _canvas.height = width;
              break;
            default:
              _canvas.width = width;
              _canvas.height = height;
          }
          var ctx = _canvas.getContext('2d');
          switch (orientation) {
            case 2:
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
              break;
            case 3:
              ctx.translate(width, height);
              ctx.rotate(Math.PI);
              break;
            case 4:
              ctx.translate(0, height);
              ctx.scale(1, -1);
              break;
            case 5:
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(0, -height);
              break;
            case 7:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(width, -height);
              ctx.scale(-1, 1);
              break;
            case 8:
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-width, 0);
              break;
          }
        }
        function _purge() {
          if (_imgInfo) {
            _imgInfo.purge();
            _imgInfo = null;
          }
          _binStr = _img = _canvas = _blob = null;
          _modified = false;
        }
      }
      return (extensions.Image = HTML5Image);
    });
    define("moxie/runtime/html4/image/Image", ["moxie/runtime/html4/Runtime", "moxie/runtime/html5/image/Image"], function(extensions, Image) {
      return (extensions.Image = Image);
    });
    expose(["moxie/core/utils/Basic", "moxie/core/I18n", "moxie/core/utils/Mime", "moxie/core/utils/Env", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/core/utils/Encode", "moxie/runtime/Runtime", "moxie/runtime/RuntimeClient", "moxie/file/Blob", "moxie/file/File", "moxie/file/FileInput", "moxie/runtime/RuntimeTarget", "moxie/file/FileReader", "moxie/core/utils/Url", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/xhr/XMLHttpRequest", "moxie/runtime/Transporter", "moxie/image/Image", "moxie/core/utils/Events"]);
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
})(require('process'));
