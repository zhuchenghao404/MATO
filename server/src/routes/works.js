const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const { authMiddleware, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// ===== 文件上传配置 =====
const coversDir = path.join(__dirname, '..', '..', 'uploads', 'covers')
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: coversDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `work_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// ==================== 作品上传 ====================
router.post('/', authMiddleware, upload.single('cover'), async (req, res) => {
  try {
    const { title, description, html_code, css_code, js_code, dependencies } = req.body

    if (!title || !title.trim()) {
      return res.json({ code: 400, msg: '请输入作品名称' })
    }
    if (!req.file) {
      return res.json({ code: 400, msg: '请上传运行截图' })
    }

    const coverUrl = `/uploads/covers/${req.file.filename}`

    const [result] = await pool.query(
      `INSERT INTO works (user_id, title, description, cover, html_code, css_code, js_code, dependencies, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [req.user.id, title.trim(), description || '', coverUrl, html_code || '', css_code || '', js_code || '', dependencies || '']
    )

    res.json({
      code: 200,
      msg: '作品发布成功',
      data: { id: result.insertId, cover: coverUrl },
    })
  } catch (err) {
    console.error('[works/upload]', err)
    res.status(500).json({ code: 500, msg: '发布失败' })
  }
})

// ==================== 作品列表 ====================
router.get('/', async (req, res) => {
  try {
    const { filter = 'all', page = 1, pageSize = 12 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const limit = parseInt(pageSize)

    let orderBy = 'w.created_at DESC'
    let whereDate = ''

    if (filter === 'daily') {
      whereDate = `AND DATE(w.created_at) = CURDATE()`
    } else if (filter === 'monthly') {
      whereDate = `AND YEAR(w.created_at) = YEAR(CURDATE()) AND MONTH(w.created_at) = MONTH(CURDATE())`
    } else if (filter === 'most-liked') {
      orderBy = 'w.like_count DESC, w.created_at DESC'
    } else if (filter === 'most-viewed') {
      orderBy = 'w.view_count DESC, w.created_at DESC'
    }
    // 'all' 不做任何筛选，展示全部已通过作品，按时间倒序

    const [works] = await pool.query(
      `SELECT w.id, w.user_id, w.title, w.description, w.cover,
              w.like_count, w.collect_count, w.comment_count, w.view_count,
              w.created_at,
              u.username, u.avatar, u.level
       FROM works w
       JOIN users u ON w.user_id = u.id
       WHERE w.status = 1 ${whereDate}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM works w WHERE w.status = 1 ${whereDate}`
    )

    res.json({
      code: 200,
      data: {
        list: works.map(w => ({
          id: w.id,
          user_id: w.user_id,
          title: w.title,
          description: w.description,
          cover: w.cover,
          like_count: w.like_count,
          collect_count: w.collect_count,
          comment_count: w.comment_count,
          view_count: w.view_count,
          created_at: w.created_at,
          user: {
            name: w.username,
            avatar: w.avatar,
            level: w.level,
          },
        })),
        total: total[0].total,
        page: parseInt(page),
        pageSize: limit,
      },
    })
  } catch (err) {
    console.error('[works/list]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 作品渲染预览（返回完整 HTML，供 iframe 直接嵌入） ====================
router.get('/render/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [works] = await pool.query(
      'SELECT html_code, css_code, js_code, dependencies FROM works WHERE id = ? AND status = 1',
      [id]
    )
    if (works.length === 0) {
      return res.status(404).send('作品不存在')
    }
    const { html_code, css_code, js_code, dependencies } = works[0]
    // 解析依赖：每行一个 CDN URL
    const depScripts = (dependencies || '').split('\n').filter(u => u.trim()).map(u =>
      `<script src="${u.trim()}"></script>`
    ).join('\n')
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${depScripts}
<style>*,*::before,*::after{box-sizing:border-box}body{margin:0;padding:8px;min-height:100vh}${css_code || ''}</style>
</head>
<body>${html_code || ''}
<script>${js_code || ''}</script>
</body>
</html>`
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    console.error('[works/render]', err)
    res.status(500).send('服务器错误')
  }
})

// ==================== 我的作品列表 ====================
router.get('/my/works', authMiddleware, async (req, res) => {
  try {
    const [works] = await pool.query(
      `SELECT w.id, w.title, w.description, w.cover, w.html_code, w.css_code, w.js_code, w.dependencies,
              w.like_count, w.collect_count, w.comment_count, w.view_count, w.status, w.created_at
       FROM works w WHERE w.user_id = ? AND w.status IN (0, 1, 2) ORDER BY w.created_at DESC`,
      [req.user.id]
    )
    res.json({ code: 200, data: works })
  } catch (err) {
    console.error('[works/my]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

/** 获取指定用户的作品 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const [works] = await pool.query(
      `SELECT w.id, w.title, w.description, w.cover, w.html_code, w.css_code, w.js_code, w.dependencies,
              w.like_count, w.collect_count, w.comment_count, w.view_count, w.status, w.created_at
       FROM works w WHERE w.user_id = ? AND w.status = 1 ORDER BY w.created_at DESC`,
      [userId]
    )
    res.json({ code: 200, data: works })
  } catch (err) {
    console.error('[works/user]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 我点赞的作品 ====================
router.get('/my/likes', authMiddleware, async (req, res) => {
  try {
    const [works] = await pool.query(
      `SELECT w.id, w.title, w.description, w.cover,
              w.like_count, w.collect_count, w.comment_count, w.view_count, w.created_at,
              u.username, u.avatar, u.level
       FROM works w
       JOIN work_likes l ON w.id = l.work_id
       JOIN users u ON w.user_id = u.id
       WHERE l.user_id = ? AND w.status = 1
       ORDER BY l.created_at DESC`,
      [req.user.id]
    )
    res.json({ code: 200, data: works })
  } catch (err) {
    console.error('[works/my-likes]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 我收藏的作品 ====================
router.get('/my/collections', authMiddleware, async (req, res) => {
  try {
    const [works] = await pool.query(
      `SELECT w.id, w.title, w.description, w.cover,
              w.like_count, w.collect_count, w.comment_count, w.view_count, w.created_at,
              u.username, u.avatar, u.level
       FROM works w
       JOIN work_collections c ON w.id = c.work_id
       JOIN users u ON w.user_id = u.id
       WHERE c.user_id = ? AND w.status = 1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    )
    res.json({ code: 200, data: works })
  } catch (err) {
    console.error('[works/my-collections]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 编辑作品 ====================
router.put('/:id', authMiddleware, upload.single('cover'), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, html_code, css_code, js_code, dependencies } = req.body

    const [works] = await pool.query('SELECT id FROM works WHERE id = ? AND user_id = ?', [id, req.user.id])
    if (works.length === 0) {
      return res.json({ code: 403, msg: '无权编辑此作品' })
    }

    let coverUrl = null
    if (req.file) {
      coverUrl = `/uploads/covers/${req.file.filename}`
    }

    const fields = []
    const values = []

    if (title !== undefined) { fields.push('title = ?'); values.push(title.trim()) }
    if (description !== undefined) { fields.push('description = ?'); values.push(description || '') }
    if (html_code !== undefined) { fields.push('html_code = ?'); values.push(html_code || '') }
    if (css_code !== undefined) { fields.push('css_code = ?'); values.push(css_code || '') }
    if (js_code !== undefined) { fields.push('js_code = ?'); values.push(js_code || '') }
    if (dependencies !== undefined) { fields.push('dependencies = ?'); values.push(dependencies || '') }
    if (coverUrl) { fields.push('cover = ?'); values.push(coverUrl) }

    if (fields.length === 0) {
      return res.json({ code: 400, msg: '没有需要更新的内容' })
    }

    values.push(id)
    await pool.query(`UPDATE works SET ${fields.join(', ')} WHERE id = ?`, values)

    res.json({ code: 200, msg: '更新成功', data: { cover: coverUrl } })
  } catch (err) {
    console.error('[works/edit]', err)
    res.status(500).json({ code: 500, msg: '编辑失败' })
  }
})

// ==================== 作品详情 + 记录浏览 ====================
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const [works] = await pool.query(
      `SELECT w.*, u.username, u.avatar, u.level
       FROM works w
       JOIN users u ON w.user_id = u.id
       WHERE w.id = ? AND w.status = 1`,
      [id]
    )

    if (works.length === 0) {
      return res.json({ code: 404, msg: '作品不存在' })
    }

    const work = works[0]

    // 记录浏览（同一用户24小时内不重复计数）
    const userId = req.user?.id || null
    let shouldIncrement = true

    if (userId) {
      const [existing] = await pool.query(
        `SELECT id FROM work_views WHERE user_id = ? AND work_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [userId, id]
      )
      shouldIncrement = existing.length === 0
    }

    if (shouldIncrement) {
      await pool.query('UPDATE works SET view_count = view_count + 1 WHERE id = ?', [id])
      work.view_count = (work.view_count || 0) + 1
      // 总是记录浏览（匿名用户 user_id 为 NULL）
      await pool.query('INSERT INTO work_views (user_id, work_id) VALUES (?, ?)', [userId, id])
    }

    // 检查当前用户是否已点赞/收藏
    let is_liked = false
    let is_collected = false
    if (req.user) {
      const [likes] = await pool.query(
        'SELECT id FROM work_likes WHERE user_id = ? AND work_id = ?', [req.user.id, id]
      )
      is_liked = likes.length > 0

      const [collections] = await pool.query(
        'SELECT id FROM work_collections WHERE user_id = ? AND work_id = ?', [req.user.id, id]
      )
      is_collected = collections.length > 0
    }

    res.json({
      code: 200,
      data: {
        id: work.id,
        user_id: work.user_id,
        title: work.title,
        description: work.description,
        cover: work.cover,
        html_code: work.html_code,
        css_code: work.css_code,
        js_code: work.js_code,
        dependencies: work.dependencies || '',
        like_count: work.like_count,
        collect_count: work.collect_count,
        comment_count: work.comment_count,
        view_count: work.view_count,
        created_at: work.created_at,
        is_liked,
        is_collected,
        user: {
          id: work.user_id,
          name: work.username,
          avatar: work.avatar,
          level: work.level,
        },
      },
    })
  } catch (err) {
    console.error('[works/detail]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 点赞/取消点赞 ====================
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const [work] = await pool.query('SELECT id FROM works WHERE id = ? AND status = 1', [id])
    if (work.length === 0) {
      return res.json({ code: 404, msg: '作品不存在' })
    }

    const [existing] = await pool.query(
      'SELECT id FROM work_likes WHERE user_id = ? AND work_id = ?',
      [userId, id]
    )

    if (existing.length > 0) {
      // 取消点赞
      await pool.query('DELETE FROM work_likes WHERE user_id = ? AND work_id = ?', [userId, id])
      await pool.query('UPDATE works SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [id])
      res.json({ code: 200, msg: '已取消点赞', data: { liked: false } })
    } else {
      // 点赞
      await pool.query('INSERT INTO work_likes (user_id, work_id) VALUES (?, ?)', [userId, id])
      await pool.query('UPDATE works SET like_count = like_count + 1 WHERE id = ?', [id])
      res.json({ code: 200, msg: '点赞成功', data: { liked: true } })
    }
  } catch (err) {
    console.error('[works/like]', err)
    res.status(500).json({ code: 500, msg: '操作失败' })
  }
})

// ==================== 收藏/取消收藏 ====================
router.post('/:id/collect', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const [work] = await pool.query('SELECT id FROM works WHERE id = ? AND status = 1', [id])
    if (work.length === 0) {
      return res.json({ code: 404, msg: '作品不存在' })
    }

    const [existing] = await pool.query(
      'SELECT id FROM work_collections WHERE user_id = ? AND work_id = ?',
      [userId, id]
    )

    if (existing.length > 0) {
      await pool.query('DELETE FROM work_collections WHERE user_id = ? AND work_id = ?', [userId, id])
      await pool.query('UPDATE works SET collect_count = GREATEST(collect_count - 1, 0) WHERE id = ?', [id])
      res.json({ code: 200, msg: '已取消收藏', data: { collected: false } })
    } else {
      await pool.query('INSERT INTO work_collections (user_id, work_id) VALUES (?, ?)', [userId, id])
      await pool.query('UPDATE works SET collect_count = collect_count + 1 WHERE id = ?', [id])
      res.json({ code: 200, msg: '收藏成功', data: { collected: true } })
    }
  } catch (err) {
    console.error('[works/collect]', err)
    res.status(500).json({ code: 500, msg: '操作失败' })
  }
})

// ==================== 获取评论 ====================
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params
    const [comments] = await pool.query(
      `SELECT c.id, c.user_id, c.content, c.parent_id, c.created_at,
              u.username, u.avatar, u.level
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.work_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    )

    res.json({ code: 200, data: comments })
  } catch (err) {
    console.error('[works/comments]', err)
    res.status(500).json({ code: 500, msg: '服务器错误' })
  }
})

