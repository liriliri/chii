const Emitter = require('licia/Emitter');

module.exports = class Channel extends Emitter {
  constructor(ws) {
    super();
    this._ws = ws;

    ws.on('close', (...args) => this.emit('close', ...args));
  }
};
