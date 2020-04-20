const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');

module.exports = function () {
  const router = new Router();

  const frontEnd = '/front_end';
  router.get(`${frontEnd}/*`, async ctx => {
    await send(ctx, ctx.path.slice(frontEnd.length), { root: path.resolve(__dirname, `../../public/${frontEnd}`) });
  });

  router.get('/', ctx => {
    ctx.body = 'hello world';
  });

  return router.routes();
};
