import each from 'licia/each';
import rmCookie from 'licia/rmCookie';
import safeStorage from 'licia/safeStorage';
import { getCookies } from './Network';

const localStore = safeStorage('local');
const sessionStore = safeStorage('session');

export function getUsageAndQuota() {
  return {
    quota: 0,
    usage: 0,
    usageBreakdown: [],
  };
}

export function clearDataForOrigin(params: any) {
  const storageTypes = params.storageTypes.split(',');

  each(storageTypes, type => {
    if (type === 'cookies') {
      const cookies = getCookies().cookies;
      each(cookies, ({ name }) => rmCookie(name));
    } else if (type === 'local_storage') {
      localStore.clear();
      sessionStore.clear();
    }
  });
}
