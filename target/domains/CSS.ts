import { getNode, getNodeId } from '../lib/stringifyNode';
import * as stylesheet from '../lib/stylesheet';
import map from 'licia/map';
import last from 'licia/last';
import each from 'licia/each';
import trim from 'licia/trim';
import startWith from 'licia/startWith';
import concat from 'licia/concat';
import connector from '../lib/connector';
import mutationObserver from '../lib/mutationObserver';

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
  const inlineStyle: any = {
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
      endColumn: last(cssText.split('\n')).length,
    };
    let cssPropertiesWithRange = toCssProperties(parseCssText(cssText));
    cssPropertiesWithRange = map(cssPropertiesWithRange, ({ name, value }) => {
      const { text, range } = getInlineStyleRange(name, value, cssText);

      const ret: any = {
        name,
        value,
        text,
        range,
      };

      if (startWith(text, '/*')) {
        ret.disabled = true;
      } else {
        ret.disabled = false;
        ret.implicit = false;
        ret.parsedOk = style[name] !== '';
      }

      return ret;
    });
    const parsedStyle = stylesheet.formatStyle(style);
    each(cssPropertiesWithRange, ({ name }) => delete parsedStyle[name]);
    const cssPropertiesWithoutRange = toCssProperties(parsedStyle);

    inlineStyle.shorthandEntries = getShorthandEntries(style);
    inlineStyle.cssProperties = concat(cssPropertiesWithRange, cssPropertiesWithoutRange);
  }

  return {
    inlineStyle,
  };
}

export function getMatchedStylesForNode(params: any) {
  const node = getNode(params.nodeId);
  const matchedCSSRules = stylesheet.getMatchedCssRules(node);

  return {
    matchedCSSRules: map(matchedCSSRules, matchedCSSRule => formatMatchedCssRule(node, matchedCSSRule)),
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

export function getStyleSheetText(params: any) {
  const nodeId = stylesheet.getInlineStyleNodeId(params.styleSheetId);
  let text = '';
  if (nodeId) {
    const node = getNode(nodeId);
    text = node.getAttribute('style') || '';
  }

  return {
    text,
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
      const { start, end } = getPosFromRange(range, cssText);
      cssText = cssText.slice(0, start) + text + cssText.slice(end);

      node.setAttribute('style', cssText);
      return getInlineStylesForNode({ nodeId }).inlineStyle;
    }

    return { styleSheetId };
  });

  return {
    styles,
  };
}

function formatMatchedCssRule(node: any, matchedCssRule: any) {
  const { selectorText } = matchedCssRule;
  const selectors = map(selectorText.split(','), trim);

  const shorthandEntries = getShorthandEntries(matchedCssRule.style);
  const style = stylesheet.formatStyle(matchedCssRule.style);

  const rule: any = {
    styleSheetId: matchedCssRule.styleSheetId,
    selectorList: {
      selectors: map(selectors, selector => ({ text: selector })),
      text: selectorText,
    },
    style: {
      cssProperties: toCssProperties(style),
      shorthandEntries,
    },
  };

  const matchingSelectors: number[] = [];
  each(selectors, (selector, idx) => {
    if (stylesheet.matchesSelector(node, selector)) {
      matchingSelectors.push(idx);
    }
  });

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

interface ICSSProperty {
  name: string;
  value: string;
  disabled?: boolean;
  implicit?: boolean;
  parsedOk?: boolean;
  text?: string;
}

function toCssProperties(style: any): ICSSProperty[] {
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

function parseCssText(cssText: string) {
  cssText = cssText.replace(/\/\*/g, '').replace(/\*\//g, '');
  const properties = cssText.split(';');
  const ret: any = {};

  each(properties, property => {
    property = trim(property);
    if (!property) return;
    const colonPos = property.indexOf(':');
    if (colonPos) {
      const name = trim(property.slice(0, colonPos));
      const value = trim(property.slice(colonPos + 1));
      ret[name] = value;
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

  const reg = new RegExp(`(\\/\\*)?\\s*${name}:\\s*${value};?\\s*(\\*\\/)?`);
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i];
    const match = line.match(reg);
    if (match) {
      text = match[0];
      startLine = i;
      startColumn = match.index || 0;
      endLine = i;
      endColumn = startColumn + text.length;
      break;
    }
  }

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

function getPosFromRange(range: any, cssText: string) {
  const { startLine, startColumn, endLine, endColumn } = range;
  let start = 0;
  let end = 0;

  const lines = cssText.split('\n');
  for (let i = 0; i <= endLine; i++) {
    const line = lines[i] + 1;
    const len = line.length;
    if (i < startLine) {
      start += len;
    } else if (i === startLine) {
      start += startColumn;
    }
    if (i < endLine) {
      end += len;
    } else if (i === endLine) {
      end += endColumn;
    }
  }

  return {
    start,
    end,
  };
}

mutationObserver.on('attributes', (target: any, name: string) => {
  const nodeId = getNodeId(target);
  if (!nodeId) return;
  if (name !== 'style') return;

  const styleSheetId = stylesheet.getInlineStyleSheetId(nodeId);
  if (styleSheetId) {
    connector.trigger('CSS.styleSheetChanged', {
      styleSheetId,
    });
  }
});
