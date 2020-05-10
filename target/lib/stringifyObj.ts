import toStr from 'licia/toStr';
import isNull from 'licia/isNull';
import isArr from 'licia/isArr';
import isFn from 'licia/isFn';
import isEl from 'licia/isEl';
import isErr from 'licia/isErr';
import isRegExp from 'licia/isRegExp';
import getType from 'licia/type';
import getKeys from 'licia/keys';
import toSrc from 'licia/toSrc';
import allKeys from 'licia/allKeys';
import isNative from 'licia/isNative';
import getProto from 'licia/getProto';
import isSymbol from 'licia/isSymbol';
import has from 'licia/has';

const objects = new Map();
const objectIds = new Map();
const selfs = new Map();
let id = 1;

function getOrCreateObjId(obj: any, self: any) {
  let objId = objectIds.get(obj);
  if (objId) return objId;

  objId = JSON.stringify({
    injectedScriptId: 0,
    id: id++,
  });
  objectIds.set(obj, objId);
  objects.set(objId, obj);
  selfs.set(objId, self);

  return objId;
}

export function clear() {
  objects.clear();
  objectIds.clear();
  selfs.clear();
}

export function wrap(value: any, { generatePreview = false, self = value } = {}): any {
  const ret = basic(value);
  const { type, subtype } = ret;

  if (type === 'undefined') {
    return ret;
  }

  if (type === 'string' || type === 'boolean' || subtype === 'null') {
    ret.value = value;
    return ret;
  }

  if (type === 'number') {
    ret.description = toStr(value);
    ret.value = value;
    return ret;
  }

  if (type === 'symbol') {
    ret.objectId = getOrCreateObjId(value, self);
    ret.description = toStr(value);
    return ret;
  }

  if (type === 'function') {
    ret.className = 'Function';
    ret.description = toSrc(value);
  } else if (subtype === 'array') {
    ret.className = 'Array';
    ret.description = `Array(${value.length})`;
  } else if (subtype === 'regexp') {
    ret.className = 'RegExp';
    ret.description = toStr(value);
  } else if (subtype === 'error') {
    ret.className = value.name;
    ret.description = value.stack;
  } else {
    ret.className = getType(value, false);
    ret.description = ret.className;
  }

  if (generatePreview) {
    ret.preview = {
      ...ret,
      ...preview(value, self),
    };
  }

  ret.objectId = getOrCreateObjId(value, self);

  return ret;
}

export function getObj(objectId: number) {
  return objects.get(objectId);
}

export function releaseObj(objectId: number) {
  const object = getObj(objectId);
  objectIds.delete(object);
  selfs.delete(objectId);
  objects.delete(objectId);
}

export function getProperties(params: any) {
  const { accessorPropertiesOnly, objectId, ownProperties, generatePreview } = params;
  const properties = [];

  const options = {
    prototype: !ownProperties,
    unenumerable: true,
    symbol: !accessorPropertiesOnly,
  };

  const obj = objects.get(objectId);
  const self = selfs.get(objectId);
  const keys = allKeys(obj, options);
  const proto = getProto(obj);
  for (let i = 0, len = keys.length; i < len; i++) {
    const name = keys[i];
    let propVal;
    try {
      propVal = self[name];
    } catch (e) {
      /* tslint:disable-next-line */
    }

    const property: any = {
      name: toStr(name),
      isOwn: has(self, name),
    };

    let descriptor = Object.getOwnPropertyDescriptor(obj, name);
    if (!descriptor && proto) {
      descriptor = Object.getOwnPropertyDescriptor(proto, name);
    }
    if (descriptor) {
      if (accessorPropertiesOnly) {
        if (!descriptor.get && !descriptor.set) {
          continue;
        }
      }
      property.configurable = descriptor.configurable;
      property.enumerable = descriptor.enumerable;
      property.writable = descriptor.writable;
      if (descriptor.get) {
        property.get = wrap(descriptor.get);
      }
      if (descriptor.set) {
        property.set = wrap(descriptor.set);
      }
    }

    if (proto && has(proto, name) && property.enumerable) {
      property.isOwn = true;
    }

    let accessValue = true;
    if (!property.isOwn && property.get) accessValue = false;
    if (accessValue) {
      if (isSymbol(name)) {
        property.symbol = wrap(name);
        property.value = { type: 'undefined' };
      } else {
        property.value = wrap(propVal, {
          generatePreview,
        });
      }
    }

    if (accessorPropertiesOnly) {
      if (isFn(propVal) && isNative(propVal)) continue;
    }

    properties.push(property);
  }
  if (proto) {
    properties.push({
      name: '__proto__',
      configurable: true,
      enumerable: false,
      isOwn: has(obj, '__proto__'),
      value: wrap(proto, {
        self,
      }),
      writable: false,
    });
  }

  return {
    result: properties,
  };
}

const MAX_PREVIEW_LEN = 5;

function preview(obj: any, self: any) {
  let overflow = false;
  const properties = [];

  const keys = getKeys(obj);
  let len = keys.length;
  if (len > MAX_PREVIEW_LEN) {
    len = MAX_PREVIEW_LEN;
    overflow = true;
  }

  for (let i = 0; i < len; i++) {
    const name = keys[i];
    const propVal = self[name];
    const property: any = basic(propVal);
    property.name = name;
    const { subtype, type } = property;

    let value;
    if (type === 'object') {
      if (subtype === 'null') {
        value = 'null';
      } else if (subtype === 'array') {
        value = `Array(${propVal.length})`;
      } else {
        value = getType(propVal, false);
      }
    } else {
      value = toStr(propVal);
    }

    property.value = value;
    properties.push(property);
  }

  return {
    overflow,
    properties,
  };
}

function basic(value: any) {
  const type = typeof value;
  const ret: any = { type };

  if (isNull(value)) {
    ret.subtype = 'null';
  } else if (isArr(value)) {
    ret.subtype = 'array';
  } else if (isRegExp(value)) {
    ret.subtype = 'regexp';
  } else if (isErr(value)) {
    ret.subtype = 'error';
  } else {
    try {
      // Accessing nodeType may throw exception
      if (isEl(value)) {
        ret.subtype = 'node';
      }
    } catch (e) {
      /* tslint:disable-next-line */
    }
  }

  return ret;
}
