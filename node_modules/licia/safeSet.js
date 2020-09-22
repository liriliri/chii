var castPath = require('./castPath');
var isUndef = require('./isUndef');

exports = function(obj, path, val) {
    path = castPath(path, obj);
    var lastProp = path.pop();
    var prop;
    prop = path.shift();

    while (!isUndef(prop)) {
        if (!obj[prop]) obj[prop] = {};
        obj = obj[prop];
        prop = path.shift();
    }

    obj[lastProp] = val;
};

module.exports = exports;
