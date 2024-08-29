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

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" p-id="10132" width="200" height="200"><path d="M512 128q104.5 0 192.75 51.5t139.75 139.75 51.5 192.75-51.5 192.75-139.75 139.75-192.75 51.5-192.75-51.5-139.75-139.75-51.5-192.75 51.5-192.75 139.75-139.75 192.75-51.5zm137 260.5q-1 0.5-4.75 4.75t-6.75 4.75q1 0 2.25-2.5t2.5-5.5 1.75-3.5q3-3.5 11-7.5 7-3 26-6 17-4 25.5 5.5-1-1 4.75-6.5t7.25-6q1.5-1 7.5-2.25t7.5-3.75l1-11q-6 0.5-8.75-3.5t-3.25-10.5q0 1-3 4 0-3.5-2.25-4t-5.75 0.5-4.5 0.5q-5-1.5-7.5-3.75t-4-8.25-2-7.5q-1-2.5-4.75-5.25t-4.75-5.25q-0.5-1-1.25-2.75t-1.5-3.25-2-2.75-2.75-1.25-3.5 2.5-3.75 5-2.25 2.5q-1.5-1-3-0.75t-2.25 0.5-2.25 1.5-2.5 1.75q-1.5 1-4.25 1.5t-4.25 1q7.5-2.5-0.5-5.5-5-2-8-1.5 4.5-2 3.75-6t-4.25-7l2.5 0q-0.5-2-4.25-4.25t-8.75-4.25-6.5-3q-4-2.5-17-4.75t-16.5 2.5q-2.5 3-2.25 5.25t2 7 1.75 6.25q0.5 3-2.75 6.5t-3.25 6q0 3.5 7 7.75t5 10.75q-1.5 4-8 8t-8 6q-2.5 4-0.75 9.25t5.25 8.25q1 1 0.75 2t-1.75 2.25-2.75 2-3.25 1.75l-1.5 1q-5.5 2.5-10.25-3t-6.75-13q-3.5-12.5-8-15-11.5-4-14.5 0.5-2.5-6.5-20.5-13-12.5-4.5-29-2 3-0.5 0-7.5-3.5-7.5-9.5-6 1.5-3 2-8.75t0.5-6.75q1.5-6.5 6-11.5 0.5-0.5 3.5-4.25t4.75-6.75 2.5-3q17.5 2 25-5.5 2.5-2.5 5.75-8.5t5.25-8.5q4.5-3 7-2.75t7.25 2.75 7.25 2.5q7 0.5 7.75-5.5t-3.75-10q6 0.5 1.5-8.5-2.5-3.5-4-4.5-6-2-13.5 2.5-4 2 1 4-0.5-0.5-4.75 5.25t-8.25 8.75-8-2.5q-0.5-0.5-2.75-6.75t-4.75-6.75q-4 0-8 7.5 1.5-4-5.5-7.5t-12-4q9.5-6-4-13.5-3.5-2-10.25-2.5t-9.75 2q-2.5 3.5-2.75 5.75t2.5 4 5.25 2.75 5.75 2 4.25 1.5q7 5 4 7-1 0.5-4.25 1.75t-5.75 2.25-3 2q-1.5 2 0 7t-1 7q-2.5-2.5-4.5-8.75t-3.5-8.25q3.5 4.5-12.5 3l-5-0.5q-2 0-8 1t-10.25 0.5-6.75-4q-2-4 0-10 0.5-2 2-1-2-1.5-5.5-4.75t-5-4.25q-23 7.5-47 20.5 3 0.5 6-0.5 2.5-1 6.5-3.25t5-2.75q17-7 21-3.5l2.5-2.5q7 8 10 12.5-3.5-2-15-0.5-10 3-11 6 3.5 6 2.5 9-2-1.5-5.75-5t-7.25-5.5-7.5-2.5q-8 0-11 0.5-73 40-117.5 111 3.5 3.5 6 4 2 0.5 2.5 4.5t1.25 5.5 5.75-1.5q4.5 4 1.5 9.5 0.5-0.5 22 13.5 9.5 8.5 10.5 10.5 1.5 5.5-5 9-0.5-1-4.5-4.5t-4.5-2q-1.5 2.5 2.5 9.25t5.25 6.25q-3.5 0-4.75 8t-1.25 17.75-0.5 11.75l1 0.5q-1.5 6 2.75 17.25t10.75 9.75q-6.5 1.5 10 21.5 3 4 4 4.5 1.5 1 6 3.75t7.5 5 5 5.25q2 2.5 5 11.25t7 11.75q-1 3 4.75 10t5.25 11.5q-0.5 0-1.25 0.5t-1.25 0.5q1.5 3.5 7.75 7t7.75 6.5q0.5 1.5 1 5t1.5 5.5 4 1q1-10-12-31-7.5-12.5-8.5-14.5-1.5-2.5-2.75-7.75t-2.25-7.25q1 0 3 0.75t4.25 1.75 3.75 2 1 1.5q-1.5 3.5 1 8.75t6 9.25 8.5 9.5 6 6.5q3 3 7 9.75t0 6.75q4.5 0 10 5t8.5 10q2.5 4 4 13t2.5 12q1 3.5 4.25 6.75t6.25 4.75l8 4 6.5 3.5q2.5 1 9.25 5.25t10.75 5.75q5 2 8 2t7.25-1.25 6.75-1.75q7.5-1 14.5 7.5t10.5 10.5q18 9.5 27.5 5.5-1 0.5 2.5 3.75t4 7.75 4.5 7.25 2.75 4.25q2.5 3 9 7.5t9 7.5q3-2 3.5-4.5-1.5 4 3.5 10t9 5q7-1.5 7-16-15.5 7.5-24.5-9 0-0.5-1.25-2.75t-2-4.25-1.25-4.25 0-3.75 2.5-1.5q4.5 0 5-1.75t-1-6.25-2-6.5q-0.5-4-5.5-10t-6-7.5q-2.5 4.5-8 4t-8-4.5q0 0.5-0.75 2.75t-0.75 3.25q-6.5 0-7.5-0.5 0.5-1.5 1.25-8.75t1.75-11.25q0.5-2 2.75-6t3.75-7.25 2-6.25-2.25-4.75-8.75-1.25q-9.5 0.5-13 10-0.5 1.5-1.5 5.25t-2.5 5.75-4.5 3.5q-3.5 1.5-12 1t-12-2.5q-6.5-4-11.25-14.5t-4.75-18.5q0-5 1.25-13.25t1.5-12.5-2.75-12.25q1.5-1 4.5-4.75t5-5.25q1-0.5 2.25-0.75t2.25 0 2-0.75 1.5-3q-0.5-0.5-2-1.5-1.5-1.5-2-1.5 3.5 1.5 14.25-0.75t13.75 0.75q7.5 5.5 11-1 0-0.5-1.25-4.75t2.5-6.75q2.5 13.5 14.5 4.5 1.5 1.5 7.75 2.5t8.75 2.5q1.5 1 3.5 2.75t2.75 2.25 2.5 2.5 4.25-3.25q5 7 6 12 5.5 20 9.5 22 3.5 1.5 5.5 1t2.25-4.75 0-7-0.75-6.25l-0.5-4 0-9-0.5-4q-7.5-1.5-9.25-6t0.75-9.25 7.5-9.25q0.5-0.5 4-1.75t7.75-3.25 6.25-4q10.5-9.5 7.5-17.5 3.5 0 5.5-4.5-0.5 0-2.5-1.5t-3.75-2.5-2.25-1q4.5-2.5 1-8 2.5-1.5 3.75-5.5t3.75-5q4.5 6 10.5 1 3.5-4 0.5-8 2.5-3.5 10.25-5.25t9.25-4.75q3.5 1 4-1t0.5-6 1.5-6q2-2.5 7.5-4.5t6.5-2.5l8.5-5.5q1.5-2 0-2 9 1 15.5-5.5 5-5.5-3-10 1.5-3-1.5-4.75t-7.5-2.75q1.5-0.5 5.75 2.5t5.25-0.75q7.5-5-3.5-8-8.5-2.5-21.5 6zm-81.5 438.5q103-18 175.5-94.5-1.5-1.5-6.25-2.25t-6.25-1.75q-9-3.5-12-4 0.5-3.5-1.25-6.5t-4-4.5-6.25-4-5.5-3.5q-1-1-3.5-3t-3.5-2.75-3.75-2.25-4.25-1-5 0.5l-1.5 0.5q-1.5 0.5-2.75 1.25t-2.75 1.5-2 1.5 0 1.25q-10.5-8.5-18-11-2.5-0.5-5.5-2.75t-5.25-3.5-5-0.75-5.75 3.5q-2.5 2.5-3 7.5t-1 6.5q-3.5-2.5 0-8.75t1-9.25q-1.5-3-5.25-2.25t-6 2.25-5.75 4.25-4.5 3.25-4.25 2.75-4.25 3.75q-1.5 2-3 6t-2.5 5.5q-1-2-5.75-3.25t-4.75-2.75q1 5 2 17.5t2.5 19q3.5 15.5-6 24-13.5 12.5-14.5 20-2 11 6 13 0 3.5-4 10.25t-3.5 10.75q0 3 1 8z" p-id="10133"></path></svg>';
window.defaultFavicon = `data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}`;

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
    const userAgent = toEl(
      `<span title="${target.userAgent}" target="_blank">${target.userAgent}</span>`
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
  const height = window.innerHeight - $contentHeader.offset().height - 8 * 3 - 2;
  dataGrid.setOption('maxHeight', height);
}

updateDataGridHeight();

window.addEventListener('resize', throttle(updateDataGridHeight, 16));
