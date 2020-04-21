import * as Runtime from './domains/Runtime';
import * as Page from './domains/Page';

const methods: any = {
  'DOM.enable': noop,

  'Log.enable': noop,

  'Network.enable': noop,

  'Page.getResourceTree': Page.getResourceTree,

  'Runtime.enable': Runtime.enable,

  'Page.enable': noop,

  'Profiler.enable': noop,

  'Audits.enable': noop,

  'CSS.enable': noop,

  'Inspector.enable': noop,

  'Overlay.enable': noop,

  'ServiceWorker.enable': noop,
};

async function noop() {}

export default methods;
