const Channel = require('./Channel');
const Emitter = require('licia/Emitter');

module.exports = class ChannelManager extends Emitter {
  constructor() {
    super();

    this._targets = {};
    this._clients = {};
  }
  createTarget(id, ws, url, title) {
    const channel = new Channel(ws);

    console.log(`target ${id} connected`);
    this._targets[id] = {
      id,
      title,
      url,
      channel,
    };

    channel.on('close', () => this.removeTarget(id));

    this.emit('target_changed');
  }
  createClient(id, ws, target) {
    target = this._targets[target];
    if (!target) {
      return ws.close();
    }

    const channel = new Channel(ws);
    console.log(`client ${id} connected to target ${target.id}`);
    channel.connect(target.channel);

    this._clients[id] = {
      id,
      target: target.id,
      channel,
    };

    channel.on('close', () => this.removeClient(id));
    target.channel.on('close', () => channel.destroy());
  }
  removeTarget(id) {
    console.log(`target ${id} disconnected`);
    delete this._targets[id];

    this.emit('target_changed');
  }
  removeClient(id) {
    console.log(`client ${id} disconnected`);
    delete this._clients[id];
  }
  getTargets() {
    return this._targets;
  }
  getClients() {
    return this._clients;
  }
};
