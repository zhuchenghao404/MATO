const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const quizRoutes = require('./routes/quiz')
const emailRoutes = require('./routes/email')
const worksRoutes = require('./routes/works')
const aiRoutes = require('./routes/ai')
const adminRoutes = require('./routes/admin')
const socialRoutes = require('./routes/social')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/works', worksRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/social', socialRoutes)

// 等级配置（挂到 /api 下，前端直接调 /api/level-configs）
const pool = require('./db')
app.get('/api/level-configs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT level, exp_required FROM level_configs ORDER BY level')
    res.json({ code: 200, data: rows })
  } catch (err) {
    console.error('[level-configs]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, msg: 'MATO Server is running' })
})

// 生产模式：托管前端静态文件
const frontendDist = path.resolve(__dirname, '..', '..', 'browser', 'dist')
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs')
  const indexPath = path.join(frontendDist, 'index.html')
  
  app.use((req, res, next) => {
    // 跳过 API 路由
    if (req.path.startsWith('/api/')) return next()
    
    // 尝试匹配静态文件
    const filePath = path.join(frontendDist, req.path)
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        // 根据扩展名设置 Content-Type
        const ext = path.extname(req.path).toLowerCase()
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
        return res.send(data)
      }
      // 静态文件没找到 → SPA fallback 返回 index.html
      fs.readFile(indexPath, (e, html) => {
        if (e) return res.status(500).send('前端未构建，请执行 npm run build')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.send(html)
      })
    })
  })
  console.log('[Static] 静态文件服务已启用:', frontendDist)
} else {
  // 开发模式 404
  app.use((req, res) => {
    res.status(404).json({ code: 404, msg: '接口不存在' })
  })
}

// 全局错误处理
app.use((err, req, res, _next) => {
  console.error('[Error]', err)
  res.status(500).json({ code: 500, msg: '服务器内部错误' })
})

const initDB = require('./initDB')

// 启动服务器
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  MATO Server 已启动 → http://localhost:${PORT}`)
    console.log(`  健康检查 → http://localhost:${PORT}/api/health\n`)
  })
})