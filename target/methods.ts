import noop from 'licia/noop';
import * as Runtime from './domains/Runtime';
import * as Page from './domains/Page';
import * as DOM from './domains/DOM';
import * as CSS from './domains/CSS';
import * as DOMStorage from './domains/DOMStorage';
import * as Network from './domains/Network';
import * as Overlay from './domains/Overlay';
import * as DOMDebugger from './domains/DOMDebugger';
import * as Debugger from './domains/Debugger';
import * as Storage from './domains/Storage';

const methods: any = {
  'Debugger.enable': Debugger.enable,
  'Debugger.setAsyncCallStackDepth': noop,
  'Debugger.setBlackboxPatterns': noop,
  'Debugger.setPauseOnExceptions': noop,

  'DOM.collectClassNamesFromSubtree': DOM.collectClassNamesFromSubtree,
  'DOM.copyTo': DOM.copyTo,
  'DOM.discardSearchResults': DOM.discardSearchResults,
  'DOM.enable': DOM.enable,
  'DOM.getDocument': DOM.getDocument,
  'DOM.getOuterHTML': DOM.getOuterHTML,
  'DOM.getSearchResults': DOM.getSearchResults,
  'DOM.markUndoableState': noop,
  'DOM.moveTo': DOM.moveTo,
  'DOM.performSearch': DOM.performSearch,
  'DOM.pushNodesByBackendIdsToFrontend': DOM.pushNodesByBackendIdsToFrontend,
  'DOM.removeNode': DOM.removeNode,
  'DOM.requestChildNodes': DOM.requestChildNodes,
  'DOM.requestNode': DOM.requestNode,
  'DOM.resolveNode': DOM.resolveNode,
  'DOM.setAttributesAsText': DOM.setAttributesAsText,
  'DOM.setAttributeValue': DOM.setAttributeValue,
  'DOM.setInspectedNode': DOM.setInspectedNode,
  'DOM.setNodeValue': DOM.setNodeValue,
  'DOM.setOuterHTML': DOM.setOuterHTML,
  'DOM.undo': noop,

  'DOMDebugger.getEventListeners': DOMDebugger.getEventListeners,

  'Emulation.setEmulatedMedia': noop,

  'Log.clear': noop,
  'Log.enable': noop,
  'Log.startViolationsReport': noop,

  'Network.deleteCookies': Network.deleteCookies,
  'Network.enable': Network.enable,
  'Network.getCookies': Network.getCookies,
  'Network.getResponseBody': Network.getResponseBody,

  'Page.getResourceContent': noop,
  'Page.getResourceTree': Page.getResourceTree,

  'Runtime.callFunctionOn': Runtime.callFunctionOn,
  'Runtime.compileScript': noop,
  'Runtime.discardConsoleEntries': noop,
  'Runtime.enable': Runtime.enable,
  'Runtime.evaluate': Runtime.evaluate,
  'Runtime.getHeapUsage': noop,
  'Runtime.getIsolateId': noop,
  'Runtime.getProperties': Runtime.getProperties,
  'Runtime.releaseObject': noop,
  'Runtime.releaseObjectGroup': noop,
  'Runtime.runIfWaitingForDebugger': noop,

  'ApplicationCache.enable': noop,
  'ApplicationCache.getFramesWithManifests': noop,

  'Page.getManifestIcons': noop,
  'Page.bringToFront': noop,
  'Page.enable': noop,
  'Page.getAppManifest': Page.getAppManifest,
  'Page.getInstallabilityErrors': noop,

  'Profiler.enable': noop,

  'Audits.enable': noop,

  'BackgroundService.startObserving': noop,

  'CacheStorage.requestCacheNames': noop,

  'CSS.enable': CSS.enable,
  'CSS.getComputedStyleForNode': CSS.getComputedStyleForNode,
  'CSS.getInlineStylesForNode': CSS.getInlineStylesForNode,
  'CSS.getMatchedStylesForNode': CSS.getMatchedStylesForNode,
  'CSS.getPlatformFontsForNode': noop,
  'CSS.getStyleSheetText': CSS.getStyleSheetText,
  'CSS.getBackgroundColors': CSS.getBackgroundColors,
  'CSS.setStyleTexts': CSS.setStyleTexts,

  'Database.enable': noop,

  'DOMStorage.clear': DOMStorage.clear,
  'DOMStorage.enable': DOMStorage.enable,
  'DOMStorage.getDOMStorageItems': DOMStorage.getDOMStorageItems,
  'DOMStorage.removeDOMStorageItem': DOMStorage.removeDOMStorageItem,
  'DOMStorage.setDOMStorageItem': DOMStorage.setDOMStorageItem,

  'HeapProfiler.enable': noop,

  'IndexedDB.enable': noop,

  'Inspector.enable': noop,
  'IndexedDB.requestDatabaseNames': noop,

  'Overlay.enable': noop,
  'Overlay.hideHighlight': Overlay.hideHighlight,
  'Overlay.highlightFrame': noop,
  'Overlay.highlightNode': Overlay.highlightNode,
  'Overlay.setInspectMode': Overlay.setInspectMode,
  'Overlay.setShowViewportSizeOnResize': Overlay.setShowViewportSizeOnResize,

  'ServiceWorker.enable': noop,

  'Storage.getUsageAndQuota': Storage.getUsageAndQuota,

  'Storage.trackCacheStorageForOrigin': noop,
  'Storage.trackIndexedDBForOrigin': noop,
  'Storage.clearDataForOrigin': Storage.clearDataForOrigin,
};

export default methods;
