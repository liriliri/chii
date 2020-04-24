const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');
const readTpl = require('../lib/readTpl');

module.exports = function (channelManager) {
  const router = new Router();

  router.get('/', async ctx => {
    const tpl = await readTpl('index');
    ctx.body = tpl({ targets: channelManager.getTargets() });
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
