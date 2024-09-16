const d3 = require('d3');

// ribbon function from d3 version 3
var π = Math.PI, halfπ = π / 2;
function d3_functor(v) {
    return typeof v === "function" ? v : function() {
        return v;
    };
}

function d3_source(d) {
  return d.source;
}

function d3_target(d) {
  return d.target;
}

function d3_svg_chordRadius(d) {
  return d.radius;
}

function d3_svg_arcStartAngle(d) {
  return d.startAngle;
}

function d3_svg_arcEndAngle(d) {
  return d.endAngle;
}

var ribbonV3 = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
        var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
        result = "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.p0) : curve(t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(s.p0)) + "Z";
        return result;
    }
    function subgroup(self, f, d, i) {
        var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - halfπ, a1 = endAngle.call(self, subgroup, i) - halfπ;
        return {
            r: r,
            a0: a0,
            a1: a1,
            p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
            p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
        };
    }
    function equals(a, b) {
        return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
        return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
    }
    function curve(p1) {
        return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
        if (!arguments.length) return radius;
        radius = d3_functor(v);
        return chord;
    };
    chord.source = function(v) {
        if (!arguments.length) return source;
        source = d3_functor(v);
        return chord;
    };
    chord.target = function(v) {
        if (!arguments.length) return target;
        target = d3_functor(v);
        return chord;
    };
    chord.startAngle = function(v) {
        if (!arguments.length) return startAngle;
        startAngle = d3_functor(v);
        return chord;
    };
    chord.endAngle = function(v) {
        if (!arguments.length) return endAngle;
        endAngle = d3_functor(v);
        return chord;
    };
    return chord;
};
// end of ribbon function from d3 version 3


// Bellow code extracted from circosjs https://github.com/nicgirault/circosJS and d3 version upgraded to use version 7.9

