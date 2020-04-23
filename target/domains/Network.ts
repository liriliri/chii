import trim from 'licia/trim';
import each from 'licia/each';
import decodeUriComponent from 'licia/decodeUriComponent';
import rmCookie from 'licia/rmCookie';

export async function deleteCookies(params: any) {
  rmCookie(params.name);
}

export async function getCookies() {
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
