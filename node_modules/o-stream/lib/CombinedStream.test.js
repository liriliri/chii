"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombinedStream_1 = require("./CombinedStream");
const main_1 = require("./main");
const chai_1 = require("chai");
function default_1(suite) {
    suite.describe(CombinedStream_1.CombinedStream.name, suite => {
        suite.describe("Ctor", suite => {
            suite.test("Given less than 2 streams, throws.", t => {
                chai_1.expect(() => new CombinedStream_1.CombinedStream([])).to.throw();
            });
        });
        suite.test("Combine few streams.", t => {
            function createAppendStream(append) {
                return main_1.default.transform({
                    onEntered: args => { args.output.push(args.object + append); }
                });
            }
            let combined = new CombinedStream_1.CombinedStream([
                createAppendStream("b"),
                createAppendStream("c"),
                createAppendStream("d"),
                createAppendStream("e")
            ]);
            combined.write("a");
            let actual = combined.read();
            chai_1.expect(actual).to.equal("abcde");
        });
    });
}
exports.default = default_1;
