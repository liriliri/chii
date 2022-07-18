import $ from 'licia/$';
import chobitsu from 'chobitsu';
import h from 'licia/h';
import evalCss from 'licia/evalCss';
import toStr from 'licia/toStr';
import toNum from 'licia/toNum';

const $document = $(document as any);

export default class DevtoolsFrame {
  private targetOrigin: string = '';
  private container: HTMLDivElement;
  private $container: $.$;
  private $draggable: $.$;
  private height: number;
  private startY: number = 0;
  private originHeight: number = 0;
  constructor(targetOrigin: string) {
    this.targetOrigin = targetOrigin;
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
    this.bindEvent();
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
  attach() {
    const { targetOrigin } = this;
    let protocol = location.protocol;
    let host = location.host;
    if (protocol === 'about:') {
      protocol = window.parent.location.protocol;
      host = window.parent.location.host;
    }
    const frame = document.createElement('iframe');
    const $frame = $(frame);
    $frame.css({
      border: 'none',
      width: '100%',
      height: '100%',
    });
    frame.src = `${targetOrigin}/front_end/chii_app.html?embedded=${protocol}//${host}`;
    chobitsu.setOnMessage((message: string) => {
      frame.contentWindow?.postMessage(message, targetOrigin);
    });
    window.addEventListener('message', event => {
      if (event.origin !== targetOrigin) {
        return;
      }
      chobitsu.sendRawMessage(event.data);
    });

    this.container.appendChild(frame);
    document.body.appendChild(this.container);
    this.resize();
  }
  private bindEvent() {
    window.addEventListener('resize', this.resize);
    this.$draggable.on('mousedown', this.onResizeStart);
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
    $document.on('mousemove', this.onResizeMove);
    $document.on('mouseup', this.onResizeEnd);
  };
  private onResizeMove = (e: any) => {
    const deltaY = e.origEvent.clientY - this.startY;
    this.setHeight(this.originHeight - deltaY);
    this.resize();
  };
  private onResizeEnd = () => {
    this.$draggable.css({
      height: 10,
    });
    $document.off('mousemove', this.onResizeMove);
    $document.off('mouseup', this.onResizeEnd);
  };
  private resize = () => {
    const { height } = this;
    this.$container.css({
      height,
    });
    $(document.body).css({
      height: window.innerHeight - height,
    });
  };
}
