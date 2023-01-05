import detectOs from 'licia/detectOs';
import $ from 'licia/$';
import randomId from 'licia/randomId';
import toInt from 'licia/toInt';
import isEmpty from 'licia/isEmpty';
import LunaDataGrid from 'luna-data-grid';
import each from 'licia/each';
import throttle from 'licia/throttle';
import escape from 'licia/escape';
import toEl from 'licia/toEl';
import h from 'licia/h';
import debounce from 'licia/debounce';
import 'luna-data-grid/luna-data-grid.css';

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

function inspect(id: string) {
  const { domain, basePath } = window;
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const url =
    location.protocol +
    `//${domain}${basePath}front_end/chii_app.html?${protocol}=${domain}${basePath}client/${randomId(6)}?target=${id}`;
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

const $description = $('.description');
const $targets = $('.targets');
const $filter = $('.filter');
const $contentHeader = $('.content-header');

$filter.on(
  'input',
  debounce(function () {
    const filter = $filter.val();
    dataGrid.setOption('filter', filter);
  }, 500)
);

const dataGrid = new LunaDataGrid($targets.get(0) as HTMLElement, {
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
      id: 'action',
      title: 'Action',
      weight: 15,
    },
  ],
  minHeight: 100,
});

function update() {
  fetch(`${window.basePath}targets`)
    .then(res => res.json())
    .then(data => {
      const targets = data.targets;

      if (isEmpty(targets)) {
        $description.rmClass('hidden');
        $targets.addClass('hidden');
        $filter.addClass('hidden');
      } else {
        $description.addClass('hidden');
        $targets.rmClass('hidden');
        $filter.rmClass('hidden');
        render(targets);
      }
    });
}

function render(targets: any[]) {
  dataGrid.clear();
  each(targets, target => {
    const title = toEl(`<span><img src="${escape(target.favicon)}"/>${escape(target.title)}</span>`) as HTMLElement;
    const url = toEl(`<a href="${escape(target.url)}" target="_blank">${escape(target.url)}</a>`) as HTMLElement;
    const action = h(
      'a',
      {
        style: {
          cursor: 'pointer',
        },
        onclick() {
          inspect(target.id);
        },
      },
      'inspect'
    );

    dataGrid.append({
      title,
      url,
      ip: target.ip,
      action,
    });
  });
}

update();

function updateDataGridHeight() {
  const height = window.innerHeight - $contentHeader.offset().height - 8 * 3 - 2;
  dataGrid.setOption('maxHeight', height);
}

updateDataGridHeight();

window.addEventListener('resize', throttle(updateDataGridHeight, 16));
