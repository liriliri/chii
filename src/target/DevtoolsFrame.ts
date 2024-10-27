import $ from 'licia/$';
import chobitsu from 'chobitsu';
import h from 'licia/h';
import evalCss from 'licia/evalCss';
import toStr from 'licia/toStr';
import toNum from 'licia/toNum';
import startWith from 'licia/startWith';
import isStr from 'licia/isStr';
import isJson from 'licia/isJson';
import contain from 'licia/contain';
import uniqId from 'licia/uniqId';
import nextTick from 'licia/nextTick';
import pointerEvent from 'licia/pointerEvent';
import { getOrigin } from './util';

const $document = $(document as any);

export default class DevtoolsFrame {
  private container: HTMLDivElement;
  private $container: $.$;
  private $draggable: $.$;
  private height: number;
  private startY = 0;
  private originHeight = 0;
  private externalIframe?: HTMLIFrameElement = (window as any).ChiiDevtoolsIframe;
  constructor() {
    this.container = h('.__chobitsu-hide__') as HTMLDivElement;
    this.$container = $(this.container);
    this.$container.css({
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      height: '50%',
      zIndex: 200000,
      borderTop: '1px solid #cacdd1',
    });
    const draggable = h('div');
    this.$draggable = $(draggable);
    this.$draggable.css({
      position: 'absolute',
      width: '100%',
      height: 10,
      left: 0,
      top: -8,
      cursor: 'row-resize',
    });
    this.container.appendChild(draggable);
    evalCss(`
    html, body {
      overflow-y: auto;
      box-sizing: border-box;
    }
    `);
    const height = localStorage.getItem('chii-embedded-height');
    if (height) {
      this.setHeight(toNum(height));
    } else {
      this.setHeight(Math.round(window.innerHeight * 0.5));
    }
    if (!this.externalIframe) {
      this.bindEvent();
    }
  }
  setHeight(height: number) {
    if (height < 100) {
      height = 100;
    }
    if (height > window.innerHeight) {
      height = window.innerHeight;
    }
    this.height = height;
    localStorage.setItem('chii-embedded-height', toStr(height));
  }
  attach(devtoolsUrl: string) {
    let protocol = location.protocol;
    let host = location.host;
    if (protocol === 'about:' || protocol === 'blob:') {
      protocol = window.parent.location.protocol;
      host = window.parent.location.host;
    }
    const hostOrigin = `${protocol}//${host}`;
    let frame: any;
    if (this.externalIframe) {
      frame = this.externalIframe;
    } else {
      frame = document.createElement('iframe');
      const $frame = $(frame);
      $frame.css({
        border: 'none',
        width: '100%',
        height: '100%',
      });
    }
    let targetOrigin = '';
    if (startWith(devtoolsUrl, 'blob:')) {
      targetOrigin = hostOrigin;
    } else {
      targetOrigin = getOrigin(devtoolsUrl);
    }

    function sendToDevtools(message: any) {
      frame.contentWindow.postMessage(JSON.stringify(message), targetOrigin);
    }
    function sendToChobitsu(message: any) {
      message.id = uniqId('tmp');
      chobitsu.sendRawMessage(JSON.stringify(message));
    }
    if (this.externalIframe && contain(this.externalIframe.src, '#?embedded=')) {
      const window: any = this.externalIframe.contentWindow;
      nextTick(() => {
        window.runtime.loadLegacyModule('core/sdk/sdk.js').then((SDKModule: any) => {
          for (const resourceTreeModel of SDKModule.TargetManager.TargetManager.instance().models(
            SDKModule.ResourceTreeModel.ResourceTreeModel
          )) {
            resourceTreeModel.dispatchEventToListeners(
              SDKModule.ResourceTreeModel.Events.WillReloadPage,
              resourceTreeModel
            );
          }
          sendToDevtools({
            method: 'Page.frameNavigated',
            params: {
              frame: {
                id: '1',
                mimeType: 'text/html',
                securityOrigin: location.origin,
                url: location.href,
              },
              type: 'Navigation',
            },
          });
          sendToChobitsu({ method: 'Network.enable' });
          sendToDevtools({ method: 'Runtime.executionContextsCleared' });
          sendToChobitsu({ method: 'Runtime.enable' });
          sendToChobitsu({ method: 'Debugger.enable' });
          sendToChobitsu({ method: 'DOMStorage.enable' });
          sendToChobitsu({ method: 'DOM.enable' });
          sendToChobitsu({ method: 'CSS.enable' });
          sendToChobitsu({ method: 'Overlay.enable' });
          sendToDevtools({ method: 'DOM.documentUpdated' });
          sendToChobitsu({ method: 'Page.enable' });
          sendToDevtools({ method: 'Page.loadEventFired' });
        });
      });
    } else {
      frame.src = `${devtoolsUrl}#?embedded=${encodeURIComponent(hostOrigin)}`;
    }

    chobitsu.setOnMessage((message: string) => {
      if (contain(message, '"id":"tmp')) {
        return;
      }
      frame.contentWindow.postMessage(message, targetOrigin);
    });
    window.addEventListener('message', event => {
      if (event.origin !== targetOrigin) {
        return;
      }
      if (event.data && isStr(event.data) && isJson(event.data)) {
        chobitsu.sendRawMessage(event.data);
      }
    });

    if (!this.externalIframe) {
      this.container.appendChild(frame);
      document.body.appendChild(this.container);
      this.resize();
    }
  }
  private bindEvent() {
    window.addEventListener('resize', this.resize);
    this.$draggable.on(pointerEvent('down'), this.onResizeStart);
  }
  private onResizeStart = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    e = e.origEvent;
    this.startY = e.clientY;
    this.originHeight = this.height;
    this.$draggable.css({
      height: '100%',
    });
    $document.on(pointerEvent('move'), this.onResizeMove);
    $document.on(pointerEvent('up'), this.onResizeEnd);
  };
  private onResizeMove = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    const deltaY = e.origEvent.clientY - this.startY;
    this.setHeight(this.originHeight - deltaY);
    this.resize();
  };
  private onResizeEnd = () => {
    this.$draggable.css({
      height: 10,
    });
    $document.off(pointerEvent('move'), this.onResizeMove);
    $document.off(pointerEvent('up'), this.onResizeEnd);
  };
  private resize = () => {
    let { height } = this;
    if (height > window.innerHeight) {
      height = window.innerHeight;
      this.setHeight(height);
    }
    this.$container.css({
      height,
    });
    $(document.body).css({
      height: window.innerHeight - height,
    });
  };
}
