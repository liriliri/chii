var root = require('./root');

var getComputedStyle = root.getComputedStyle;
var document = root.document;

exports = function(el) {
    var _ref =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {},
        _ref$display = _ref.display,
        display = _ref$display === void 0 ? true : _ref$display,
        _ref$visibility = _ref.visibility,
        visibility = _ref$visibility === void 0 ? false : _ref$visibility,
        _ref$opacity = _ref.opacity,
        opacity = _ref$opacity === void 0 ? false : _ref$opacity,
        _ref$size = _ref.size,
        size = _ref$size === void 0 ? false : _ref$size,
        _ref$viewport = _ref.viewport,
        viewport = _ref$viewport === void 0 ? false : _ref$viewport,
        _ref$overflow = _ref.overflow,
        overflow = _ref$overflow === void 0 ? false : _ref$overflow;

    if (display) {
        return el.offsetParent === null;
    }

    var computedStyle = getComputedStyle(el);

    if (visibility && computedStyle.visibility === 'hidden') {
        return true;
    }

    if (opacity) {
        if (computedStyle.opacity === '0') {
            return true;
        } else {
            var cur = el;

            while ((cur = cur.parentElement)) {
                var _computedStyle = getComputedStyle(cur);

                if (_computedStyle.opacity === '0') {
                    return true;
                }
            }
        }
    }

    var clientRect = el.getBoundingClientRect();

    if (size && (clientRect.width === 0 || clientRect.height === 0)) {
        return true;
    }

    if (viewport) {
        var containerRect = {
            top: 0,
            left: 0,
            right: document.documentElement.clientWidth,
            bottom: document.documentElement.clientHeight
        };
        return isOutside(clientRect, containerRect);
    }

    if (overflow) {
        var _cur = el;

        while ((_cur = _cur.parentElement)) {
            var _computedStyle2 = getComputedStyle(_cur);

            var _overflow = _computedStyle2.overflow;

            if (_overflow === 'scroll' || _overflow === 'hidden') {
                var curRect = _cur.getBoundingClientRect();

                if (isOutside(clientRect, curRect)) return true;
            }
        }
    }

    return false;
};

function isOutside(clientRect, containerRect) {
    return (
        clientRect.right < containerRect.left ||
        clientRect.left > containerRect.right ||
        clientRect.bottom < containerRect.top ||
        clientRect.top > containerRect.bottom
    );
}

module.exports = exports;
