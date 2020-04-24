import Emitter from 'licia/Emitter';
import query from 'licia/query';
import randomId from 'licia/randomId';

class Connector extends Emitter {
  private ws: WebSocket;
  constructor() {
    super();

    this.ws = new WebSocket(
      `ws://${location.host}/target/${randomId(6)}?${query.stringify({
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
  close() {
    this.ws.close();
  }
}

export default new Connector();
