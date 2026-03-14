import { SunPanelPageElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_page } from '../../utils/style';
import { INTERVAL_DEFAULT, INTERVAL_MAX, INTERVAL_MIN } from '../../utils/const';

const TEMPLATE_DEFAULT = '{% set my_test_json = { \n\
  "temperature": 25, \n\
  "unit": "°C" \n\
} %} \n\
\n\
The temperature is {{ my_test_json.temperature }} {{ my_test_json.unit }}. \n\
\n\
KV temperature:{{ my_test_json.temperature }} {{ my_test_json.unit }}\n\
Progress: \n\
PROGRESS 0.1'

export class HomeAssistantPage extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    host: { type: String },
    token: { type: String },
    template: { type: String },
    interval: { type: Number }
  };

  onInitialized({ widgetInfo, customParam }) {
    this.widgetInfo = widgetInfo;
    const config = widgetInfo?.config || {};
    this.host = config.host ?? '';
    this.token = config.token ?? '';
    this.template = config.template ?? TEMPLATE_DEFAULT;

    this.interval = Math.min(Math.max(parseInt(config.interval ?? INTERVAL_DEFAULT), INTERVAL_MIN), INTERVAL_MAX);
    this.requestUpdate();
  }

  async loadConfig() {
    try {
      const savedConfig = await this.spCtx.api.dataNode.user.get('cardConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
      }
      this.requestUpdate();
    } catch (error) {
      console.error('[CardConfig] Failed to load config:', error);
    }
  }

  async handleSaveOrCreateWidget() {
    this.token = this.token ?? this.widgetInfo.config.token

    this.spCtx.api.widget.save({
      ...this.widgetInfo,
      config: {
        ...this.widgetInfo.config,
        host: this.host,
        token: this.token,
        template: this.template,
        interval: Math.min(Math.max(parseInt(this.interval ?? INTERVAL_DEFAULT), INTERVAL_MIN), INTERVAL_MAX)
      },
    });
  }

  render() {
    return html`
      <style>
        ${style_page}
      </style>
      <div class="container">
        <div class="content-wrapper">
          <h1>设置</h1>
          <form @submit="${(e) => e.preventDefault()}">
            <div class="form-section">
              <div class="section-title">Home-Assistant</div>
              <div class="form-group">
                <label for="host">Host</label>
                <input
                  type="text"
                  name="host"
                  .value="${this.host}"
                  @input="${(e) => this.host = e.target.value}"
                  placeholder="http://xxxxx"
                  class="styled-input"
                >
              </div>
              <div class="form-group">
                <label for="token">Token</label>
                <input
                  type="text"
                  name="token"
                  .value=""
                  @input="${(e) => this.token = e.target.value ?? this.token}"
                  placeholder="留空则不修改"
                  class="styled-input"
                >
                </div>
              <div class="form-group">
                <label for="template">Template</label>
                <textarea
                  name="template"
                  rows="5"
                  .value="${this.template}"
                  @input="${(e) => this.template = e.target.value}"
                  placeholder=""
                  class="styled-input"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="interval">刷新间隔（${INTERVAL_MIN}-${INTERVAL_MAX}）</label>
                <input
                  type="number"
                  name="interval"
                  min="${INTERVAL_MIN}"
                  max="${INTERVAL_MAX}"
                  .value="${this.interval}"
                  @input="${(e) => this.interval = e.target.value}"
                  placeholder="Interval"
                  class="styled-input"
                >
                </div>
            </div>
          </form>
        </div>
        
        <div class="button-container">
          <button type="button" @click=${this.handleSaveOrCreateWidget}>保存</button>
        </div>
      </div>
    `;
  }
}
