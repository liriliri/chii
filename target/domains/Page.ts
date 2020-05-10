import $ from 'licia/$';
import fetch from 'licia/fetch';
import { fullUrl } from '../lib/request';

export async function getAppManifest() {
  const $links = $('link');
  const ret: any = {
    errors: [],
  };

  let url = '';
  $links.each(function (this: Element) {
    const $this = $(this);

    if ($this.attr('rel') === 'manifest') {
      url = fullUrl($this.attr('href'));
    }
  });
  ret.url = url;

  if (url) {
    const res = await fetch(url);
    ret.data = await res.text();
  }

  return ret;
}

export function getResourceTree() {
  return {
    frameTree: {
      frame: {
        id: '',
        mimeType: 'text/html',
        securityOrigin: location.origin,
        url: location.href,
      },
      resources: [],
    },
  };
}
