var toArr = require('./toArr');

exports = function() {
    var args = toArr(arguments);
    args = args.sort(nameSort);
    var ret = {};
    var idleMap = {};

    for (var i = 0, len = args.length; i < len; i++) {
        var str = args[i];
        var nextStr = args[i + 1] || '';
        if (str === nextStr) continue;
        var start = false,
            abbrev = '';

        for (var j = 0, strLen = str.length; j < strLen; j++) {
            abbrev += str[j];
            if (!start && (str[j] !== nextStr[j] || j === strLen - 1))
                start = true;

            if (!start) {
                idleMap[abbrev] = str;
            } else if (!ret[abbrev] && !idleMap[abbrev]) {
                ret[abbrev] = str;
            }
        }
    }

    return ret;
};

function nameSort(a, b) {
    return a === b ? 0 : a > b ? 1 : -1;
}

module.exports = exports;
