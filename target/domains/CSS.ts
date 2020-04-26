import { getNode } from '../lib/stringifyNode';

export function getComputedStyleForNode(params: any) {
  const node = getNode(params.nodeId);

  const computedStyle: any = window.getComputedStyle(node);

  const ret: any = [];

  for (let i = 0, len = computedStyle.length; i < len; i++) {
    const name = computedStyle[i];

    ret.push({
      name,
      value: computedStyle[name],
    });
  }

  return {
    computedStyle: ret,
  };
}
