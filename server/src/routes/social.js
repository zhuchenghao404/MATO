const express = require('express')
const router = express.Router()
const pool = require('../db')
const { authMiddleware } = require('../middleware/auth')

// ==================== 关注相关接口 ====================

/**
 * 关注用户
 * POST /api/social/follow
 */
router.post('/follow', authMiddleware, async (req, res) => {
  try {
    const { followeeId } = req.body
    const followerId = req.user.id

    if (!followeeId || followerId === followeeId) {
      return res.json({ code: 400, msg: '参数错误' })
    }

    await pool.query('INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)', [followerId, followeeId])
    res.json({ code: 200, msg: '关注成功' })
  } catch (err) {
    console.error('[social/follow]', err)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ code: 400, msg: '已经关注该用户' })
    }
    res.status(500).json({ code: 500, msg: '关注失败' })
  }
})

/**
 * 取消关注
 * POST /api/social/unfollow
 */
router.post('/unfollow', authMiddleware, async (req, res) => {
  try {
    const { followeeId } = req.body
    const followerId = req.user.id

    const [result] = await pool.query('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [followerId, followeeId])
    if (result.affectedRows > 0) {
      res.json({ code: 200, msg: '取消关注成功' })
    } else {
      res.json({ code: 400, msg: '未关注该用户' })
    }
  } catch (err) {
    console.error('[social/unfollow]', err)
    res.status(500).json({ code: 500, msg: '取消关注失败' })
  }
})

/**
 * 检查是否关注
 * GET /api/social/is-following/:followeeId
 */
router.get('/is-following/:followeeId', authMiddleware, async (req, res) => {
  try {
    const followeeId = parseInt(req.params.followeeId)
    const followerId = req.user.id

    const [rows] = await pool.query('SELECT id FROM follows WHERE follower_id = ? AND followee_id = ?', [followerId, followeeId])
    res.json({ code: 200, data: { isFollowing: rows.length > 0 } })
  } catch (err) {
    console.error('[social/is-following]', err)
    res.status(500).json({ code: 500, msg: '查询失败' })
  }
})

/**
 * 获取关注列表
 * GET /api/social/following
 */
router.get('/following', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const offset = (page - 1) * pageSize

    const [rows] = await pool.query(`
      SELECT u.id, u.username, u.avatar, u.level, f.created_at
      FROM follows f
      JOIN users u ON f.followee_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, pageSize, offset])

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM follows WHERE follower_id = ?', [userId])

    // 查询对方是否关注当前用户（用于判断是否互相关注）
    const result = await Promise.all(rows.map(async row => {
      const [followRes] = await pool.query(
        'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?',
        [row.id, userId]
      )
      return {
        ...row,
        isFollowed: followRes[0].count > 0
      }
    }))

    res.json({
      code: 200,
      data: {
        list: result,
        total: countResult[0].total,
        page,
        pageSize
      }
    })
  } catch (err) {
    console.error('[social/following]', err)
    res.status(500).json({ code: 500, msg: '获取关注列表失败' })
  }
})

/**
 * 获取粉丝列表
 * GET /api/social/followers
 */
router.get('/followers', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const offset = (page - 1) * pageSize

    const [rows] = await pool.query(`
      SELECT u.id, u.username, u.avatar, u.level, f.created_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.followee_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, pageSize, offset])

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM follows WHERE followee_id = ?', [userId])

    // 查询当前用户是否关注对方（用于判断是否互相关注）
    const result = await Promise.all(rows.map(async row => {
      const [followRes] = await pool.query(
        'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?',
        [userId, row.id]
      )
      return {
        ...row,
        isFollowing: followRes[0].count > 0
      }
    }))

    res.json({
      code: 200,
      data: {
        list: result,
        total: countResult[0].total,
        page,
        pageSize
      }
    })
  } catch (err) {
    console.error('[social/followers]', err)
    res.status(500).json({ code: 500, msg: '获取粉丝列表失败' })
  }
})

// ==================== 私信相关接口 ====================

