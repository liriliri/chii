import * as Runtime from './domains/Runtime';
import * as Page from './domains/Page';
import * as DOM from './domains/DOM';
import * as CSS from './domains/CSS';
import * as DOMStorage from './domains/DOMStorage';
import * as Network from './domains/Network';
import * as Overlay from './domains/Overlay';

const methods: any = {
  'DOM.copyTo': DOM.copyTo,
  'DOM.enable': DOM.enable,
  'DOM.getDocument': DOM.getDocument,
  'DOM.getOuterHTML': DOM.getOuterHTML,
  'DOM.moveTo': DOM.moveTo,
  'DOM.removeNode': DOM.removeNode,
  'DOM.requestChildNodes': DOM.requestChildNodes,
  'DOM.setAttributesAsText': DOM.setAttributesAsText,
  'DOM.setOuterHTML': DOM.setOuterHTML,

  'Log.enable': noop,

  'Network.deleteCookies': Network.deleteCookies,
  'Network.enable': noop,
  'Network.getCookies': Network.getCookies,

  'Page.getResourceTree': Page.getResourceTree,

  'Runtime.discardConsoleEntries': Runtime.discardConsoleEntries,
  'Runtime.enable': Runtime.enable,
  'Runtime.evaluate': Runtime.evaluate,
  'Runtime.getProperties': Runtime.getProperties,

  'Page.enable': noop,

  'Profiler.enable': noop,

  'Audits.enable': noop,

  'CSS.enable': noop,
  'CSS.getComputedStyleForNode': CSS.getComputedStyleForNode,

  'DOMStorage.clear': DOMStorage.clear,
  'DOMStorage.enable': DOMStorage.enable,
  'DOMStorage.getDOMStorageItems': DOMStorage.getDOMStorageItems,
  'DOMStorage.removeDOMStorageItem': DOMStorage.removeDOMStorageItem,
  'DOMStorage.setDOMStorageItem': DOMStorage.setDOMStorageItem,

  'Inspector.enable': noop,

  'Overlay.enable': noop,
  'Overlay.hideHighlight': Overlay.hideHighlight,
  'Overlay.highlightNode': Overlay.highlightNode,

  'ServiceWorker.enable': noop,
};

async function noop() {}

export default methods;
