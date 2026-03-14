import { SunPanelPageElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_page } from '../../utils/style';
import { INTERVAL_DEFAULT, INTERVAL_MAX, INTERVAL_MIN } from '../../utils/const';

export class PVEStatusPage extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    host: { type: String },
    token: { type: String },
    node: { type: String },
    qemuid: { type: Number },
    lxcid: { type: Number },
    interval: { type: Number }
  };

  onInitialized({ widgetInfo, customParam }) {
    this.widgetInfo = widgetInfo;
    const config = widgetInfo?.config || {};
    this.host = config.host ?? '';
    this.token = config.token ?? '';
    this.node = config.node ?? '';
    this.qemuid = config.qemuid ?? 0;
    this.lxcid = config.lxcid ?? 0;
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
        node: this.node,
        qemuid: this.qemuid,
        lxcid: this.lxcid,
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
              <div class="section-title">Proxmox VE Server</div>
              <div class="form-group">
                <label for="host">Host</label>
                <input
                  type="text"
                  name="host"
                  .value="${this.host}"
                  @input="${(e) => this.host = e.target.value}"
                  placeholder="Host"
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
                <label for="node">Node</label>
                <input
                  type="text"
                  name="node"
                  .value="${this.node}"
                  @input="${(e) => this.node = e.target.value}"
                  placeholder="Node"
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
              <div class="form-group">
                <label for="qemuid">虚拟机 ID</label>
                <input
                  type="number"
                  name="qemuid"
                  .value="${this.qemuid}"
                  @input="${(e) => this.qemuid = e.target.value}"
                  placeholder="100 - 999999999，或留空"
                  class="styled-input"
                >
                </div>
              <div class="form-group">
                <label for="lxcid">LXC ID</label>
                <input
                  type="number"
                  name="lxcid"
                  .value="${this.lxcid}"
                  @input="${(e) => this.lxcid = e.target.value}"
                  placeholder="100 - 999999999，或留空"
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
