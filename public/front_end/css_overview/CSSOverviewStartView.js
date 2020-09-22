import*as UI from"../ui/ui.js";import{Events}from"./CSSOverviewController.js";export class CSSOverviewStartView extends UI.Widget.Widget{constructor(e){super(),this.registerRequiredCSS("css_overview/cssOverviewStartView.css"),this._controller=e,this._render()}_render(){const e=UI.UIUtils.createTextButton(ls`Capture overview`,()=>this._controller.dispatchEventToListeners(Events.RequestOverviewStart),"",!0);this.setDefaultFocusedElement(e);const t=UI.Fragment.Fragment.build`
      <div class="vbox overview-start-view">
        <h1>${ls`CSS Overview`}</h1>
        <div>${e}</div>
      </div>
    `;this.contentElement.appendChild(t.element()),this.contentElement.style.overflow="auto"}}