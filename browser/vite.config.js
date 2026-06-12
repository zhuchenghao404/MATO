import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    allowedHosts: [
      'dry-poems-nail.loca.lt',
      '.loca.lt',
    ],
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: false,
    },
  },
  plugins: [
    vue(),
    {
      name: 'prevent-hmr-full-reload',
      configureServer(server) {
        server.ws.on('connection', () => {
          // 不再自动触发全量刷新
        })
      },
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: `
// 阻止 Vite HMR 重连/移动端切回时自动刷新页面
;(function() {
  var blockReload = false
  var blockTimer = null

  // 页面从后台切回前台时，短时间内标记阻止刷新
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      blockReload = true
      clearTimeout(blockTimer)
      blockTimer = setTimeout(function () { blockReload = false }, 5000)
    }
  })

  // 拦截 bfcache 恢复
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      blockReload = true
      clearTimeout(blockTimer)
      blockTimer = setTimeout(function () { blockReload = false }, 5000)
    }
  })
})()`
          }
        ]
      }
    }
  ],
}) 
