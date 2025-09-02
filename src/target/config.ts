import { getTargetScriptEl } from './util';
import endWith from 'licia/endWith';
import safeStorage from 'licia/safeStorage';
import randomId from 'licia/randomId';
import rtrim from 'licia/rtrim';
import startWith from 'licia/startWith';

let serverUrl = location.origin;

if ((window as any).ChiiServerUrl) {
  serverUrl = (window as any).ChiiServerUrl;
} else {
  const element = getTargetScriptEl();
  if (element) {
    serverUrl = element.src.replace('target.js', '');
  }
}

if (!endWith(serverUrl, '/')) {
  serverUrl += '/';
}

if (!startWith(serverUrl, 'http')) {
  const protocol = location.protocol === 'https:' ? 'https:' : 'http:';
  if (!startWith(serverUrl, '//')) {
    serverUrl = `//${serverUrl}`;
  }
  serverUrl = `${protocol}${serverUrl}`;
}

let embedded = false;
let rtc = false;
let cdn = '';
let secret = '';

const element = getTargetScriptEl();
if (element) {
  if (element.getAttribute('embedded') === 'true') {
    embedded = true;
  }
  if (element.getAttribute('rtc') === 'true') {
    rtc = true;
  }
  cdn = element.getAttribute('cdn') || '';
  secret = element.getAttribute('secret') || '';
}

if (cdn && endWith(cdn, '/')) {
  cdn = rtrim(cdn, '/');
}

const sessionStore = safeStorage('session');

let id = sessionStore.getItem('chii-id');
if (!id) {
  id = randomId(32);
  sessionStore.setItem('chii-id', id);
}

export {
  // https://chii.liriliri.io/base/
  serverUrl,
  embedded,
  rtc,
  cdn,
  id,
  secret
};
