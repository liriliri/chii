const Koa = require('koa');

const router = require('./middle/router');

function start(port = 3000) {
  const app = new Koa();

  app.use(router());

  app.listen(port);
}

module.exports = {
  start,
};
