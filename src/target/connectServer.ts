import Socket from 'licia/Socket';
import query from 'licia/query';
import chobitsu from 'chobitsu';
import { serverUrl, id } from './config';
import { getFavicon } from './util';

let isInit = false;

export default function () {
  const proxy = `${serverUrl}proxy`;
  chobitsu.domain('Page').setProxy({
    proxy,
  });
  chobitsu.domain('Debugger').setProxy({
    proxy,
  });
  chobitsu.domain('CSS').setProxy({
    proxy,
  });

  const ws = new Socket(
    `${serverUrl.replace(/^http/, 'ws')}target/${id}?${query.stringify({
      url: location.href,
      title: (window as any).ChiiTitle || document.title,
      favicon: getFavicon(),
      '__chobitsu-hide__': true,
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

  return { ws };
}
