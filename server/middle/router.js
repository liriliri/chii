const Router = require('koa-router');

module.exports = function () {
  const router = new Router();

  router.get('/', ctx => {
    ctx.body = 'hello world';
  });

  return router.routes();
};