var circosJS,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
        'use strict';
        var index, key, source;
        if (target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        target = Object(target);
        index = 1;
        while (index < arguments.length) {
            source = arguments[index];
            if (source !== null) {
                for (key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            index++;
        }
        return target;
    };
}

circosJS = function(conf) {
    var instance;
    instance = new circosJS.Core(conf);
    return instance;
};

circosJS.Core = function(conf) {
    this.tracks = {
        heatmaps: {},
        histograms: {},
        chords: {},
        scatters: {},
        lines: {},
        stacks: {},
        highlights: {},
        texts: {}
    };
    this.conf = circosJS.mixConf(conf, this.defaultConf);
    return this;
};

circosJS.Core.prototype.removeTracks = function(trackIds) {
    var id, l, len, ref, store, svg, trackId, type;
    svg = d3.select(this.conf.container);
    ref = this.tracks;
    for (type in ref) {
        store = ref[type];
        if (typeof trackIds === 'object') {
            for (l = 0, len = trackIds.length; l < len; l++) {
                id = trackIds[l];
                if (id in store) {
                    svg.select('.' + id).remove();
                    delete store[id];
                }
            }
        } else if (typeof trackIds === 'string') {
            if (trackIds in store) {
                svg.select('.' + trackIds).remove();
                delete store[trackIds];
            }
        } else if (typeof trackIds === 'undefined') {
            for (trackId in store) {
                svg.select('.' + trackId).remove();
                delete store[trackId];
            }
        }
    }
    return this;
};

circosJS.Core.prototype.layout = function(conf, data) {
    this._layout = new circosJS.Layout(conf, data);
    return this;
};

circosJS.log = function(level, code, message, data) {
    var levels;
    levels = ['Permanent log', 'Error', 'Warning', 'Info'];
    console.log('CircosJS: ', levels[level] + ' [' + code + '] ', message, data);
};

circosJS.mixConf = function(conf, defaultConf) {
    var key, newConf, value;
    newConf = {};
    for (key in defaultConf) {
        value = defaultConf[key];
        if (key in conf) {
            if (Object.prototype.toString.call(value) === '[object Array]') {
                newConf[key] = conf[key];
            } else if (typeof value === 'object' && (value != null)) {
                if ((value != null) && Object.keys(value).length === 0) {
                    newConf[key] = conf[key];
                } else {
                    newConf[key] = circosJS.mixConf(conf[key], value);
                }
            } else {
                newConf[key] = conf[key];
            }
        } else {
            newConf[key] = value;
        }
    }
    return newConf;
};

circosJS.Core.prototype.smartBorders = function() {
    var border, borders, currentBorder, l, layout, len, ref, store, track, trackId, trackType, width;
    width = this.conf.defaultTrackWidth;
    layout = {
        'in': this._layout.conf.innerRadius,
        out: this._layout.conf.outerRadius
    };
    borders = [];
    ref = this.tracks;
    for (trackType in ref) {
        store = ref[trackType];
        for (trackId in store) {
            track = store[trackId];
            if (track.conf.innerRadius) {
                borders.push({
                    'in': track.conf.innerRadius,
                    out: track.conf.outerRadius
                });
            }
        }
    }
    borders = borders.sort(function(a, b) {
        if (a.out > b.out) {
            1;
        }
        if (a.out < b.out) {
            -1;
        }
        return 0;
    });
    currentBorder = layout;
    for (l = 0, len = borders.length; l < len; l++) {
        border = borders[l];
        if (border.out < currentBorder['in'] - width) {
            return {
                'in': currentBorder['in'] - width,
                out: currentBorder['in']
            };
        }
        currentBorder = border;
    }
    if (currentBorder['in'] > width) {
        return {
            'in': currentBorder['in'] - width,
            out: currentBorder['in']
        };
    } else {
        return {
            'in': borders[0].out,
            out: borders[0].out + width
        };
    }
};

if (typeof module !== 'undefined' && module !== null) {
    module.exports = circosJS;
}

circosJS.checkParent = function(key, index, layoutSummary, header) {
    if (!(key in layoutSummary)) {
        circosJS.log(1, 'datum', 'unknown parent id', {
            line: index + 1,
            value: key,
            header: header,
            layoutSummary: layoutSummary
        });
        return false;
    }
    return true;
};

circosJS.checkNumber = function(keys, index) {
    var header, value;
    for (header in keys) {
        value = keys[header];
        if (isNaN(value)) {
            circosJS.log(1, 'datum', 'not a number', {
                line: index + 1,
                value: value,
                header: header
            });
            return false;
        }
    }
    return true;
};

circosJS.parseChordData = function(data, layoutSummary) {
    var sample;
    sample = data[0];
    if ('source_id' in sample && 'source_start' in sample && 'source_end' && 'target_id' in sample && 'target_start' in sample && 'target_end' in sample) {
        data = data.map(function(datum) {
            var elts;
            elts = [datum.source_id, datum.source_start, datum.source_end, datum.target_id, datum.target_start, datum.target_end];
            if (datum.value != null) {
                elts.push(datum.value);
            }
            return elts;
        });
    }
    data = data.filter(function(datum, index) {
        return circosJS.checkParent(datum[0], index, layoutSummary, 'source_id');
    }).filter(function(datum, index) {
        return circosJS.checkParent(datum[3], index, layoutSummary, 'target_id');
    }).filter(function(datum, index) {
        return circosJS.checkNumber({
            source_start: datum[1],
            source_end: datum[2],
            target_start: datum[4],
            target_end: datum[5],
            value: datum[6] || 1
        }, index);
    }).map(function(datum) {
        return {
            source: {
                id: datum[0],
                start: Math.max(0, parseFloat(datum[1])),
                end: Math.min(layoutSummary[datum[0]], parseFloat(datum[2]))
            },
            target: {
                id: datum[3],
                start: Math.max(0, parseFloat(datum[4])),
                end: Math.min(layoutSummary[datum[3]], parseFloat(datum[5]))
            },
            value: parseFloat(datum[6]),
            hsp: datum[7]
        };
    });
    return {
        data: data,
        meta: {
            min: d3.min(data, function(d) {
                return d.value;
            }),
            max: d3.max(data, function(d) {
                return d.value;
            })
        }
    };
};

circosJS.Layout = function(conf, data) {
    var block_nb, gap, k, offset, ref, ref1, size, v;
    if (data == null) {
        circosJS.log(2, 'no layout data', '');
    }
    this.conf = circosJS.mixConf(conf, JSON.parse(JSON.stringify(this.defaultConf)));
    this.data = data;
    this.blocks = {};
    this.size = 0;
    offset = 0;
    ref = this.data;
    for (k in ref) {
        v = ref[k];
        this.blocks[v.id] = {
            label: v.label,
            len: v.len,
            color: v.color,
            offset: offset
        };
        v.offset = offset;
        offset += v.len;
    }
    this.size = offset;
    gap = this.conf.gap;
    size = this.size;
    block_nb = this.data.length;
    ref1 = this.data;
    for (k in ref1) {
        v = ref1[k];
        this.blocks[v.id].start = v.offset / size * (2 * Math.PI - block_nb * gap) + k * gap;
        this.blocks[v.id].end = (v.offset + v.len) / size * (2 * Math.PI - block_nb * gap) + k * gap;
        v.start = v.offset / size * (2 * Math.PI - block_nb * gap) + k * gap;
        v.end = (v.offset + v.len) / size * (2 * Math.PI - block_nb * gap) + k * gap;
    }
    this.getAngle = function(blockId, unit) {
        var block;
        block = this.blocks[blockId].start / this._size;
        if (unit === 'deg') {
            return block * 360;
        } else if (unit === 'rad') {
            return block * 2 * Math.PI;
        } else {
            return null;
        }
    };
    this.summary = function() {
        var d, l, layoutSummary, len, ref2;
        layoutSummary = {};
        ref2 = this._data;
        for (l = 0, len = ref2.length; l < len; l++) {
            d = ref2[l];
            layoutSummary[d.id] = d.len;
        }
        return layoutSummary;
    };
    return this;
};

circosJS.Core.prototype.chord = function(id, conf, data) {
    var track;
    track = new circosJS.Chord();
    track.build(this, conf, data);
    this.tracks.chords[id] = track;
    return this;
};

circosJS.Chord = function() {
    circosJS.Track.call(this);
    this.parseData = circosJS.parseChordData;
    this.applyRules = function(rules, data) {
        var datum, l, len, results, rule;
        rules = rules || [];
        results = [];
        for (l = 0, len = data.length; l < len; l++) {
            datum = data[l];
            results.push((function() {
                var len1, m, results1;
                results1 = [];
                for (m = 0, len1 = rules.length; m < len1; m++) {
                    rule = rules[m];
                    if (rule.condition(datum)) {
                        results1.push(datum[rule.parameter] = rule.value);
                    } else {
                        results1.push(void 0);
                    }
                }
                return results1;
            })());
        }
        return results;
    };
    this.getSource = (function(_this) {
        return function(d, layout) {
            var block, endAngle, result, startAngle;
            d = d.source;
            block = layout.blocks[d.id];
            startAngle = block.start + d.start / block.len * (block.end - block.start);
            endAngle = block.start + d.end / block.len * (block.end - block.start);
            result = {
                radius: layout.conf.innerRadius,
                startAngle: startAngle,
                endAngle: endAngle
            };
            return result;
        };
    })(this);
    this.getTarget = (function(_this) {
        return function(d, layout) {
            var block, endAngle, result, startAngle;
            d = d.target;
            block = layout.blocks[d.id];
            startAngle = block.start + d.start / block.len * (block.end - block.start);
            endAngle = block.start + d.end / block.len * (block.end - block.start);
            result = {
                radius: layout.conf.innerRadius,
                startAngle: startAngle,
                endAngle: endAngle
            };
            return result;
        };
    })(this);
    this.dimChords = function (parentElement, d, conf, index) {
        parentElement.selectAll('path').style('opacity', function (p, i) {
            if (d === p) {
                return 1;
            }
            return 0;
        });
    };
    this.resetChords = function (parentElement,conf) {
        parentElement.selectAll('path').style('opacity',conf.opacity);
    };
    this.renderChords = function(parentElement, name, conf, data, layout, ratio, getSource, getTarget) {
        var link, track;
        track = parentElement.append('g').attr('class', conf.colorPalette);
        link = track
            .selectAll('.chord')
            .data(data)
            .enter()
            .append('path')
            .attr('class', 'chord')
            .attr('d', ribbonV3()
                .source(function(d) {
                    return getSource(d, layout);
                })
                .target(function(d) {
                    return getTarget(d, layout);
                })
            )
            .attr('opacity', function(_d) {
                return conf.opacity;
            })
            .attr('id', function(d) {
                return d.source.id + '_' + d.target.id;
            })
            .on('mouseover', (function(_this) {
                return function(event, d) {
                    _this.dimChords(track, d, conf);
                    return _this.dispatch.call('mouseover', event, d);
                };
            })(this))
            .on('mouseout', (function(_this) {
                return function(event, d) {
                    _this.resetChords(track, conf);
                    return _this.dispatch.call('mouseout', event, d);
                };
            })(this));

        if (conf.usePalette) {
            link.attr('class', function(d) {
                return 'q' + ratio(d.value, conf.cmin, conf.cmax, conf.colorPaletteSize, conf.colorPaletteReverse, conf.logScale) + '-' + conf.colorPaletteSize;
            });
        } else {
            link.attr('fill', function(d) {
                return d.color || conf.color;
            });
        }
        return link;
    };
    this.render = (function(_this) {
        return function(instance, parentElement, name) {
            var selection, track;
            parentElement.select('.' + name).remove();
            track = parentElement.append('g').attr('class', name).attr('z-index', _this.conf.zIndex);
            selection = _this.renderChords(track, name, _this.conf, _this.data, instance._layout, _this.ratio, _this.getSource, _this.getTarget);
            if (_this.conf.tooltipContent != null) {
                return circosJS.registerTooltip(instance, _this, selection, _this.conf);
            }
        };
    })(this);
    return this;
};

circosJS.Track = function() {
    this.build = function(instance, conf, data) {
        this.dispatch = d3.dispatch('mouseover', 'mouseout');
        this.loadData(data, instance);
        this.conf = this.processConf(conf, this.defaultConf, this.meta, instance, this);
        return this.applyRules(conf.rules, this.data);
    };
    this.loadData = function(data, instance) {
        var d, l, layoutSummary, len, ref, result;
        layoutSummary = {};
        ref = instance._layout.data;
        for (l = 0, len = ref.length; l < len; l++) {
            d = ref[l];
            layoutSummary[d.id] = d.len;
        }
        result = this.parseData(data, layoutSummary);
        this.data = result.data;
        return this.meta = result.meta;
    };
    this.processConf = function(conf, defaultConf, meta, instance, utils) {
        var smartBorders;
        conf = circosJS.mixConf(conf, Object.assign({}, defaultConf));
        conf = utils.computeMinMax(conf, meta);
        if (conf.innerRadius === 0 && conf.outerRadius === 0) {
            smartBorders = instance.smartBorders();
            conf.innerRadius = smartBorders['in'];
            conf.outerRadius = smartBorders.out;
        }
        return conf;
    };
    this.applyRules = function(rules, data) {
        var datum, i, k, results, rule, v;
        rules = rules || [];
        results = [];
        for (k in data) {
            v = data[k];
            results.push((function() {
                var ref, results1;
                ref = v.values;
                results1 = [];
                for (i in ref) {
                    datum = ref[i];
                    results1.push((function() {
                        var l, len, results2;
                        results2 = [];
                        for (l = 0, len = rules.length; l < len; l++) {
                            rule = rules[l];
                            if (rule.condition(v.key, datum, i)) {
                                results2.push(datum[rule.parameter] = rule.value);
                            } else {
                                results2.push(void 0);
                            }
                        }
                        return results2;
                    })());
                }
                return results1;
            })());
        }
        return results;
    };
    this.computeMinMax = function(conf, meta) {
        conf.cmin = conf.min === 'smart' ? meta.min : conf.min;
        conf.cmax = conf.max === 'smart' ? meta.max : conf.max;
        return conf;
    };
    this.ratio = function(value, min, max, scope, reverse, logScale) {
        var fraction, scaleLogBase, x;
        scaleLogBase = logScale ? 2.3 : 1;
        if (min === max || (value === min && !reverse) || (value === max && reverse)) {
            return 0;
        }
        if (value === max || (value === min && reverse)) {
            return scope - 1;
        }
        fraction = (value - min) / (max - min);
        x = Math.exp(1 / scaleLogBase * Math.log(fraction));
        if (reverse) {
            x = 1 - x;
        }
        return Math.floor(scope * x);
    };
    this.render = (function(_this) {
        return function(instance, parentElement, name) {
            var datumContainer, ref, selection, track;
            parentElement.select('.' + name).remove();
            track = parentElement.append('g').attr('class', name).attr('z-index', _this.conf.zIndex);
            datumContainer = _this.renderDatumContainer(instance, track, name, _this.data, _this.conf);
            if ((ref = _this.conf.axes) != null ? ref.display : void 0) {
                _this.renderAxes(datumContainer, _this.conf, instance._layout, _this.data);
            }
            selection = _this.renderDatum(datumContainer, _this.conf, instance._layout, _this);
            if (_this.conf.tooltipContent != null) {
                circosJS.registerTooltip(instance, _this, selection, _this.conf);
            }
            selection.on('mouseover', function(d, i, j) {
                return _this.dispatch.mouseover(d, i, j);
            });
            return selection.on('mouseout', function(d, i, j) {
                return _this.dispatch.mouseout(d, i, j);
            });
        };
    })(this);
    this.renderBlock = function(parentElement, data, layout, conf) {
        var block, scope;
        scope = conf.outerRadius - conf.innerRadius;
        block = parentElement.selectAll('.block').data(data).enter().append('g').attr('class', 'block').attr('transform', function(d) {
            return 'rotate(' + layout.blocks[d.key].start * 360 / (2 * Math.PI) + ')';
        });
        if (conf.backgrounds) {
            block.selectAll('.background').data(conf.backgrounds).enter().append('path').attr('class', 'background').attr('fill', function(background) {
                return background.color;
            }).attr('opacity', function(background) {
                return background.opacity || 1;
            }).attr('d', d3.arc().innerRadius(function(background) {
                if (conf.direction === 'in') {
                    return conf.outerRadius - scope * background.start;
                } else {
                    return conf.innerRadius + scope * background.start;
                }
            }).outerRadius(function(background) {
                if (conf.direction === 'in') {
                    return conf.outerRadius - scope * background.end;
                } else {
                    return conf.innerRadius + scope * background.end;
                }
            }).startAngle(function(d, i, j) {
                return 0;
            }).endAngle(function(d, i, j) {
                return layout.blocks[data[j].key].end - layout.blocks[data[j].key].start;
            }));
        }
        return block;
    };
    this.renderAxes = function(parentElement, conf, layout, data) {
        var axes, axis, x;
        if (conf.axes.minor.spacingType === 'pixel') {
            axes = (function() {
                var l, ref, ref1, ref2, results;
                results = [];
                for (x = l = ref = conf.innerRadius, ref1 = conf.outerRadius, ref2 = conf.axes.minor.spacing; ref2 > 0 ? l <= ref1 : l >= ref1; x = l += ref2) {
                    results.push(x);
                }
                return results;
            })();
        }
        axis = d3.arc().innerRadius(function(d) {
            return d;
        }).outerRadius(function(d) {
            return d;
        }).startAngle(0).endAngle(function(d, i, j) {
            var block;
            block = layout.blocks[data[j].key];
            return block.end - block.start;
        });
        console.log('axis', axis);
        return parentElement.selectAll('.axis').data(axes).enter().append('path').attr('opacity', conf.opacity).attr('class', 'axis').attr('d', axis).attr('stroke-width', function(d, i) {
            if (i % conf.axes.major.spacing === 0) {
                return conf.axes.major.thickness;
            } else {
                return conf.axes.minor.thickness;
            }
        }).attr('stroke', function(d, i) {
            if (i % conf.axes.major.spacing === 0) {
                return conf.axes.major.color;
            } else {
                return conf.axes.minor.color;
            }
        });
    };
    this.theta = function(position, block) {
        return position / block.len * (block.end - block.start);
    };
    this.x = (function(_this) {
        return function(d, layout, conf) {
            var angle, height, r;
            height = _this.ratio(d.value, conf.cmin, conf.cmax, conf.outerRadius - conf.innerRadius, false, conf.logscale);
            if (conf.direction === 'in') {
                r = conf.outerRadius - height;
            } else {
                r = conf.innerRadius + height;
            }
            angle = _this.theta(d.position, layout.blocks[d.block_id]) - Math.PI / 2;
            return r * Math.cos(angle);
        };
    })(this);
    this.y = (function(_this) {
        return function(d, layout, conf) {
            var angle, height, r;
            height = _this.ratio(d.value, conf.cmin, conf.cmax, conf.outerRadius - conf.innerRadius, false, conf.logscale);
            if (conf.direction === 'in') {
                r = conf.outerRadius - height;
            } else {
                r = conf.innerRadius + height;
            }
            angle = _this.theta(d.position, layout.blocks[d.block_id]) - Math.PI / 2;
            return r * Math.sin(angle);
        };
    })(this);
    this.ratio = function(value, min, max, scope, reverse, logScale) {
        var fraction, scaleLogBase, x;
        scaleLogBase = logScale ? 2.3 : 1;
        if (min === max || (value === min && !reverse) || (value === max && reverse)) {
            return 0;
        }
        if (value === max || (value === min && reverse)) {
            return scope - 1;
        }
        fraction = (value - min) / (max - min);
        x = Math.exp(1 / scaleLogBase * Math.log(fraction));
        if (reverse) {
            x = 1 - x;
        }
        return Math.floor(scope * x);
    };
    return this;
};

circosJS.renderLayout = function(d3, parentElement, instance) {
    var block, conf, entry, layout;
    conf = instance._layout.conf;
    parentElement.select('.cs-layout').remove();
    layout = parentElement.append('g').attr('class', 'cs-layout').attr('z-index', conf.zIndex).on('click', conf.onClick);
    block = layout.selectAll('g').data(instance._layout.data).enter().append('g').attr('class', function(d) {
        return d.id;
    }).attr('opacity', conf.opacity);
    entry = d3.arc().innerRadius(conf.innerRadius).outerRadius(conf.outerRadius).cornerRadius(conf.cornerRadius).startAngle(function(d) {
        return d.start;
    }).endAngle(function(d) {
        return d.end;
    });
    block.append('path').attr('d', entry).attr('fill', function(d) {
        return d.color;
    }).attr('id', function(d) {
        return d.id;
    });
    if (conf.labels.display) {
        circosJS.renderLayoutLabels(conf, d3, block);
    }
    if (conf.ticks.display) {
        return circosJS.renderLayoutTicks(conf, layout, d3, instance);
    }
};

circosJS.renderLayoutLabels = function(conf, d3, block) {
    var label, labelArc, r;
    r = conf.innerRadius + conf.labels.radialOffset;
    labelArc = d3.arc().innerRadius(r).outerRadius(r).startAngle(function(d, i) {
        return d.start;
    }).endAngle(function(d, i) {
        return d.end;
    });
    block.append('path').attr('fill', 'none').attr('stroke', 'none').attr('d', labelArc).attr('id', function(d) {
        return 'arc-label' + d.id;
    });
    label = block.append('text').attr('font-size', conf.labels.size).attr('text-anchor', 'middle');
    return label.append('textPath').attr('startOffset', '25%').attr('xlink:href', function(d) {
        return '#arc-label' + d.id;
    }).style('fill', conf.labels.color).text(function(d) {
        var arc_len = d.end - d.start;
        return d.label.slice(0, Math.floor(21 * arc_len)) + '..';
    });
};

circosJS.renderLayoutTicks = function(conf, layout, d3, instance) {
    var blockTicks, displayLabel, ticks;
    blockTicks = function(d) {
        var k,space;
        k = (d.end - d.start) / d.len;
        if ((d.end - d.start) > 1.57) {
            space = 8;
        } else if ((d.end - d.start) > 0.785) {
            space = 4;
        } else if ((d.end - d.start) > 0.3925) {
            space = 2;
        } else if ((d.end - d.start) > 0) {
            space = 0;
        }
        var arr = [];
        var item = {angle: 0 * k + d.start, label: 0};
        arr.push(item);
        var temp_scale = d3.scaleLinear()
            .domain([1, d.len])
            .range([d.start, d.end]);
        var len = temp_scale.ticks(space).length;
        temp_scale.ticks(space).map(function (v,i) {
            var init = v * k + d.start;
            var final = d.len * k +d.start;
            if ((final - init) > 0.5) {
            }
            var item = {
                angle: v * k + d.start,
                label: v / conf.ticks.labelDenominator + conf.ticks.labelSuffix
            };
            arr.push(item);
        });
        arr.splice(len, 1);
        var item = {
            angle: (d.len * k + d.start) - 0.006,
            label: d.len / conf.ticks.labelDenominator + conf.ticks.labelSuffix
        };
        arr.push(item);
        return arr;
    };
    displayLabel = function(v, i) {
        if (conf.ticks.labels === false) {
            return null;
        } else if (conf.ticks.labelDisplay0 === false && i === 0) {
            return null;
        } else if (i % conf.ticks.labelSpacing) {
            return null;
        } else if (i === 0) {
            return v / conf.ticks.labelDenominator; // added support for 0 without suffix.
        }
        else {
            return v / conf.ticks.labelDenominator + conf.ticks.labelSuffix;
        }
    };
    ticks = layout.append('g').selectAll('g').data(instance._layout.data).enter().append('g').selectAll('g').data(blockTicks).enter().append('g').attr('transform', function(d) {
        return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ')' + 'translate(' + conf.outerRadius + ',0)';
    });
    ticks.append('line').attr('x1', 0).attr('y1', 1).attr('x2', function(d, i) {
        return conf.ticks.size.major;
    }).attr('y2', 1).style('stroke', conf.ticks.color);
    return ticks.append('text').attr('x', 8).attr('dy', '.35em').attr('transform', function(d) {
        if (d.angle > Math.PI) {
            return 'rotate(180)translate(-16)';
        } else {
            return null;
        }
    }).attr('text-anchor', function(d) {
        if (d.angle > Math.PI) {
            return 'end';
        } else {
            return null;
        }
    }).attr('font-size', conf.ticks.labelSize).style('fill', conf.ticks.labelColor).text(function(d) {
        return d.label;
    });
};

circosJS.Core.prototype.render = function(ids, removeTracks) {
    var name, ref, ref1, renderAll, svg, track, trackStore, trackType, tracks, translated;
    if (typeof ids === 'undefined') {
        renderAll = true;
        ids = [];
    }
    if (removeTracks) {
        ref = this.tracks;
        for (trackType in ref) {
            trackStore = ref[trackType];
            for (name in trackStore) {
                track = trackStore[name];
                svg.select('.' + name).remove();
            }
        }
    }
    svg = d3.select(this.conf.container);
    translated = svg.select('.all');
    if (translated.empty()) {
        translated = svg.append('svg')
              .attr('width', this.conf.width)
              .attr('height', this.conf.height)

        translated = translated.append('g').attr('class', 'all').attr('transform', 'translate(' + parseInt(this.conf.width / 2) + ',' + parseInt(this.conf.height / 2) + ')');
    }
    ref1 = this.tracks;
    for (trackType in ref1) {
        trackStore = ref1[trackType];
        for (name in trackStore) {
            track = trackStore[name];
            if (renderAll || indexOf.call(ids, name) >= 0) {
                track.render(this, translated, name);
            }
        }
    }
    if (renderAll || indexOf.call(ids, 'layout') >= 0) {
        circosJS.renderLayout(d3, translated, this);
    }

    // tracks = svg.selectAll('.all > g').nodes();
    // svg.selectAll('.all > g').remove();

    // tracks.sort(function(a, b) {
    //     if (parseInt(a.getAttribute('z-index')) < parseInt(b.getAttribute('z-index'))) {
    //         return -1;
    //     } else if (parseInt(a.getAttribute('z-index')) > parseInt(b.getAttribute('z-index'))) {
    //         return 1;
    //     } else {
    //         return 0;
    //     }
    // });

    // svg.select('.all').selectAll('g').data(tracks).enter().append(function(d) {
    //     return d;
    // });
    // return this;
};

circosJS.Core.prototype.defaultConf = {
    width: 700,
    height: 700,
    container: 'circos',
    defaultTrackWidth: 10
};

circosJS.Layout.prototype.defaultConf = {
    innerRadius: 250,
    outerRadius: 300,
    cornerRadius: 5,
    gap: 0.04,
    opacity: 1,
    labels: {
        position: 'center',
        display: true,
        size: 14,
        color: '#000',
        radialOffset: 20
    },
    ticks: {
        display: true,
        color: 'grey',
        spacing: 10000000,
        labels: true,
        labelSpacing: 10,
        labelSuffix: 'Mb',
        labelDenominator: 1000000,
        labelDisplay0: true,
        labelSize: 10,
        labelColor: '#000',
        labelFont: 'default',
        majorSpacing: 5,
        size: {
            minor: 2,
            major: 5
        }
    },
    onClick: null,
    onMouseOver: null,
    zIndex: 100
};

circosJS.axes = {
    display: false,
    minor: {
        spacing: 5,
        spacingType: 'pixel',
        color: '#d3d3d3',
        thickness: 2
    },
    major: {
        spacing: 5,
        color: '#000000',
        thickness: 2
    }
};

circosJS.Chord.prototype.defaultConf = {
    colorPaletteSize: 9,
    colorPalette: 'PuBuGn',
    usePalette: true,
    colorPaletteReverse: false,
    color: '#fd6a62',
    opacity: 0.7,
    min: 'smart',
    max: 'smart',
    logScale: false,
    rules: [],
    backgrounds: [],
    zIndex: 1,
    tooltipContent: null
};

circosJS.registerTooltip = function(instance, track, element, trackParams) {
    track.tip = d3.tip().direction('s').offset([20, 0]).html(trackParams.tooltipContent);
    element.call(track.tip);
    track.dispatch.on('mouseover', function(d, i, j) {
        return track.tip.attr('class', 'd3-tip appear').show(d);
    });
    return track.dispatch.on('mouseout', function(d, i, j) {
        track.tip.attr('class', 'd3-tip').show(d);
        return track.tip.hide();
    });
};
