import { PVEStatusWidget } from '../src/components/widgets/PVEStatusWidget.js';
import { PVEStatusWidgetPage as PVEStatusPage } from '../src/components/pages/PVEStatusPage.js';

import { Aria2StatusWidget } from '../src/components/widgets/Aria2StatusWidget.js';
import { Aria2StatusWidgetPage as Aria2StatusPage } from '../src/components/pages/Aria2StatusPage.js';

import { HomeAssistantWidget } from '../src/components/widgets/HomeAssistantWidget.js';
import { HomeAssistantPage } from '../src/components/pages/HomeAssistantPage.js';

export default {
  // =======================
  // 页面注册
  // =======================
  pages: {
    'pve-status-config': {
      component: PVEStatusPage,
    },
    'aria2-status-config': {
      component: Aria2StatusPage,
    },
    'home-assistant-config': {
      component: HomeAssistantPage,
    },
  },

  widgets: {
    'pve-status-widget': {
      component: PVEStatusWidget,
      configComponentName: 'pve-status-config',
      size: ['2x2'],
    },
    'aria2-status-widget': {
      component: Aria2StatusWidget,
      configComponentName: 'aria2-status-config',
      size: ['2x2'],
    },
    'home-assistant-widget': {
      component: HomeAssistantWidget,
      configComponentName: 'home-assistant-config',
      size: ['2x2'],
    },
  },
};
