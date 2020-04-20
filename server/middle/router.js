const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');

module.exports = function () {
  const router = new Router();

  router.get('/', ctx => {
    ctx.body = 'hello world';
  });

  function createStatic(prefix, folder) {
    router.get(`${prefix}/*`, async ctx => {
      await send(ctx, ctx.path.slice(prefix.length), {
        root: path.resolve(__dirname, `../..${folder}`),
      });
    });
  }

  createStatic('/front_end', '/public/front_end');
  createStatic('/public', '/public');
  createStatic('/tests', '/tests');

  return router.routes();
};
