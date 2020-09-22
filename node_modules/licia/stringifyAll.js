var escapeJsStr = require('./escapeJsStr');
var type = require('./type');
var toStr = require('./toStr');
var endWith = require('./endWith');
var toSrc = require('./toSrc');
var keys = require('./keys');
var each = require('./each');
var Class = require('./Class');
var getProto = require('./getProto');
var difference = require('./difference');
var extend = require('./extend');
var isPromise = require('./isPromise');
var filter = require('./filter');
var now = require('./now');
var allKeys = require('./allKeys');
var contain = require('./contain');

exports = function(obj) {
    var _ref =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {},
        self = _ref.self,
        _ref$startTime = _ref.startTime,
        startTime = _ref$startTime === void 0 ? now() : _ref$startTime,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? 0 : _ref$timeout,
        _ref$depth = _ref.depth,
        depth = _ref$depth === void 0 ? 0 : _ref$depth,
        _ref$curDepth = _ref.curDepth,
        curDepth = _ref$curDepth === void 0 ? 1 : _ref$curDepth,
        _ref$visitor = _ref.visitor,
        visitor = _ref$visitor === void 0 ? new Visitor() : _ref$visitor,
        _ref$unenumerable = _ref.unenumerable,
        unenumerable = _ref$unenumerable === void 0 ? false : _ref$unenumerable,
        _ref$symbol = _ref.symbol,
        symbol = _ref$symbol === void 0 ? false : _ref$symbol,
        _ref$accessGetter = _ref.accessGetter,
        accessGetter = _ref$accessGetter === void 0 ? false : _ref$accessGetter,
        _ref$ignore = _ref.ignore,
        ignore = _ref$ignore === void 0 ? [] : _ref$ignore;

    var json = '';
    var options = {
        visitor: visitor,
        unenumerable: unenumerable,
        symbol: symbol,
        accessGetter: accessGetter,
        depth: depth,
        curDepth: curDepth + 1,
        timeout: timeout,
        startTime: startTime,
        ignore: ignore
    };
    var t = type(obj, false);

    if (t === 'String') {
        json = wrapStr(obj);
    } else if (t === 'Number') {
        json = toStr(obj);

        if (endWith(json, 'Infinity')) {
            json = '{"value":"'.concat(json, '","type":"Number"}');
        }
    } else if (t === 'NaN') {
        json = '{"value":"NaN","type":"Number"}';
    } else if (t === 'Boolean') {
        json = obj ? 'true' : 'false';
    } else if (t === 'Null') {
        json = 'null';
    } else if (t === 'Undefined') {
        json = '{"type":"Undefined"}';
    } else if (t === 'Symbol') {
        var val = 'Symbol';

        try {
            val = toStr(obj);
        } catch (e) {}

        json = '{"value":'.concat(wrapStr(val), ',"type":"Symbol"}');
    } else {
        if (timeout && now() - startTime > timeout) {
            return wrapStr('Timeout');
        }

        if (depth && curDepth > depth) {
            return wrapStr('{...}');
        }

        json = '{';
        var parts = [];
        var visitedObj = visitor.get(obj);
        var id;

        if (visitedObj) {
            id = visitedObj.id;
            parts.push('"reference":'.concat(id));
        } else {
            id = visitor.set(obj);
            parts.push('"id":'.concat(id));
        }

        parts.push('"type":"'.concat(t, '"'));

        if (endWith(t, 'Function')) {
            parts.push('"value":'.concat(wrapStr(toSrc(obj))));
        } else if (t === 'RegExp') {
            parts.push('"value":'.concat(wrapStr(obj)));
        }

        if (!visitedObj) {
            var enumerableKeys = keys(obj);

            if (enumerableKeys.length) {
                parts.push(
                    iterateObj(
                        'enumerable',
                        enumerableKeys,
                        self || obj,
                        options
                    )
                );
            }

            if (unenumerable) {
                var unenumerableKeys = difference(
                    allKeys(obj, {
                        prototype: false,
                        unenumerable: true
                    }),
                    enumerableKeys
                );

                if (unenumerableKeys.length) {
                    parts.push(
                        iterateObj(
                            'unenumerable',
                            unenumerableKeys,
                            self || obj,
                            options
                        )
                    );
                }
            }

            if (symbol) {
                var symbolKeys = filter(
                    allKeys(obj, {
                        prototype: false,
                        symbol: true
                    }),
                    function(key) {
                        return typeof key === 'symbol';
                    }
                );

                if (symbolKeys.length) {
                    parts.push(
                        iterateObj('symbol', symbolKeys, self || obj, options)
                    );
                }
            }

            var prototype = getProto(obj);

            if (prototype && !contain(ignore, prototype)) {
                var proto = '"proto":'.concat(
                    exports(
                        prototype,
                        extend(options, {
                            self: self || obj
                        })
                    )
                );
                parts.push(proto);
            }
        }

        json += parts.join(',') + '}';
    }

    return json;
};

function iterateObj(name, keys, obj, options) {
    var parts = [];
    each(keys, function(key) {
        var val;
        var descriptor = Object.getOwnPropertyDescriptor(obj, key);
        var hasGetter = descriptor && descriptor.get;
        var hasSetter = descriptor && descriptor.set;

        if (!options.accessGetter && hasGetter) {
            val = '(...)';
        } else {
            try {
                val = obj[key];

                if (contain(options.ignore, val)) {
                    return;
                }

                if (isPromise(val)) {
                    val.catch(function() {});
                }
            } catch (e) {
                val = e.message;
            }
        }

        parts.push(''.concat(wrapKey(key), ':').concat(exports(val, options)));

        if (hasGetter) {
            parts.push(
                ''
                    .concat(wrapKey('get ' + toStr(key)), ':')
                    .concat(exports(descriptor.get, options))
            );
        }

        if (hasSetter) {
            parts.push(
                ''
                    .concat(wrapKey('set ' + toStr(key)), ':')
                    .concat(exports(descriptor.set, options))
            );
        }
    });
    return '"'.concat(name, '":{') + parts.join(',') + '}';
}

function wrapKey(key) {
    return '"'.concat(escapeJsonStr(key), '"');
}

function wrapStr(str) {
    return '"'.concat(escapeJsonStr(toStr(str)), '"');
}

function escapeJsonStr(str) {
    return escapeJsStr(str)
        .replace(/\\'/g, "'")
        .replace(/\t/g, '\\t');
}

var Visitor = Class({
    initialize: function() {
        this.id = 0;
        this.visited = [];
    },
    set: function(val) {
        var visited = this.visited,
            id = this.id;
        var obj = {
            id: id,
            val: val
        };
        visited.push(obj);
        this.id++;
        return id;
    },
    get: function(val) {
        var visited = this.visited;

        for (var i = 0, len = visited.length; i < len; i++) {
            var obj = visited[i];
            if (val === obj.val) return obj;
        }

        return false;
    }
});

module.exports = exports;
