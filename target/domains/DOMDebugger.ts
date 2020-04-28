import safeGet from 'licia/safeGet';
import isEl from 'licia/isEl';
import isFn from 'licia/isFn';
import isBool from 'licia/isBool';
import keys from 'licia/keys';
import each from 'licia/each';
import * as stringifyObj from '../lib/stringifyObj';
import * as scripts from '../lib/scripts';

export function getEventListeners(params: any) {
  const obj = stringifyObj.getObj(params.objectId);

  const events = obj.chiiEvents || [];
  const listeners: any[] = [];

  const script = scripts.get();

  each(events, (events: any[], type) => {
    each(events, event => {
      listeners.push({
        type,
        useCapture: event.useCapture,
        handler: stringifyObj.wrap(event.listener),
        passive: false,
        once: false,
        scriptId: script.scriptId,
        columnNumber: 0,
        lineNumber: 0,
      });
    });
  });

  return {
    listeners,
  };
}

const getWinEventProto = () => {
  return safeGet(window, 'EventTarget.prototype') || window.Node.prototype;
};

const winEventProto = getWinEventProto();

const origAddEvent = winEventProto.addEventListener;
const origRmEvent = winEventProto.removeEventListener;

winEventProto.addEventListener = function (type: string, listener: any, useCapture: boolean) {
  addEvent(this, type, listener, useCapture);
  origAddEvent.apply(this, arguments);
};

winEventProto.removeEventListener = function (type: string, listener: any, useCapture: boolean) {
  rmEvent(this, type, listener, useCapture);
  origRmEvent.apply(this, arguments);
};

function addEvent(el: any, type: string, listener: any, useCapture = false) {
  if (!isEl(el) || !isFn(listener) || !isBool(useCapture)) return;

  const events = (el.chiiEvents = el.chiiEvents || {});

  events[type] = events[type] || [];
  events[type].push({
    listener: listener,
    useCapture: useCapture,
  });
}

function rmEvent(el: any, type: string, listener: any, useCapture = false) {
  if (!isEl(el) || !isFn(listener) || !isBool(useCapture)) return;

  const events = el.chiiEvents;

  if (!(events && events[type])) return;

  const listeners = events[type];

  for (let i = 0, len = listeners.length; i < len; i++) {
    if (listeners[i].listener === listener) {
      listeners.splice(i, 1);
      break;
    }
  }

  if (listeners.length === 0) delete events[type];
  if (keys(events).length === 0) delete el.chiiEvents;
}
