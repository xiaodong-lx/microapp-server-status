
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_widget, renderNotReady } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';

export class HomeAssistantWidget extends SunPanelWidgetElement {
  static properties = {
    content: { type: String },
  };

  _title = "Home Assistant";
  _ready = false;

  constructor() {
    super();
    this.content = '';
  }
  onInitialized() {
    this.getTemplate()
    var interval = this.spCtx.widgetInfo.config.interval;

    if (interval >= INTERVAL_MIN) {
      setInterval(() => {
        this.getTemplate();
      }, interval * 1000);
    }
  }

  onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    this.requestUpdate();
  }

  extractProgress(str) {
    const regex = /^PROGRESS\s+(0(\.\d+)?|1(\.0+)?)$/;
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
    this._ready = false;

    try {
      const host = this.spCtx.widgetInfo.config.host;
      const token = this.spCtx.widgetInfo.config.token;
      const template = this.spCtx.widgetInfo.config.template;

      if (!host || !token) { return }

      var body = {
        template: template
      }

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: `${host}/api/template`,
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      });

      var data = response.data;

      this._ready = true;
      this.content = data;

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
    if (!this._ready) {
      return renderNotReady(this._title)
    }

    return html`
      <div class="container">
        <div class="info-item">
          <span class="label"></span>
          <span class="value"><strong>${this._title}</strong></span>
        </div>
    ${this.content.split("\n").map(item => {
      var progress = this.extractProgress(item)
      var kv = this.extractKeyValue(item)
      if (progress != -1) {
        return html`
            <div class="progress-bar">
              <div class="progress-bar-line" style="max-width: ${progress * 100}%"></div>
            </div>`
      } else if (kv) {
        return html`
            <div class="info-item">
              <span class="label">${kv.key}</span>
              <span class="value">${kv.value}</span>
            </div>`
      } else {
        return html`
            <div class="info-item">
              <span class="value">${item}</span>
            </div>`
      }
    })}
      </div>
    `;
  }

  static styles = style_widget;
}
