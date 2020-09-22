"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnteredAsyncArgs {
    constructor(object, output, callback) {
        this.object = object;
        this.output = output;
        this.callback = callback;
    }
    done() {
        this.callback();
    }
    failed(error) {
        this.callback(error);
    }
}
exports.EnteredAsyncArgs = EnteredAsyncArgs;
