import contain from 'licia/contain';
import $ from 'licia/$';

export function getTargetScriptEl() {
  const elements = document.getElementsByTagName('script');
  let i = 0;
  while (i < elements.length) {
    const element = elements[i];
    if (-1 !== element.src.indexOf('/target.js')) {
      return element;
    }
    i++;
  }
}

export function getFavicon() {
  let favicon = location.origin + '/favicon.ico';

  const $link = $('link');
  /* eslint-disable-next-line */
  $link.each(function (this: HTMLElement) {
    if (contain(this.getAttribute('rel') || '', 'icon')) {
      const href = this.getAttribute('href');
      if (href) favicon = fullUrl(href);
    }
  });

  return favicon;
}

const link = document.createElement('a');

export function getOrigin(url: string) {
  link.href = url;
  return link.protocol + '//' + link.host;
}

export function fullUrl(href: string) {
  link.href = href;
  return link.protocol + '//' + link.host + link.pathname + link.search + link.hash;
}

export const storage = {
  getItem(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, val: string) {
    try {
      window.localStorage.setItem(key, val);
    } catch {
      // Ignore storage failures so embedded DevTools keeps working in Safari private mode.
    }
  },
};

export function getClientViewportHeight() {
  return Math.round(window.visualViewport?.height || window.innerHeight);
}

export function getEventClientY(e: any) {
  const event = e.origEvent || e;
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  return touch ? touch.clientY : event.clientY;
}
