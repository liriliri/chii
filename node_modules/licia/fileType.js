function _slicedToArray(arr, i) {
    return (
        _arrayWithHoles(arr) ||
        _iterableToArrayLimit(arr, i) ||
        _unsupportedIterableToArray(arr, i) ||
        _nonIterableRest()
    );
}

function _nonIterableRest() {
    throw new TypeError(
        'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === 'Object' && o.constructor) n = o.constructor.name;
    if (n === 'Map' || n === 'Set') return Array.from(o);
    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
}

function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === 'undefined' || !(Symbol.iterator in Object(arr)))
        return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
        for (
            var _i = arr[Symbol.iterator](), _s;
            !(_n = (_s = _i.next()).done);
            _n = true
        ) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally {
        try {
            if (!_n && _i['return'] != null) _i['return']();
        } finally {
            if (_d) throw _e;
        }
    }
    return _arr;
}

function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}

var type = require('./type');
var mime = require('./mime');
var isFn = require('./isFn');

exports = function(input) {
    if (type(input) !== 'uint8array') {
        input = new Uint8Array(input);
    }

    for (var i = 0, len = types.length; i < len; i++) {
        var _type = types[i];

        var _type2 = _slicedToArray(_type, 3),
            ext = _type2[0],
            magic = _type2[1],
            offset = _type2[2];

        if (isFn(magic)) {
            if (magic(input)) {
                return {
                    ext: ext,
                    mime: mime(ext)
                };
            }
        } else if (check(input, magic, offset)) {
            return {
                ext: ext,
                mime: mime(ext)
            };
        }
    }
};

var types = [
    ['jpg', [0xff, 0xd8, 0xff]],
    ['png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ['gif', [0x47, 0x49, 0x46]],
    ['webp', [0x57, 0x45, 0x42, 0x50], 8],
    ['bmp', [0x42, 0x4d]],
    ['gz', [0x1f, 0x8b, 0x8]],
    [
        'zip',
        function(input) {
            return (
                check(input, [0x50, 0x4b]) &&
                (input[2] === 0x3 || input[2] === 0x5 || input[2] === 0x7) &&
                (input[3] === 0x4 || input[3] === 0x6 || input[3] === 0x8)
            );
        }
    ],
    [
        'rar',
        function(input) {
            return (
                check(input, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x7]) &&
                (input[6] === 0x0 || input[6] === 0x1)
            );
        }
    ],
    ['pdf', [0x25, 0x50, 0x44, 0x46]],
    ['exe', [0x4d, 0x5a]]
];

function check(input, magic) {
    var offset =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    for (var i = 0, len = magic.length; i < len; i++) {
        if (input[offset + i] !== magic[i]) {
            return false;
        }
    }

    return true;
}

module.exports = exports;
