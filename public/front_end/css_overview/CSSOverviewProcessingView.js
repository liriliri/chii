import*as UI from"../ui/ui.js";import{Events}from"./CSSOverviewController.js";export class CSSOverviewProcessingView extends UI.Widget.Widget{constructor(e){super(),this.registerRequiredCSS("css_overview/cssOverviewProcessingView.css"),this._formatter=new Intl.NumberFormat("en-US"),this._controller=e,this._render()}_render(){const e=UI.UIUtils.createTextButton(ls`Cancel`,()=>this._controller.dispatchEventToListeners(Events.RequestOverviewCancel),"",!0);this.setDefaultFocusedElement(e),this.fragment=UI.Fragment.Fragment.build`
      <div class="vbox overview-processing-view">
        <h1>Processing page</h1>
        <div>${e}</div>
      </div>
    `,this.contentElement.appendChild(this.fragment.element()),this.contentElement.style.overflow="auto"}}