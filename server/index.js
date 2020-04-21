const Koa = require('koa');

const router = require('./middle/router');
const WebSocketServer = require('./lib/WebSocketServer');

function start(port = 3000) {
  const app = new Koa();
  const wss = new WebSocketServer();

  app.use(router(wss.channelManager));

  console.log(`starting server at http://localhost:${port}`);
  const server = app.listen(port);

  wss.start(server);
}

module.exports = {
  start,
};
