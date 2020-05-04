import connector from '../lib/connector';
import each from 'licia/each';
import map from 'licia/map';
import now from 'licia/now';
import fnParams from 'licia/fnParams';
import startWith from 'licia/startWith';
import isObj from 'licia/isObj';
import * as stringifyObj from '../lib/stringifyObj';
import evaluateJs, { setGlobal } from '../lib/evaluate';

const executionContext = {
  id: 1,
  name: 'top',
  origin: location.origin,
};

export async function callFunctionOn(params: any) {
  const { functionDeclaration, objectId } = params;
  let args = params.arguments;

  args = map(args, (arg: any) => {
    if (isObj(arg) && arg.objectId) {
      const obj = stringifyObj.getObj(arg.objectId);
      if (obj) return obj;
    }

    return arg;
  });

  let ctx = null;
  if (objectId) {
    ctx = stringifyObj.getObj(objectId);
  }

  return {
    result: stringifyObj.wrap(await callFn(functionDeclaration, args, ctx)),
  };
}

export function enable() {
  connector.trigger('Runtime.executionContextCreated', {
    context: executionContext,
  });
}

export function getProperties(params: any) {
  return stringifyObj.getProperties(params);
}

export function evaluate(params: any) {
  const result = evaluateJs(params.expression);
  setGlobal('$_', result);

  return {
    result: stringifyObj.wrap(result),
  };
}

export function releaseObject(params: any) {
  stringifyObj.releaseObj(params.objectId);
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

const Function = window.Function;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function parseFn(fnStr: string) {
  const result = fnParams(fnStr);

  if (fnStr[fnStr.length - 1] !== '}') {
    result.push('return ' + fnStr.slice(fnStr.indexOf('=>') + 2));
  } else {
    result.push(fnStr.slice(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}')));
  }

  return result;
}

async function callFn(functionDeclaration: string, args: any[], ctx: any = null) {
  const fnParams = parseFn(functionDeclaration);
  let fn;

  if (startWith(functionDeclaration, 'async')) {
    fn = AsyncFunction.apply(null, fnParams);
    return await fn.apply(ctx, args);
  }

  fn = Function.apply(null, fnParams);
  return fn.apply(ctx, args);
}
