const ws = new WebSocket(`ws://${location.host}/foo`);

ws.addEventListener('open', () => {
  setInterval(() => {
    ws.send('hello world');
  }, 1000);
});
