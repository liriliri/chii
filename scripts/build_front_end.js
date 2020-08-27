const path = require('path');
const concat = require('licia/concat');
const rmdir = require('licia/rmdir');
const endWith = require('licia/endWith');
const sleep = require('licia/sleep');
const ncp = require('ncp').ncp;
const fs = {
  ...require('fs'),
  ...require('fs').promises,
};

const pathFolders = [
  path.resolve(__dirname, '../front_end'),
  path.resolve(__dirname, '../devtools-frontend/front_end'),
];

const outFolder = path.resolve(__dirname, '../public/front_end');

function lookupFile(fileName) {
  for (const pathFolder of pathFolders) {
    const absoluteFileName = path.join(pathFolder, fileName);
    if (fs.existsSync(absoluteFileName)) return absoluteFileName;
  }
  return '';
}

async function loadSource(fileName) {
  return await fs.readFile(lookupFile(fileName), 'utf8');
}

async function loadAppDescriptor(appName) {
  let descriptor = {
    modules: [],
  };

  while (true) {
    const source = await loadSource(appName + '.json');
    const content = JSON.parse(source);
    if (content.modules) {
      descriptor.modules = concat(descriptor.modules, content.modules);
    }
    if (content.extends) {
      appName = content.extends;
    } else {
      break;
    }
  }

  return descriptor;
}

async function copyModule(name) {
  const descriptor = JSON.parse(await loadSource(name + '/module.json'));
  const outDir = path.join(outFolder, name);
  let files = descriptor.modules || [];
  files.push('module.json');
  files = concat(files, descriptor.resources || []);
  for (let file of files) {
    const srcPath = lookupFile(name + '/' + file);
    const destPath = path.join(outDir, file);
    await copyFile(srcPath, destPath);
  }
}

async function copyFile(srcPath, destPath) {
  await mkdir(path.dirname(destPath));
  await fs.copyFile(srcPath, destPath);
}

async function copyApp(appName) {
  const files = [
    appName + '.js',
    appName + '.html',
    appName + '.json',
    'root.js',
    'shell.js',
    'RuntimeInstantiator.js',
  ];

  while (true) {
    const descriptor = await loadSource(appName + '.json');
    const content = JSON.parse(descriptor);
    if (content.extends) {
      appName = content.extends;
      files.push(appName + '.json');
    } else {
      break;
    }
  }

  for (let file of files) {
    const srcPath = lookupFile(file);
    const destPath = path.join(outFolder, file);
    if (fs.existsSync(srcPath)) {
      await copyFile(srcPath, destPath);
    }
  }
}

async function mkdir(dir) {
  try {
    await fs.stat(dir);
  } catch (e) {
    await fs.mkdir(dir, {
      recursive: true,
    });
  }
}

async function buildApp(appName) {
  await copyApp(appName);
  const descriptor = await loadAppDescriptor(appName);
  const modules = descriptor.modules.map(module => module.name);
  for (let module of modules) {
    await copyModule(module);
  }
}

function copyImages() {
  const promises = pathFolders.map(pathFolder => {
    return new Promise(async (resolve, reject) => {
      const srcPath = path.join(pathFolder, 'Images');
      const outPath = path.join(outFolder, 'Images');
      await mkdir(outPath);
      if (fs.existsSync(srcPath)) {
        ncp(
          srcPath,
          outPath,
          {
            filter(name) {
              return !endWith(name, '.md') && !endWith(name, '.hashes');
            },
          },
          err => {
            if (err) return reject(err);
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  });

  return Promise.all(promises);
}

async function buildApps(appNames) {
  await copyImages();
  for (let appName of appNames) {
    await buildApp(appName);
  }
}

rmdir(outFolder, async err => {
  await sleep(500);
  await buildApps(['chii_app', 'devtools_app', 'formatter_worker_entrypoint']);
});