// ==================== 发表评论 ====================
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { content, parent_id } = req.body

    if (!content || !content.trim()) {
      return res.json({ code: 400, msg: '请输入评论内容' })
    }

    await pool.query(
      'INSERT INTO comments (user_id, work_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [req.user.id, id, content.trim(), parent_id || null]
    )
    await pool.query('UPDATE works SET comment_count = comment_count + 1 WHERE id = ?', [id])

    res.json({ code: 200, msg: '评论成功' })
  } catch (err) {
    console.error('[works/comment]', err)
    res.status(500).json({ code: 500, msg: '评论失败' })
  }
})

module.exports = router

// ==================== Pen 快捷保存（无需截图） ====================
router.post('/save-pen', authMiddleware, async (req, res) => {
  try {
    const { title, html_code, css_code, js_code, dependencies, for_case } = req.body

    if (!title || !title.trim()) {
      return res.json({ code: 400, msg: '请输入作品名称' })
    }

    // status: 0=待审核投稿, 1=已发布(优秀案例), 2=私人草稿(仅自己可见)
    const status = for_case ? 0 : 2

    const [result] = await pool.query(
      `INSERT INTO works (user_id, title, description, cover, html_code, css_code, js_code, dependencies, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title.trim(), '', '/uploads/covers/default.png', html_code || '', css_code || '', js_code || '', dependencies || '', status]
    )

    res.json({
      code: 200,
      msg: for_case ? '投稿成功！正在审核中...' : '保存成功！可在个人中心查看',
      data: { id: result.insertId },
    })
  } catch (err) {
    console.error('[works/save-pen]', err)
    res.status(500).json({ code: 500, msg: '保存失败' })
  }
})
