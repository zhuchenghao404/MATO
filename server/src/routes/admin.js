const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 所有接口需要认证 + 管理员校验
router.use(authMiddleware)
router.use((req, res, next) => {
  if (req.user.username !== 'admin') {
    return res.status(403).json({ code: 403, msg: '需要管理员权限' })
  }
  next()
})

// ==================== 仪表盘统计 ====================
router.get('/stats', async (req, res) => {
  try {
    /** 将 trend 数据中的 date (JS Date/string) 转为 yyyy-MM-dd 字符串，避免 JSON 序列化时区偏移 */
    function fmtTrend(trend) {
      return (trend || []).map(r => {
        const d = r.date instanceof Date ? r.date : new Date(r.date)
        // 用本地时间格式化，避免 UTC 序列化导致日期偏移一天
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return { date: ds, count: r.count }
      })
    }
    const [[{ userCount }]] = await pool.query('SELECT COUNT(*) as userCount FROM users')
    const [[{ workCount }]] = await pool.query('SELECT COUNT(*) as workCount FROM works')
    const [[{ commentCount }]] = await pool.query('SELECT COUNT(*) as commentCount FROM comments')
    const [[{ pendingCount }]] = await pool.query("SELECT COUNT(*) as pendingCount FROM works WHERE status = 0")
    const [[{ todayUsers }]] = await pool.query(
      "SELECT COUNT(*) as todayUsers FROM users WHERE DATE(created_at) = CURDATE()"
    )
    const [[{ todayWorks }]] = await pool.query(
      "SELECT COUNT(*) as todayWorks FROM works WHERE DATE(created_at) = CURDATE()"
    )

    // 近7天用户注册趋势
    const [userTrend] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at) ORDER BY date`
    )

    // 近7天作品提交趋势
    const [workTrend] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM works WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at) ORDER BY date`
    )

    // 近7天浏览量趋势（work_views 表）
    const [viewTrend] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM work_views WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at) ORDER BY date`
    )

    // 作品浏览量 TOP10
    const [topWorks] = await pool.query(
      `SELECT w.id, w.title, w.view_count, u.username
       FROM works w JOIN users u ON w.user_id = u.id
       WHERE w.status = 1
       ORDER BY w.view_count DESC LIMIT 10`
    )

    // 用户作品总浏览量 TOP5（圆环图用）
    const [topUserViews] = await pool.query(
      `SELECT u.username, IFNULL(SUM(w.view_count), 0) as total_views
       FROM works w JOIN users u ON w.user_id = u.id
       WHERE w.status = 1
       GROUP BY u.id, u.username
       ORDER BY total_views DESC LIMIT 5`
    )

    // AI API 今日访问次数（用本地日期，与 aiLimit.js 保持一致）
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const [[{ todayAiCalls }]] = await pool.query(
      'SELECT IFNULL(SUM(count), 0) as todayAiCalls FROM ai_usage WHERE usage_date = ?',
      [todayStr]
    )

    // AI API 近7天访问趋势
    const s = new Date(Date.now() - 6 * 86400000)
    const sevenDaysAgo = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`
    const [aiTrend] = await pool.query(
      `SELECT usage_date as date, SUM(count) as count
       FROM ai_usage WHERE usage_date >= ?
       GROUP BY usage_date ORDER BY date`,
      [sevenDaysAgo]
    )

    const [recentUsers] = await pool.query(
      'SELECT username, email, level, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    )

    // 用户答题数量 TOP5
    const [topAnswerUsers] = await pool.query(
      `SELECT u.username, COUNT(*) as answer_count
       FROM question_records qr JOIN users u ON qr.user_id = u.id
       WHERE qr.is_correct = 1
       GROUP BY qr.user_id, u.username
       ORDER BY answer_count DESC LIMIT 5`
    )

    res.json({
      code: 200,
      data: {
        userCount,
        workCount,
        commentCount,
        pendingCount,
        todayUsers,
        todayWorks,
        userTrend: fmtTrend(userTrend),
        workTrend: fmtTrend(workTrend),
        viewTrend: fmtTrend(viewTrend),
        topWorks,
        topUserViews,
        todayAiCalls,
        aiTrend: fmtTrend(aiTrend),
        topAnswerUsers,
        recentUsers,
      },
    })
  } catch (err) {
    console.error('[admin/stats]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 待审核作品列表 ====================
router.get('/works/pending', async (req, res) => {
  try {
    const [works] = await pool.query(
      `SELECT w.id, w.title, w.description, w.cover,
              w.html_code, w.css_code, w.js_code, w.dependencies,
              w.created_at, u.username, u.avatar
       FROM works w
       JOIN users u ON w.user_id = u.id
       WHERE w.status = 0
       ORDER BY w.created_at DESC`
    )
    res.json({ code: 200, data: works })
  } catch (err) {
    console.error('[admin/works/pending]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 用户列表（分页+搜索） ====================
router.get('/user/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, username, email, status } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const limit = parseInt(pageSize)

    let where = 'WHERE 1=1'
    const params = []

    if (username) {
      where += ' AND username LIKE ?'
      params.push(`%${username}%`)
    }
    if (email) {
      where += ' AND email LIKE ?'
      params.push(`%${email}%`)
    }
    if (status !== undefined && status !== null && status !== '') {
      where += ' AND status = ?'
      params.push(parseInt(status))
    }

    const [rows] = await pool.query(
      `SELECT id, username, email, gender, avatar, bio, exp, level, status, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${where}`,
      params
    )

    res.json({
      code: 200,
      data: { list: rows, total, page: parseInt(page), pageSize: limit },
    })
  } catch (err) {
    console.error('[admin/user/list]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 更新用户状态（封禁/解封） ====================
router.put('/user/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id])
    res.json({ code: 200, msg: '操作成功' })
  } catch (err) {
    console.error('[admin/user/status]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 删除用户 ====================
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM users WHERE id = ?', [id])
    res.json({ code: 200, msg: '删除成功' })
  } catch (err) {
    console.error('[admin/user/delete]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 更新用户 ====================
router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, gender, bio, level, exp } = req.body
    await pool.query(
      'UPDATE users SET username=?, email=?, gender=?, bio=?, level=?, exp=? WHERE id=?',
      [username, email, gender, bio || '', level, exp, id]
    )
    res.json({ code: 200, msg: '更新成功' })
  } catch (err) {
    console.error('[admin/user/update]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 作品列表（管理端：不过滤状态） ====================
router.get('/works/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, title, author, status } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const limit = parseInt(pageSize)

    let where = 'WHERE 1=1'
    const params = []

    if (title) {
      where += ' AND w.title LIKE ?'
      params.push(`%${title}%`)
    }
    if (author) {
      where += ' AND u.username LIKE ?'
      params.push(`%${author}%`)
    }
    if (status !== undefined && status !== null && status !== '') {
      where += ' AND w.status = ?'
      params.push(parseInt(status))
    }

    const [rows] = await pool.query(
      `SELECT w.id, w.user_id, w.title, w.description, w.cover,
              w.like_count, w.collect_count, w.comment_count, w.view_count,
              w.status, w.created_at,
              u.username, u.avatar
       FROM works w
       JOIN users u ON w.user_id = u.id
       ${where}
       ORDER BY w.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM works w JOIN users u ON w.user_id = u.id ${where}`,
      params
    )

    // 统一格式
    const list = rows.map(w => ({
      id: w.id,
      user_id: w.user_id,
      title: w.title,
      description: w.description,
      cover: w.cover,
      like_count: w.like_count,
      collect_count: w.collect_count,
      comment_count: w.comment_count,
      view_count: w.view_count,
      status: w.status,
      created_at: w.created_at,
      user: { name: w.username, avatar: w.avatar },
    }))

    res.json({
      code: 200,
      data: { list, total, page: parseInt(page), pageSize: limit },
    })
  } catch (err) {
    console.error('[admin/works/list]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 更新作品状态 ====================
router.put('/works/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await pool.query('UPDATE works SET status = ? WHERE id = ?', [status, id])
    res.json({ code: 200, msg: '操作成功' })
  } catch (err) {
    console.error('[admin/works/status]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 删除作品 ====================
router.delete('/works/:id', async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM works WHERE id = ?', [id])
    res.json({ code: 200, msg: '删除成功' })
  } catch (err) {
    console.error('[admin/works/delete]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 评论列表（分页+搜索） ====================
router.get('/comment/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, content, username, workId } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const limit = parseInt(pageSize)

    let where = 'WHERE 1=1'
    const params = []

    if (content) {
      where += ' AND c.content LIKE ?'
      params.push(`%${content}%`)
    }
    if (username) {
      where += ' AND u.username LIKE ?'
      params.push(`%${username}%`)
    }
    if (workId) {
      where += ' AND c.work_id = ?'
      params.push(parseInt(workId))
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.user_id, c.work_id, c.content, c.parent_id, c.created_at,
              u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM comments c JOIN users u ON c.user_id = u.id ${where}`,
      params
    )

    res.json({
      code: 200,
      data: { list: rows, total, page: parseInt(page), pageSize: limit },
    })
  } catch (err) {
    console.error('[admin/comment/list]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 删除评论 ====================
router.delete('/comment/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [comment] = await pool.query('SELECT work_id FROM comments WHERE id = ?', [id])
    if (comment.length > 0) {
      await pool.query('DELETE FROM comments WHERE id = ?', [id])
      await pool.query('UPDATE works SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?', [comment[0].work_id])
    }
    res.json({ code: 200, msg: '删除成功' })
  } catch (err) {
    console.error('[admin/comment/delete]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

module.exports = router
