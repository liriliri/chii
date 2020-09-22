"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const o_stream_1 = require("o-stream");
const PluginError = require("plugin-error");
const Uglify = require("terser");
const applySourceMap = require("vinyl-sourcemaps-apply");
const PLUGIN_NAME = "gulp-uglify-es";
function plugin(uglifyOptions) {
    return o_stream_1.default.transform({
        onEntered: (args) => {
            let file = args.object;
            throwIfStream(file);
            if (file.isNull() || !file.contents) {
                args.output.push(file);
                return;
            }
            if (file.sourceMap) {
                uglifyOptions = setUglifySourceMapOptions(uglifyOptions, file);
            }
            let fileMap = {};
            fileMap[file.relative] = file.contents.toString();
            let result = Uglify.minify(fileMap, uglifyOptions);
            if (result.error) {
                throw new PluginError(PLUGIN_NAME, result.error);
            }
            file.contents = new Buffer(result.code);
            if (result.map) {
                applySourceMap(file, JSON.parse(result.map));
            }
            args.output.push(file);
        }
    });
}
exports.default = plugin;
function setUglifySourceMapOptions(uglifyOptions, file) {
    uglifyOptions = uglifyOptions || {};
    uglifyOptions.sourceMap = uglifyOptions.sourceMap || {};
    let sourceMap = uglifyOptions.sourceMap;
    // console.log(file.sourceMap);
    sourceMap.filename = file.sourceMap.file;
    sourceMap.includeSources = true;
    if (sourceMap.url !== undefined && sourceMap.url !== null) {
        sourceMap.url = undefined;
        console.warn("Uglify options.sourceMap.url should not be set. Deleting it.");
    }
    if (file.sourceMap.mappings) {
        sourceMap.content = file.sourceMap;
    }
    return uglifyOptions;
}
function throwIfStream(file) {
    if (file.isStream()) {
        throw new PluginError(PLUGIN_NAME, 'Streams are not supported.');
    }
}
