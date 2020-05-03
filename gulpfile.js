const { src, dest } = require('gulp');
const uglify = require('gulp-uglify-es').default;
const clean = require('gulp-clean');

exports.uglify = function () {
  return src('public/front_end/**/*.js').pipe(uglify()).pipe(dest('public/front_end'));
};

exports.clean = function () {
  return src('public', { read: false, allowEmpty: true }).pipe(clean());
};
