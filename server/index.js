const Koa = require('koa');

const router = require('./middle/router');
const compress = require('./middle/compress');
const util = require('./lib/util');
const WebSocketServer = require('./lib/WebSocketServer');
const https = require('./middle/https');

function start({ port = 8080, host, domain, server, ssl } = {}) {
  domain = domain || 'localhost:' + port;

  const app = new Koa();
  const wss = new WebSocketServer();

  app.use(compress()).use(router(wss.channelManager, domain));

  if (server) {
    server.on('request', app.callback());
    wss.start(server);
  } else {
    let server
    if(ssl && ssl.length === 2){
      server = https(app,port,host,ssl)
      util.log(`starting server at https://${domain}`);
    }else{
      server = app.listen(port, host);
      util.log(`starting server at http://${domain}`);
    }
    wss.start(server);
  }
}

module.exports = {
  start,
};
