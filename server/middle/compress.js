const compress = require('koa-compress');
const contain = require('licia/contain');

module.exports = function () {
  return compress({
    threshold: 2048,
    filter(content_type) {
      return contain(['application/javascript', 'application/json', 'text/css'], content_type);
    },
    gzip: {
      flush: require('zlib').Z_SYNC_FLUSH,
    },
    deflate: {
      flush: require('zlib').Z_SYNC_FLUSH,
    },
    br: false, // disable brotli
  });
};
