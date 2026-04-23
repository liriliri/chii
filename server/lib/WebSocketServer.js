const WebSocket = require('ws');
const url = require('url');
const ChannelManager = require('./ChannelManager');
const query = require('licia/query');

module.exports = class WebSocketServer {
  constructor(auth) {
    this.auth = auth;
    this.channelManager = new ChannelManager();

    const wss = (this._wss = new WebSocket.Server({ noServer: true }));

    wss.on('connection', (ws, req) => {
      const type = ws.type;
      if (type === 'target') {
        const { id, chiiUrl, title, favicon } = ws;
        let ip = req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        if (req.headers['x-forwarded-for']) {
          ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        }
        this.channelManager.createTarget(id, ws, chiiUrl, title, favicon, ip, userAgent);
      } else {
        const { id, target } = ws;
        this.channelManager.createClient(id, ws, target);
      }
    });
  }
  start(server) {
    const wss = this._wss;
    const auth = this.auth;

    server.on('upgrade', function (request, socket, head) {
      const urlObj = url.parse(request.url);
      const pathname = urlObj.pathname.split('/');

      const len = pathname.length;
      const type = pathname[len - 2];
      const id = pathname[len - 1];

      if (auth && type !== 'target') {
        const authorization = request.headers.authorization;
        let isAuth = false;
        if (authorization) {
          const parts = authorization.split(' ');
          if (parts.length === 2 && parts[0] === 'Basic') {
            const credentials = Buffer.from(parts[1], 'base64').toString('utf-8');
            if (credentials === auth) {
              isAuth = true;
            }
          }
        }
        if (!isAuth) {
          socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic realm="Chii"\r\n\r\n');
          socket.destroy();
          return;
        }
      }

      if (type === 'target' || type === 'client') {
        wss.handleUpgrade(request, socket, head, ws => {
          ws.type = type;
          ws.id = id;
          const q = query.parse(urlObj.query);
          if (type === 'target') {
            ws.chiiUrl = q.url;
            ws.title = q.title;
            ws.favicon = q.favicon;
            ws.userAgent = q.userAgent;
            ws.rtc = q.rtc === 'true';
          } else {
            ws.target = q.target;
          }
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }
};
