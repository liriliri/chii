const { src, dest } = require('gulp');
const clean = require('gulp-clean');
const map = require('licia/map');
const startWith = require('licia/startWith');
const xml2js = require('xml2js');
const fs = require('licia/fs');

exports['copy:dev'] = function () {
  return src(transSrc(['**/*.{js,html,json,svg,png}', '!legacy_test_runner/**/*'])).pipe(dest('public/front_end'));
};

exports['copy:release'] = async function () {
  return src(transSrc(await readReleaseFiles()), {
    base: 'devtools/devtools-frontend/out/Default/gen/front_end/',
  }).pipe(dest('public/front_end'));
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

async function readReleaseFiles() {
  const xml = await fs.readFile(transSrc(['devtools_resources.grd'])[0], 'utf8');
  const result = await xml2js.parseStringPromise(xml);
  const includes = result.grit.release[0].includes[0].include;
  return map(includes, function (include) {
    return include.$.file.replace('.compressed', '');
  }).slice(1);
}
