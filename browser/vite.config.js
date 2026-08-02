import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import fs from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 图片压缩插件
function imageCompressPlugin() {
  let outDir
  return {
    name: 'image-compress',
    configResolved(config) {
      outDir = config.build.outDir
    },
    async writeBundle() {
      // 压缩 dist/assets 中的图片
      const assetsDir = path.join(outDir, 'assets')
      let saved = 0
      try {
        const files = await fs.readdir(assetsDir)
        for (const f of files) {
          if (/\.(png|jpe?g)$/i.test(f)) {
            const fp = path.join(assetsDir, f)
            const input = await fs.readFile(fp)
            const compressed = await sharp(input)
              .png({ quality: 80, compressionLevel: 9 })
              .toBuffer()
            if (compressed.length < input.length) {
              await fs.writeFile(fp, compressed)
              saved += input.length - compressed.length
            }
          }
        }
      } catch (_) {}
      // 压缩 dist 根目录的图片（如 public/favicon.png）
      try {
        const rootFiles = await fs.readdir(outDir)
        for (const f of rootFiles) {
          if (/\.(png|jpe?g)$/i.test(f)) {
            const fp = path.join(outDir, f)
            const input = await fs.readFile(fp)
            const compressed = await sharp(input)
              .png({ quality: 80, compressionLevel: 9 })
              .toBuffer()
            if (compressed.length < input.length) {
              await fs.writeFile(fp, compressed)
              saved += input.length - compressed.length
            }
          }
        }
      } catch (_) {}
      if (saved > 0) {
        console.log(`[image-compress] 图片压缩节省 ${(saved / 1024).toFixed(0)} KB`)
      }
    },
  }
}

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
      '.trycloudflare.com',
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
    imageCompressPlugin(),
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
