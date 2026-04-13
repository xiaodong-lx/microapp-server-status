
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { style_widget, renderNotReady, renderData } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';

export class HomeAssistantWidget extends SunPanelWidgetElement {
  static properties = {
    data: { type: Array },
  };

  _title = "Home Assistant";
  _ready = -1;

  constructor() {
    super();
  }

  async onInitialized() {
    this.data = await this.spCtx.api.localCache.user.get(this.spCtx.widgetInfo.widgetId + "_cache") || [];

    this.getTemplate()
    var interval = this.spCtx.widgetInfo.config.interval;

    if (interval >= INTERVAL_MIN) {
      setInterval(() => {
        this.getTemplate();
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

  extractProgress(str) {
    const regex = /^PROGRESS\s+(\d+(\.\d+)?|1(\.0+)?)$/;
    const match = str.match(regex);

    if (match) {
      return parseFloat(match[1]);
    }

    return -1;
  }

  extractKeyValue(str) {
    const regex = /^KV\s+(.+):(.+)$/;
    const match = str.match(regex);

    if (match && match.length > 2) {
      return { key: match[1].trim(), value: match[2].trim() };
    }

    return null;
  }

  async getTemplate() {
    this._ready = 0;

    try {
      const host = this.spCtx.widgetInfo.config.host;
      const template = this.spCtx.widgetInfo.config.template;

      if (!host || !template) { this._ready = -1; return }

      var body = {
        template: template
      }

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: `${host}/api/template`,
          method: 'POST',
          headers: {
            "Authorization": "Bearer {{token}}",
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
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

      this.data = resp.split("\n").map(item => {
        var progress = this.extractProgress(item)
        var kv = this.extractKeyValue(item)
        if (progress != -1) {
          return { type: "progress-bar", value: progress }
        } else if (kv) {
          return { type: "key-value", key: kv.key, value: kv.value }
        } else {
          return { type: "text", value: item }
        }
      });

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
