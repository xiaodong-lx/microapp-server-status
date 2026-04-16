
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { style_widget, renderNotReady, renderData } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';
import { html } from 'lit';

const COLOR_DEFENSE = "rgb(2, 191, 165)"
const COLOR_AUDITED = "rgb(255, 191, 0)"
const COLOR_OFFLINE = "rgb(254, 95, 87)"

export class SafeLineWAFStatusWidget extends SunPanelWidgetElement {
  static properties = {
    data: { type: Array },
    type: { type: String },
  };

  _title = "雷池 WAF";
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

      var mode = "未知";
      var mode_color = "unset";
      switch (resp?.data.mode) {
        case 0:
          mode = "防护模式";
          mode_color = COLOR_DEFENSE;
          break;
        case 1:
          mode = "维护模式";
          mode_color = COLOR_OFFLINE;
          break;
        case 2:
          mode = "观察模式";
          mode_color = COLOR_AUDITED;
          break;
      }

      this.data = [
        { type: "key-value", key: "应用", value: html`<span style="display: flex; align-items: center;"><img src="${resp?.data.icon}" style="width: 16px; margin-right: 2px;">${resp?.data.comment}</span>` },
        { type: "key-value", key: "模式", value: html`<span style="color: ${mode_color}">${mode}</span>` },
        { type: "key-value", key: "域名", value: resp?.data.server_names.join(", ") },
        { type: "key-value", key: "监听端口", value: resp?.data.ports.join(", ") },
        { type: "key-value", key: "请求/拦截", value: `${resp?.data.req_value}/${resp?.data.denied_value}` },
        { type: "key-value", key: "", value: html`<small>id: ${resp?.data.id}</small>` },
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
