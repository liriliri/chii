import connector from '../lib/connector';
import each from 'licia/each';
import type from 'licia/type';
import map from 'licia/map';
import toStr from 'licia/toStr';
import now from 'licia/now';

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

declare const console: any;

each(['log'], name => {
  let origin = console[name].bind(console);
  console[name] = (...args: any[]) => {
    args = map(args, arg => ({ type: type(arg), value: toStr(arg) }));

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

    origin(...args);
  };
});
