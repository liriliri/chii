const Channel = require('./Channel');

module.exports = class ChannelManager {
  constructor() {
    this._targets = {};
    this._clients = {};
  }
  create(ws) {
    const { type, id } = ws;

    const channel = new Channel(ws);
    if (type === 'target') {
      console.log(`target ${id} connected`);
      this._targets[id] = {
        title: ws.title,
        url: ws.url,
        channel,
      };
      channel.on('close', () => this.remove(type, id));
    } else {
      console.log(`client ${id} connected`);
      this._clients[id] = {
        channel,
      };
    }
  }
  remove(type, id) {
    console.log(`${type} ${id} disconnected`);
    if (type === 'target') {
      delete this._targets[id];
    } else {
      delete this._clients[id];
    }
  }
  getTargets() {
    return this._targets;
  }
  getClients() {
    return this._clients;
  }
};
