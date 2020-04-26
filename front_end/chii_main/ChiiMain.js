import * as Common from '../common/common.js';
import * as Components from '../components/components.js';
import * as SDK from '../sdk/sdk.js';

export class ChiiMainImpl extends Common.ObjectWrapper.ObjectWrapper {
  async run() {
    await SDK.Connections.initMainConnection(() => {},
    Components.TargetDetachedDialog.TargetDetachedDialog.webSocketConnectionLost);
  }
}
