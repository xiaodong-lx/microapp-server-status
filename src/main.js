/**
 * 微应用入口文件 - 此文件非特殊情况不需修改
 * 将所有组件打包成单个对象供主平台使用
 */

import componentsConfig from '../config/components.config.js';
import appConfig from '../config/app.config.js';
import { VERSION as SP_API_VERSION } from '@sun-panel/micro-app';


// 判断是否为开发环境
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

// 生成适用于当前环境的 microAppId
const getMicroAppId = (config, isDevelopment) => {
  return isDevelopment ? `${config.microAppId}-dev` : config.microAppId;
};

/**
 * 微应用包对象
 * 主平台通过此对象获取所有组件
 */
const microAppPackage = {
  // 应用配置（整体赋值 appConfig 对象）
  appConfig: {
    ...appConfig,
    apiVersion: SP_API_VERSION,
    // dev 模式下自动添加 -dev 后缀
    microAppId: getMicroAppId(appConfig, isDev),
    dev: isDev,
  },

  // 组件配置（对象形式，key为组件名）
  components: componentsConfig
};

// 默认导出
export default microAppPackage;