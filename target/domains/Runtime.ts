import connector from '../lib/connector';
import each from 'licia/each';
import map from 'licia/map';
import now from 'licia/now';
import isStr from 'licia/isStr';
import fnParams from 'licia/fnParams';
import uncaught from 'licia/uncaught';
import startWith from 'licia/startWith';
import stackTrace from 'licia/stackTrace';
import trim from 'licia/trim';
import * as stringifyObj from '../lib/stringifyObj';
import evaluateJs, { setGlobal } from '../lib/evaluate';

const executionContext = {
  id: 1,
  name: 'top',
  origin: location.origin,
};

export async function callFunctionOn(params: any) {
  const { functionDeclaration, objectId } = params;
  let args = params.arguments || [];

  args = map(args, (arg: any) => {
    const { objectId, value } = arg;
    if (objectId) {
      const obj = stringifyObj.getObj(objectId);
      if (obj) return obj;
    }

    return value;
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
  uncaught.start();
  connector.trigger('Runtime.executionContextCreated', {
    context: executionContext,
  });
}

export function getProperties(params: any) {
  return stringifyObj.getProperties(params);
}

export function evaluate(params: any) {
  const ret: any = {};

  let result: any;
  try {
    result = evaluateJs(params.expression);
    setGlobal('$_', result);
    ret.result = stringifyObj.wrap(result);
  } catch (e) {
    ret.exceptionDetails = {
      exception: stringifyObj.wrap(e),
      text: 'Uncaught',
    };
    ret.result = stringifyObj.wrap(e, {
      generatePreview: true,
    });
  }

  return ret;
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
  dir: 'dir',
  table: 'table',
  group: 'startGroup',
  groupCollapsed: 'startGroupCollapsed',
  groupEnd: 'endGroup',
  debug: 'debug',
  clear: 'clear',
};

each(methods, (type, name) => {
  const origin = console[name].bind(console);
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
      stackTrace: { callFrames: type === 'error' || type === 'warning' ? getCallFrames() : [] },
      executionContextId: executionContext.id,
      timestamp: now(),
    });
  };
});

const Function = window.Function;
/* tslint:disable-next-line */
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

uncaught.addListener(err => {
  connector.trigger('Runtime.exceptionThrown', {
    exceptionDetails: {
      exception: stringifyObj.wrap(err),
      stackTrace: { callFrames: getCallFrames(err) },
      text: 'Uncaught',
    },
    timestamp: now,
  });
});

function getCallFrames(error?: Error) {
  let callFrames: any[] = [];
  const callSites: any = error ? error.stack : stackTrace();
  if (isStr(callSites)) {
    callFrames = callSites.split('\n');
    if (!error) {
      callFrames.shift();
    }
    callFrames.shift();
    callFrames = map(callFrames, val => ({ functionName: trim(val) }));
  } else {
    callSites.shift();
    callFrames = map(callSites, (callSite: any) => {
      return {
        functionName: callSite.getFunctionName(),
        lineNumber: callSite.getLineNumber(),
        columnNumber: callSite.getColumnNumber(),
        url: callSite.getFileName(),
      };
    });
  }
  return callFrames;
}
