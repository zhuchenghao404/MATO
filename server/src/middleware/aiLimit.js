const pool = require('../db')

const DAILY_LIMIT = 10
let tableReady = false

/** 初始化 ai_usage 表 */
async function ensureTable() {
  if (tableReady) return
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_ip VARCHAR(45) NOT NULL,
      usage_date DATE NOT NULL,
      count INT NOT NULL DEFAULT 0,
      UNIQUE KEY uk_ip_date (user_ip, usage_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  tableReady = true
}

/** AI 每日限额中间件 — 按 IP 限制，未登录用户也适用 */
async function aiLimit(req, res, next) {
  try {
    await ensureTable()

    const ip = req.ip || req.connection.remoteAddress || '0.0.0.0'
    const today = new Date().toISOString().slice(0, 10)

    // 查询今日使用次数
    const [rows] = await pool.execute(
      'SELECT count FROM ai_usage WHERE user_ip = ? AND usage_date = ?',
      [ip, today]
    )

    const current = rows.length > 0 ? rows[0].count : 0

    if (current >= DAILY_LIMIT) {
      return res.status(429).json({
        code: 429,
        msg: `今日 AI 次数已用完（${DAILY_LIMIT}/${DAILY_LIMIT}），请明天再试`,
      })
    }

    // 更新计数
    if (rows.length > 0) {
      await pool.execute(
        'UPDATE ai_usage SET count = count + 1 WHERE user_ip = ? AND usage_date = ?',
        [ip, today]
      )
    } else {
      await pool.execute(
        'INSERT INTO ai_usage (user_ip, usage_date, count) VALUES (?, ?, 1)',
        [ip, today]
      )
    }

    // 把剩余次数挂到 req 上，后续路由可返回给前端
    req.aiRemaining = DAILY_LIMIT - current - 1

    next()
  } catch (err) {
    console.error('[aiLimit]', err)
    // 出错时放行（不阻塞用户）
    next()
  }
}

module.exports = aiLimit
