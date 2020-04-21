import uuid from 'licia/uuid';
import query from 'licia/query';

const ws = new WebSocket(
  `ws://${location.host}/target/${uuid()}?${query.stringify({
    url: location.href,
    title: document.title,
  })}`
);

ws.addEventListener('open', () => {
  setInterval(() => {
    ws.send('hello world');
  }, 1000);
});
