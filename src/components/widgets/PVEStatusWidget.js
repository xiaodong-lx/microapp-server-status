
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { html } from 'lit';
import { style_widget, renderNotReady } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';
import { formatBytes, formatUptime } from '../../utils/function';

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

  _title = "Proxmox VE";
  _ready = -1;

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

    if (interval >= INTERVAL_MIN) {
      setInterval(() => {
        this.getServerStatus();
      }, interval * 1000);
    }
  }

  onDisconnected() {
    if (this.spCtx.widgetInfo.widgetId) {
      this.spCtx.api.dataNode.user.delByKey("widgetConfig", this.spCtx.widgetInfo.widgetId + "_token");
    }
  }

  onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    this.requestUpdate();
  }

  async getServerStatus() {
    this._ready = 0;

    try {
      const host = this.spCtx.widgetInfo.config.host;
      const node = this.spCtx.widgetInfo.config.node;
      const qemuid = this.spCtx.widgetInfo.config.qemuid;
      const lxcid = this.spCtx.widgetInfo.config.lxcid;

      if (!host || !node) { this._ready = -1; return }

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
            "Authorization": "PVEAPIToken {{token}}"
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

      var data = response.data?.data;

      this._ready = 1;

      if (this.type == "node") {
        this.name = node;
        this.loadavg = data.loadavg.join(", ");
        this.cpu = Math.round(data.cpu * 100, 0) + "%";
        this.cpu_percent = Math.round(data.cpu * 100, 0);
        this.mem = `${formatBytes(data.memory.used, 1)}/${formatBytes(data.memory.total, 1)}`;
        this.mem_percent = parseFloat(data.memory.used) / parseFloat(data.memory.total) * 100;
        this.uptime = formatUptime(data.uptime);
      } else if (this.type == "qemu" || this.type == "lxc") {
        this.name = `${data.name} (${data.vmid})`;
        this.cpu = Math.round(data.cpu * 100, 0) + "%";
        this.cpu_percent = Math.round(data.cpu * 100, 0);
        this.mem = `${formatBytes(data.mem, 1)}/${formatBytes(data.maxmem, 1)}`;
        this.mem_percent = parseFloat(data.mem) / parseFloat(data.maxmem) * 100;
        this.uptime = formatUptime(data.uptime);
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
    if (this._ready == -1) {
      return renderNotReady(this._title)
    }

    return html`
      <div class="container">
        <div class="info-item">
          <span class="label"></span>
          <span class="value"><strong>${this._title}</strong></span>
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
