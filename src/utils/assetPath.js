/**
 * 获取静态资源的正确路径
 * 开发模式：使用 Vite 开发服务器的完整地址（包含主机和端口）
 * 生产模式：使用 spCtx.staticPath 拼接路径（由主平台传入）
 *
 * @param {string} relativePath - 相对于 public 目录的路径，如 'weather/tianqi-qing.png' 或 '/sun-panel-logo.png'
 * @param {string} staticPath - Sun Panel 上下文对象，包含 staticPath
 * @returns {string} 完整的资源路径
 */
export function getAssetPath(relativePath, staticPath) {
  // 移除路径开头的斜杠，确保是相对于 public 目录的路径
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

  const isDev = import.meta.env.DEV;

  if (isDev) {
    // 开发模式：使用 Vite 开发服务器的完整地址（包含主机和端口）
    const baseUrl = import.meta.url;
    // console.log('[getAssetPath] import.meta.url:', baseUrl);
    const assetUrl = new URL(`/${cleanPath}`, baseUrl).href;
    // console.log('[getAssetPath] Dev mode - Asset path:', { cleanPath, assetUrl });
    return assetUrl;
  } else {
    // 生产模式：使用主平台提供的 staticPath
    const prefix = staticPath.endsWith('/') ? staticPath : `${staticPath}/`;
    const assetUrl = `${prefix}${cleanPath}`;
    // console.log('[getAssetPath] Prod mode - Asset path:', { cleanPath, staticPath, assetUrl });
    return assetUrl;
  }
}
