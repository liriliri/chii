import Emitter = require('./Emitter');

declare class MediaQuery extends Emitter {
    constructor(query: string);
    isMatch(): boolean;
}

export = MediaQuery;
