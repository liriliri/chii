# Chii

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![License][license-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/chii.svg
[npm-url]: https://npmjs.org/package/chii
[travis-image]: https://img.shields.io/travis/liriliri/chii.svg
[travis-url]: https://travis-ci.org/liriliri/chii
[license-image]: https://img.shields.io/npm/l/chii.svg

Remote debugging tool like [weinre](https://people.apache.org/~pmuellr/weinre/docs/latest/Home.html), replacing  web inspector with the latest [chrome devtools frontend](https://github.com/ChromeDevTools/devtools-frontend).

![Chii](./docs/screenshot.jpg)

## Install

You can get it on npm.

```bash
npm install chii -g
```

## Usage

Start the server with the following command.

```bash
chii start -p 8080
```

Use this script to inject the target code into your webpage.

```html
<script src="http://localhost:8080/target.js"></script>
```

Then browse to localhost:8080 to start debugging your page.