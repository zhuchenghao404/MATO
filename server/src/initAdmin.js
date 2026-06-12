/**
 * 数据库初始化 —— 确保 admin 用户存在
 * 在 app.js 启动时自动执行
 */
const bcrypt = require('bcryptjs')
const pool = require('./db')

async function initAdmin() {
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin'])
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10)
      await pool.query(
        'INSERT INTO users (username, password, email, gender, exp, level, status) VALUES (?, ?, ?, ?, 0, 1, 1)',
        ['admin', hashedPassword, 'admin@mato.com', 'male']
      )
      console.log('[Init] 管理员账号已创建: admin / admin')
    } else {
      console.log('[Init] 管理员账号已存在')
    }
  } catch (err) {
    console.error('[Init] 管理员初始化失败:', err.message)
  }
}

module.exports = initAdmin
