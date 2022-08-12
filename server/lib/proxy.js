const request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = async function (ctx, url) {
  const headers = Object.assign({}, ctx.header);
  delete headers.host;
  delete headers.cookie;

  const options = {
    uri: url,
    method: ctx.method,
    timeout: 5000,
    headers,
  };

  await pipeRequest(ctx, options);
};

function pipeRequest(ctx, options) {
  return new Promise((resolve, reject) => {
    const req = request(options);
    ctx.req.pipe(req);
    req
      .on('response', res => {
        const { headers } = res;

        delete headers['set-cookie'];
      })
      .pipe(ctx.res);
    req.on('error', err => {
      reject(err);
    });
    req.on('end', () => {
      ctx.res.end();
      resolve();
    });
  });
}
