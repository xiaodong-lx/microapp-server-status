
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { style_widget, renderNotReady, renderData } from '../../utils/style';
import { INTERVAL_MIN } from '../../utils/const';
import { formatBytes, formatUptime } from '../../utils/function';

export class PVEStatusWidget extends SunPanelWidgetElement {
  static properties = {
    data: { type: Array },
  };

  _title = "Proxmox VE";
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
      const node = this.spCtx.widgetInfo.config.node;
      const qemuid = this.spCtx.widgetInfo.config.qemuid;
      const lxcid = this.spCtx.widgetInfo.config.lxcid;

      if (!host || !node) { this._ready = -1; return }

      var targetUrl = `${host}/api2/json/nodes/${node}/status`;
      var type = "node";
      var type_name = "节点";
      if (qemuid) {
        targetUrl = `${host}/api2/json/nodes/${node}/qemu/${qemuid}/status/current`
        type = "vm";
        type_name = "虚拟机"
      } else if (lxcid) {
        targetUrl = `${host}/api2/json/nodes/${node}/lxc/${lxcid}/status/current`
        type = "lxc";
        type_name = "容器";
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

      var resp = response.data;

      if (type == "node") {
        this.data = [
          { type: "key-value", key: "节点", value: node },
          { type: "key-value", key: "负载", value: Math.round(resp?.data.cpu * 100, 0) + "%" },
          { type: "key-value", key: "CPU", value: Math.round(resp?.data.cpu * 100, 0) + "%" },
          { type: "progress-bar", value: resp?.data.cpu },
          { type: "key-value", key: "内存", value: `${formatBytes(resp?.data.memory.used, 1)}/${formatBytes(resp?.data.memory.total, 1)}` },
          { type: "progress-bar", value: parseFloat(resp?.data.memory.used) / parseFloat(resp?.data.memory.total) },
          { type: "key-value", key: "运行时间", value: formatUptime(resp?.data.uptime) },
        ]
      } else if (type == "vm" || type == "lxc") {
        this.data = [
          { type: "key-value", key: type_name, value: `${resp?.data.name} (${resp?.data.vmid})` },
          { type: "key-value", key: "状态", value: resp?.data.status },
          { type: "key-value", key: "CPU", value: Math.round(resp?.data.cpu * 100, 0) + "%" },
          { type: "progress-bar", value: resp?.data.cpu },
          { type: "key-value", key: "内存", value: `${formatBytes(resp?.data.mem, 1)}/${formatBytes(resp?.data.maxmem, 1)}` },
          { type: "progress-bar", value: parseFloat(resp?.data.mem) / parseFloat(resp?.data.maxmem) },
          { type: "key-value", key: "运行时间", value: formatUptime(resp?.data.uptime) },
        ]
      }

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
