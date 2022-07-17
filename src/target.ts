import query from 'licia/query';
import randomId from 'licia/randomId';
import safeStorage from 'licia/safeStorage';
import $ from 'licia/$';
import contain from 'licia/contain';
import Socket from 'licia/Socket';
import chobitsu from 'chobitsu';
import DevtoolsFrame from './DevtoolsFrame';

const sessionStore = safeStorage('session');

let ChiiServerUrl = location.host;

function getTargetScriptEl() {
  const elements = document.getElementsByTagName('script');
  let i = 0;
  while (i < elements.length) {
    const element = elements[i];
    if (-1 !== element.src.indexOf('/target.js')) {
      return element;
    }
    i++;
  }
}

if ((window as any).ChiiServerUrl) {
  ChiiServerUrl = (window as any).ChiiServerUrl;
} else {
  const element = getTargetScriptEl();
  if (element) {
    const pattern = /((https?:)?\/\/(.*?)\/)/;
    const match = pattern.exec(element.src);
    if (match) {
      ChiiServerUrl = match[3];
    }
  }
}

let embedded = false;
const element = getTargetScriptEl();
if (element) {
  if (element.getAttribute('embedded') === 'true') {
    embedded = true;
  }
}

function getFavicon() {
  let favicon = location.origin + '/favicon.ico';

  const $link = $('link');
  $link.each(function (this: HTMLElement) {
    if (contain(this.getAttribute('rel') || '', 'icon')) {
      const href = this.getAttribute('href');
      if (href) favicon = fullUrl(href);
    }
  });

  return favicon;
}

const link = document.createElement('a');

function fullUrl(href: string) {
  link.href = href;

  return link.protocol + '//' + link.host + link.pathname + link.search + link.hash;
}

let isInit = false;

let id = sessionStore.getItem('chii-id');
if (!id) {
  id = randomId(6);
  sessionStore.setItem('chii-id', id);
}

if (!embedded) {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

  const ws = new Socket(
    `${protocol}//${ChiiServerUrl}/target/${id}?${query.stringify({
      url: location.href,
      title: (window as any).ChiiTitle || document.title,
      favicon: getFavicon(),
    })}`
  );

  ws.on('open', () => {
    isInit = true;
    ws.on('message', event => {
      chobitsu.sendRawMessage(event.data);
    });
  });

  chobitsu.setOnMessage((message: string) => {
    if (!isInit) return;
    ws.send(message);
  });
} else {
  const protocol = location.protocol === 'https:' ? 'https:' : 'http:';
  const devtoolsFrame = new DevtoolsFrame(`${protocol}//${ChiiServerUrl}`);
  devtoolsFrame.attach();
}
