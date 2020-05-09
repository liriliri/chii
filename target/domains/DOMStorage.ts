import safeStorage from 'licia/safeStorage';
import each from 'licia/each';
import isStr from 'licia/isStr';
import once from 'licia/once';
import jsonClone from 'licia/jsonClone';
import connector from '../lib/connector';

const localStore = safeStorage('local');
const sessionStore = safeStorage('session');

export function clear(params: any) {
  const store = getStore(params.storageId);

  store.clear();
}

export function getDOMStorageItems(params: any) {
  const store = getStore(params.storageId);

  const entries: string[][] = [];

  each(jsonClone(store), (val, key) => {
    if (!isStr(val)) return;

    entries.push([key, val]);
  });

  return {
    entries,
  };
}

export function removeDOMStorageItem(params: any) {
  const { key, storageId } = params;

  const store = getStore(storageId);

  store.removeItem(key);
}

export function setDOMStorageItem(params: any) {
  const { key, value, storageId } = params;

  const store = getStore(storageId);

  store.setItem(key, value);
}

export const enable = once(function () {
  each(['local', 'session'], type => {
    const store = type === 'local' ? localStore : sessionStore;
    const storageId = getStorageId(type);

    const originSetItem = store.setItem.bind(store);
    store.setItem = function (key: string, value: string) {
      if (!isStr(key) || !isStr(value)) return;

      const oldValue = store.getItem(key);
      originSetItem(key, value);
      if (oldValue) {
        connector.trigger('DOMStorage.domStorageItemUpdated', {
          key,
          newValue: value,
          oldValue,
          storageId,
        });
      } else {
        connector.trigger('DOMStorage.domStorageItemAdded', {
          key,
          newValue: value,
          storageId,
        });
      }
    };

    const originRemoveItem = store.removeItem.bind(store);
    store.removeItem = function (key: string) {
      if (!isStr(key)) return;
      const oldValue = store.getItem(key);
      if (oldValue) {
        originRemoveItem(key);
        connector.trigger('DOMStorage.domStorageItemRemoved', {
          key,
          storageId,
        });
      }
    };

    const originClear = store.clear.bind(store);
    store.clear = function () {
      originClear();
      connector.trigger('DOMStorage.domStorageItemsCleared', {
        storageId,
      });
    };
  });
});

function getStorageId(type: string) {
  return {
    securityOrigin: location.origin,
    isLocalStorage: type === 'local',
  };
}

function getStore(storageId: any) {
  const { isLocalStorage } = storageId;

  return isLocalStorage ? localStore : sessionStore;
}
