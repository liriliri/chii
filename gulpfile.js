const { src, dest } = require('gulp');
const uglify = require('gulp-uglify-es').default;
const clean = require('gulp-clean');
const map = require('licia/map');
const startWith = require('licia/startWith');

exports.uglify = function () {
  return src(
    transSrc([
      '**/*.js',
      '!ui/components/diff_view/diff_view.js',
      '!ui/components/panel_feedback/panel_feedback.js',
      '!ui/components/text_editor/text_editor.js',
      '!ui/components/docs/**/*.js',
    ])
  )
    .pipe(uglify())
    .pipe(dest('public/front_end'));
};

exports.clean = function () {
  return src('public', { read: false, allowEmpty: true }).pipe(clean());
};

function transSrc(paths) {
  return map(paths, val => {
    const prefix = 'public/front_end/';
    if (startWith(val, '!')) {
      return '!' + prefix + val.slice(1);
    }

    return prefix + val;
  });
}
