const Koa = require('koa');
const https = require('https');

const router = require('./middle/router');
const compress = require('./middle/compress');
const util = require('./lib/util');
const fs = require('licia/fs');
const endWith = require('licia/endWith');
const WebSocketServer = require('./lib/WebSocketServer');

async function start({
  port = 8080,
  host,
  domain,
  server,
  cdn,
  https: useHttps,
  sslCert,
  sslKey,
  basePath = '/',
  auth,
} = {}) {
  domain = domain || 'localhost:' + port;
  if (!endWith(basePath, '/')) {
    basePath += '/';
  }

  const app = new Koa();
  const wss = new WebSocketServer(auth);

  if (auth) {
    app.use(async (ctx, next) => {
      const { path, method } = ctx;
      if (
        method === 'OPTIONS' ||
        path === basePath + 'target.js' ||
        path === basePath + 'proxy' ||
        path.startsWith(basePath + 'test/')
      ) {
        await next();
        return;
      }
      const { authorization } = ctx.header;
      if (authorization) {
        const parts = authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Basic') {
          const credentials = Buffer.from(parts[1], 'base64').toString('utf-8');
          if (credentials === auth) {
            await next();
            return;
          }
        }
      }
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic realm="Chii"');
      ctx.body = 'Unauthorized';
    });
  }

  app.use(compress()).use(router(wss.channelManager, domain, cdn, basePath));

  if (server) {
    server.on('request', app.callback());
    wss.start(server);
  } else {
    util.log(`starting server at http://${domain}${basePath}`);
    if (useHttps) {
      const cert = await fs.readFile(sslCert, 'utf8');
      const key = await fs.readFile(sslKey, 'utf8');
      const server = https
        .createServer(
          {
            key,
            cert,
          },
          app.callback(),
        )
        .listen(port, host);
      wss.start(server);
    } else {
      const server = app.listen(port, host);
      wss.start(server);
    }
  }
}

module.exports = {
  start,
};
