exports = false;

if (typeof process !== 'undefined') {
    exports =
        process.platform === 'win32' ||
        process.env.OSTYPE === 'cygwin' ||
        process.env.OSTYPE === 'msys';
}

module.exports = exports;
