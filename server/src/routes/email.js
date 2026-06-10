const express = require('express')
const sendCode = require('../utils/email')

const router = express.Router()

/** 内存存储验证码（生产环境应改用 Redis） */
const codeMap = new Map()

/** 发送邮箱验证码 */
router.post('/send-code', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.json({ code: 400, msg: '邮箱不能为空' })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  codeMap.set(email, {
    code,
    expire: Date.now() + 5 * 60 * 1000, // 5 分钟有效
  })

  try {
    await sendCode(email, code)
    res.json({ code: 200, msg: '验证码发送成功' })
  } catch (err) {
    console.error('[send-code]', err)
    res.status(500).json({ code: 500, msg: '验证码发送失败' })
  }
})

/** 验证验证码 */
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.json({ code: 400, msg: '参数不完整' })
  }

  const stored = codeMap.get(email)
  if (!stored) {
    return res.json({ code: 400, msg: '请先发送验证码' })
  }
  if (stored.expire < Date.now()) {
    codeMap.delete(email)
    return res.json({ code: 400, msg: '验证码已过期' })
  }
  if (stored.code !== code) {
    return res.json({ code: 400, msg: '验证码错误' })
  }

  // 验证通过后清除
  codeMap.delete(email)
  res.json({ code: 200, msg: '验证成功' })
})

module.exports = router