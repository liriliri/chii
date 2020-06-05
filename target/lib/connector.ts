import Emitter from 'licia/Emitter';
import query from 'licia/query';
import randomId from 'licia/randomId';
import safeStorage from 'licia/safeStorage';
import $ from 'licia/$';
import contain from 'licia/contain';
import Socket from 'licia/Socket';
import { fullUrl } from './request';

const sessionStore = safeStorage('session');
class Connector extends Emitter {
  private ws: Socket;
  private isInit: boolean = false;
  constructor() {
    super();

    let id = sessionStore.getItem('chii-id');
    if (!id) {
      id = randomId(6);
      sessionStore.setItem('chii-id', id);
    }

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

    this.ws = new Socket(
      `${protocol}//${ChiiServerUrl}/target/${id}?${query.stringify({
        url: location.href,
        title: (window as any).ChiiTitle || document.title,
        favicon: getFavicon(),
      })}`
    );
    this.ws.on('open', () => {
      this.isInit = true;
      this.ws.on('message', event => {
        this.emit('message', JSON.parse(event.data));
      });
    });
  }
  send(message: any) {
    if (!this.isInit) return;
    this.ws.send(JSON.stringify(message));
  }
  trigger(method: string, params: any) {
    this.send({
      method,
      params,
    });
  }
  close() {
    this.ws.close();
  }
}

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

export default new Connector();
