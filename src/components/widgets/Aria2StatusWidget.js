
import { SunPanelWidgetElement, VERSION } from '@sun-panel/micro-app';
import { html, css } from 'lit';

export class Aria2StatusWidget extends SunPanelWidgetElement {
  static properties = {
    numActive: { type: String },
    numWaiting: { type: String },
    numStopped: { type: String },
    downloadSpeed: { type: String },
    uploadSpeed: { type: String },
  };

  constructor() {
    super();
    this.numActive = '-';
    this.numWaiting = '-';
    this.numStopped = '-';
    this.downloadSpeed = '-';
    this.uploadSpeed = '-';
  }
  onInitialized() {
    this.getServerStatus()
    var interval = this.spCtx.widgetInfo.config.interval;

    if (interval > 1) {
      setInterval(() => {
        this.getServerStatus();
      }, interval * 1000);
    }
  }

  onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    this.requestUpdate();
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    if (!bytes || isNaN(bytes)) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async getServerStatus() {
    try {
      const url = this.spCtx.widgetInfo.config.url;
      const token = this.spCtx.widgetInfo.config.token;

      if (!url || !token) { return }

      var body = {
        "jsonrpc": "2.0",
        "method": "aria2.getGlobalStat",
        "id": "QXJpYU5nXzE3Mjg4MjkwNTFfMC43MjA1ODQzNjc2NDU4NTA4",
        "params": [
          "token:" + token
        ]
      }

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: url,
          method: 'POST',
          body: JSON.stringify(body)
        }
      });

      var data = response.data;

      this.numActive = data.result.numActive;
      this.numStopped = data.result.numStopped;
      this.numWaiting = data.result.numWaiting;
      this.uploadSpeed = this.formatBytes(parseInt(data.result.uploadSpeed));
      this.downloadSpeed = this.formatBytes(parseInt(data.result.downloadSpeed));
    } catch (error) {
      switch (error.type) {
        case 'microApp':
          break;
        case 'targetUrl':
          break;
        default:
          console.error(error);
      }
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="info-item">
          <span class="label"></span>
          <span class="value"><strong>Aria2</strong></span>
        </div>
        <div class="info-item">
          <span class="label">Active</span>
          <span class="value">${this.numActive}</span>
        </div>
        <div class="info-item">
          <span class="label">Waiting</span>
          <span class="value">${this.numWaiting}</span>
        </div>
        <div class="info-item">
          <span class="label">Stopped</span>
          <span class="value">${this.numStopped}</span>
        </div>
        <div class="info-item">
          <span class="label">Speed</span>
          <span class="value">${this.downloadSpeed}↓ / ${this.uploadSpeed}↑</span>
        </div>
      </div>
    `;
  }

  static styles = css`
    .container {
      padding: 8px 12px;
      height: 100%;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      background: white;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
    }
    
    .label {
      color: #666;
      font-size: 12px;
    }
    
    .value {
      color: #333;
      font-size: 12px;
      font-weight: 500;
    }
    
    .progress-bar {
      background-color: rgba(207, 207, 207, 0.66);
      height: 5px;
      border-radius: 2.5px;
    }
    
    .progress-bar-line {
      background-color: rgba(145, 145, 145, 1);
      height: 5px;
      line-height: 5px;
      border-radius: 2.5px;
    }
  `;
}
