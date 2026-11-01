import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // 打包路径拼接CDN地址前缀
  base: command === 'build' ? '//cdn.pintree.com.cn/oss/schulte-grid/' : '/',

  server: {
    port: Number(process.env.DEPLOY_RUN_PORT) || 5188,
    host: '0.0.0.0',
  },
  preview: {
    port: Number(process.env.DEPLOY_RUN_PORT) || 5166,
    host: '0.0.0.0',
  },
  build: {
    target: 'es2017',
    outDir: 'dist',
    sourcemap: true,
  },
}));