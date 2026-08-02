const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// ===== 文件上传配置 =====
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 png/jpg/jpeg/gif/webp 格式'))
    }
  },
})

// ===== 工具函数 =====

/** 获取等级经验配置 */
async function getLevelConfig() {
  const [rows] = await pool.query('SELECT level, exp_required FROM level_configs ORDER BY level')
  return rows
}

/** 根据经验计算等级 */
function calcLevel(exp, levelConfig) {
  let lv = 1
  for (const cfg of levelConfig) {
    if (exp >= cfg.exp_required) {
      lv = cfg.level
    } else {
      break
    }
  }
  return lv
}

// ===== 公开接口 =====

/** 获取等级配置 */
router.get('/level-configs', async (req, res) => {
  try {
    const rows = await getLevelConfig()
    res.json({ code: 200, data: rows })
  } catch (err) {
    console.error('[level-configs]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ===== 需要认证的接口 =====

/** 获取当前用户信息 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, gender, avatar, bio, exp, level, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) {
      return res.json({ code: 404, msg: '用户不存在' })
    }

    const user = rows[0]
    const levelConfig = await getLevelConfig()

    // 当前等级经验区间
    const currentLevelCfg = levelConfig.find(c => c.level === user.level)
    const nextLevelCfg = levelConfig.find(c => c.level === user.level + 1)
    const expInLevel = user.exp - (currentLevelCfg?.exp_required || 0)
    const expMax = nextLevelCfg
      ? nextLevelCfg.exp_required - (currentLevelCfg?.exp_required || 0)
      : 0

    res.json({
      code: 200,
      data: {
        ...user,
        expInLevel,
        expMax,
      },
    })
  } catch (err) {
    console.error('[profile]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 获取指定用户信息（公开信息） */
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const [rows] = await pool.query(
      'SELECT id, username, gender, avatar, bio, exp, level FROM users WHERE id = ?',
      [userId]
    )
    if (rows.length === 0) {
      return res.json({ code: 404, msg: '用户不存在' })
    }

    const user = rows[0]
    const levelConfig = await getLevelConfig()

    const currentLevelCfg = levelConfig.find(c => c.level === user.level)
    const nextLevelCfg = levelConfig.find(c => c.level === user.level + 1)
    const expInLevel = user.exp - (currentLevelCfg?.exp_required || 0)
    const expMax = nextLevelCfg
      ? nextLevelCfg.exp_required - (currentLevelCfg?.exp_required || 0)
      : 0

    res.json({
      code: 200,
      data: {
        ...user,
        expInLevel,
        expMax,
      },
    })
  } catch (err) {
    console.error('[profile/:userId]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 更新个人资料 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, gender, bio } = req.body
    const updates = []
    const values = []

    if (username !== undefined) {
      if (username.length < 2 || username.length > 20) {
        return res.json({ code: 400, msg: '用户名长度 2-20 个字符' })
      }
      // 检查用户名是否已被其他人占用
      const [dup] = await pool.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.user.id]
      )
      if (dup.length > 0) {
        return res.json({ code: 400, msg: '用户名已被占用' })
      }
      updates.push('username = ?')
      values.push(username)
    }

    if (gender !== undefined) {
      if (!['male', 'female'].includes(gender)) {
        return res.json({ code: 400, msg: '性别参数无效' })
      }
      updates.push('gender = ?')
      values.push(gender)
    }

    if (bio !== undefined) {
      if (bio.length > 100) {
        return res.json({ code: 400, msg: '简介最长100个字符' })
      }
      updates.push('bio = ?')
      values.push(bio)
    }

    if (updates.length === 0) {
      return res.json({ code: 400, msg: '没有需要更新的内容' })
    }

    values.push(req.user.id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

    res.json({ code: 200, msg: '更新成功' })
  } catch (err) {
    console.error('[profile/update]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 上传头像 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, msg: '请选择头像文件' })
    }

    const avatarUrl = `/uploads/${req.file.filename}`

    // 删除旧头像文件（跳过默认头像）
    const [rows] = await pool.query('SELECT avatar FROM users WHERE id = ?', [req.user.id])
    if (rows.length > 0 && rows[0].avatar) {
      const oldPath = path.join(uploadsDir, path.basename(rows[0].avatar))
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id])

    res.json({
      code: 200,
      msg: '头像上传成功',
      data: { avatar: avatarUrl },
    })
  } catch (err) {
    console.error('[avatar]', err)
    res.status(500).json({ code: 500, msg: '上传失败' })
  }
})