/**
 * 发送私信
 * POST /api/social/message
 */
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { toUserId, content } = req.body
    const fromUserId = req.user.id

    if (!toUserId || !content.trim()) {
      return res.json({ code: 400, msg: '参数错误' })
    }

    if (fromUserId === toUserId) {
      return res.json({ code: 400, msg: '不能给自己发消息' })
    }

    // 检查是否是关注的人或粉丝（互相关注或单向关注都可以发私信）
    const [followResult] = await pool.query(`
      SELECT COUNT(*) as count FROM follows 
      WHERE (follower_id = ? AND followee_id = ?) OR (follower_id = ? AND followee_id = ?)
    `, [fromUserId, toUserId, toUserId, fromUserId])

    if (followResult[0].count === 0) {
      return res.json({ code: 403, msg: '只能给关注的人或粉丝发送私信' })
    }

    await pool.query('INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)', [fromUserId, toUserId, content.trim()])
    res.json({ code: 200, msg: '发送成功' })
  } catch (err) {
    console.error('[social/message]', err)
    res.status(500).json({ code: 500, msg: '发送失败' })
  }
})

/**
 * 获取对话列表（最近联系人）
 * GET /api/social/conversations
 */
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const [rows] = await pool.query(`
      SELECT 
        pair.other_user_id,
        u.username,
        u.avatar,
        u.level,
        pair.last_time,
        latest.content as last_message,
        pair.unread_count
      FROM (
        SELECT 
          CASE WHEN from_user_id = ? THEN to_user_id ELSE from_user_id END AS other_user_id,
          MAX(created_at) as last_time,
          SUM(CASE WHEN to_user_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count
        FROM messages
        WHERE from_user_id = ? OR to_user_id = ?
        GROUP BY other_user_id
      ) pair
      JOIN users u ON u.id = pair.other_user_id
      LEFT JOIN messages latest ON latest.id = (
        SELECT id FROM messages
        WHERE ((from_user_id = ? AND to_user_id = pair.other_user_id)
            OR (from_user_id = pair.other_user_id AND to_user_id = ?))
        ORDER BY created_at DESC LIMIT 1
      )
      ORDER BY pair.last_time DESC
    `, [userId, userId, userId, userId, userId, userId])

    res.json({ code: 200, data: rows })
  } catch (err) {
    console.error('[social/conversations]', err)
    res.status(500).json({ code: 500, msg: '获取对话列表失败' })
  }
})

/**
 * 获取与某用户的私信记录
 * GET /api/social/messages/:userId
 */
router.get('/messages/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id
    const otherUserId = parseInt(req.params.userId)
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 50
    const offset = (page - 1) * pageSize

    // 标记为已读
    await pool.query('UPDATE messages SET is_read = 1 WHERE from_user_id = ? AND to_user_id = ?', [otherUserId, currentUserId])

    const [rows] = await pool.query(`
      SELECT 
        m.id,
        m.from_user_id,
        m.to_user_id,
        m.content,
        m.is_read,
        m.created_at
      FROM messages m
      WHERE (m.from_user_id = ? AND m.to_user_id = ?) OR (m.from_user_id = ? AND m.to_user_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [currentUserId, otherUserId, otherUserId, currentUserId, pageSize, offset])

    // 获取对方用户信息
    const [userRows] = await pool.query('SELECT username, avatar, level FROM users WHERE id = ?', [otherUserId])

    res.json({
      code: 200,
      data: {
        messages: rows.reverse(),
        otherUser: userRows[0] || null,
        page,
        pageSize
      }
    })
  } catch (err) {
    console.error('[social/messages]', err)
    res.status(500).json({ code: 500, msg: '获取消息失败' })
  }
})

/**
 * 获取未读消息数量
 * GET /api/social/unread-count
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const [rows] = await pool.query('SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND is_read = 0', [userId])
    res.json({ code: 200, data: { count: rows[0].count } })
  } catch (err) {
    console.error('[social/unread-count]', err)
    res.status(500).json({ code: 500, msg: '查询失败' })
  }
})

/** 获取指定用户的关注和粉丝数量 */
router.get('/counts/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    const [followingRows] = await pool.query('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [userId])
    const [followerRows] = await pool.query('SELECT COUNT(*) as count FROM follows WHERE followee_id = ?', [userId])

    // 检查当前用户是否关注了该用户
    const [followingRows2] = await pool.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?',
      [currentUserId, userId]
    )
    // 检查该用户是否关注了当前用户
    const [followerRows2] = await pool.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?',
      [userId, currentUserId]
    )

    res.json({
      code: 200,
      data: {
        following: followingRows[0].count,
        followers: followerRows[0].count,
        isFollowing: followingRows2[0].count > 0,
        isFollowed: followerRows2[0].count > 0
      }
    })
  } catch (err) {
    console.error('[social/counts]', err)
    res.status(500).json({ code: 500, msg: '查询失败' })
  }
})

module.exports = router