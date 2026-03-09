/**
 * 组件配置文件
 * 类似于 vue 路由配置，name 值全局不可以重复
 */

// 导入组件对象（只在浏览器环境使用）
import { PVEStatusWidget } from '../src/components/widgets/PVEStatusWidget.js';
import { PVEStatusWidgetPage } from '../src/components/pages/PVEStatusPage.js';

export default {
  // =======================
  // 页面注册
  // =======================
  pages: {
    'pve-status-config': {
      // 组件对象（直接引用）
      component: PVEStatusWidgetPage,
    },
  },

  // =======================
  // 小部件（卡片）注册
  // =======================
  widgets: {
    'pve-status-widget': {
      // 组件对象（直接引用）widgetId
      component: PVEStatusWidget,
      configComponentName: 'pve-status-config',
      size: ['1x2', '2x2'],
    },
  },
};
