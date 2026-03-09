/**
 * 微应用配置文件
 * 应用基础配置
 */

export default {
  // =======================
  // 应用基础信息
  // =======================
  // 作者标识
  author: 'xiaodong',
  // 应用唯一标识（作者标识-应用标识）
  microAppId: 'xiaodong-server-status',
  // 应用版本
  version: '1.0.0',
  // 入口文件
  entry: 'main.js',
  // 图标
  icon: 'logo.png',
  // 调试模式（正式发布请设置为false）
  debug: true,

  // 应用信息 国际化配置
  appInfo: {
    'en-US': {
      appName: 'Server Status',
      description: 'server status',
      networkDescription: 'connect to servers'
    }
  },

  // 权限配置
  permissions: [
    'network',
    'dataNode'
  ],

  // 网络域名白名单
  networkDomains: [
    "*"
  ],

  // 数据节点配置
  dataNodes: {
    config: {
      scope: 'user',
      isPublic: false
    }
  }
};
