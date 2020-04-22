import toStr from 'licia/toStr';
import isNull from 'licia/isNull';
import isArr from 'licia/isArr';
import isFn from 'licia/isFn';
import isRegExp from 'licia/isRegExp';
import getType from 'licia/type';
import getKeys from 'licia/keys';
import toSrc from 'licia/toSrc';
import allKeys from 'licia/allKeys';
import isNative from 'licia/isNative';
import getProto from 'licia/getProto';
import has from 'licia/has';
import isSymbol from 'licia/isSymbol';

const objects = new Map();
const objectIds = new Map();
let id = 0;

function createObjId(obj: any) {
  let objId = objectIds.get(obj);
  if (objId) return objId;

  objId = JSON.stringify({
    injectedScriptId: 0,
    id: id++,
  });
  objectIds.set(obj, objId);
  objects.set(objId, obj);

  return objId;
}

export function wrap(value: any, { generatePreview = false } = {}): any {
  let ret = basic(value);
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
    ret.objectId = createObjId(value);
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
    (ret.className = 'RegExp'), (ret.description = toStr(value));
  } else {
    ret.className = getType(value, false);
    ret.description = ret.className;
  }

  if (generatePreview) {
    ret.preview = {
      ...ret,
      ...preview(value),
    };
  }

  ret.objectId = createObjId(value);

  return ret;
}

export function getProperties(params: any) {
  const { accessorPropertiesOnly, objectId, ownProperties } = params;
  const properties = [];

  const options = {
    prototype: !ownProperties,
    unenumerable: true,
    symbol: !accessorPropertiesOnly,
  };

  const obj = objects.get(objectId);
  const keys = allKeys(obj, options);
  const proto = getProto(obj);
  for (let i = 0, len = keys.length; i < len; i++) {
    const name = keys[i];
    let propVal;
    try {
      propVal = obj[name];
    } catch (e) {}

    const property: any = {
      name: toStr(name),
      isOwn: has(obj, name),
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

    if (isSymbol(name)) {
      property.symbol = wrap(name);
      property.value = { type: 'undefined' };
    } else {
      property.value = wrap(propVal);
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
      isOwn: true,
      // value: wrap(proto),
      writable: false,
    });
  }

  return {
    result: properties,
  };
}

const MAX_PREVIEW_LEN = 5;

function preview(obj: any) {
  let overflow = false;
  let properties = [];

  const keys = getKeys(obj);
  let len = keys.length;
  if (len > MAX_PREVIEW_LEN) {
    len = MAX_PREVIEW_LEN;
    overflow = true;
  }

  for (let i = 0; i < len; i++) {
    const name = keys[i];
    const propVal = obj[name];
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
  }

  if (isArr(value)) {
    ret.subtype = 'array';
  }

  if (isRegExp(value)) {
    ret.subtype = 'regexp';
  }

  return ret;
}
