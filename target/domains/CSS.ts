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
  const { nodeId } = params;
  const node = getNode(nodeId);
  const { style } = node;
  let inlineStyle: any = {
    shorthandEntries: [],
    cssProperties: [],
  };

  if (style) {
    const styleSheetId = stylesheet.getOrCreateInlineStyleSheetId(nodeId);
    inlineStyle.styleSheetId = styleSheetId;
    const cssText = node.getAttribute('style') || '';
    inlineStyle.cssText = cssText;
    inlineStyle.range = {
      startLine: 0,
      startColumn: 0,
      endLine: getLineCount(cssText) - 1,
      endColumn: inlineStyle.cssText.length,
    };
    const shorthandEntries = getShorthandEntries(style);
    let cssProperties = toCssProperties(stylesheet.formatStyle(style));
    each(shorthandEntries, shorthandEntry => cssProperties.push(shorthandEntry));
    cssProperties = map(cssProperties, ({ name, value }: { name: string; value: string }) => {
      let ret: any = {
        name,
        value,
      };
      const range = getInlineStyleRange(name, value, cssText);
      if (range) {
        ret = {
          ...ret,
          ...range,
          disabled: false,
          implicit: false,
        };
      }
      return ret;
    });
    inlineStyle.shorthandEntries = shorthandEntries;
    inlineStyle.cssProperties = cssProperties;
  }

  return {
    inlineStyle,
  };
}

export function getMatchedStylesForNode(params: any) {
  const matchedCSSRules = stylesheet.getMatchedCssRules(getNode(params.nodeId));

  return {
    matchedCSSRules: map(matchedCSSRules, formatMatchedCssRule),
    ...getInlineStylesForNode(params),
  };
}

export function getBackgroundColors(params: any) {
  const node = getNode(params.nodeId);

  const computedStyle: any = stylesheet.formatStyle(window.getComputedStyle(node));

  return {
    backgroundColors: [computedStyle['background-color']],
    computedFontSize: computedStyle['font-size'],
    computedFontWeight: computedStyle['font-weight'],
  };
}

export function setStyleTexts(params: any) {
  const { edits } = params;
  const styles = map(edits, (edit: any) => {
    const { styleSheetId, text, range } = edit;
    const nodeId = stylesheet.getInlineStyleNodeId(styleSheetId);
    // Only allow to edit inline style
    if (nodeId) {
      const node = getNode(nodeId);
      let cssText = node.getAttribute('style') || '';
      const { startColumn, endColumn } = range;
      cssText = cssText.slice(0, startColumn) + text + cssText.slice(endColumn);

      node.setAttribute('style', cssText);
      return getInlineStylesForNode({ nodeId }).inlineStyle;
    }

    return { styleSheetId };
  });

  return {
    styles,
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

function getLineCount(str: string) {
  return str.split('\n').length;
}

const shortHandNames = ['background', 'font', 'border', 'margin', 'padding'];

function getShorthandEntries(style: CSSStyleDeclaration) {
  const ret: any[] = [];

  each(shortHandNames, name => {
    const value = (style as any)[name];
    if (value) {
      ret.push({
        name,
        value,
      });
    }
  });

  return ret;
}

function getInlineStyleRange(name: string, value: string, cssText: string) {
  const lines = cssText.split('\n');
  let startLine = 0;
  let endLine = 0;
  let startColumn = 0;
  let endColumn = 0;
  let text = '';

  const reg = new RegExp(`${name}:\\s*${value};?`);
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i];
    const match = line.match(reg);
    if (match) {
      text = match[0];
      startLine = i;
      startColumn = match.index || 0;
      endLine = i;
      endColumn = startColumn + text.length;
      return {
        range: {
          startLine,
          endLine,
          startColumn,
          endColumn,
        },
        text,
      };
    }
  }
}
