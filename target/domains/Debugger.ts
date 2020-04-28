import connector from '../lib/connector';
import * as scripts from '../lib/scripts';

export function enable() {
  connector.trigger('Debugger.scriptParsed', scripts.get());
}
