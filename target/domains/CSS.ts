import { getNode } from '../lib/stringifyNode';
import * as stylesheet from '../lib/stylesheet';
import map from 'licia/map';
import each from 'licia/each';
import connector from '../lib/connector';

export function enable() {
  each(stylesheet.getStyleSheets(), (styleSheet: any) => {
    if (styleSheet.styleSheetId) {
      connector.trigger('CSS.styleSheetAdded', {
        header: {
          styleSheetId: styleSheet.styleSheetId,
          sourceURL: '',
          startColumn: 0,
          startLine: 0,
          endColumn: 0,
          endLine: 0,
        },
      });
    }
  });
}

export function getComputedStyleForNode(params: any) {
  const node = getNode(params.nodeId);

  const computedStyle: any = stylesheet.formatStyle(window.getComputedStyle(node));

  return {
    computedStyle: toCssProperties(computedStyle),
  };
}

export function getInlineStylesForNode(params: any) {
  const { style } = getNode(params.nodeId);

  let cssProperties: any[] = [];

  if (style) {
    cssProperties = toCssProperties(stylesheet.formatStyle(style));
  }

  return {
    inlineStyle: {
      cssProperties,
      shorthandEntries: [],
    },
  };
}

export function getMatchedStylesForNode(params: any) {
  const matchedCSSRules = stylesheet.getMatchedCssRules(getNode(params.nodeId));

  return {
    matchedCSSRules: map(matchedCSSRules, formatMatchedCssRule),
    ...getInlineStylesForNode(params),
  };
}

function formatMatchedCssRule(matchedCssRule: any) {
  const rule: any = {
    styleSheetId: matchedCssRule.styleSheetId,
    selectorList: {
      selectors: [{ text: matchedCssRule.selectorText }],
      text: matchedCssRule.selectorText,
    },
    style: {
      cssProperties: toCssProperties(matchedCssRule.style),
      shorthandEntries: [],
    },
  };

  return {
    matchingSelectors: [0],
    rule,
  };
}

stylesheet.onStyleSheetAdded((styleSheet: any) => {
  connector.trigger('CSS.styleSheetAdded', {
    header: {
      styleSheetId: styleSheet.styleSheetId,
      sourceURL: '',
      startColumn: 0,
      startLine: 0,
      endColumn: 0,
      endLine: 0,
    },
  });
});

function toCssProperties(style: any) {
  const cssProperties: any[] = [];

  each(style, (value: string, name: string) => {
    cssProperties.push({
      name,
      value,
    });
  });

  return cssProperties;
}
