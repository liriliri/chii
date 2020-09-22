import*as UI from"../ui/ui.js";export class ContextDetailBuilder{constructor(t){this._fragment=createDocumentFragment(),this._container=createElementWithClass("div","context-detail-container"),this._fragment.appendChild(this._container),this._build(t)}_build(t){const e="realtime"===t.contextType?ls`AudioContext`:ls`OfflineAudioContext`;this._addTitle(e,t.contextId),this._addEntry(ls`State`,t.contextState),this._addEntry(ls`Sample Rate`,t.sampleRate,"Hz"),"realtime"===t.contextType&&this._addEntry(ls`Callback Buffer Size`,t.callbackBufferSize,"frames"),this._addEntry(ls`Max Output Channels`,t.maxOutputChannelCount,"ch")}_addTitle(t,e){this._container.appendChild(UI.Fragment.html`
      <div class="context-detail-header">
        <div class="context-detail-title">${t}</div>
        <div class="context-detail-subtitle">${e}</div>
      </div>
    `)}_addEntry(t,e,a){const n=e+(a?" "+a:"");this._container.appendChild(UI.Fragment.html`
      <div class="context-detail-row">
        <div class="context-detail-row-entry">${t}</div>
        <div class="context-detail-row-value">${n}</div>
      </div>
    `)}getFragment(){return this._fragment}}export class ContextSummaryBuilder{constructor(t,e){const a=e.currentTime.toFixed(3),n=(1e3*e.callbackIntervalMean).toFixed(3),i=(1e3*Math.sqrt(e.callbackIntervalVariance)).toFixed(3),s=(100*e.renderCapacity).toFixed(3);this._fragment=createDocumentFragment(),this._fragment.appendChild(UI.Fragment.html`
      <div class="context-summary-container">
        <span>${ls`Current Time`}: ${a} s</span>
        <span>\u2758</span>
        <span>${ls`Callback Interval`}: μ = ${n} ms, σ = ${i} ms</span>
        <span>\u2758</span>
        <span>${ls`Render Capacity`}: ${s} %</span>
      </div>
    `)}getFragment(){return this._fragment}}