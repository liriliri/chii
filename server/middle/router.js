const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');
const readTpl = require('../lib/readTpl');
const now = require('licia/now');
const pairs = require('licia/pairs');
const reverse = require('licia/reverse');
const map = require('licia/map');

module.exports = function (channelManager, domain) {
  const router = new Router();

  router.get('/', async ctx => {
    const targets = reverse(
      map(pairs(channelManager.getTargets()), item => ({
        id: item[0],
        ...item[1],
      }))
    );

    const tpl = await readTpl('index');
    ctx.body = tpl({
      targets,
      protocol: ctx.protocol,
      domain,
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
      root: path.resolve(__dirname, '../../public'),
    });
  });

  return router.routes();
};
