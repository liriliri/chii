<a href="https://chii.liriliri.io/" target="_blank">
  <img src="https://res.liriliri.io/chii/banner.jpg" style="width:100%">
</a>

<h1 align="center">Chii</h1>

<div align="center">

远程调试工具。

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![License][license-image]][npm-url]

</div>

[npm-image]: https://img.shields.io/npm/v/chii?style=flat-square
[npm-url]: https://npmjs.org/package/chii
[ci-image]: https://img.shields.io/github/actions/workflow/status/liriliri/chii/main.yml?branch=master&style=flat-square
[ci-url]: https://github.com/liriliri/chii/actions/workflows/main.yml
[license-image]: https://img.shields.io/npm/l/chii?style=flat-square

<img src="https://res.liriliri.io/chii/screenshot.jpg" style="width:100%">

与 [weinre](https://people.apache.org/~pmuellr/weinre/docs/latest/Home.html) 一样的远程调试工具，主要是将 web inspector 替换为最新的 [chrome devtools frontend](https://github.com/ChromeDevTools/devtools-frontend).

## Demo

![Demo](https://res.liriliri.io/chii/qrcode.png)

请扫描二维码或在手机上直接访问：[https://chii.liriliri.io/test/demo.html](https://chii.liriliri.io/test/demo.html)

打开 [https://chii.liriliri.io/](https://chii.liriliri.io/) 并点击 inspect 按钮开始调试示例页面。

如果想在其它页面尝试，请在浏览器地址栏上输入以下代码。

```javascript
javascript:(function () { var script = document.createElement('script'); script.src="//chii.liriliri.io/target.js"; document.body.appendChild(script); })();
```

## 安装

可以通过 npm 安装。

```bash
npm install chii -g
```

## 使用 

用下面的命令开启服务。

```bash
chii start -p 8080
```

在你的页面中使用这个脚本注入代码。


```html
<script src="//host-machine-ip:8080/target.js"></script>
```

然后就可以访问 localhost:8080 开始调试页面。

你可以使用 iframe 将调试器展示在同一页面中，只需要在 script 元素上加多 embedded 一个参数即可。

```html
<script src="//host-machine-ip:8080/target.js" embedded="true"></script>
```

访问 [https://chii.liriliri.io/test/demo.html?embedded=true](https://chii.liriliri.io/test/demo.html?embedded=true) 可以查看实际效果。

## 相关项目

* [whistle.chii](https://github.com/liriliri/whistle.chii)：Whistle Chii 插件。
* [chobitsu](https://github.com/liriliri/chobitsu): Chrome 调试协议 JavaScript 实现。
