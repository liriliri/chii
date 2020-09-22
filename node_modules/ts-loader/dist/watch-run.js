"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const constants = require("./constants");
const servicesHost_1 = require("./servicesHost");
const utils_1 = require("./utils");
/**
 * Make function which will manually update changed files
 */
function makeWatchRun(instance, loader) {
    // Called Before starting compilation after watch
    const lastTimes = new Map();
    const startTime = 0;
    // Save the loader index.
    const loaderIndex = loader.loaderIndex;
    return (compiler, callback) => {
        const promises = [];
        if (instance.loaderOptions.transpileOnly) {
            instance.reportTranspileErrors = true;
        }
        else {
            const times = compiler.fileTimestamps;
            for (const [filePath, date] of times) {
                const lastTime = lastTimes.get(filePath) || startTime;
                if (date <= lastTime) {
                    continue;
                }
                lastTimes.set(filePath, date);
                promises.push(updateFile(instance, filePath, loader, loaderIndex));
            }
            // On watch update add all known dts files expect the ones in node_modules
            // (skip @types/* and modules with typings)
            for (const filePath of instance.files.keys()) {
                if (filePath.match(constants.dtsDtsxOrDtsDtsxMapRegex) !== null &&
                    filePath.match(constants.nodeModules) === null) {
                    promises.push(updateFile(instance, filePath, loader, loaderIndex));
                }
            }
        }
        // Update all the watched files from solution builder
        if (instance.solutionBuilderHost) {
            for (const filePath of instance.solutionBuilderHost.watchedFiles.keys()) {
                promises.push(updateFile(instance, filePath, loader, loaderIndex));
            }
        }
        Promise.all(promises)
            .then(() => callback())
            .catch(err => callback(err));
    };
}
exports.makeWatchRun = makeWatchRun;
function updateFile(instance, filePath, loader, loaderIndex) {
    return new Promise((resolve, reject) => {
        // When other loaders are specified after ts-loader
        // (e.g. `{ test: /\.ts$/, use: ['ts-loader', 'other-loader'] }`),
        // manually apply them to TypeScript files.
        // Otherwise, files not 'preprocessed' by them may cause complication errors (#1111).
        if (loaderIndex + 1 < loader.loaders.length &&
            instance.rootFileNames.has(path.normalize(filePath))) {
            let request = `!!${path.resolve(__dirname, 'stringify-loader.js')}!`;
            for (let i = loaderIndex + 1; i < loader.loaders.length; ++i) {
                request += loader.loaders[i].request + '!';
            }
            request += filePath;
            loader.loadModule(request, (err, source) => {
                if (err) {
                    reject(err);
                }
                else {
                    const text = JSON.parse(source);
                    servicesHost_1.updateFileWithText(instance, filePath, () => text);
                    resolve();
                }
            });
        }
        else {
            servicesHost_1.updateFileWithText(instance, filePath, nFilePath => utils_1.readFile(nFilePath) || '');
            resolve();
        }
    });
}
//# sourceMappingURL=watch-run.js.map