"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class CombinedStream extends events_1.EventEmitter {
    constructor(streams) {
        super();
        this.streams = streams;
        if (this.streams.length < 2)
            throw new Error(`At least 2 streams expected. Recieved: ${this.streams.length}`);
        this.first = this.streams[0];
        this.last = this.streams[this.streams.length - 1];
        this.pipeStreams();
        this.propegateFirstAndLastEvents();
    }
    pipeStreams() {
        for (let i = 0; i < this.streams.length - 1; i++) {
            this.streams[i].pipe(this.streams[i + 1]);
        }
    }
    propegateFirstAndLastEvents() {
        if (this.first.writable) {
            this.propegateEvents(this.first, "close", "drain", "error", "finish", "pipe", "unpipe");
        }
        if (this.last.readable) {
            this.propegateEvents(this.first, "close", "data", "end", "error", "readable");
        }
    }
    propegateEvents(emitter, ...events) {
        for (let event of events) {
            emitter.on(event, () => {
                this.emit(event, ...arguments);
            });
        }
    }
    // Readable - start
    get readable() { return this.last.readable; }
    // isTTY?: boolean; // Not in the spec
    read(size) { return this.last.read(size); }
    setEncoding(encoding) { encoding && this.last.setEncoding(encoding); return this; }
    pause() { this.last.pause(); return this; }
    resume() { this.last.resume(); return this; }
    isPaused() { return this.last.isPaused(); }
    pipe(destination, options) {
        return this.last.pipe(destination, options);
    }
    unpipe(destination) {
        this.last.unpipe(destination);
        return this;
    }
    unshift(chunk) { this.last.unshift(chunk); }
    wrap(oldStream) { return this.last.wrap(oldStream); }
    // Readable - end
    // Writable
    get writable() { return this.first.writable; }
    write(str, encodingOrCallback, cb) {
        return this.first.write.apply(this.first, arguments);
    }
    end(str, encodingOrCallback, cb) {
        return this.first.end.apply(this.first, arguments);
    }
}
exports.CombinedStream = CombinedStream;
