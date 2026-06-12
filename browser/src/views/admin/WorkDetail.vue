<template>
  <div class="detail-page">
    <div class="page-inner">
      <!-- 顶部工具栏 -->
      <div class="top-bar">
        <button class="back-btn" @click="goBack">← 返回</button>
        <div class="top-center">
          <h1 class="work-title" v-if="work">{{ work.title }}</h1>
        </div>
        <div class="top-stats">
          <button class="stat-btn" :class="{ active: work?.is_liked }" @click="handleLike" :disabled="!isLoggedIn">
            ❤ {{ work?.like_count || 0 }}
          </button>
          <button class="stat-btn" :class="{ active: work?.is_collected }" @click="handleCollect" :disabled="!isLoggedIn">
            ★ {{ work?.collect_count || 0 }}
          </button>
          <span class="stat-item">👁 {{ work?.view_count || 0 }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading-text">加载中...</div>
      <div v-else-if="!work" class="loading-text">作品不存在</div>

      <template v-else>
        <!-- 描述 -->
        <p v-if="work.description" class="work-desc">{{ work.description }}</p>

        <!-- ====== CodePen 风格左右分栏 ====== -->
        <div class="editor-layout" ref="layoutRef">
          <!-- 左侧：代码面板 -->
          <div class="editor-panel" :style="{ width: leftWidth + 'px' }">
            <div class="panel-header">
              <div class="panel-tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  :class="{ active: activeTab === tab.key }"
                  @click="activeTab = tab.key"
                  class="panel-tab"
                >
                  <span class="tab-dot" :class="'tab-dot--' + tab.color"></span>
                  {{ tab.label }}
                </button>
              </div>
              <button
                class="btn-copy"
                :class="{ copied: copyFeedback }"
                @click="copyCode"
                :title="copyFeedback ? '已复制！' : '复制代码'"
              >
                {{ copyFeedback ? '✓ 已复制' : '📋 复制' }}
              </button>
            </div>
            <div class="editor-body">
              <pre class="code-editor" v-if="work[activeTab]"><code>{{ work[activeTab] }}</code></pre>
              <div v-else class="no-code">
                <span class="no-code-icon">📝</span>
                <span>暂无 {{ tabs.find(t => t.key === activeTab)?.label }}{{ activeTab === 'dependencies' ? '外部链接' : '代码' }}</span>
              </div>
            </div>
          </div>

          <!-- 拖拽分隔条 -->
          <div
            class="divider"
            @mousedown="startDrag"
            ref="dividerRef"
          >
            <div class="divider-handle"></div>
          </div>

          <!-- 右侧：预览面板 -->
          <div class="preview-panel" :style="{ width: rightWidth + 'px' }">
            <div class="panel-header">
              <div class="panel-tabs">
                <span class="panel-tab active">
                  <span class="tab-dot tab-dot--green"></span>
                  运行效果
                </span>
              </div>
              <button class="btn-refresh" @click="refreshPreview" title="刷新预览">↻</button>
            </div>
            <div class="preview-body">
              <iframe
                v-if="work"
                :key="previewKey"
                :src="`/api/works/render/${work.id}`"
                class="preview-iframe"
                sandbox="allow-scripts allow-same-origin"
                title="代码运行预览"
              ></iframe>
            </div>
          </div>
        </div>

        <!-- ====== 作者信息 ====== -->
        <div class="author-bar">
          <div class="author-avatar">{{ (work.user?.name || '?')[0] }}</div>
          <div class="author-info">
            <span class="author-name">{{ work.user?.name || '未知' }}</span>
            <span class="author-lv">Lv.{{ work.user?.level || 1 }}</span>
          </div>
          <span class="author-time">{{ formatTime(work.created_at) }}</span>
        </div>

        <!-- ====== 评论区 ====== -->
        <div class="comments-section">
          <h2 class="section-title">评论 ({{ work.comment_count }})</h2>

          <div v-if="isLoggedIn" class="comment-form">
            <textarea
              v-model.trim="commentText"
              class="comment-input"
              placeholder="写下你的评论..."
              rows="3"
              maxlength="500"
            ></textarea>
            <button
              class="comic-btn small"
              :disabled="!commentText || sendingComment"
              @click="handleComment"
            >
              {{ sendingComment ? '发送中...' : '发表评论' }}
            </button>
          </div>
          <p v-else class="login-hint">请登录后发表评论</p>

          <div v-if="comments.length === 0" class="no-comments">暂无评论，快来抢沙发！</div>
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-user">
              <strong>{{ c.username }}</strong>
              <span class="comment-lv">Lv.{{ c.level }}</span>
              <span class="comment-time">{{ formatTime(c.created_at) }}</span>
            </div>
            <p class="comment-content">{{ c.content }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const route = useRoute()
const router = useRouter()
const API_BASE = '/api'
const { isLoggedIn, token } = useAuth()

const work = ref(null)
const loading = ref(true)
const comments = ref([])
const commentText = ref('')
const sendingComment = ref(false)
const activeTab = ref('html_code')
const copyFeedback = ref(false)
const previewKey = ref(0)
const layoutRef = ref(null)
const dividerRef = ref(null)

const tabs = [
  { key: 'html_code', label: 'HTML', color: 'red' },
  { key: 'css_code', label: 'CSS', color: 'blue' },
  { key: 'js_code', label: 'JS', color: 'yellow' },
  { key: 'dependencies', label: 'Links', color: 'purple' },
]

// 分栏宽度 — 初始化为基于窗口宽度的默认值，确保首次渲染即呈现左右布局
const leftWidth = ref(Math.floor(window.innerWidth * 0.45))
const rightWidth = ref(Math.floor(window.innerWidth * 0.55))
const MIN_WIDTH = 200

function initLayout() {
  if (!layoutRef.value) return
  const total = layoutRef.value.offsetWidth - 8 // 减去 divider 宽度
  leftWidth.value = Math.floor(total * 0.45)
  rightWidth.value = total - leftWidth.value
}

// 拖拽调整宽度
let dragging = false

function startDrag(e) {
  e.preventDefault()
  dragging = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onDrag(e) {
  if (!dragging || !layoutRef.value) return
  const total = layoutRef.value.offsetWidth - 8
  const rect = layoutRef.value.getBoundingClientRect()
  let newLeft = e.clientX - rect.left
  if (newLeft < MIN_WIDTH) newLeft = MIN_WIDTH
  if (newLeft > total - MIN_WIDTH) newLeft = total - MIN_WIDTH
  leftWidth.value = newLeft
  rightWidth.value = total - newLeft
}

function stopDrag() {
  dragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

async function apiRequest(url, options = {}) {
  const headers = { ...options.headers }
  if (token.value) headers['Authorization'] = `Bearer ${token.value}`
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  return res.json()
}

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id
    const [workRes, commentsRes] = await Promise.all([
      apiRequest(`/works/${id}`),
      apiRequest(`/works/${id}/comments`),
    ])
    if (workRes.code === 200) {
      work.value = workRes.data
      await nextTick()
      initLayout()
    }
    if (commentsRes.code === 200) {
      comments.value = commentsRes.data
    }
  } catch (e) {
    console.error('[WorkDetail]', e)
  } finally {
    loading.value = false
  }
}

function refreshPreview() {
  previewKey.value++
}

async function copyCode() {
  if (!work.value?.[activeTab.value]) return
  try {
    await navigator.clipboard.writeText(work.value[activeTab.value])
    copyFeedback.value = true
    setTimeout(() => { copyFeedback.value = false }, 2000)
  } catch { /* 忽略 */ }
}

async function handleLike() {
  if (!isLoggedIn.value || !work.value) return
  try {
    const res = await apiRequest(`/works/${work.value.id}/like`, { method: 'POST' })
    if (res.code === 200) {
      work.value.is_liked = res.data.liked
      work.value.like_count += res.data.liked ? 1 : -1
    }
  } catch (e) { console.error(e) }
}

async function handleCollect() {
  if (!isLoggedIn.value || !work.value) return
  try {
    const res = await apiRequest(`/works/${work.value.id}/collect`, { method: 'POST' })
    if (res.code === 200) {
      work.value.is_collected = res.data.collected
      work.value.collect_count += res.data.collected ? 1 : -1
    }
  } catch (e) { console.error(e) }
}

async function handleComment() {
  if (!commentText.value || !work.value) return
  sendingComment.value = true
  try {
    const res = await apiRequest(`/works/${work.value.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText.value }),
    })
    if (res.code === 200) {
      const commentsRes = await apiRequest(`/works/${work.value.id}/comments`)
      if (commentsRes.code === 200) comments.value = commentsRes.data
      work.value.comment_count++
      commentText.value = ''
    } else {
      alert(res.msg || '评论失败')
    }
  } catch (e) { console.error(e) }
  finally { sendingComment.value = false }
}

function goBack() {
  router.push('/PerfectCase')
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return d.toLocaleDateString()
}

onMounted(() => {
  fetchDetail()
  window.addEventListener('resize', initLayout)
})

onUnmounted(() => {
  window.removeEventListener('resize', initLayout)
})
</script>

<style lang="scss" scoped>
/* ════════════════════════════════════
   整体布局
   ════════════════════════════════════ */
.detail-page {
  height: 100vh;
  background: #1e1e2e;
  padding: 0;
  overflow: hidden;
}

.page-inner {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ════════════════════════════════════
   顶部工具栏
   ════════════════════════════════════ */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #16161e;
  border-bottom: 2px solid #2d2d3f;
  gap: 1rem;
  flex-shrink: 0;
}

.back-btn {
  padding: 0.4rem 0.8rem;
  border: 2px solid #444;
  background: #2d2d3f;
  color: #ccc;
  font-family: 'Bangers', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  &:hover { background: #3d3d5f; color: #fff; }
}

.top-center {
  flex: 1;
  text-align: center;
  overflow: hidden;
}

.work-title {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.1rem;
  color: #fff;
  margin: 0;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-stats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.stat-btn {
  font-size: 0.8rem;
  font-weight: 700;
  color: #888;
  background: none;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  padding: 3px 8px;
  &:hover { border-color: #888; color: #ccc; }
  &.active { border-color: #e74c3c; color: #e74c3c; }
  &:disabled { cursor: not-allowed; opacity: 0.5; }
}

.stat-item {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  white-space: nowrap;
}

.loading-text {
  text-align: center;
  padding: 4rem;
  font-family: 'Bangers', sans-serif;
  font-size: 1.2rem;
  color: #888;
}

.work-desc {
  padding: 0.6rem 1rem;
  margin: 0;
  font-size: 0.85rem;
  color: #aaa;
  background: #22223a;
  border-bottom: 1px solid #2d2d3f;
  flex-shrink: 0;
}

/* ════════════════════════════════════
   CodePen 风格左右分栏
   ════════════════════════════════════ */
.editor-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

/* ── 面板头部 ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  background: #1a1a2e;
  border-bottom: 1px solid #2d2d3f;
  height: 36px;
  flex-shrink: 0;
}

.panel-tabs {
  display: flex;
  gap: 0;
  height: 100%;
}

.panel-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 0.8rem;
  height: 100%;
  border: none;
  background: transparent;
  color: #666;
  font-family: 'Bangers', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  &:hover { color: #aaa; }
  &.active {
    color: #fff;
    border-bottom-color: #ffd700;
  }
}

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  &--red { background: #ff5f57; }
  &--blue { background: #5e9cf2; }
  &--yellow { background: #ffbd2e; }
  &--green { background: #28c840; }
  &--purple { background: #c678dd; }
}

.panel-file {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: #555;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid #444;
  background: transparent;
  color: #888;
  font-size: 0.7rem;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  transition: all 0.15s;
  &:hover { color: #fff; border-color: #ffd700; }
  &.copied { color: #28c840; border-color: #28c840; }
}

.btn-refresh {
  width: 28px;
  height: 28px;
  border: 1px solid #444;
  background: #2d2d3f;
  color: #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #3d3d5f; }
}

/* ── 编辑器主体 ── */
.editor-body {
  flex: 1;
  overflow: auto;
  background: #1e1e2e;
}

.code-editor {
  margin: 0;
  padding: 1rem;
  background: #1e1e2e;
  color: #e0e0e0;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 0.82rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 100%;
  tab-size: 2;
}

.no-code {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.no-code-icon { font-size: 2rem; }

/* ── 预览主体 ── */
.preview-body {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* ── 拖拽分隔条 ── */
.divider {
  width: 8px;
  background: #2d2d3f;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: #ffd700; }
}

.divider-handle {
  width: 2px;
  height: 30px;
  background: #555;
  border-radius: 1px;
}

.divider:hover .divider-handle {
  background: #000;
}

/* ════════════════════════════════════
   作者信息栏
   ════════════════════════════════════ */
.author-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  background: #22223a;
  border-top: 1px solid #2d2d3f;
  flex-shrink: 0;
}

.author-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffd700;
  color: #000;
  font-family: 'Bangers', sans-serif;
  font-size: 0.9rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.author-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.author-lv {
  font-size: 0.7rem;
  color: #888;
  font-weight: 700;
}

.author-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #555;
}

/* ════════════════════════════════════
   评论区
   ════════════════════════════════════ */
.comments-section {
  padding: 0.8rem 1rem;
  background: #16161e;
  border-top: 2px solid #2d2d3f;
  flex-shrink: 0;
  max-height: 30vh;
  overflow-y: auto;
}

.section-title {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  color: #fff;
  margin: 0 0 0.8rem;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid #ffd700;
}

.comment-form {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.comment-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 2px solid #444;
  background: #1e1e2e;
  color: #ccc;
  font-family: inherit;
  font-size: 0.85rem;
  resize: vertical;
  border-radius: 4px;
  &:focus { outline: none; border-color: #ffd700; }
}

.login-hint { color: #666; font-size: 0.85rem; }
.no-comments { text-align: center; color: #555; padding: 1.5rem; font-size: 0.85rem; }

.comment-item {
  padding: 0.7rem 0.8rem;
  border: 1px solid #2d2d3f;
  margin-bottom: 0.4rem;
  background: #1e1e2e;
  border-radius: 4px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  font-size: 0.8rem;
  color: #ccc;
}

.comment-lv {
  font-size: 0.7rem;
  color: #888;
  font-weight: 700;
}

.comment-time {
  margin-left: auto;
  font-size: 0.7rem;
  color: #555;
}

.comment-content {
  margin: 0;
  font-size: 0.85rem;
  color: #aaa;
  line-height: 1.5;
}

/* ════════════════════════════════════
   按钮
   ════════════════════════════════════ */
.comic-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.2rem;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #fff;
  background: #ffd700;
  color: #000;
  border: 2px solid #ffd700;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #ffe44d; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &.small { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
}

/* ════════════════════════════════════
   响应式
   ════════════════════════════════════ */
@media (max-width: 767px) {
  .editor-layout {
    flex-direction: column;
  }

  .editor-panel {
    width: 100% !important;
    height: 40vh;
    flex-shrink: 0;
  }

  .preview-panel {
    width: 100% !important;
    flex: 1;
  }

  .divider {
    width: 100%;
    height: 6px;
    cursor: row-resize;
  }

  .divider-handle {
    width: 30px;
    height: 2px;
  }

  .work-title { font-size: 0.9rem; }
  .top-bar { padding: 0.4rem 0.6rem; }
}
</style>