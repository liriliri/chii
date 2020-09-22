var Emitter = require('./Emitter');

exports = Emitter.extend({
    className: 'MediaQuery',
    initialize: function(query) {
        var _this = this;

        this.callSuper(Emitter, 'initialize');
        this._mql = window.matchMedia(query);

        this._mql.addListener(function() {
            _this.emit(_this.isMatch() ? 'match' : 'unmatch');
        });
    },
    isMatch: function() {
        return this._mql.matches;
    }
});

module.exports = exports;
