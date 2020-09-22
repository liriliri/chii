import { EnteredArgs, EnteredAsyncArgs } from "./EnteredArgs";
import { EndedArgs, EndedAsyncArgs } from "./EndedArgs";
import { SourceStreamErrorArgs } from "./SourceStreamErrorArgs";
export interface TransformArgs<TIn, TOut> {
    onEntered?: (args: EnteredArgs<TIn, TOut>) => void;
    onEnteredAsync?: (args: EnteredAsyncArgs<TIn, TOut>) => void;
    onEnded?: (args: EndedArgs<TOut>) => void;
    onEndedAsync?: (args: EndedAsyncArgs<TOut>) => void;
    onSourceStreamError?: (args: SourceStreamErrorArgs) => void;
}
