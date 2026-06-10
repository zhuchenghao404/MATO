const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

/** 提交答案（前端已判断对错，后端只记录） */
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { questionId, answer, isCorrect, expReward } = req.body
    if (!questionId || answer === undefined) {
      return res.json({ code: 400, msg: '参数不完整' })
    }

    const [existing] = await pool.query(
      'SELECT id, is_correct FROM question_records WHERE user_id = ? AND question_id = ?',
      [req.user.id, questionId]
    )
    const correct = isCorrect ? 1 : 0
    const reward = expReward || 0

    if (existing.length > 0) {
      // 已答过：之前错的现在答对了 → 更新
      if (existing[0].is_correct === 0 && correct === 1) {
        await pool.query(
          'UPDATE question_records SET answer = ?, is_correct = 1, exp_reward = ? WHERE id = ?',
          [String(answer), reward, existing[0].id]
        )
        return res.json({ code: 200, msg: '已更新为正确', data: { isCorrect: true, expReward: reward } })
      }
      // 已经答对的 → 幂等忽略
      return res.json({ code: 200, msg: '该题已提交过', data: { isCorrect: true, expReward: reward } })
    }

    // 新记录
    await pool.query(
      'INSERT INTO question_records (user_id, question_id, answer, is_correct, exp_reward) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, questionId, String(answer), correct, reward]
    )

    res.json({
      code: 200,
      msg: '提交成功',
      data: { isCorrect: isCorrect, expReward: reward },
    })
  } catch (err) {
    console.error('[quiz/submit]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 用户答题记录 */
router.get('/my-answers', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT question_id, is_correct, answer AS user_answer, exp_reward, created_at FROM question_records WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ code: 200, data: rows })
  } catch (err) {
    console.error('[quiz/my-answers]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

module.exports = router