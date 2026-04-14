import { SunPanelPageElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_page } from '../../utils/style';
import { INTERVAL_DEFAULT, INTERVAL_MAX, INTERVAL_MIN } from '../../utils/const';

export class Aria2StatusPage extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    url: { type: String },
    interval: { type: Number }
  };

  onInitialized({ widgetInfo, customParam }) {
    this.widgetInfo = widgetInfo;
    const config = widgetInfo?.config || {};
    this.url = config.url ?? '';
    this.token = '';
    this.interval = Math.min(Math.max(parseInt(config.interval ?? INTERVAL_DEFAULT), INTERVAL_MIN), INTERVAL_MAX);
    this.requestUpdate();
  }

  async handleSaveOrCreateWidget() {
    const resp = await this.spCtx.api.widget.save({
      ...this.widgetInfo,
      config: {
        ...this.widgetInfo.config,
        url: this.url,
        interval: Math.min(Math.max(parseInt(this.interval ?? INTERVAL_DEFAULT), INTERVAL_MIN), INTERVAL_MAX)
      },
    })

    if (this.token && resp.id) {
      this.spCtx.api.dataNode.user.setByKey("widgetConfig", resp.id + "_token", this.token);
    }
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
              <div class="section-title">Aria2</div>
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
