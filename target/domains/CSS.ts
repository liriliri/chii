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

export function getInlineStylesForNode(params: any) {
  const { style } = getNode(params.nodeId);

  const cssProperties = [];

  if (style) {
    for (let i = 0, len = style.length; i < len; i++) {
      const name = style[i];
      cssProperties.push({
        name,
        value: style[name],
      });
    }
  }

  return {
    inlineStyle: {
      cssProperties,
      shorthandEntries: [],
    },
  };
}

export function getMatchedStylesForNode(params: any) {
  return {
    matchedCSSRules: [],
    ...getInlineStylesForNode(params),
  };
}
