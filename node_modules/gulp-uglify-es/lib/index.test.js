"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const o_stream_1 = require("o-stream");
const index_1 = require("./index");
const sourcemaps = require("gulp-sourcemaps");
const File = require("vinyl");
const FILE_PATH = "bundle.js";
const FILE_MIN_PATH = "bundle.min.js";
const FILE_TEXT = "class MyClass { constructor() { let asdf = 1; console.info(asdf); } }";
const FILE_TEXT_UGLIFIED = "class MyClass{constructor(){console.info(1)}}";
function default_1(suite) {
    suite.test("When recieves a valid file, then uglify it.", (test) => __awaiter(this, void 0, void 0, function* () {
        test.arrange();
        let stream = index_1.default();
        let file = createGulpTextFile(FILE_TEXT);
        test.act();
        stream.write(file);
        let actual = stream.read();
        test.assert();
        chai_1.expect(stream.read()).to.be.null;
        chai_1.expect(actual.contents.toString()).to.equal(FILE_TEXT_UGLIFIED);
    }));
    suite.test("When recieves a file without contents, then pass through.", test => {
        test.arrange();
        let stream = index_1.default();
        let file = new File({ path: FILE_PATH, contents: null });
        test.act();
        stream.write(file);
        let actual = stream.read();
        test.assert();
        chai_1.expect(stream.read()).to.be.null;
        chai_1.expect(actual).to.equal(file);
    });
    suite.describe("When created with source-map", suite => {
        suite.test("Test source maps are created in external file.", test => {
            test.arrange();
            let inStream = o_stream_1.default.transform({});
            let outStream = inStream
                .pipe(sourcemaps.init())
                .pipe(index_1.default())
                .pipe(sourcemaps.write("./maps"));
            let file = createGulpTextFile(FILE_TEXT);
            test.act();
            inStream.write(file);
            let mapFile = outStream.read();
            let actual = outStream.read();
            test.assert();
            const sourceMapString = "\n//# sourceMappingURL=maps/bundle.min.js.map\n";
            chai_1.expect(outStream.read()).to.be.null;
            chai_1.expect(actual.contents.toString()).to.equal(FILE_TEXT_UGLIFIED + sourceMapString);
            let map = JSON.parse(mapFile.contents.toString());
            // console.log(map);
            chai_1.expect(map.sources[0]).to.equal(FILE_MIN_PATH);
            chai_1.expect(map.mappings.length).to.be.greaterThan(0);
            chai_1.expect(map.file).to.equal("../" + FILE_MIN_PATH);
            chai_1.expect(map.sourcesContent[0]).to.equal(FILE_TEXT);
        });
        suite.test("Test source maps are created inline.", test => {
            test.arrange();
            let inStream = o_stream_1.default.transform({});
            let outStream = inStream
                .pipe(sourcemaps.init())
                .pipe(index_1.default())
                .pipe(sourcemaps.write());
            let file = createGulpTextFile(FILE_TEXT);
            test.act();
            inStream.write(file);
            let actual = outStream.read();
            test.assert();
            const sourceMapString = "\n//# sourceMappingURL=data:application/json;charset=utf8;base64";
            chai_1.expect(outStream.read()).to.be.null;
            chai_1.expect(actual.contents.toString().startsWith(FILE_TEXT_UGLIFIED + sourceMapString)).to.true;
        });
    });
}
exports.default = default_1;
function createGulpTextFile(text) {
    return new File({
        path: FILE_MIN_PATH,
        contents: new Buffer(text)
    });
}
