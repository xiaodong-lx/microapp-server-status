
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { style_widget, renderNotReady, renderData } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';
import { html } from 'lit';

export class SafeLineWAFStatusWidget extends SunPanelWidgetElement {
  static properties = {
    data: { type: Array },
    type: { type: String },
  };

  _title = "SafeLine WAF";
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
      const host = this.spCtx.widgetInfo.config.host;
      const siteid = this.spCtx.widgetInfo.config.siteid;

      if (!host || !siteid) { this._ready = -1; return }

      var targetUrl = `${host}/api/open/site/${siteid}`;

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: targetUrl,
          method: 'GET',
          headers: {
            "X-SLCE-API-TOKEN": "{{token}}"
          }
        },
        templateReplacements: [
          {
            placeholder: '{{token}}',
            fields: ['headers'],
            dataNodeKey: "widgetConfig." + this.spCtx.widgetInfo.widgetId + "_token"
          }
        ]
      });

      var resp = response.data;

      var mode;
      switch (resp?.data.mode) {
        case 0:
          mode = "Defense"
          break;
        case 1:
          mode = "Offline"
          break;
        case 2:
          mode = "Audited"
          break;
        default:
          mode = "Unknown"
          break;
      }

      this.data = [
        { type: "key-value", key: "Name", value: html`<span style="display: flex; align-items: center;"><img src="${resp?.data.icon}" style="width: 16px; margin-right: 2px;">${resp?.data.comment} (id: ${resp?.data.id})</span>` },
        { type: "key-value", key: "Mode", value: mode },
        { type: "key-value", key: "Host", value: resp?.data.server_names.join(", ") },
        { type: "key-value", key: "Port", value: resp?.data.ports.join(", ") },
        { type: "key-value", key: "Request", value: `${resp?.data.req_value}/${resp?.data.denied_value}` },
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
