const dateFormat = require('licia/dateFormat');
const toArr = require('licia/toArr');
const Channel = require('licia/Channel');

exports.log = function () {
  const args = toArr(arguments);

  args.unshift(dateFormat('yyyy-mm-dd HH:MM:ss'));

  console.log.apply(console, args);
};

exports.createChannel = function (ws) {
  const channel = new Channel();

  ws.on('close', () => channel.destroy());
  ws.on('message', msg => channel.send(msg));
  channel.on('message', msg => ws.send(msg));

  return channel;
};
