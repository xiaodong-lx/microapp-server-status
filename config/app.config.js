export default {
  author: 'xiaodong',
  microAppId: 'xiaodong-server-status',
  version: '1.0.5',
  entry: 'main.js',
  icon: 'logo.png',
  debug: false,
  appInfo: {
    'zh-CN': {
      appName: 'Server Status',
      description: '获取多种服务器状态',
      networkDescription: '连接到服务器'
    },
    'en-US': {
      appName: 'Server Status',
      description: 'get servers status',
      networkDescription: 'connect to servers'
    }
  },
  permissions: [
    'network',
    'dataNode'
  ],
  networkDomains: [
    "*"
  ],
  dataNodes: {
    widgetConfig: {
      scope: 'user',
      isPublic: false
    }
  }
};
