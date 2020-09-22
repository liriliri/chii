exports = {
    encode: function(arr) {
        return String.fromCodePoint.apply(String, arr);
    },
    decode: function(str) {
        var ret = [];
        var i = 0;
        var len = str.length;

        while (i < len) {
            var c = str.charCodeAt(i++);

            if (c >= 0xd800 && c <= 0xdbff && i < len) {
                var tail = str.charCodeAt(i++);

                if ((tail & 0xfc00) === 0xdc00) {
                    ret.push(((c & 0x3ff) << 10) + (tail & 0x3ff) + 0x10000);
                } else {
                    ret.push(c);
                    i--;
                }
            } else {
                ret.push(c);
            }
        }

        return ret;
    }
};

module.exports = exports;
