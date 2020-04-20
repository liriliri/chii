const Koa = require('koa');
const url = require('url');
const WebSocket = require('ws');

const router = require('./middle/router');

function start(port = 3000) {
  const wss = new WebSocket.Server({ noServer: true });
  wss.on('connection', ws => {
    ws.on('message', message => console.log(message));
  });

  const app = new Koa();

  app.use(router());

  const server = app.listen(port);
  server.on('upgrade', function (request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/foo') {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
}

module.exports = {
  start,
};
