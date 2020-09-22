"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EndedAsyncArgs {
    constructor(output, callback) {
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
exports.EndedAsyncArgs = EndedAsyncArgs;
