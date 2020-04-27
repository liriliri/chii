import { getNode } from '../lib/stringifyNode';
import $ from 'licia/$';
import h from 'licia/h';
import toNum from 'licia/toNum';

const transparent: any = { r: 0, g: 0, b: 0, a: 0 };

export function highlightNode(params: any) {
  const { nodeId, highlightConfig } = params;
  let {
    marginColor = transparent,
    paddingColor = transparent,
    contentColor = transparent,
    borderColor = transparent,
  } = highlightConfig;

  const node = getNode(nodeId);

  const { left, width, top, height } = $(node).offset();
  $container.css({ left, top, width, height }).show();

  const computedStyle = window.getComputedStyle(node);
  const getNumStyle = (name: string) => pxToNum(computedStyle.getPropertyValue(name));

  const ml = getNumStyle('margin-left');
  const mr = getNumStyle('margin-right');
  const mt = getNumStyle('margin-top');
  const mb = getNumStyle('margin-bottom');

  const bl = getNumStyle('border-left-width');
  const br = getNumStyle('border-right-width');
  const bt = getNumStyle('border-top-width');
  const bb = getNumStyle('border-bottom-width');

  const pl = getNumStyle('padding-left');
  const pr = getNumStyle('padding-right');
  const pt = getNumStyle('padding-top');
  const pb = getNumStyle('padding-bottom');

  const pw = width - bl - br;
  const ph = height - bt - bb;

  marginColor = toColor(marginColor);
  $margin.css({
    left: -ml,
    top: -mt,
    width: width + ml + mr,
    height: height + mt + mb,
    borderTop: `${mt}px solid ${marginColor}`,
    borderLeft: `${ml}px solid ${marginColor}`,
    borderRight: `${mr}px solid ${marginColor}`,
    borderBottom: `${mb}px solid ${marginColor}`,
  });

  borderColor = toColor(borderColor);
  $border.css({
    left: 0,
    top: 0,
    width,
    height,
    borderTop: `${bt}px solid ${borderColor}`,
    borderLeft: `${bl}px solid ${borderColor}`,
    borderRight: `${br}px solid ${borderColor}`,
    borderBottom: `${bb}px solid ${borderColor}`,
  });

  paddingColor = toColor(paddingColor);
  $padding.css({
    left: bl,
    top: bt,
    width: pw,
    height: ph,
    borderTop: `${pt}px solid ${paddingColor}`,
    borderLeft: `${pl}px solid ${paddingColor}`,
    borderRight: `${pr}px solid ${paddingColor}`,
    borderBottom: `${pb}px solid ${paddingColor}`,
  });

  $content.css({
    left: bl + pl,
    top: bl + pt,
    width: pw - pl - pr,
    height: ph - pt - pb,
    background: toColor(contentColor),
  });
}

export function hideHighlight() {
  $container.hide();
}

let showViewportSizeOnResize = false;
export function setShowViewportSizeOnResize(params: any) {
  showViewportSizeOnResize = params.show;
}

const viewportSize = h('div', {
  style: {
    position: 'fixed',
    right: 0,
    top: 0,
    background: '#fff',
    fontSize: 13,
    opacity: 0.5,
    padding: '4px 6px',
  },
});
const $viewportSize: any = $(viewportSize);

let viewportSizeTimer: any;
window.addEventListener('resize', () => {
  if (!showViewportSizeOnResize) return;

  $viewportSize.text(`${window.innerWidth}px × ${window.innerHeight}px`);
  if (viewportSizeTimer) {
    clearTimeout(viewportSizeTimer);
  } else {
    document.documentElement.appendChild(viewportSize);
  }
  viewportSizeTimer = setTimeout(() => {
    $viewportSize.remove();
    viewportSizeTimer = null;
  }, 1000);
});

const container = h('div', {
  style: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
const $container: any = $(container);
document.documentElement.appendChild(container);

const margin = createEl(100);
const $margin: any = $(margin);

const border = createEl(200);
const $border: any = $(border);

const padding = createEl(300);
const $padding: any = $(padding);

const content = createEl(400);
const $content: any = $(content);

function createEl(zIndex: number) {
  const el = h('div', {
    style: {
      position: 'absolute',
      boxSizing: 'border-box',
      zIndex,
    },
  });
  container.appendChild(el);
  return el;
}

function pxToNum(str: string) {
  return toNum(str.replace('px', ''));
}

function toColor(obj: any) {
  obj.a = obj.a || 0;
  const { r, g, b, a } = obj;
  return `rgba(${r},${g},${b},${a})`;
}
