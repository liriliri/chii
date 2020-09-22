import { Output } from "./Output";
export interface EnteredArgs<TIn, TOut> {
    object: TIn;
    output: Output<TOut>;
}
export interface EnteredAsyncArgs<TIn, TOut> extends EnteredArgs<TIn, TOut> {
    done(): void;
    failed(error: any): void;
}
export declare class EnteredAsyncArgs<TIn, TOut> implements EnteredAsyncArgs<TIn, TOut> {
    object: TIn;
    output: Output<TOut>;
    private callback;
    constructor(object: TIn, output: Output<TOut>, callback: (error?: any) => void);
}
