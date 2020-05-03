import trim from 'licia/trim';
import each from 'licia/each';
import decodeUriComponent from 'licia/decodeUriComponent';
import rmCookie from 'licia/rmCookie';
import once from 'licia/once';
import { XhrRequest } from '../lib/request';
import connector from '../lib/connector';

export function deleteCookies(params: any) {
  rmCookie(params.name);
}

export function getCookies() {
  const cookies: any[] = [];

  const cookie = document.cookie;
  if (trim(cookie) !== '') {
    each(cookie.split(';'), function (value: any) {
      value = value.split('=');
      const name = trim(value.shift());
      value = decodeUriComponent(value.join('='));
      cookies.push({
        name,
        value,
      });
    });
  }

  return { cookies };
}

const resTxtMap = new Map();

export const enable = once(function () {
  const winXhrProto = window.XMLHttpRequest.prototype;

  const origSend: any = winXhrProto.send;
  const origOpen: any = winXhrProto.open;
  const origSetRequestHeader: any = winXhrProto.setRequestHeader;

  winXhrProto.open = function (method: string, url: string) {
    const xhr = this;

    const req = ((xhr as any).chiiRequest = new XhrRequest(xhr, method, url));

    req.on('send', (id: string, data: any) => {
      connector.trigger('Network.requestWillBeSent', {
        requestId: id,
        type: 'XHR',
        request: {
          method: data.method,
          url: data.url,
          headers: data.reqHeaders,
        },
        timestamp: data.time / 1000,
      });
    });
    req.on('headersReceived', (id: string, data: any) => {
      connector.trigger('Network.responseReceivedExtraInfo', {
        requestId: id,
        blockedCookies: [],
        headers: data.resHeaders,
      });
    });
    req.on('done', (id: string, data: any) => {
      connector.trigger('Network.responseReceived', {
        requestId: id,
        type: 'XHR',
        response: {
          status: data.status,
        },
        timestamp: data.time / 1000,
      });
      resTxtMap.set(id, data.resTxt);
      connector.trigger('Network.loadingFinished', {
        requestId: id,
        encodedDataLength: data.size,
        timestamp: data.time / 1000,
      });
    });

    xhr.addEventListener('readystatechange', function () {
      switch (xhr.readyState) {
        case 2:
          return req.handleHeadersReceived();
        case 4:
          return req.handleDone();
      }
    });

    origOpen.apply(this, arguments);
  };

  winXhrProto.send = function (data) {
    const req = (this as any).chiiRequest;
    if (req) req.handleSend(data);

    origSend.apply(this, arguments);
  };

  winXhrProto.setRequestHeader = function (key, val) {
    const req = (this as any).chiiRequest;
    if (req) {
      req.handleReqHeadersSet(key, val);
    }

    origSetRequestHeader.apply(this, arguments);
  };
});

export function getResponseBody(params: any) {
  return {
    base64Encoded: false,
    body: resTxtMap.get(params.requestId),
  };
}
