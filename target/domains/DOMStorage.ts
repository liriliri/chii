import safeStorage from 'licia/safeStorage';
import each from 'licia/each';
import isStr from 'licia/isStr';
import jsonClone from 'licia/jsonClone';
import connector from '../lib/connector';

const localStore = safeStorage('local');
const sessionStore = safeStorage('session');

export async function clear(params: any) {
  const store = getStore(params.storageId);

  store.clear();
}

export async function getDOMStorageItems(params: any) {
  const store = getStore(params.storageId);

  const entries: Array<string[]> = [];

  each(jsonClone(store), (val, key) => {
    if (!isStr(val)) return;

    entries.push([key, val]);
  });

  return {
    entries,
  };
}

export async function removeDOMStorageItem(params: any) {
  const { key, storageId } = params;

  const store = getStore(storageId);

  store.removeItem(key);
}

export async function setDOMStorageItem(params: any) {
  const { key, value, storageId } = params;

  const store = getStore(storageId);

  store.setItem(key, value);
}

function getStore(storageId: any) {
  const { isLocalStorage } = storageId;

  return isLocalStorage ? localStore : sessionStore;
}

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

function getStorageId(type: string) {
  return {
    securityOrigin: location.origin,
    isLocalStorage: type === 'local',
  };
}
