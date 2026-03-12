
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_widget } from '../../utils/style';

export class PVEStatusWidget extends SunPanelWidgetElement {
  static properties = {
    name: { type: String },
    type: { type: String },
    loadavg: { type: String },
    cpu: { type: String },
    cpu_percent: { type: String },
    mem: { type: String },
    mem_percent: { type: String },
    uptime: { type: String },
    status: { type: String },
  };

  constructor() {
    super();
    this.name = '-';
    this.loadavg = '-';
    this.cpu = '-';
    this.cpu_percent = '0';
    this.mem = '-';
    this.mem_percent = '0';
    this.uptime = '-';
    this.status = '-';
  }
  onInitialized() {
    this.getServerStatus()
    var interval = this.spCtx.widgetInfo.config.interval;

    if (interval > 1) {
      setInterval(() => {
        this.getServerStatus();
      }, interval * 1000);
    }
  }

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

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600) % 24;
    const minutes = Math.floor(seconds / 60) % 60;

    return `${days}d ${hours}h ${minutes}m`;
  }

  async getServerStatus() {
    try {
      const host = this.spCtx.widgetInfo.config.host;
      const token = this.spCtx.widgetInfo.config.token;
      const node = this.spCtx.widgetInfo.config.node;
      const qemuid = this.spCtx.widgetInfo.config.qemuid;
      const lxcid = this.spCtx.widgetInfo.config.lxcid;

      if (!host || !token || !node) { return }

      var targetUrl = `${host}/api2/json/nodes/${node}/status`;
      this.type = "node";
      if (qemuid) {
        targetUrl = `${host}/api2/json/nodes/${node}/qemu/${qemuid}/status/current`
        this.type = "qemu";
      } else if (lxcid) {
        targetUrl = `${host}/api2/json/nodes/${node}/lxc/${lxcid}/status/current`
        this.type = "lxc";
      }

      const response = await this.spCtx.api.network.request({
        request: {
          targetUrl: targetUrl,
          method: 'GET',
          headers: {
            "Authorization": `PVEAPIToken ${token}`
          }
        }
      });

      var data = response.data?.data;
      if (this.type == "node") {
        this.name = node;
        this.loadavg = data.loadavg.join(", ");
        this.cpu = Math.round(data.cpu * 100, 0) + "%";
        this.cpu_percent = Math.round(data.cpu * 100, 0);
        this.mem = `${this.formatBytes(data.memory.used, 1)}/${this.formatBytes(data.memory.total, 1)}`;
        this.mem_percent = parseFloat(data.memory.used) / parseFloat(data.memory.total) * 100;
        this.uptime = this.formatUptime(data.uptime);
      } else if (this.type == "qemu" || this.type == "lxc") {
        this.name = `${data.name} (${data.vmid})`;
        this.cpu = Math.round(data.cpu * 100, 0) + "%";
        this.cpu_percent = Math.round(data.cpu * 100, 0);
        this.mem = `${this.formatBytes(data.mem, 1)}/${this.formatBytes(data.maxmem, 1)}`;
        this.mem_percent = parseFloat(data.mem) / parseFloat(data.maxmem) * 100;
        this.uptime = this.formatUptime(data.uptime);
        this.status = data.status;
      }

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
          <span class="value"><strong>Proxmox VE</strong></span>
        </div>
        <div class="info-item">
          <span class="label">Name</span>
          <span class="value">${this.name}</span>
        </div>
        ${this.type == "qemu" || this.type == "lxc" ? html`
        <div class="info-item">
          <span class="label">Status</span>
          <span class="value">${this.status}</span>
        </div>` : ""}
        ${this.type == "node" ? html`
        <div class="info-item">
          <span class="label">Loadavg</span>
          <span class="value">${this.loadavg}</span>
        </div>` : ""}
        <div class="info-item">
          <span class="label">CPU</span>
          <span class="value">${this.cpu}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-line" style="max-width: ${this.cpu_percent}%"></div>
        </div>
        <div class="info-item">
          <span class="label">RAM</span>
          <span class="value">${this.mem}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-line" style="max-width: ${this.mem_percent}%"></div>
        </div>
        <div class="info-item">
          <span class="label">Uptime</span>
          <span class="value">${this.uptime}</span>
        </div>
      </div>
    `;
  }

  static styles = style_widget;
}