/** 每日签到 */
router.post('/sign-in', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const today = new Date().toISOString().slice(0, 10)

    // 检查今天是否已签到
    const [existing] = await conn.query(
      'SELECT id, exp_reward FROM sign_logs WHERE user_id = ? AND sign_date = ?',
      [req.user.id, today]
    )

    if (existing.length > 0) {
      conn.release()
      return res.json({ code: 400, msg: '今日已签到' })
    }

    // 签到经验奖励
    const EXP_REWARD = 10

    await conn.beginTransaction()

    // 记录签到
    await conn.query(
      'INSERT INTO sign_logs (user_id, sign_date, exp_reward) VALUES (?, ?, ?)',
      [req.user.id, today, EXP_REWARD]
    )

    // 增加用户经验
    const [userRows] = await conn.query('SELECT exp, level FROM users WHERE id = ?', [req.user.id])
    const oldExp = userRows[0].exp
    const newExp = Math.min(oldExp + EXP_REWARD, 99999)

    const levelConfig = await getLevelConfig()
    const newLevel = calcLevel(newExp, levelConfig)

    await conn.query('UPDATE users SET exp = ?, level = ? WHERE id = ?', [newExp, newLevel, req.user.id])

    // 记录经验日志
    await conn.query(
      'INSERT INTO exp_logs (user_id, type, exp, remark) VALUES (?, ?, ?, ?)',
      [req.user.id, '签到', EXP_REWARD, `每日签到 +${EXP_REWARD}`]
    )

    await conn.commit()
    conn.release()

    res.json({
      code: 200,
      msg: `签到成功！+${EXP_REWARD} EXP`,
      data: {
        exp: newExp,
        level: newLevel,
        exp_reward: EXP_REWARD,
      },
    })
  } catch (err) {
    await conn.rollback()
    conn.release()
    console.error('[sign-in]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 增加经验 */
router.post('/exp/add', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { amount, type = '答题', remark = '' } = req.body
    if (!amount || amount <= 0) {
      conn.release()
      return res.json({ code: 400, msg: '经验值无效' })
    }

    // 查询当前用户
    const [userRows] = await conn.query('SELECT exp, level FROM users WHERE id = ?', [req.user.id])
    if (userRows.length === 0) {
      conn.release()
      return res.json({ code: 404, msg: '用户不存在' })
    }

    const oldExp = userRows[0].exp
    const newExp = Math.min(oldExp + amount, 99999)

    // 计算新等级
    const levelConfig = await getLevelConfig()
    const newLevel = calcLevel(newExp, levelConfig)

    await conn.beginTransaction()

    // 更新用户经验和等级
    await conn.query('UPDATE users SET exp = ?, level = ? WHERE id = ?', [newExp, newLevel, req.user.id])

    // 记录经验日志
    await conn.query(
      'INSERT INTO exp_logs (user_id, type, exp, remark) VALUES (?, ?, ?, ?)',
      [req.user.id, type, amount, remark]
    )

    await conn.commit()
    conn.release()

    const levelUp = newLevel > userRows[0].level

    res.json({
      code: 200,
      msg: levelUp ? `恭喜升级到 LV.${newLevel}！` : `经验 +${amount}`,
      data: {
        exp: newExp,
        level: newLevel,
        levelUp,
      },
    })
  } catch (err) {
    await conn.rollback()
    conn.release()
    console.error('[exp/add]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 重置密码（公开接口，不需要登录） */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, password } = req.body

    if (!email || !code || !password) {
      return res.json({ code: 400, msg: '邮箱、验证码和新密码不能为空' })
    }
    if (password.length < 8 || password.length > 20) {
      return res.json({ code: 400, msg: '密码长度 8-20 个字符' })
    }

    // 验证邮箱验证码（使用 auth 路由的 codeMap）
    const { codeMap } = require('./auth')
    const stored = codeMap.get(email)
    if (!stored) {
      return res.json({ code: 400, msg: '请先获取验证码' })
    }
    if (stored.type !== 'reset') {
      return res.json({ code: 400, msg: '验证码类型不匹配' })
    }
    if (stored.expire < Date.now()) {
      codeMap.delete(email)
      return res.json({ code: 400, msg: '验证码已过期，请重新获取' })
    }
    if (stored.code !== code) {
      return res.json({ code: 400, msg: '验证码错误' })
    }
    codeMap.delete(email)

    // 更新密码
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email])

    res.json({ code: 200, msg: '密码重置成功' })
  } catch (err) {
    console.error('[reset-password]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

module.exports = router
