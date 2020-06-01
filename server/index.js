const Koa = require('koa');

const router = require('./middle/router');
const compress = require('./middle/compress');
const util = require('./lib/util');
const WebSocketServer = require('./lib/WebSocketServer');

function start({ port = 8080, host, domain, server } = {}) {
  domain = domain || 'localhost:' + port;

  const app = new Koa();
  const wss = new WebSocketServer();

  app.use(compress()).use(router(wss.channelManager, domain));

  if (server) {
    server.on('request', app.callback());
    wss.start(server);
  } else {
    util.log(`starting server at ${domain}`);
    const server = host ? app.listen(port, host) : app.listen(port, host);

    wss.start(server);
  }
}

module.exports = {
  start,
};
