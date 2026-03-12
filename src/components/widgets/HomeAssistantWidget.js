
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_widget } from '../../utils/style';

export class HomeAssistantWidget extends SunPanelWidgetElement {
  static properties = {
    content: { type: String },
  };

  constructor() {
    super();
    this.content = '';
  }
  onInitialized() {
    this.getTemplates()
    var interval = this.spCtx.widgetInfo.config.interval;

    if (interval > 1) {
      setInterval(() => {
        this.getTemplates();
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

  async getTemplates() {
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
    return html`
      <div class="container">
        <div class="info-item">
          <span class="label"></span>
          <span class="value"><strong>Home Assistant</strong></span>
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
