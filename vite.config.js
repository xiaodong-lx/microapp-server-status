/**
 * Vite 配置文件
 */

import { defineConfig } from 'vite';

/**
 * 判断是否为开发环境
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Vite 配置
 */
export default defineConfig(async () => {
  // 构建前钩子 - 生成配置文件
  if (!isDev) {
    console.log('📋 生成配置文件...');
    const { spawn } = await import('child_process');
    await new Promise((resolve, reject) => {
      const buildProcess = spawn('node', ['build/build.js'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`构建脚本退出码: ${code}`));
        }
      });
    });
  }

  return {
    root: '.',
    publicDir: 'public',

    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
      },
      allowedHosts: ["0.0.0.0"]
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'esbuild',
      sourcemap: isDev,
      lib: {
        entry: 'src/main.js',
        name: 'MicroApp',
        formats: ['es'],
        fileName: () => 'main.js'
      },
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
        }
      }
    },

    optimizeDeps: {
      exclude: []
    }
  };
});
