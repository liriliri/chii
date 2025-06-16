<div align="center">
  <a href="https://chii.liriliri.io/" target="_blank">
    <img src="https://chii.liriliri.io/icon.png" width="400">
  </a>
</div>

<h1 align="center">Chii</h1>

<div align="center">

Remote debugging tool.

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![License][license-image]][npm-url]

</div>

[npm-image]: https://img.shields.io/npm/v/chii?style=flat-square
[npm-url]: https://npmjs.org/package/chii
[ci-image]: https://img.shields.io/github/actions/workflow/status/liriliri/chii/main.yml?branch=master&style=flat-square
[ci-url]: https://github.com/liriliri/chii/actions/workflows/main.yml
[license-image]: https://img.shields.io/npm/l/chii?style=flat-square

<img src="https://chii.liriliri.io/screenshot.jpg" style="width:100%">

Remote debugging tool like [weinre](https://www.npmjs.com/package/weinre), replacing web inspector with the latest [chrome devtools frontend](https://github.com/ChromeDevTools/devtools-frontend).

## Demo

![Demo](https://chii.liriliri.io/qrcode.png)

Browse it on your phone: [https://chii.liriliri.io/playground/test/demo.html](https://chii.liriliri.io/playground/test/demo.html)

Open [https://chii.liriliri.io/playground/](https://chii.liriliri.io/room.html) and click inspect to start debugging the demo page.

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
<script src="//host-machine-ip:8080/target.js"></script>
```

Then browse to localhost:8080 to start debugging your page.

For more detailed usage instructions, please read the documentation at [chii.liriliri.io](https://chii.liriliri.io/docs/)!

## Related Projects

* [whistle.chii](https://github.com/liriliri/whistle.chii): Whistle Chii plugin.
* [chobitsu](https://github.com/liriliri/chobitsu): Chrome devtools protocol JavaScript implementation.
* [vivy](https://github.com/liriliri/vivy-docs): Icon image generation.

## Contribution

Read [Contributing Guide](https://chii.liriliri.io/docs/contributing.html) for development setup instructions.
