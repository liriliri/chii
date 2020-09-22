# Koa Compress

[![Node.js CI](https://github.com/koajs/compress/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/koajs/compress/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster)
[![codecov](https://codecov.io/gh/koajs/compress/branch/master/graph/badge.svg)](https://codecov.io/gh/koajs/compress)

Compress middleware for Koa

## Example

```js
const compress = require('koa-compress')
const Koa = require('koa')

const app = new Koa()
app.use(compress({
  filter (content_type) {
  	return /text/i.test(content_type)
  },
  threshold: 2048,
  gzip: {
    flush: require('zlib').Z_SYNC_FLUSH
  },
  deflate: {
    flush: require('zlib').Z_SYNC_FLUSH,
  },
  br: false // disable brotli
}))
```

## Options

### filter\<Function\>

```ts
function (mimeType: string): Boolean {

}
```

An optional function that checks the response content type to decide whether to compress.
By default, it uses [compressible](https://github.com/jshttp/compressible).

### options.threshold\<String|Number\>

Minimum response size in bytes to compress.
Default `1024` bytes or `1kb`.

### options[encoding]\<Object\>

The current encodings are, in order of preference: `br`, `gzip`, `deflate`.
Setting `options[encoding] = {}` will pass those options to the encoding function.
Setting `options[encoding] = false` will disable that encoding.

### options.br

[Brotli compression](https://en.wikipedia.org/wiki/Brotli) is supported in node v11.7.0+, which includes it natively. 

## Manually turning compression on and off

You can always enable compression by setting `ctx.compress = true`.
You can always disable compression by setting `ctx.compress = false`.
This bypasses the filter check.

```js
app.use((ctx, next) => {
  ctx.compress = true
  ctx.body = fs.createReadStream(file)
})
```
