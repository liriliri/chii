import isStr from 'licia/isStr';
import copy from 'licia/copy';
import toArr from 'licia/toArr';
import keys from 'licia/keys';
import xpath from 'licia/xpath';
import each from 'licia/each';

const global: any = {
  copy(value: any) {
    if (!isStr(value)) value = JSON.stringify(value, null, 2);
    copy(value);
  },
  $(selector: string) {
    return document.querySelector(selector);
  },
  $$(selector: string) {
    return toArr(document.querySelectorAll(selector));
  },
  $x(path: string) {
    return xpath(path);
  },
  keys,
};

declare const window: any;

function injectGlobal() {
  each(global, (val, name) => {
    if (window[name]) return;

    window[name] = val;
  });
}

function clearGlobal() {
  each(global, (val, name) => {
    if (window[name] && window[name] === val) {
      delete window[name];
    }
  });
}

export function setGlobal(name: string, val: any) {
  global[name] = val;
}

export default function evaluate(expression: string) {
  let ret;

  injectGlobal();
  try {
    ret = eval.call(window, `(${expression})`);
  } catch (e) {
    ret = eval.call(window, expression);
  }
  clearGlobal();

  return ret;
}
