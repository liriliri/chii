import { Output } from "./Output";
export interface EndedArgs<TOut> {
    output: Output<TOut>;
}
export interface EndedAsyncArgs<TOut> extends EndedArgs<TOut> {
    done(): void;
    failed(error: Error): void;
}
export declare class EndedAsyncArgs<TOut> {
    output: Output<TOut>;
    private callback;
    constructor(output: Output<TOut>, callback: (error?: any) => void);
}
