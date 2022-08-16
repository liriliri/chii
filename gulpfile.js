const { src, dest } = require('gulp');
const clean = require('gulp-clean');
const map = require('licia/map');
const startWith = require('licia/startWith');

exports.copy = function () {
  return src(transSrc(['**/*.{js,html,json,svg,png}', '!legacy_test_runner/**/*'])).pipe(dest('public/front_end'));
};

exports.clean = function () {
  return src('public', { read: false, allowEmpty: true }).pipe(clean());
};

function transSrc(paths) {
  return map(paths, val => {
    const prefix = 'devtools/devtools-frontend/out/Default/gen/front_end/';
    if (startWith(val, '!')) {
      return '!' + prefix + val.slice(1);
    }

    return prefix + val;
  });
}
