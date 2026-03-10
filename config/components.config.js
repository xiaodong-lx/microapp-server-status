import { PVEStatusWidget } from '../src/components/widgets/PVEStatusWidget.js';
import { PVEStatusWidgetPage } from '../src/components/pages/PVEStatusPage.js';

export default {
  // =======================
  // 页面注册
  // =======================
  pages: {
    'pve-status-config': {
      component: PVEStatusWidgetPage,
    },
  },

  widgets: {
    'pve-status-widget': {
      component: PVEStatusWidget,
      configComponentName: 'pve-status-config',
      size: ['2x2'],
    },
  },
};
