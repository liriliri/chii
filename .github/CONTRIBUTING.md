# Contributing Guide

## Development Setup

[Node.js](https://nodejs.org/en/) and [depot_tools](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up) is needed for the development of chii.

After cloning the repo, run:

```bash
# install npm dependencies.
npm install
# clone Chrome DevTools frontend.
npm run init:front_end
```

## Commonly used NPM scripts

```bash
# watch and auto re-build.
npm run dev
# build devtools frontend.
npm run dev:front_end
# build chii
npm run build
# lint and build.
npm run ci
```

## Project Structure

* devtools: Chrome DevTools frontend.
* server: Server side source code.
* src: Client side source code, including target.js.
