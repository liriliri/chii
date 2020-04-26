import connector from '../lib/connector';
import each from 'licia/each';
import map from 'licia/map';
import now from 'licia/now';
import * as stringifyObj from '../lib/stringifyObj';
import evaluateJs, { setGlobal } from '../lib/evaluate';

const executionContext = {
  id: 1,
  name: 'top',
  origin: location.origin,
};

export function enable() {
  connector.trigger('Runtime.executionContextCreated', {
    context: executionContext,
  });
}

export function getProperties(params: any) {
  return stringifyObj.getProperties(params);
}

export function discardConsoleEntries() {
  stringifyObj.clear();
}

export function evaluate(params: any) {
  const result = evaluateJs(params.expression);
  setGlobal('$_', result);

  return {
    result: stringifyObj.wrap(result),
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

    connector.trigger('Runtime.consoleAPICalled', {
      type,
      args,
      stackTrace: { callFrames: [] },
      executionContextId: executionContext.id,
      timestamp: now(),
    });
  };
});
