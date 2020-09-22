"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const chai_1 = require("chai");
function default_1(suite) {
    suite.describe("transform", suite => {
        suite.describe("Error handling", suite => {
            suite.describe("When an error is thrown from a source stream", suite => {
                suite.test("When default error handling, then the error is propagated.", t => {
                    let stream1 = main_1.default.transform({});
                    let stream2 = main_1.default.transform({});
                    stream1.pipe(stream2);
                    let expectedError = "a";
                    let actualError;
                    stream2.on("error", e => actualError = e);
                    stream1.emit("error", expectedError);
                    chai_1.expect(actualError).to.equal(expectedError);
                });
                suite.test("When has custom error handler, then handler is invoked.", t => {
                    let expectedError = "ab";
                    let actualError;
                    let stream1 = main_1.default.transform({});
                    let stream2 = main_1.default.transform({
                        onSourceStreamError: args => args.emitError(args.error + "b")
                    });
                    stream1.pipe(stream2);
                    stream2.on("error", e => actualError = e);
                    stream1.emit("error", "a");
                    chai_1.expect(actualError).to.equal(expectedError);
                });
            });
        });
        suite.test("When writing a number, it enters as the data.", t => {
            let actual = 0;
            let stream = main_1.default.transform({
                onEntered: (args) => {
                    actual = args.object;
                }
            });
            stream.write(4);
            stream.end();
            chai_1.expect(actual).to.equal(4);
        });
        suite.test("When writing a number, and transforming it, then output the transformed data.", t => {
            let increamentStream = main_1.default.transform({
                onEntered: (args) => {
                    args.output.push(args.object + 1);
                }
            });
            let num = 4;
            let expected = num + 1;
            increamentStream.write(num);
            let actual = increamentStream.read();
            chai_1.expect(actual).to.equal(expected);
        });
        suite.test("When writing data to output on 'ended', then data can be consumed.", t => {
            let sum = 0;
            let sumStream = main_1.default.transform({
                onEntered: (args) => {
                    sum += args.object;
                },
                onEnded: (args) => {
                    args.output.push(sum);
                }
            });
            let num1 = 4;
            let num2 = 6;
            let num3 = -1;
            let expected = num1 + num2 + num3;
            sumStream.write(num1);
            sumStream.write(num2);
            sumStream.write(num3);
            sumStream.end();
            let actual = sumStream.read();
            chai_1.expect(actual).to.equal(expected);
        });
        suite.test("When onEnterAsync and onEndedAsync, then working.", t => {
            let sum = 0;
            let sumStream = main_1.default.transform({
                onEnteredAsync: (args) => {
                    sum += args.object;
                    args.done();
                },
                onEndedAsync: (args) => {
                    args.output.push(sum);
                    args.done();
                }
            });
            let num1 = 4;
            let num2 = 6;
            let num3 = -1;
            let expected = num1 + num2 + num3;
            sumStream.write(num1);
            sumStream.write(num2);
            sumStream.write(num3);
            sumStream.end();
            let actual = sumStream.read();
            chai_1.expect(actual).to.equal(expected);
        });
        suite.test("When piping, data is transfered.", (t) => __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => {
                let arr = [1, 9, 7];
                let i = 0;
                let stream = main_1.default.fromArray(arr)
                    .pipe(main_1.default.transform({
                    onEntered: (args) => {
                        args.output.push(args.object + 1);
                    }
                }))
                    .pipe(main_1.default.transform({
                    onEntered: (args) => {
                        chai_1.expect(args.object).to.equal(arr[i++] + 1);
                    },
                    onEnded: (args) => {
                        chai_1.expect(i).to.equal(arr.length);
                        resolve();
                    }
                }));
            });
        }));
    });
    suite.describe("fromArray", suite => {
        suite.test("Numbers array.", t => {
            let arr = [1, 9, 7];
            let stream = main_1.default.fromArray(arr);
            chai_1.expect(stream.read()).to.equal(arr[0]);
            chai_1.expect(stream.read()).to.equal(arr[1]);
            chai_1.expect(stream.read()).to.equal(arr[2]);
            chai_1.expect(stream.read()).to.equal(null);
        });
    });
}
exports.default = default_1;
