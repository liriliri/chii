const Emitter = require('licia/Emitter');
const each = require('licia/each');
const some = require('licia/some');
const remove = require('licia/remove');

module.exports = class Channel extends Emitter {
  constructor(ws) {
    super();
    this._ws = ws;
    this._connections = [];
    this.send = message => ws.send(message);

    ws.on('close', (...args) => {
      this.emit('close', ...args);
      this.destroy();
    });
    ws.on('message', (...args) => {
      each(this._connections, connection => {
        connection.send(...args);
      });
      this.emit('message', ...args);
    });
    ws.on('error', error => {
      this.emit('error', error);
    });
  }
  send(message) {
    this._ws.send(message);
  }
  destroy() {
    each(this._connections, connection => {
      connection.off('message', connection);
    });
    this._connections = [];
    this._ws.close();
  }
  isConnected(connection) {
    if (this.hasConnection(connection)) return true;
    if (connection.hasConnection(this)) return true;

    return false;
  }
  hasConnection(connection) {
    return some(this._connections, item => item === connection);
  }
  connect(connection) {
    if (this.isConnected(connection)) return;

    this._connections.push(connection);
    connection.on('message', this.send);
    connection.on('close', () => this.disconnect(connection));
  }
  disconnect(connection) {
    if (!this.isConnected(connection)) return;

    if (this.hasConnection(connection)) {
      remove(this._connections, item => item === connection);
      connection.off('message', this.send);
    } else {
      connection.disconnect(this);
    }
  }
};
