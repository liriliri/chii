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
