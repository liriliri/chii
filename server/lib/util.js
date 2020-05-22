const dateFormat = require('licia/dateFormat');
const toArr = require('licia/toArr');

exports.log = function () {
  const args = toArr(arguments);

  args.unshift(dateFormat('yyyy-mm-dd HH:MM:ss'));

  console.log.apply(console, args);
};
