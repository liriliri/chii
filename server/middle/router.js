const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');
const readTpl = require('../lib/readTpl');
const now = require('licia/now');

module.exports = function (channelManager, port) {
  const router = new Router();

  router.get('/', async ctx => {
    const tpl = await readTpl('index');
    ctx.body = tpl({
      targets: channelManager.getTargets(),
      port,
    });
  });

  let timestamp = now();
  router.get('/timestamp', ctx => {
    ctx.body = timestamp;
  });
  channelManager.on('target_changed', () => (timestamp = now()));

  function createStatic(prefix, folder) {
    router.get(`${prefix}/*`, async ctx => {
      await send(ctx, ctx.path.slice(prefix.length), {
        root: path.resolve(__dirname, `../..${folder}`),
      });
    });
  }

  createStatic('/front_end', '/public/front_end');
  createStatic('/tests', '/tests');

  router.get('/target.js', async ctx => {
    await send(ctx, 'target.js', {
      root: path.resolve(__dirname, `../../public`),
    });
  });

  return router.routes();
};
