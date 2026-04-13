
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { style_widget, renderNotReady, renderData } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';
import { formatBytes } from '../../utils/function';

export class Aria2StatusWidget extends SunPanelWidgetElement {
  static properties = {
    data: { type: Array },
  };

  _title = "Aria2";
  _ready = -1;

  constructor() {
    super();
  }

  async onInitialized() {
    this.data = await this.spCtx.api.localCache.user.get(this.spCtx.widgetInfo.widgetId + "_cache") || [];

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

      var resp = response.data;

      this.data = [
        { type: "key-value", key: "Active", value: resp?.result.numActive },
        { type: "key-value", key: "Waiting", value: resp?.result.numWaiting },
        { type: "key-value", key: "Stopped", value: resp?.result.numStopped },
        { type: "key-value", key: "Speed", value: `${formatBytes(parseInt(resp?.result.downloadSpeed))}↓ / ${formatBytes(parseInt(resp?.result.uploadSpeed))}↑` },
      ]

      this._ready = 1;

      await this.spCtx.api.localCache.user.set(this.spCtx.widgetInfo.widgetId + "_cache", this.data, 3600 * 24 * 1);
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

    return renderData(this._title, this.data, this.spCtx);
  }

  static styles = style_widget;
}
