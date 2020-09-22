"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EnteredArgs_1 = require("./EnteredArgs");
const EndedArgs_1 = require("./EndedArgs");
const stream_1 = require("stream");
class ObjectTransform extends stream_1.Transform {
    constructor(args) {
        super({ objectMode: true });
        args = args || {};
        this.initEnteredAsync(args);
        this.initEndedAsync(args);
        this.initOnSourceStreamError(args);
    }
    _transform(chunk, encoding, callback) {
        this.enteredAsync(new EnteredArgs_1.EnteredAsyncArgs(chunk, this, callback));
    }
    _flush(callback) {
        this.endedAsync(new EndedArgs_1.EndedAsyncArgs(this, callback));
    }
    initOnSourceStreamError(args) {
        this.onSourceStreamError = args.onSourceStreamError ||
            ((e) => { e.emitError(e.error); });
        let errorListener = (error) => {
            let args = {
                error: error,
                emitError: (error) => { this.emit("error", error); }
            };
            try {
                this.onSourceStreamError(args);
            }
            catch (error) {
                this.emit("error", error);
            }
        };
        this.on("pipe", src => {
            src.on("error", errorListener);
        });
        this.on("unpipe", src => {
            src.removeListener("error", errorListener);
        });
    }
    initEnteredAsync(params) {
        if (params.onEntered && params.onEnteredAsync) {
            throw new Error("only one of the 'entered' methods can be asigned.");
        }
        this.enteredAsync = params.onEnteredAsync ? params.onEnteredAsync : null ||
            params.onEntered ? this.getOnEnteredAsAsync(params.onEntered) : null ||
            this.passThroughAsync;
    }
    initEndedAsync(params) {
        if (params.onEnded && params.onEndedAsync) {
            throw new Error("only one of the 'all processed' methods can be asigned.");
        }
        if (params.onEnded) {
            this.endedAsync = this.getOnEndedAsAsync(params.onEnded);
        }
        else {
            this.endedAsync = params.onEndedAsync || this.finishAsync;
        }
    }
    getOnEnteredAsAsync(onEntered) {
        return (args) => {
            try {
                onEntered(args);
                args.done();
            }
            catch (error) {
                args.failed(error);
            }
        };
    }
    getOnEndedAsAsync(onEnded) {
        return (args) => {
            try {
                onEnded(args);
                args.done();
            }
            catch (error) {
                args.failed(error);
            }
        };
    }
    passThroughAsync(args) {
        args.output.push(args.object);
        args.done();
    }
    finishAsync(args) {
        args.done();
    }
}
exports.ObjectTransform = ObjectTransform;
