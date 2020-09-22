var isBrowser = require('./isBrowser');

exports = function(ua) {
    ua = ua || (isBrowser ? navigator.userAgent : '');
    ua = ua.toLowerCase();
    if (detect('windows phone')) return 'windows phone';
    if (detect('win')) return 'windows';
    if (detect('android')) return 'android';
    if (detect('ipad') || detect('iphone') || detect('ipod')) return 'ios';
    if (detect('mac')) return 'os x';
    if (detect('linux')) return 'linux';

    function detect(keyword) {
        return ua.indexOf(keyword) > -1;
    }

    return 'unknown';
};

module.exports = exports;
