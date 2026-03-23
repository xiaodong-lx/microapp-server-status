
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_widget, renderNotReady } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';
import { formatBytes } from '../../utils/function';

export class Aria2StatusWidget extends SunPanelWidgetElement {
  static properties = {
    numActive: { type: String },
    numWaiting: { type: String },
    numStopped: { type: String },
    downloadSpeed: { type: String },
    uploadSpeed: { type: String },
  };

  _title = "Aria2";
  _ready = -1;

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

    if (interval >= INTERVAL_MIN) {
      setInterval(() => {
        this.getServerStatus();
      }, interval * 1000);
    }
  }

  onDisconnected() {
    if (this.spCtx.widgetInfo.widgetId && this.spCtx.widgetInfo.widgetId !== "0") {
      // this.spCtx.api.dataNode.user.delByKey("widgetConfig", this.spCtx.widgetInfo.widgetId + "_token");
    }
  }

  onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    this.requestUpdate();
  }

  async getServerStatus() {
    this._ready = 0;

    try {
      const url = this.spCtx.widgetInfo.config.url;

      if (!url) { this._ready = -1; return }

      var body = {
        "jsonrpc": "2.0",
        "method": "aria2.getGlobalStat",
        "id": "QXJpYU5nXzE3Mjg4MjkwNTFfMC43MjA1ODQzNjc2NDU4NTA4",
        "params": [
          "token:{{token}}"
        ]
      }

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: url,
          method: 'POST',
          body: JSON.stringify(body)
        },
        templateReplacements: [
          {
            placeholder: '{{token}}',
            fields: ['body'],
            dataNodeKey: "widgetConfig." + this.spCtx.widgetInfo.widgetId + "_token"
          }
        ]
      });

      var data = response.data;

      this._ready = 1;

      this.numActive = data.result.numActive;
      this.numStopped = data.result.numStopped;
      this.numWaiting = data.result.numWaiting;
      this.uploadSpeed = formatBytes(parseInt(data.result.uploadSpeed));
      this.downloadSpeed = formatBytes(parseInt(data.result.downloadSpeed));
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
    if (this._ready == -1) {
      return renderNotReady(this._title, this.spCtx);
    }

    return html`
      <div class="container" ?dark=${this.spCtx?.darkMode}>
        <div class="title">
          ${this._title}
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

  static styles = style_widget;
}
