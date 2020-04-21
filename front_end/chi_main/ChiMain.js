import * as Common from '../common/common.js';
import * as Components from '../components/components.js';
import * as SDK from '../sdk/sdk.js';

export class ChiMainImpl extends Common.ObjectWrapper.ObjectWrapper {
  async run() {
    let firstCall = true;
    await SDK.Connections.initMainConnection(async () => {
      const type = SDK.SDKModel.Type.Frame;
      const waitForDebuggerInPage = type === SDK.SDKModel.Type.Frame && Root.Runtime.queryParam('panel') === 'sources';
      const target = SDK.SDKModel.TargetManager.instance().createTarget(
        'main',
        Common.UIString.UIString('Main'),
        type,
        null,
        undefined,
        waitForDebuggerInPage
      );

      // Only resume target during the first connection,
      // subsequent connections are due to connection hand-over,
      // there is no need to pause in debugger.
      if (!firstCall) {
        return;
      }
      firstCall = false;

      if (waitForDebuggerInPage) {
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        if (!debuggerModel.isReadyToPause()) {
          await debuggerModel.once(SDK.DebuggerModel.Events.DebuggerIsReadyToPause);
        }
        debuggerModel.pause();
      }

      target.runtimeAgent().runIfWaitingForDebugger();
    }, Components.TargetDetachedDialog.TargetDetachedDialog.webSocketConnectionLost);
  }
}
