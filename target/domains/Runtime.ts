import connector from '../lib/connector';
import each from 'licia/each';
import map from 'licia/map';
import now from 'licia/now';
import * as stringifyObj from '../lib/stringifyObj';

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
  return stringifyObj.getProperties(params);
}

export async function discardConsoleEntries() {
  stringifyObj.clear();
}

export async function evaluate(params: any) {
  const { expression } = params;

  let ret;

  try {
    ret = eval.call(window, `(${expression})`);
  } catch (e) {
    ret = eval.call(window, expression);
  }

  return {
    result: stringifyObj.wrap(ret),
  };
}

declare const console: any;

const methods: any = {
  log: 'log',
  warn: 'warning',
  error: 'error',
  info: 'info',
  table: 'table',
  group: 'startGroup',
  groupEnd: 'endGroup',
  clear: 'clear',
};

each(methods, (type, name) => {
  let origin = console[name].bind(console);
  console[name] = (...args: any[]) => {
    origin(...args);

    args = map(args, arg =>
      stringifyObj.wrap(arg, {
        generatePreview: true,
      })
    );

    connector.send({
      method: 'Runtime.consoleAPICalled',
      params: {
        type,
        args,
        stackTrace: { callFrames: [] },
        executionContextId: executionContext.id,
        timestamp: now(),
      },
    });
  };
});
