const targetIframe = document.getElementById('target');
const devtoolsIframe = document.getElementById('devtools');

function resetHeight() {
  const targetHeight = Math.floor(window.innerHeight * 0.4);
  targetIframe.style.height = targetHeight + 'px';
  devtoolsIframe.style.height = window.innerHeight - targetHeight + 'px';
}

resetHeight();

window.addEventListener('resize', resetHeight);

const targetSrc =
  location.protocol + '//' + location.host + location.pathname.replace('test/iframe.html', '') + 'target.js';
targetIframe.onload = function () {
  targetIframe.contentWindow.ChiiDevtoolsIframe = devtoolsIframe;
  targetIframe.contentWindow.injectTarget(targetSrc);
};
window.addEventListener('message', event => {
  targetIframe.contentWindow.postMessage(event.data, event.origin);
});

function load() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Target</title>
      <style>
        .motto {
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="motto">Hello Chii!</div>
      <button onclick="reload()">Reload</button>
      <script>
        console.log('Page loaded!');
        setTimeout(function () {
          console.log('Hello Chii');
          fetch(location.href);
        }, 1000);
        window.reload = function () {
          location.reload();
        }
        window.injectTarget = function (targetSrc) {
          var script = document.createElement('script');
          script.src = targetSrc;
          script.setAttribute('embedded', 'true');
          script.setAttribute('cdn', 'https://cdn.jsdelivr.net/npm/chii/public');
          script.onload = function () {
            console.log('console right after target injected');
            throw Error('exception right after target injected');
          };
          document.head.appendChild(script);
        }
      </script>
    </body>
    </html>`;

  const blob = new Blob([html], {
    type: 'text/html',
  });
  const src = URL.createObjectURL(blob);

  targetIframe.src = src;
}

load();
