var Emitter = require('./Emitter');
var keyCode = require('./keyCode');
var each = require('./each');
var unique = require('./unique');
var trim = require('./trim');
var map = require('./map');

exports = {
    on: function(keys, listener) {
        keys = keys.split(regComma);
        each(keys, function(key) {
            emitter.on(normalizeKey(key), listener);
        });
    },
    off: function(keys, listener) {
        keys = keys.split(regComma);
        each(keys, function(key) {
            emitter.off(normalizeKey(key), listener);
        });
    }
};
var emitter = new Emitter();
document.addEventListener('keydown', function(e) {
    var keys = [];
    if (e.ctrlKey) keys.push('ctrl');
    if (e.shiftKey) keys.push('shift');
    keys.push(keyCode(e.keyCode));
    emitter.emit(normalizeKey(keys.join('+')), e);
});

function normalizeKey(keyStr) {
    var keys = keyStr.split(regPlus);
    keys = map(keys, function(key) {
        return trim(key);
    });
    keys = unique(keys);
    keys.sort();
    return keys.join('+');
}

var regComma = /,/g;
var regPlus = /\+/g;

module.exports = exports;
