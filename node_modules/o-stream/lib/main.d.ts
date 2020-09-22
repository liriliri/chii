/// <reference types="node" />
import { Output } from "./Output";
import { TransformArgs } from "./TransformArgs";
import { ObjectTransform } from "./ObjectTransform";
import { Writable, Readable, Transform } from "stream";
export * from "./EnteredArgs";
export * from "./EndedArgs";
export { Output, TransformArgs, ObjectTransform, Writable, Readable, Transform };
export default class Default {
    static transform<TIn, TOut>(args: TransformArgs<TIn, TOut>): Transform;
    static combineStreams(...streams: NodeJS.ReadWriteStream[]): NodeJS.ReadWriteStream;
    static combineStreamsList(streams: NodeJS.ReadWriteStream[]): NodeJS.ReadWriteStream;
    static fromArray<T>(array: T[]): Readable;
}
