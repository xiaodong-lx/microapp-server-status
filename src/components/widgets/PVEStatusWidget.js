
import { SunPanelWidgetElement, VERSION } from '@sun-panel/micro-app';
import { html, css } from 'lit';
import { getAssetPath } from '../../utils/assetPath.js';

export class PVEStatusWidget extends SunPanelWidgetElement {
  static properties = {
    loadavg: { type: String },
    cpu: { type: String },
    mem: { type: String },
  };


  constructor() {
    super();
    this.loadavg = '-';
    this.cpu = '-';
    this.mem = '-';
  }
  /**
   * 组件初始化完成后调用
   * @returns {void}
   */
  onInitialized() {
    this.getPVEStatus()
    setInterval(() => {
      this.getPVEStatus()
    }, 2000);
  }

  getAssetPath(relativePath) {
    console.log('[getAssetPath] Called with:', { relativePath, staticPath: this.spCtx.staticPath });
    return getAssetPath(relativePath, this.spCtx.staticPath);
  }

  /**
   * 小部件信息变化时的回调函数
   * @param {WidgetInfo} newWidgetInfo - 新的小部件信息
   * @param {WidgetInfo} oldWidgetInfo - 旧的小部件信息
   */
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

  async getPVEStatus() {
    try {
      const host = this.spCtx.widgetInfo.config.host;
      const token = this.spCtx.widgetInfo.config.token;
      const node = this.spCtx.widgetInfo.config.node;
      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: `${host}/api2/json/nodes/${node}/status`,
          method: 'GET',
          headers: {
            "Authorization": `PVEAPIToken ${token}`
          }
        }
      });

      var data = response.data?.data;
      this.loadavg = data.loadavg.join(", ");
      this.cpu = Math.round(data.cpu * 100, 0) + "%";
      this.mem = `${this.formatBytes(data.memory.used, 1)}/${this.formatBytes(data.memory.total, 1)}`;

    } catch (error) {
      switch (error.type) {
        case 'microApp':
          // 微应用错误（权限不足等）
          break;
        case 'targetUrl':
          // 目标站点返回的错误
          break;
        default:
          console.error(error);
      }
    }
  }


  // ===================
  // 各个尺寸的局部渲染方法
  // ===================

  renderDefault(data) {
    return html`
      <div class="info-item">
        <span class="label">Loadavg</span>
        <span class="value">${this.loadavg}</span>
      </div>
      <div class="info-item">
        <span class="label">CPU</span>
        <span class="value">${this.cpu}</span>
      </div>
      <div class="info-item">
        <span class="label">Mem</span>
        <span class="value">${this.mem}</span>
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        ${this.renderDefault()}
      </div>
    `;
  }


  // 定义样式
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
    
    .container[dark] { background: #333; }
    .container[dark] .title { color: #fff; }
    .container[dark] .value { color: #eee; }
    .container[dark] .label { color: #aaa; }
    .container[dark] .info-item { background: rgba(255,255,255,0.1); }
    .container[dark] .static-path { background: rgba(255,255,255,0.1); }
    .container[dark] .info-btn { background: rgba(255,255,255,0.1); color: #ccc; }
    .container[dark] .info-panel { background: rgba(30,30,30,0.98); color: #ccc; }
    .container[dark] .log-item { color: #777; }
    .container[dark] .mini-info div { color: #eee; }
  `;
}


