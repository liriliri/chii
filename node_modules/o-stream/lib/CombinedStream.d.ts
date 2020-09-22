/// <reference types="node" />
import { EventEmitter } from "events";
export declare class CombinedStream extends EventEmitter implements NodeJS.ReadWriteStream {
    private streams;
    private first;
    private last;
    constructor(streams: NodeJS.ReadWriteStream[]);
    private pipeStreams();
    private propegateFirstAndLastEvents();
    private propegateEvents(emitter, ...events);
    readonly readable: boolean;
    read(size?: number): string | Buffer;
    setEncoding(encoding: string | null): this;
    pause(): this;
    resume(): this;
    isPaused(): boolean;
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: {
        end?: boolean;
    }): T;
    unpipe<T extends NodeJS.WritableStream>(destination?: T): this;
    unshift(chunk: string | Buffer): void;
    wrap(oldStream: NodeJS.ReadableStream): NodeJS.ReadableStream;
    readonly writable: boolean;
    write(buffer: Buffer | string, cb?: Function): boolean;
    write(str: string, encoding?: string, cb?: Function): boolean;
    end(): void;
    end(buffer: Buffer, cb?: Function): void;
    end(str: string, cb?: Function): void;
    end(str: string, encoding?: string, cb?: Function): void;
}
