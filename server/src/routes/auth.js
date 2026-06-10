const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const sendCode = require('../utils/email')
const { signToken } = require('../middleware/auth')

const router = express.Router()

/** 内存验证码存储（生产环境应改用 Redis） */
const codeMap = new Map()

/** 发送邮箱验证码 */
router.post('/send-code', async (req, res) => {
  try {
    const { email, type } = req.body
    if (!email) return res.json({ code: 400, msg: '邮箱不能为空' })

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    const emailExists = rows.length > 0

    if (type === 'reset') {
      // 重置密码：邮箱必须已注册
      if (!emailExists) {
        return res.json({ code: 400, msg: '该邮箱未注册' })
      }
    } else {
      // 注册：邮箱不能已注册
      if (emailExists) {
        return res.json({ code: 400, msg: '该邮箱已被注册' })
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    codeMap.set(email, { code, expire: Date.now() + 5 * 60 * 1000, type: type || 'register' })

    await sendCode(email, code, type || 'register')
    res.json({ code: 200, msg: '验证码发送成功' })
  } catch (err) {
    console.error('[send-code]', err)
    res.status(500).json({ code: 500, msg: '验证码发送失败' })
  }
})

/** 注册 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, gender, email, code } = req.body

    if (!username || !password) {
      return res.json({ code: 400, msg: '用户名和密码不能为空' })
    }
    if (!email) {
      return res.json({ code: 400, msg: '邮箱不能为空' })
    }
    if (username.length < 2 || username.length > 20) {
      return res.json({ code: 400, msg: '用户名长度 2-20 个字符' })
    }
    if (password.length < 4 || password.length > 50) {
      return res.json({ code: 400, msg: '密码长度 4-50 个字符' })
    }

    // 验证邮箱验证码
    const stored = codeMap.get(email)
    if (!stored) {
      return res.json({ code: 400, msg: '请先获取验证码' })
    }
    if (stored.expire < Date.now()) {
      codeMap.delete(email)
      return res.json({ code: 400, msg: '验证码已过期，请重新获取' })
    }
    if (stored.code !== code) {
      return res.json({ code: 400, msg: '验证码错误' })
    }
    codeMap.delete(email)

    // 检查用户名是否已存在
    const [userRows] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (userRows.length > 0) {
      return res.json({ code: 400, msg: '用户名已被注册' })
    }

    // 检查邮箱是否已注册（双重保护）
    const [emailRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (emailRows.length > 0) {
      return res.json({ code: 400, msg: '该邮箱已被注册' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userGender = gender === 'female' ? 'female' : 'male'

    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, gender, exp, level) VALUES (?, ?, ?, ?, 0, 1)',
      [username, hashedPassword, email, userGender]
    )

    const userId = result.insertId
    const token = signToken({ id: userId, username })

    res.json({
      code: 200,
      msg: '注册成功',
      data: {
        id: userId,
        username,
        gender: userGender,
        email,
        avatar: null,
        exp: 0,
        level: 1,
        token,
      },
    })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 登录 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.json({ code: 400, msg: '用户名/邮箱和密码不能为空' })
    }

    // 支持用户名或邮箱登录
    const [rows] = await pool.query(
      'SELECT id, username, gender, avatar, email, bio, exp, level, password, status FROM users WHERE username = ? OR email = ?',
      [username, username]
    )
    if (rows.length === 0) {
      return res.json({ code: 400, msg: '用户名/邮箱或密码错误' })
    }

    const user = rows[0]
    if (user.status === 0) {
      return res.json({ code: 403, msg: '账号已被禁用' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({ code: 400, msg: '用户名/邮箱或密码错误' })
    }

    const token = signToken({ id: user.id, username: user.username })

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        gender: user.gender,
        avatar: user.avatar,
        email: user.email,
        bio: user.bio,
        exp: user.exp,
        level: user.level,
        token,
      },
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

module.exports = router
module.exports.codeMap = codeMap