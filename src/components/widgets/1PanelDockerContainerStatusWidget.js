
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_widget } from '../../utils/style';
import { md5 } from '../../utils/md5';

export class OnePanelDockerContainerStatusWidget extends SunPanelWidgetElement {
  static properties = {
    state: { type: Array },
  };

  constructor() {
    super();
    this.state = [];
  }
  onInitialized() {
    this.getContainers()
    var interval = this.spCtx.widgetInfo.config.interval;

    if (interval > 1) {
      setInterval(() => {
        this.getContainers();
      }, interval * 1000);
    }
  }

  onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    this.requestUpdate();
  }

  generateAuthHeaders(apiKey) {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const token = md5('1panel' + apiKey + timestamp);

    return {
      '1Panel-Token': token,
      '1Panel-Timestamp': timestamp
    };
  }

  async getContainers() {
    try {
      const host = this.spCtx.widgetInfo.config.host;
      const token = this.spCtx.widgetInfo.config.token;
      const containers = this.spCtx.widgetInfo.config.containers.split(",").map(x => x.trim());

      if (!host || !token || !containers) { return }

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: `${host}/api/v2/containers/list`,
          method: 'POST',
          headers: this.generateAuthHeaders(token)
        }
      });

      var data = response.data?.data;
      var list = data
        .filter(x => containers.indexOf(x.name) != -1)
        .sort((a, b) => containers.indexOf(a.name) - containers.indexOf(b.name))
      this.state = list;

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
          <span class="value"><strong>1Panel Contaienr</strong></span>
        </div>
    ${this.state?.map(item => {
      return html`
          <div class="info-item">
            <span class="label">${item.name}</span>
            <span class="value">${item.state}</span>
          </div>`
    })}
      </div>
    `;
  }

  static styles = style_widget;
}
