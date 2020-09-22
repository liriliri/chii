import*as UI from"../ui/ui.js";import{Events,LighthouseController,Presets,RuntimeSettings}from"./LighthouseController.js";import{RadioSetting}from"./RadioSetting.js";export class StartView extends UI.Widget.Widget{constructor(t){super(),this.registerRequiredCSS("lighthouse/lighthouseStartView.css"),this._controller=t,this._settingsToolbar=new UI.Toolbar.Toolbar(""),this._render()}settingsToolbar(){return this._settingsToolbar}_populateRuntimeSettingAsRadio(t,e,s){const i=RuntimeSettings.find(e=>e.setting.name===t);if(!i||!i.options)throw new Error(t+" is not a setting with options");const o=new RadioSetting(i.options,i.setting,i.description);s.appendChild(o.element),UI.ARIAUtils.setAccessibleName(o.element,e)}_populateRuntimeSettingAsToolbarCheckbox(t,e){const s=RuntimeSettings.find(e=>e.setting.name===t);if(!s||!s.title)throw new Error(t+" is not a setting with a title");s.setting.setTitle(s.title);const i=new UI.Toolbar.ToolbarSettingCheckbox(s.setting,s.description);if(e.appendToolbarItem(i),s.learnMore){const t=UI.XLink.XLink.create(s.learnMore,ls`Learn more`,"lighthouse-learn-more");t.style.padding="5px",i.element.appendChild(t)}}_populateFormControls(t){const e=t.$("device-type-form-elements");this._populateRuntimeSettingAsRadio("lighthouse.device_type",ls`Device`,e);const s=t.$("categories-form-elements"),i=t.$("plugins-form-elements");for(const t of Presets){const e=t.plugin?i:s;t.setting.setTitle(t.title);const o=new UI.Toolbar.ToolbarSettingCheckbox(t.setting),l=e.createChild("div","vbox lighthouse-launcher-row");l.title=t.description,l.appendChild(o.element)}UI.ARIAUtils.markAsGroup(s),UI.ARIAUtils.setAccessibleName(s,ls`Categories`),UI.ARIAUtils.markAsGroup(i),UI.ARIAUtils.setAccessibleName(i,ls`Community Plugins (beta)`)}_render(){this._populateRuntimeSettingAsToolbarCheckbox("lighthouse.clear_storage",this._settingsToolbar),this._populateRuntimeSettingAsToolbarCheckbox("lighthouse.throttling",this._settingsToolbar),this._startButton=UI.UIUtils.createTextButton(ls`Generate report`,()=>this._controller.dispatchEventToListeners(Events.RequestLighthouseStart,UI.UIUtils.elementIsFocusedByKeyboard(this._startButton)),"",!0),this.setDefaultFocusedElement(this._startButton);const t=ls`Identify and fix common problems that affect your site's performance, accessibility, and user experience.`,e=UI.Fragment.Fragment.build`
      <div class="vbox lighthouse-start-view">
        <header>
          <div class="lighthouse-logo"></div>
          <div class="lighthouse-start-button-container hbox">
            ${this._startButton}
            </div>
          <div $="help-text" class="lighthouse-help-text hidden"></div>
          <div class="lighthouse-start-view-text">
            <span>${t}</span>
            ${UI.XLink.XLink.create("https://developers.google.com/web/tools/lighthouse/",ls`Learn more`)}
          </div>
        </header>
        <form>
          <div class="lighthouse-form-categories">
            <div class="lighthouse-form-section">
              <div class="lighthouse-form-section-label">
                ${ls`Categories`}
              </div>
              <div class="lighthouse-form-elements" $="categories-form-elements"></div>
            </div>
            <div class="lighthouse-form-section">
              <div class="lighthouse-form-section-label">
                <div class="lighthouse-icon-label">${ls`Community Plugins (beta)`}</div>
              </div>
              <div class="lighthouse-form-elements" $="plugins-form-elements"></div>
            </div>
          </div>
          <div class="lighthouse-form-section">
            <div class="lighthouse-form-section-label">
              ${ls`Device`}
            </div>
            <div class="lighthouse-form-elements" $="device-type-form-elements"></div>
          </div>
        </form>
      </div>
    `;this._helpText=e.$("help-text"),this._populateFormControls(e),this.contentElement.appendChild(e.element()),this.contentElement.style.overflow="auto"}onResize(){const t=this.contentElement.offsetWidth<560,e=this.contentElement.querySelector(".lighthouse-start-view");e.classList.toggle("hbox",!t),e.classList.toggle("vbox",t)}focusStartButton(){this._startButton.focus()}setStartButtonEnabled(t){this._helpText&&this._helpText.classList.toggle("hidden",t),this._startButton&&(this._startButton.disabled=!t)}setUnauditableExplanation(t){this._helpText&&(this._helpText.textContent=t)}}