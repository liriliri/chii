const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');
const readTpl = require('../lib/readTpl');
const now = require('licia/now');
const pairs = require('licia/pairs');
const reverse = require('licia/reverse');
const map = require('licia/map');
const ms = require('licia/ms');

const pkg = require('../../package.json');

const maxAge = ms('2h');

module.exports = function (channelManager, domain, cdn) {
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
      domain,
      version: pkg.version,
    });
  });

  if (cdn) {
    router.get('/front_end/chii_app.html', async ctx => {
      const tpl = await readTpl('chii_app');
      ctx.body = tpl({
        cdn,
      });
    });
  }

  let timestamp = now();
  router.get('/timestamp', ctx => {
    ctx.body = timestamp;
  });
  channelManager.on('target_changed', () => (timestamp = now()));

  function createStatic(prefix, folder) {
    router.get(`${prefix}/*`, async ctx => {
      await send(ctx, ctx.path.slice(prefix.length), {
        root: path.resolve(__dirname, `../..${folder}`),
        maxAge,
      });
    });
  }

  function createStaticFile(file) {
    router.get(`/${file}`, async ctx => {
      await send(ctx, file, {
        root: path.resolve(__dirname, '../../public'),
        maxAge,
      });
    });
  }

  createStatic('/front_end', '/public/front_end');
  createStatic('/test', '/test');
  createStaticFile('target.js');
  createStaticFile('index.js');

  return router.routes();
};
