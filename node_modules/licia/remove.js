var safeCb = require('./safeCb');

exports = function(arr, iterator, ctx) {
    var ret = [];
    iterator = safeCb(iterator, ctx);
    var i = -1;
    var len = arr.length;

    while (++i < len) {
        var val = arr[i];

        if (iterator(val, i, arr)) {
            ret.push(val);
            arr.splice(i, 1);
        }
    }

    return ret;
};

module.exports = exports;
