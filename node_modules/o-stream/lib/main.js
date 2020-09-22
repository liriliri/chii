"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const ObjectTransform_1 = require("./ObjectTransform");
exports.ObjectTransform = ObjectTransform_1.ObjectTransform;
const stream_1 = require("stream");
exports.Writable = stream_1.Writable;
exports.Readable = stream_1.Readable;
exports.Transform = stream_1.Transform;
const CombinedStream_1 = require("./CombinedStream");
__export(require("./EnteredArgs"));
__export(require("./EndedArgs"));
class Default {
    static transform(args) {
        return new ObjectTransform_1.ObjectTransform(args);
    }
    static combineStreams(...streams) {
        return new CombinedStream_1.CombinedStream(streams);
    }
    static combineStreamsList(streams) {
        return new CombinedStream_1.CombinedStream(streams);
    }
    static fromArray(array) {
        let i = 0;
        let stream = new ReadableObjectsStream(() => {
            if (i == array.length) {
                return null;
            }
            return array[i++];
        });
        return stream;
    }
}
exports.default = Default;
class ReadableObjectsStream extends stream_1.Readable {
    constructor(readObject) {
        super({ objectMode: true });
        this.readObject = readObject;
    }
    _read() {
        let shouldPushMore = true;
        while (shouldPushMore) {
            shouldPushMore = this.push(this.readObject());
        }
    }
}
