var objToStr = require('./objToStr');

exports = function(val) {
    return objToStr(val) === '[object Error]';
};

module.exports = exports;
