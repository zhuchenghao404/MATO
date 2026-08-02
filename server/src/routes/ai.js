const express = require('express')
const router = express.Router()
const aiLimit = require('../middleware/aiLimit')
const { optionalAuth } = require('../middleware/auth')

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

// 先解析用户身份（可选），再检查限额
router.use(optionalAuth)
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
    res.json({ code: 200, data: result, remaining: req.aiRemaining })
  } catch (e) {
    console.error('[AI Explain Error]', e.message)
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// POST /api/ai/solve - 解答闯关题目
router.post('/solve', async (req, res) => {
  const { question, options, type, topic } = req.body
  if (!question) return res.status(400).json({ code: 400, msg: '缺少 question' })

  // 根据题型生成不同的 system prompt
  let systemPrompt
  if (type === 'code-fix') {
    systemPrompt = `你是前端教学助手。以下是${topic || '前端开发'}的一道代码纠错题，题目中包含一段有bug的代码。请：1) 指出代码中的错误，2) 解释为什么会导致问题，3) 给出修复后的正确代码。用中文回答，格式清晰。`
  } else if (type === 'programming') {
    systemPrompt = `你是前端教学助手。以下是${topic || '前端开发'}的一道编程题。请：1) 分析题目需求，2) 给出完整的实现代码，3) 逐行解释关键代码的作用。用中文回答，格式清晰，代码用 markdown 代码块包裹。`
  } else {
    systemPrompt = `你是前端教学助手。请分析以下${topic || '前端开发'}相关${type || '题目'}，给出正确答案并解释原因。`
  }

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
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMsg },
    ])
    res.json({ code: 200, data: result, remaining: req.aiRemaining })
  } catch (e) {
    console.error('[AI Solve Error]', e.message)
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// POST /api/ai/check - 智能评判编程题/纠错题答案
router.post('/check', async (req, res) => {
  const { question, userAnswer, expectedAnswer, type } = req.body
  if (!question || !userAnswer) {
    return res.status(400).json({ code: 400, msg: '缺少 question 或 userAnswer' })
  }

  try {
    const result = await askDeepSeek([
      {
        role: 'system',
        content: `你是前端代码评判专家。用户提交了一段代码作为答案，你需要判断它是否正确解决了题目要求。
评判标准：
- 代码逻辑正确、能完成题目要求即算正确，不必和参考答案完全一致
- 变量名、写法风格不同但功能相同也算正确
- 只有逻辑完全错误或完全偏离题目要求才算错误

请严格按以下格式回复（只回复一行JSON，不要其他内容）：
{"correct":true/false,"reason":"简短中文解释（30字以内）"}`,
      },
      {
        role: 'user',
        content: `【题目】${question}\n\n【参考答案】${expectedAnswer || '（无参考答案）'}\n\n【用户提交的代码】\n${userAnswer}\n\n请判断用户代码是否正确。`,
      },
    ])

    // 解析 JSON 回复
    let parsed = { correct: false, reason: '无法判断' }
    try {
      const cleaned = result.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      // 如果 AI 没返回标准 JSON，根据关键词判断
      const upper = result.toUpperCase()
      if (upper.includes('"correct":true') || upper.includes('正确') && !upper.includes('错误')) {
        parsed = { correct: true, reason: 'AI 判断正确' }
      }
    }

    res.json({ code: 200, data: parsed, remaining: req.aiRemaining })
  } catch (e) {
    console.error('[AI Check Error]', e.message)
    // 出错时降级为宽松的文本比对
    const norm = (s) => s.replace(/\s+/g, '').toLowerCase()
    const correct = norm(userAnswer) === norm(expectedAnswer || '')
    res.json({ code: 200, data: { correct, reason: correct ? '答案匹配' : '答案不匹配（AI 暂不可用，使用文本比对）' } })
  }
})

// POST /api/ai/chat - 多轮追问
router.post('/chat', async (req, res) => {
  const { messages, topic } = req.body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ code: 400, msg: '缺少 messages' })
  }

  try {
    const systemMsg = {
      role: 'system',
      content: `你是前端教学助手，正在帮助用户解答关于${topic || '前端开发'}的疑问。请用简洁中文回答，涉及代码时用 markdown 代码块包裹。保持对话连贯，可引用之前的对话内容。`,
    }
    const result = await askDeepSeek([systemMsg, ...messages])
    res.json({ code: 200, data: result, remaining: req.aiRemaining })
  } catch (e) {
    console.error('[AI Chat Error]', e.message)
    res.status(500).json({ code: 500, msg: e.message })
  }
})

module.exports = router
