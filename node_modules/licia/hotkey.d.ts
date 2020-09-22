import types = require('./types');

declare const hotkey: {
    on(key: string, listener: types.AnyFn): void;
    off(key: string, listener: types.AnyFn): void;
};

export = hotkey;
