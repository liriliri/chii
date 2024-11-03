import detectOs from 'licia/detectOs';
import $ from 'licia/$';
import randomId from 'licia/randomId';
import toInt from 'licia/toInt';
import LunaDataGrid from 'luna-data-grid';
import LunaModal from 'luna-modal';
import LunaToolbar from 'luna-toolbar';
import each from 'licia/each';
import throttle from 'licia/throttle';
import escape from 'licia/escape';
import toEl from 'licia/toEl';
import h from 'licia/h';
import winIcon from './icon/win.svg';
import macIcon from './icon/mac.svg';
import linuxIcon from './icon/linux.svg';
import globeIcon from './icon/globe.svg';
import androidIcon from './icon/android.svg';
import 'luna-data-grid/luna-data-grid.css';
import 'luna-toolbar/luna-toolbar.css';
import 'luna-modal/luna-modal.css';

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

function inspect(id: string, rtc: boolean) {
  const { domain, basePath } = window;
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const url =
    location.protocol +
    `//${domain}${basePath}front_end/chii_app.html?${protocol}=${encodeURIComponent(
      `${domain}${basePath}client/${randomId(6)}?target=${id}`
    )}&rtc=${rtc}`;
  window.open(url, '_blank');
}

let start = Date.now();
setInterval(() => {
  if (document.hidden) {
    return;
  }
  fetch(`${window.basePath}timestamp`)
    .then(res => res.text())
    .then(timestamp => {
      if (toInt(timestamp) > start) {
        start = toInt(timestamp);
        update();
      }
    });
}, 2000);

const $targets = $('.targets');
const $toolbar = $('.toolbar');
const $help = $('.help');
const $description = $('.description');

const help = new LunaModal($help.get(0) as HTMLElement, {
  theme: 'auto',
  title: 'Help',
  content: $description.get(0) as HTMLElement,
});

const toolbar = new LunaToolbar($toolbar.get(0) as HTMLElement, {
  theme: 'auto',
});
toolbar.appendInput('filter', '', 'Filter');
const targets = toolbar.appendText('0 Target');
toolbar.appendSpace();
toolbar.appendButton('Help', () => {
  $description.rmClass('hidden');
  help.show();
});
toolbar.on('change', (key, val) => {
  if (key === 'filter') {
    dataGrid.setOption('filter', val);
  }
});

const dataGrid = new LunaDataGrid($targets.get(0) as HTMLElement, {
  theme: 'auto',
  columns: [
    {
      id: 'title',
      title: 'Title',
      weight: 30,
      sortable: true,
    },
    {
      id: 'url',
      title: 'URL',
      weight: 40,
      sortable: true,
    },
    {
      id: 'ip',
      title: 'IP',
      sortable: true,
      weight: 15,
    },
    {
      id: 'userAgent',
      title: 'User Agent',
      sortable: true,
      weight: 40,
    },
    {
      id: 'action',
      title: 'Action',
      weight: 10,
    },
  ],
  minHeight: 100,
});

function update() {
  fetch(`${window.basePath}targets`)
    .then(res => res.json())
    .then(data => {
      const count = data.targets.length;
      targets.setText(`${count} Target${count > 1 ? 's' : ''}`);
      render(data.targets);
    });
}

window.defaultFavicon = globeIcon;

const osIcons: any = {
  windows: winIcon,
  'os x': macIcon,
  ios: macIcon,
  linux: linuxIcon,
  android: androidIcon,
};

function render(targets: any[]) {
  dataGrid.clear();
  each(targets, target => {
    const title = toEl(
      `<span><img src="${escape(target.favicon)}" onerror="this.src=defaultFavicon"/>${escape(target.title)}</span>`
    ) as HTMLElement;
    const formattedUrl = escape(target.url);
    const url = toEl(
      `<a title=${formattedUrl} href="${formattedUrl}" target="_blank">${formattedUrl}</a>`
    ) as HTMLElement;
    const os = detectOs(target.userAgent);
    const osIcon = osIcons[os] ? `<img src="${osIcons[os]}" class="os-icon" />` : '';
    const userAgent = toEl(
      `<span title="${target.userAgent}" target="_blank">${osIcon}${target.userAgent}</span>`
    ) as HTMLElement;
    const action = h(
      'a',
      {
        style: {
          cursor: 'pointer',
        },
        onclick() {
          inspect(target.id, target.rtc);
        },
      },
      'inspect'
    );

    dataGrid.append({
      title,
      url,
      ip: target.ip,
      userAgent,
      action,
    });
  });
}

update();

function updateDataGridHeight() {
  const height = window.innerHeight - $toolbar.offset().height - 8 * 3 - 2;
  dataGrid.setOption('maxHeight', height);
}

updateDataGridHeight();

window.addEventListener('resize', throttle(updateDataGridHeight, 16));
