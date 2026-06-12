const express = require('express')
const router = express.Router()
const aiLimit = require('../middleware/aiLimit')

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

// 所有 AI 路由需要限额检查
router.use(aiLimit)

/** 调用 DeepSeek 一次返回完整结果 */
async function askDeepSeek(messages) {
  const url = `${DEEPSEEK_BASE_URL}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = `API 错误 (${res.status})`
    try {
      const err = JSON.parse(text)
      if (err.error?.message) msg = err.error.message
    } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content
    || data.choices?.[0]?.message?.reasoning_content
    || '(空响应)'
}

// POST /api/ai/explain - 解释选中文本
router.post('/explain', async (req, res) => {
  const { text, context } = req.body
  if (!text) return res.status(400).json({ code: 400, msg: '缺少 text' })

  try {
    const result = await askDeepSeek([
      { role: 'system', content: `你是前端教学助手。请用简洁中文解释以下「${context || '前端开发'}」相关内容，可举例。` },
      { role: 'user', content: text },
    ])
    res.json({ code: 200, data: result })
  } catch (e) {
    console.error('[AI Explain Error]', e.message)
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// POST /api/ai/solve - 解答闯关题目
router.post('/solve', async (req, res) => {
  const { question, options, type, topic } = req.body
  if (!question) return res.status(400).json({ code: 400, msg: '缺少 question' })

  // 格式化选项文本
  let opts = ''
  if (options?.length) {
    if (typeof options[0] === 'object') {
      opts = '\n选项：' + options.map(o => `${o.key}.${o.text}`).join('  ')
    } else {
      opts = '\n选项：' + options.join('、')
    }
  }
  const userMsg = `题目：${question}${opts}`

  try {
    const result = await askDeepSeek([
      { role: 'system', content: `你是前端教学助手。请分析以下${topic || '前端开发'}相关${type || '题目'}，给出正确答案并解释原因。` },
      { role: 'user', content: userMsg },
    ])
    res.json({ code: 200, data: result })
  } catch (e) {
    console.error('[AI Solve Error]', e.message)
    res.status(500).json({ code: 500, msg: e.message })
  }
})

module.exports = router
