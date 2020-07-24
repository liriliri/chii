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
      domain,
      version: pkg.version,
    });
  });
  //for vscode-plugin
  router.get('/vscode-plugin', async ctx => {
    const targets = reverse(
      map(pairs(channelManager.getTargets()), item => ({
        id: item[0],
        ...item[1],
      }))
    );
    ctx.body = {targets};
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
        maxAge,
      });
    });
  }

  createStatic('/front_end', '/public/front_end');
  createStatic('/tests', '/tests');

  router.get('/target.js', async ctx => {
    await send(ctx, 'target.js', {
      root: path.resolve(__dirname, '../../public'),
      maxAge,
    });
  });

  return router.routes();
};
