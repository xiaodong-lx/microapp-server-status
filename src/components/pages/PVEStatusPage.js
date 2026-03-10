import { SunPanelPageElement } from '@sun-panel/micro-app';
import { html } from 'lit';

const INTERVAL_MAX = 10
const INTERVAL_MIN = 0
const INTERVAL_DEFAULT = 3

export class PVEStatusWidgetPage extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    host: { type: String },
    token: { type: String },
    node: { type: String },
    qemuid: { type: Number },
    lxcid: { type: Number },
    interval: { type: Number }
  };

  /**
   * 页面初始化时调用
   */
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

  /**
   * 加载配置
   */
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
    const darkMode = this.spCtx?.darkMode ?? false;
    return html`
      <style>
        :host { height: 100%; width: 100%; display: block; }
        
        .container {
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          color: #262626;
          display: flex;
          flex-direction: column;
        }
        
        .content-wrapper {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }
        
        .content-wrapper::-webkit-scrollbar { width: 6px; }
        .content-wrapper::-webkit-scrollbar-track { background: transparent; }
        .content-wrapper::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }
        .content-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.25);
        }
        
        h1 { color: #1890ff; margin: 0 0 4px; font-size: 18px; font-weight: 600; }
        .subtitle { color: #8c8c8c; margin-bottom: 16px; font-size: 12px; }
        
        .form-section {
          background: rgba(250,250,250,0.7);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid rgba(232,232,232,0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #262626;
          display: flex;
          align-items: center;
        }
        
        .section-title::before {
          content: '';
          width: 3px;
          height: 14px;
          background: #1890ff;
          margin-right: 6px;
          border-radius: 2px;
        }
        
        .form-group { margin: 12px 0; }
        .form-group:first-child { margin-top: 0; }
        .form-group:last-child { margin-bottom: 0; }
        
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 13px;
          color: #595959;
        }
        
        input.styled-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 13px;
          color: #262626;
          background: #fff;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        
        input.styled-input:focus {
          outline: none;
          border-color: #1890ff;
          box-shadow: 0 0 0 3px rgba(24,144,255,0.1);
        }
        
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e8e8e8;
          flex-shrink: 0;
        }
        
        button[type="button"] {
          padding: 8px 24px;
          background: #1890ff;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(24,144,255,0.15);
        }
        
        button[type="button"]:hover {
          background: #40a9ff;
          box-shadow: 0 4px 8px rgba(24,144,255,0.25);
          transform: translateY(-1px);
        }
        
        button[type="button"]:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(24,144,255,0.15);
        }
      </style>
      <div class="container">
        <div class="content-wrapper">
          <h1>设置</h1>
          <form @submit="${(e) => e.preventDefault()}">
            <div class="form-section">
              <div class="section-title">Server</div>
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
                <label for="interval">刷新间隔（0-10，0为不刷新）</label>
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
