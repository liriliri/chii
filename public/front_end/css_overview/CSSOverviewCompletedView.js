import*as Common from"../common/common.js";import*as Components from"../components/components.js";import*as DataGrid from"../data_grid/data_grid.js";import*as SDK from"../sdk/sdk.js";import*as TextUtils from"../text_utils/text_utils.js";import*as UI from"../ui/ui.js";import{Events}from"./CSSOverviewController.js";import{CSSOverviewSidebarPanel,SidebarEvents}from"./CSSOverviewSidebarPanel.js";export class CSSOverviewCompletedView extends UI.Panel.PanelWithSidebar{constructor(e,t){super("css_overview_completed_view"),this.registerRequiredCSS("css_overview/cssOverviewCompletedView.css"),this._controller=e,this._formatter=new Intl.NumberFormat("en-US"),this._mainContainer=new UI.SplitWidget.SplitWidget(!0,!0),this._resultsContainer=new UI.Widget.VBox,this._elementContainer=new DetailsView,this._elementContainer.addEventListener(UI.TabbedPane.Events.TabClosed,e=>{0===e.data&&this._mainContainer.setSidebarMinimized(!0)}),this._mainContainer.registerRequiredCSS("css_overview/cssOverviewCompletedView.css"),this._mainContainer.setMainWidget(this._resultsContainer),this._mainContainer.setSidebarWidget(this._elementContainer),this._mainContainer.setVertical(!1),this._mainContainer.setSecondIsSidebar(!0),this._mainContainer.setSidebarMinimized(!0),this._sideBar=new CSSOverviewSidebarPanel,this.splitWidget().setSidebarWidget(this._sideBar),this.splitWidget().setMainWidget(this._mainContainer),this._cssModel=t.model(SDK.CSSModel.CSSModel),this._domModel=t.model(SDK.DOMModel.DOMModel),this._domAgent=t.domAgent(),this._linkifier=new Components.Linkifier.Linkifier(20,!0),this._viewMap=new Map,this._sideBar.addItem(ls`Overview summary`,"summary"),this._sideBar.addItem(ls`Colors`,"colors"),this._sideBar.addItem(ls`Font info`,"font-info"),this._sideBar.addItem(ls`Unused declarations`,"unused-declarations"),this._sideBar.addItem(ls`Media queries`,"media-queries"),this._sideBar.select("summary"),this._sideBar.addEventListener(SidebarEvents.ItemSelected,this._sideBarItemSelected,this),this._sideBar.addEventListener(SidebarEvents.Reset,this._sideBarReset,this),this._controller.addEventListener(Events.Reset,this._reset,this),this._controller.addEventListener(Events.PopulateNodes,this._createElementsView,this),this._resultsContainer.element.addEventListener("click",this._onClick.bind(this)),this._data=null}wasShown(){super.wasShown()}_sideBarItemSelected(e){const t=this._fragment.$(e.data);t&&t.scrollIntoView()}_sideBarReset(){this._controller.dispatchEventToListeners(Events.Reset)}_reset(){this._resultsContainer.element.removeChildren(),this._mainContainer.setSidebarMinimized(!0),this._elementContainer.closeTabs(),this._viewMap=new Map}_onClick(e){const t=e.target.dataset.type;if(!t)return;let s;switch(t){case"color":{const i=e.target.dataset.color,a=e.target.dataset.section;if(!i)return;let r;switch(a){case"text":r=this._data.textColors.get(i);break;case"background":r=this._data.backgroundColors.get(i);break;case"fill":r=this._data.fillColors.get(i);break;case"border":r=this._data.borderColors.get(i)}if(!r)return;r=Array.from(r).map(e=>({nodeId:e})),s={type:t,color:i,nodes:r,section:a};break}case"unused-declarations":{const i=e.target.dataset.declaration,a=this._data.unusedDeclarations.get(i);if(!a)return;s={type:t,declaration:i,nodes:a};break}case"media-queries":{const i=e.target.dataset.text,a=this._data.mediaQueries.get(i);if(!a)return;s={type:t,text:i,nodes:a};break}case"font-info":{const i=e.target.dataset.value,[a,r]=e.target.dataset.path.split("/"),n=this._data.fontInfo.get(a).get(r).get(i);if(!n)return;s={type:t,name:`${i} (${a}, ${r})`,nodes:n.map(e=>({nodeId:e}))};break}default:return}e.consume(),this._controller.dispatchEventToListeners(Events.PopulateNodes,s),this._mainContainer.setSidebarMinimized(!1)}_onMouseOver(e){const t=e.path.find(e=>e.dataset&&e.dataset.backendNodeId);if(!t)return;const s=Number(t.dataset.backendNodeId);this._controller.dispatchEventToListeners(Events.RequestNodeHighlight,s)}async _render(e){if(!e||!("backgroundColors"in e)||!("textColors"in e))return;this._data=e;const{elementCount:t,backgroundColors:s,textColors:i,fillColors:a,borderColors:r,globalStyleStats:n,mediaQueries:o,unusedDeclarations:l,fontInfo:d}=this._data,c=this._sortColorsByLuminance(s),h=this._sortColorsByLuminance(i),m=this._sortColorsByLuminance(a),u=this._sortColorsByLuminance(r);this._fragment=UI.Fragment.Fragment.build`
    <div class="vbox overview-completed-view">
      <div $="summary" class="results-section horizontally-padded summary">
        <h1>${ls`Overview summary`}</h1>

        <ul>
          <li>
            <div class="label">${ls`Elements`}</div>
            <div class="value">${this._formatter.format(t)}</div>
          </li>
          <li>
            <div class="label">${ls`External stylesheets`}</div>
            <div class="value">${this._formatter.format(n.externalSheets)}</div>
          </li>
          <li>
            <div class="label">${ls`Inline style elements`}</div>
            <div class="value">${this._formatter.format(n.inlineStyles)}</div>
          </li>
          <li>
            <div class="label">${ls`Style rules`}</div>
            <div class="value">${this._formatter.format(n.styleRules)}</div>
          </li>
          <li>
            <div class="label">${ls`Media queries`}</div>
            <div class="value">${this._formatter.format(o.size)}</div>
          </li>
          <li>
            <div class="label">${ls`Type selectors`}</div>
            <div class="value">${this._formatter.format(n.stats.type)}</div>
          </li>
          <li>
            <div class="label">${ls`ID selectors`}</div>
            <div class="value">${this._formatter.format(n.stats.id)}</div>
          </li>
          <li>
            <div class="label">${ls`Class selectors`}</div>
            <div class="value">${this._formatter.format(n.stats.class)}</div>
          </li>
          <li>
            <div class="label">${ls`Universal selectors`}</div>
            <div class="value">${this._formatter.format(n.stats.universal)}</div>
          </li>
          <li>
            <div class="label">${ls`Attribute selectors`}</div>
            <div class="value">${this._formatter.format(n.stats.attribute)}</div>
          </li>
          <li>
            <div class="label">${ls`Non-simple selectors`}</div>
            <div class="value">${this._formatter.format(n.stats.nonSimple)}</div>
          </li>
        </ul>
      </div>

      <div $="colors" class="results-section horizontally-padded colors">
        <h1>${ls`Colors`}</h1>
        <h2>${ls`Background colors: ${c.length}`}</h2>
        <ul>
          ${c.map(this._colorsToFragment.bind(this,"background"))}
        </ul>

        <h2>${ls`Text colors: ${h.length}`}</h2>
        <ul>
          ${h.map(this._colorsToFragment.bind(this,"text"))}
        </ul>

        <h2>${ls`Fill colors: ${m.length}`}</h2>
        <ul>
          ${m.map(this._colorsToFragment.bind(this,"fill"))}
        </ul>

        <h2>${ls`Border colors: ${u.length}`}</h2>
        <ul>
          ${u.map(this._colorsToFragment.bind(this,"border"))}
        </ul>
      </div>

      <div $="font-info" class="results-section font-info">
        <h1>${ls`Font info`}</h1>
        ${d.size>0?this._fontInfoToFragment(d):UI.Fragment.Fragment.build`<div>${ls`There are no fonts.`}</div>`}
      </div>

      <div $="unused-declarations" class="results-section unused-declarations">
        <h1>${ls`Unused declarations`}</h1>
        ${l.size>0?this._groupToFragment(l,"unused-declarations","declaration"):UI.Fragment.Fragment.build`<div class="horizontally-padded">${ls`There are no unused declarations.`}</div>`}
      </div>

      <div $="media-queries" class="results-section media-queries">
        <h1>${ls`Media queries`}</h1>
        ${o.size>0?this._groupToFragment(o,"media-queries","text"):UI.Fragment.Fragment.build`<div class="horizontally-padded">${ls`There are no media queries.`}</div>`}
      </div>
    </div>`,this._resultsContainer.element.appendChild(this._fragment.element())}_createElementsView(e){const{type:t,nodes:s}=e.data;let i="",a="";switch(t){case"color":{const{section:t,color:s}=e.data;i=`${t}-${s}`,a=`${s.toUpperCase()} (${t})`;break}case"unused-declarations":{const{declaration:t}=e.data;i=""+t,a=""+t;break}case"media-queries":{const{text:t}=e.data;i=""+t,a=""+t;break}case"font-info":{const{name:t}=e.data;i=""+t,a=""+t;break}}let r=this._viewMap.get(i);r||(r=new ElementDetailsView(this._controller,this._domModel,this._cssModel,this._linkifier),r.populateNodes(s),this._viewMap.set(i,r)),this._elementContainer.appendTab(i,a,r,!0)}_fontInfoToFragment(e){const t=Array.from(e.entries());return UI.Fragment.Fragment.build`
      ${t.map(([e,t])=>UI.Fragment.Fragment.build`<section class="font-family"><h2>${e}</h2> ${this._fontMetricsToFragment(e,t)}</section>`)}
    `}_fontMetricsToFragment(e,t){const s=Array.from(t.entries());return UI.Fragment.Fragment.build`
      <div class="font-metric">
      ${s.map(([t,s])=>{const i=`${e}/${t}`;return UI.Fragment.Fragment.build`
          <div>
            <h3>${t}</h3>
            ${this._groupToFragment(s,"font-info","value",i)}
          </div>`})}
      </div>`}_groupToFragment(e,t,s,i=""){const a=Array.from(e.entries()).sort((e,t)=>{const s=e[1];return t[1].length-s.length}),r=a.reduce((e,t)=>e+t[1].length,0);return UI.Fragment.Fragment.build`<ul>
    ${a.map(([e,a])=>{const n=100*a.length/r,o=1===a.length?ls`occurrence`:ls`occurrences`;return UI.Fragment.Fragment.build`<li>
        <div class="title">${e}</div>
        <button data-type="${t}" data-path="${i}" data-${s}="${e}">
          <div class="details">${ls`${a.length} ${o}`}</div>
          <div class="bar-container">
            <div class="bar" style="width: ${n}%"></div>
          </div>
        </button>
      </li>`})}
    </ul>`}_colorsToFragment(e,t){const s=UI.Fragment.Fragment.build`<li>
      <button data-type="color" data-color="${t}" data-section="${e}" class="block" $="color"></button>
      <div class="block-title">${t}</div>
    </li>`,i=s.$("color");i.style.backgroundColor=t;const a=Common.Color.Color.parse(t);let[r,n,o]=a.hsla();r=Math.round(360*r),n=Math.round(100*n),o=Math.round(100*o),o=Math.max(0,o-15);const l=`1px solid hsl(${r}, ${n}%, ${o}%)`;return i.style.border=l,s}_sortColorsByLuminance(e){return Array.from(e.keys()).sort((e,t)=>{const s=Common.Color.Color.parse(e),i=Common.Color.Color.parse(t);return Common.Color.Color.luminance(i.rgba())-Common.Color.Color.luminance(s.rgba())})}setOverviewData(e){this._render(e)}}CSSOverviewCompletedView.pushedNodes=new Set;export class DetailsView extends UI.Widget.VBox{constructor(){super(),this._tabbedPane=new UI.TabbedPane.TabbedPane,this._tabbedPane.show(this.element),this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabClosed,()=>{this.dispatchEventToListeners(UI.TabbedPane.Events.TabClosed,this._tabbedPane.tabIds().length)})}appendTab(e,t,s,i){this._tabbedPane.hasTab(e)||this._tabbedPane.appendTab(e,t,s,void 0,void 0,i),this._tabbedPane.selectTab(e)}closeTabs(){this._tabbedPane.closeTabs(this._tabbedPane.tabIds())}}export class ElementDetailsView extends UI.Widget.Widget{constructor(e,t,s,i){super(),this._controller=e,this._domModel=t,this._cssModel=s,this._linkifier=i,this._elementGridColumns=[{id:"nodeId",title:ls`Element`,visible:!1,sortable:!0,hideable:!0,weight:50},{id:"declaration",title:ls`Declaration`,visible:!1,sortable:!0,hideable:!0,weight:50},{id:"sourceURL",title:ls`Source`,visible:!0,sortable:!1,hideable:!0,weight:100}],this._elementGrid=new DataGrid.SortableDataGrid.SortableDataGrid({displayName:ls`CSS Overview Elements`,columns:this._elementGridColumns}),this._elementGrid.element.classList.add("element-grid"),this._elementGrid.element.addEventListener("mouseover",this._onMouseOver.bind(this)),this._elementGrid.setStriped(!0),this._elementGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged,this._sortMediaQueryDataGrid.bind(this)),this.element.appendChild(this._elementGrid.element)}_sortMediaQueryDataGrid(){const e=this._elementGrid.sortColumnId();if(!e)return;const t=DataGrid.SortableDataGrid.SortableDataGrid.StringComparator.bind(null,e);this._elementGrid.sortNodes(t,!this._elementGrid.isSortOrderAscending())}_onMouseOver(e){const t=e.path.find(e=>e.dataset&&e.dataset.backendNodeId);if(!t)return;const s=Number(t.dataset.backendNodeId);this._controller.dispatchEventToListeners(Events.RequestNodeHighlight,s)}async populateNodes(e){if(this._elementGrid.rootNode().removeChildren(),!e.length)return;const[t]=e,s={nodeId:!!t.nodeId,declaration:!!t.declaration,sourceURL:!!t.sourceURL};let i;if(s.nodeId){const t=e.reduce((e,t)=>CSSOverviewCompletedView.pushedNodes.has(t.nodeId)?e:(CSSOverviewCompletedView.pushedNodes.add(t.nodeId),e.add(t.nodeId)),new Set);i=await this._domModel.pushNodesByBackendIdsToFrontend(t)}for(const t of e){if(s.nodeId){const e=i.get(t.nodeId);if(!e)continue;t.node=e}const e=new ElementNode(this._elementGrid,t,this._linkifier,this._cssModel);e.selectable=!1,this._elementGrid.insertChild(e)}this._elementGrid.setColumnsVisiblity(s),this._elementGrid.renderInline(),this._elementGrid.wasShown()}}export class ElementNode extends DataGrid.SortableDataGrid.SortableDataGridNode{constructor(e,t,s,i){super(e,t.hasChildren),this.data=t,this._linkifier=s,this._cssModel=i}createCell(e){if("nodeId"===e){const t=this.createTD(e);return t.textContent="...",Common.Linkifier.Linkifier.linkify(this.data.node).then(e=>{t.textContent="",e.dataset.backendNodeId=this.data.node.backendNodeId(),t.appendChild(e)}),t}if("sourceURL"===e){const t=this.createTD(e);if(this.data.range){const e=this._linkifyRuleLocation(this._cssModel,this._linkifier,this.data.styleSheetId,TextUtils.TextRange.TextRange.fromObject(this.data.range));""!==e.textContent?t.appendChild(e):t.textContent="(unable to link)"}else t.textContent="(unable to link to inlined styles)";return t}return super.createCell(e)}_linkifyRuleLocation(e,t,s,i){const a=e.styleSheetHeaderForId(s),r=a.lineNumberInSource(i.startLine),n=a.columnNumberInSource(i.startLine,i.startColumn),o=new SDK.CSSModel.CSSLocation(a,r,n);return t.linkifyCSSLocation(o)}}