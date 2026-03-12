import { SunPanelPageElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_page } from '../../utils/style';

const INTERVAL_MAX = 10
const INTERVAL_MIN = 3
const INTERVAL_DEFAULT = 3

export class Aria2StatusPage extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    url: { type: String },
    token: { type: String },
    interval: { type: Number }
  };

  onInitialized({ widgetInfo, customParam }) {
    this.widgetInfo = widgetInfo;
    const config = widgetInfo?.config || {};
    this.url = config.url ?? '';
    this.token = config.token ?? '';
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
        url: this.url,
        token: this.token,
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
              <div class="section-title">Aria2 Server</div>
              <div class="form-group">
                <label for="url">Url</label>
                <input
                  type="text"
                  name="url"
                  .value="${this.url}"
                  @input="${(e) => this.url = e.target.value}"
                  placeholder="http://xxxxx/jsonrpc"
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
