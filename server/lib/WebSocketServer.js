const WebSocket = require('ws');
const url = require('url');
const ChannelManager = require('./ChannelManager');
const query = require('licia/query');

module.exports = class WebSocketServer {
  constructor() {
    this.channelManager = new ChannelManager();

    const wss = (this._wss = new WebSocket.Server({ noServer: true }));

    wss.on('connection', ws => {
      this.channelManager.create(ws);
    });
  }
  start(server) {
    const wss = this._wss;

    server.on('upgrade', function (request, socket, head) {
      const urlObj = url.parse(request.url);
      const pathname = urlObj.pathname.split('/');

      const type = pathname[1];
      const id = pathname[2];

      if (type === 'target' || type === 'client') {
        wss.handleUpgrade(request, socket, head, ws => {
          ws.type = type;
          ws.id = id;
          if (type === 'target') {
            const q = query.parse(urlObj.query);
            ws.url = q.url;
            ws.title = q.title;
          }
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }
};
