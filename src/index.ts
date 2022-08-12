import detectOs from 'licia/detectOs';
import $ from 'licia/$';
import randomId from 'licia/randomId';
import toInt from 'licia/toInt';

declare const window: any;

const os = detectOs();

switch (os) {
  case 'linux':
    $('body').addClass('platform-linux');
    break;
  case 'windows':
    $('body').addClass('platform-windows');
    break;
}

window.inspect = function (id: string) {
  const { domain, basePath } = window;
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const url =
    location.protocol +
    `//${domain}${basePath}front_end/chii_app.html?${protocol}=${domain}${basePath}client/${randomId(6)}?target=${id}`;
  window.open(url, '_blank');
};

const start = Date.now();
setInterval(() => {
  fetch(`${window.basePath}timestamp`)
    .then(res => res.text())
    .then(
      timestamp => {
        if (toInt(timestamp) > start) location.reload();
      },
      () => {}
    );
}, 2000);
