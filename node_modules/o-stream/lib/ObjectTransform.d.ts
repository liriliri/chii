/// <reference types="node" />
import { TransformArgs } from "./TransformArgs";
import { Transform } from "stream";
export declare class ObjectTransform<TIn, TOut> extends Transform {
    private enteredAsync;
    private endedAsync;
    private onSourceStreamError;
    constructor(args: TransformArgs<TIn, TOut>);
    _transform(chunk: TIn, encoding: string, callback: (error?: any) => void): void;
    _flush(callback: (error?: any) => void): void;
    private initOnSourceStreamError(args);
    private initEnteredAsync(params);
    private initEndedAsync(params);
    private getOnEnteredAsAsync(onEntered);
    private getOnEndedAsAsync(onEnded);
    private passThroughAsync(args);
    private finishAsync(args);
}
