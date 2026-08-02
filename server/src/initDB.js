/**
 * 数据库初始化 —— 建表 + 初始数据
 * 在 app.js 启动时自动执行
 */
const bcrypt = require('bcryptjs')
const pool = require('./db')

async function initDB() {
  try {
    // ===== 创建所有需要的表（IF NOT EXISTS） =====

    // 🆕 用户表（核心）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) DEFAULT '',
        gender ENUM('male','female') DEFAULT 'male',
        avatar VARCHAR(255) DEFAULT NULL,
        bio VARCHAR(100) DEFAULT '',
        exp INT NOT NULL DEFAULT 0,
        level INT NOT NULL DEFAULT 1,
        status TINYINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    // 兼容：如果 password 列太短（之前手动建表可能设了 VARCHAR(60)以下），扩为 255
    try {
      await pool.query('ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL')
    } catch (_) { /* 已正确则忽略 */ }

    // 🆕 签到日志表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sign_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sign_date DATE NOT NULL,
        exp_reward INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 🆕 经验日志表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exp_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT '',
        exp INT NOT NULL DEFAULT 0,
        remark VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS level_configs (
        level INT PRIMARY KEY,
        exp_required INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS work_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        work_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS work_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        work_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_work (user_id, work_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS work_collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        work_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_work (user_id, work_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        work_id INT NOT NULL,
        content TEXT NOT NULL,
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_ip VARCHAR(45) NOT NULL,
        usage_date DATE NOT NULL,
        count INT NOT NULL DEFAULT 0,
        UNIQUE KEY uk_ip_date (user_ip, usage_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        skill VARCHAR(50) NOT NULL DEFAULT '',
        answer TEXT,
        is_correct TINYINT NOT NULL DEFAULT 0,
        exp_reward INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_question_skill (user_id, question_id, skill)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    // 兼容已有表：如果缺少 skill 列则添加
    try {
      await pool.query('ALTER TABLE question_records ADD COLUMN skill VARCHAR(50) NOT NULL DEFAULT \'\'')
      console.log('[InitDB] question_records 已添加 skill 列')
    } catch (_) { /* 列已存在则忽略 */ }

    // 🆕 关注表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        followee_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_follower_followee (follower_id, followee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 🆕 私信表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_user_id INT NOT NULL,
        to_user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read TINYINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_from_to (from_user_id, to_user_id),
        INDEX idx_to_from (to_user_id, from_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('[InitDB] 数据表检查完成')

    // ===== 初始化等级配置 =====
    const [levelRows] = await pool.query('SELECT COUNT(*) as cnt FROM level_configs')
    if (levelRows[0].cnt === 0) {
      const levels = [
        [1, 0], [2, 100], [3, 300], [4, 600], [5, 1000],
        [6, 1500], [7, 2100], [8, 2800], [9, 3600], [10, 4500],
        [11, 5500], [12, 6600], [13, 7800], [14, 9100], [15, 10500],
      ]
      for (const [lv, exp] of levels) {
        await pool.query('INSERT INTO level_configs (level, exp_required) VALUES (?, ?)', [lv, exp])
      }
      console.log('[InitDB] 等级配置已初始化')
    }

    // ===== 初始化管理员 =====
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin'])
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10)
      await pool.query(
        'INSERT INTO users (username, password, email, gender, exp, level, status) VALUES (?, ?, ?, ?, 0, 1, 1)',
        ['admin', hashedPassword, 'admin@mato.com', 'male']
      )
      console.log('[InitDB] 管理员账号已创建: admin / admin')
    } else {
      console.log('[InitDB] 管理员账号已存在')
    }
  } catch (err) {
    console.error('[InitDB] 初始化失败:', err.message)
  }
}

module.exports = initDB
