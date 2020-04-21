const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const TPL_PATH = path.resolve(__dirname, '../tpl');

const cache = {};

handlebars.registerHelper('raw', function (options) {
  return options.fn();
});

module.exports = function (name) {
  return new Promise((resolve, reject) => {
    let tpl = cache[name];

    if (tpl) return process.nextTick(() => resolve(tpl));

    fs.readFile(path.resolve(TPL_PATH, name + '.hbs'), 'utf8', (err, data) => {
      if (err) return reject(err);

      tpl = cache[name] = handlebars.compile(data);

      resolve(tpl);
    });
  });
};
