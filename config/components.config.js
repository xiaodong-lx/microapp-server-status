import { PVEStatusWidget } from '../src/components/widgets/PVEStatusWidget.js';
import { PVEStatusPage } from '../src/components/pages/PVEStatusPage.js';

import { Aria2StatusWidget } from '../src/components/widgets/Aria2StatusWidget.js';
import { Aria2StatusPage } from '../src/components/pages/Aria2StatusPage.js';

import { HomeAssistantWidget } from '../src/components/widgets/HomeAssistantWidget.js';
import { HomeAssistantPage } from '../src/components/pages/HomeAssistantPage.js';

import { OnePanelDockerContainerStatusWidget } from '../src/components/widgets/1PanelDockerContainerStatusWidget.js';
import { OnePanelDockerContainerStatusPage } from '../src/components/pages/1PanelDockerContainerStatusPage.js';

import { SafeLineWAFStatusWidget } from '../src/components/widgets/SafeLineWAFStatusWidget.js';
import { SafeLineWAFStatusPage } from '../src/components/pages/SafeLineWAFStatusPage.js';


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
    '1panel-docker-container-config': {
      component: OnePanelDockerContainerStatusPage,
    },
    'safeline-waf-config': {
      component: SafeLineWAFStatusPage,
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
      size: ["2x2", "2x4", "1x2"],
    },
    '1panel-docker-container-widget': {
      component: OnePanelDockerContainerStatusWidget,
      configComponentName: '1panel-docker-container-config',
      size: ['2x2'],
    },
    'safeline-waf-widget': {
      component: SafeLineWAFStatusWidget,
      configComponentName: 'safeline-waf-config',
      size: ['2x2', '2x4'],
    },
  },
};
