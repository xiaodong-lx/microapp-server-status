
import { SunPanelWidgetElement, VERSION } from '@sun-panel/micro-app';
import { html, css } from 'lit';

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
      if (progress != -1) {
        return html`
        <div class="progress-bar">
          <div class="progress-bar-line" style="max-width: ${progress * 100}%"></div>
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
