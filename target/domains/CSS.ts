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
    inlineStyle.cssText = node.getAttribute('style') || '';
    inlineStyle.range = {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: inlineStyle.cssText.length,
    };
    inlineStyle.cssProperties = map(
      toCssProperties(stylesheet.formatStyle(style)),
      ({ name, value }: { name: string; value: string }) => {
        const ret: any = {
          name,
          value,
          disabled: false,
          implicit: false,
        };
        const reg = new RegExp(`${name}:\\s*${value};?`);
        const match = inlineStyle.cssText.match(reg);
        if (match) {
          ret.text = match[0];
          ret.range = {
            startLine: 0,
            startColumn: match.index,
            endLine: 0,
            endColumn: match.index + ret.text.length,
          };
        }

        return ret;
      }
    );
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
