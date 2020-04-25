import Emitter from 'licia/Emitter';
import query from 'licia/query';
import randomId from 'licia/randomId';

class Connector extends Emitter {
  private ws: WebSocket;
  constructor() {
    super();

    this.ws = new WebSocket(
      `ws://${ChiiServerUrl}/target/${randomId(6)}?${query.stringify({
        url: location.href,
        title: document.title,
      })}`
    );
    this.ws.addEventListener('open', () => {
      this.ws.addEventListener('message', event => {
        this.emit('message', JSON.parse(event.data));
      });
    });
  }
  send(message: any) {
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

let ChiiServerUrl = (window as any).ChiiServerUrl || location.host;

function getTargetScriptEl() {
  const elements = document.getElementsByTagName('script');
  let i = 0;
  while (i < elements.length) {
    let element = elements[i];
    if (-1 !== element.src.indexOf('/target.js')) {
      return element;
    }
    i++;
  }
}

const element = getTargetScriptEl();
if (element) {
  const pattern = /((https?:)?\/\/(.*?)\/)/;
  const match = pattern.exec(element.src);
  if (match) {
    ChiiServerUrl = match[3];
  }
}

export default new Connector();
