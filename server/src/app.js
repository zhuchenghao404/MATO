const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const quizRoutes = require('./routes/quiz')
const emailRoutes = require('./routes/email')

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

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在' })
})

// 全局错误处理
app.use((err, req, res, _next) => {
  console.error('[Error]', err)
  res.status(500).json({ code: 500, msg: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`\n  MATO Server 已启动 → http://localhost:${PORT}`)
  console.log(`  健康检查 → http://localhost:${PORT}/api/health\n`)
})