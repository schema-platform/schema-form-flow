import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const isProd = process.env.NODE_ENV === 'production'
const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: isProd ? '/schema-platform/micro/flow/' : '/',
  plugins: [
    vue(),
    qiankun('flow', { useDevMode: true }),
  ],
  resolve: {
    alias: { '@': resolve(rootDir, 'src') },
  },
  server: {
    port: 5200,
    strictPort: true,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: {
      '/schema-platform/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/schema-platform\/api/, '/api'),
      },
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/ws': { target: 'http://localhost:3001', changeOrigin: true, ws: true },
    },
  },
})
