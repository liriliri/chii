import connector from '../lib/connector';
import each from 'licia/each';
import map from 'licia/map';
import now from 'licia/now';
import * as stringify from '../lib/stringify';

const executionContext = {
  id: 1,
  name: 'top',
  origin: location.origin,
};

export async function enable() {
  connector.send({
    method: 'Runtime.executionContextCreated',
    params: {
      context: executionContext,
    },
  });
}

export async function getProperties(params: any) {
  return stringify.getProperties(params);
}

export async function discardConsoleEntries() {
  stringify.clear();
}

declare const console: any;

each(['log'], name => {
  let origin = console[name].bind(console);
  console[name] = (...args: any[]) => {
    origin(...args);

    args = map(args, arg =>
      stringify.wrap(arg, {
        generatePreview: true,
      })
    );

    connector.send({
      method: 'Runtime.consoleAPICalled',
      params: {
        type: name,
        args,
        stackTrace: { callFrames: [] },
        executionContextId: executionContext.id,
        timestamp: now(),
      },
    });
  };
});
