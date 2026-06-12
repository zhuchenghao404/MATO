<template>
  <div class="case-page">
    <!-- 背景装饰 -->
    <div class="page-bg" aria-hidden="true">
      <span class="bg-sfx bg-sfx--1">SHOWCASE!</span>
      <span class="bg-sfx bg-sfx--2">INSPIRE</span>
      <span class="bg-sfx bg-sfx--3">WOW!!</span>
      <span class="bg-burst bg-burst--1">★</span>
      <span class="bg-burst bg-burst--2">✦</span>
    </div>

    <div class="page-inner">
      <!-- 页头 -->
      <header class="page-header">
        <span class="header-badge">★ PERFECT CASE ★</span>
        <h1 class="page-title">优秀案例</h1>
        <p class="page-desc">看看大家用 MATO 学到的技能创造了什么有趣的作品</p>
      </header>

      <!-- 筛选栏 + 上传按钮 -->
      <div class="filter-bar">
        <button class="comic-btn small" @click="drawerOpen = true">☰ 筛选</button>
        <span class="filter-label">{{ currentFilterLabel }}</span>
        <button
          v-if="isLoggedIn"
          class="comic-btn small upload-btn"
          @click="showUploadModal = true"
        >
          ✚ 上传作品
        </button>
      </div>

      <!-- 案例网格 -->
      <div v-if="loading" class="empty-state">
        <p class="empty-text">加载中...</p>
      </div>
      <div v-else-if="works.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">还没有相关案例，快来成为第一个吧！</p>
      </div>
      <div v-else class="case-grid">
        <article
          v-for="(item, index) in works"
          :key="item.id"
          class="case-card"
          :class="`case-card--${index + 1}`"
          @click="goDetail(item.id)"
        >
          <div class="panel-tape panel-tape--left"></div>
          <div class="panel-tape panel-tape--right"></div>

          <!-- 预览区域：优先显示可交互 iframe，懒加载 -->
          <div class="case-preview" ref="previewContainer">
            <iframe
              v-if="item._iframeActive"
              :src="`/api/works/render/${item.id}`"
              class="preview-iframe"
              sandbox="allow-scripts allow-same-origin"
              title="作品预览"
            ></iframe>
            <div v-else class="preview-placeholder">
              <img :src="item.cover" :alt="item.title" class="cover-img" />
              <span class="placeholder-badge">▶ 预览</span>
            </div>
          </div>

          <!-- 项目介绍 -->
          <div class="case-desc">
            <h3 class="desc-title">{{ item.title }}</h3>
            <p class="desc-text">{{ item.description || '暂无描述' }}</p>
            <span class="desc-enter-btn">点此进入 →</span>
          </div>

          <!-- 用户信息 + 操作 -->
          <div class="case-user" @click.stop>
            <div class="user-avatar">
              <img v-if="item.user?.avatar" :src="item.user.avatar" :alt="item.user.name" class="avatar-img" />
              <span v-else class="avatar-text">{{ (item.user?.name || '?')[0] }}</span>
            </div>
            <div class="user-meta">
              <span class="user-name">{{ item.user?.name || '未知' }}</span>
              <span class="user-lv">Lv.{{ item.user?.level || 1 }}</span>
            </div>
            <div class="case-stats">
              <button
                class="stat-btn"
                :class="{ active: item._liked }"
                @click.stop="handleLike(item)"
                :disabled="!isLoggedIn"
                :title="isLoggedIn ? '点赞/取消点赞' : '请先登录'"
              >
                ❤ {{ item.like_count }}
              </button>
              <button
                class="stat-btn"
                :class="{ active: item._collected }"
                @click.stop="handleCollect(item)"
                :disabled="!isLoggedIn"
                :title="isLoggedIn ? '收藏/取消收藏' : '请先登录'"
              >
                ★ {{ item.collect_count }}
              </button>
              <span class="stat-item">👁 {{ item.view_count }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- ===== 上传作品弹窗 ===== -->
    <div v-if="showUploadModal" class="upload-overlay" @click.self="closeUploadModal">
      <div class="upload-modal">
        <div class="upload-header">
          <span class="upload-title">✚ 发布作品</span>
          <button class="upload-close" @click="closeUploadModal">✕</button>
        </div>

        <form class="upload-form" @submit.prevent="handleUpload">
          <!-- 作品名称 -->
          <div class="form-group">
            <label class="form-label">作品名称 <span class="required">*</span></label>
            <input
              v-model.trim="uploadForm.title"
              class="form-input"
              type="text"
              placeholder="给你的作品取个名字"
              maxlength="50"
              required
            />
          </div>

          <!-- 作品描述 -->
          <div class="form-group">
            <label class="form-label">作品描述</label>
            <textarea
              v-model.trim="uploadForm.description"
              class="form-input form-textarea"
              placeholder="简单介绍一下你的作品..."
              maxlength="200"
              rows="2"
            ></textarea>
          </div>

          <!-- 运行截图 -->
          <div class="form-group">
            <label class="form-label">运行截图 <span class="required">*</span></label>
            <div class="cover-upload" @click="triggerCoverUpload">
              <img v-if="coverPreview" :src="coverPreview" alt="预览" class="cover-preview" />
              <div v-else class="cover-placeholder">
                <span class="cover-icon">📷</span>
                <span>点击上传运行截图</span>
              </div>
            </div>
            <input
              ref="coverInputRef"
              type="file"
              accept="image/*"
              style="display:none"
              @change="handleCoverChange"
            />
            <span v-if="uploadForm.coverFile" class="form-hint">{{ uploadForm.coverFile.name }}</span>
          </div>

          <!-- HTML 代码 -->
          <div class="form-group">
            <label class="form-label">HTML 代码</label>
            <textarea
              v-model="uploadForm.html_code"
              class="form-input form-code"
              placeholder="<div class='my-work'>...</div>"
              rows="4"
            ></textarea>
          </div>

          <!-- CSS 代码 -->
          <div class="form-group">
            <label class="form-label">CSS 代码</label>
            <textarea
              v-model="uploadForm.css_code"
              class="form-input form-code"
              placeholder=".my-work { ... }"
              rows="4"
            ></textarea>
          </div>

          <!-- JS 代码 -->
          <div class="form-group">
            <label class="form-label">JS 代码</label>
            <textarea
              v-model="uploadForm.js_code"
              class="form-input form-code"
              placeholder="console.log('Hello MATO!')"
              rows="4"
            ></textarea>
          </div>

          <!-- 外部依赖 -->
          <div class="form-group">
            <label class="form-label">外部依赖 <span class="form-hint">(CDN 链接，一行一个)</span></label>
            <textarea
              v-model="uploadForm.dependencies"
              class="form-input form-code"
              placeholder="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js&#10;https://cdn.jsdelivr.net/npm/chart.js"
              rows="3"
            ></textarea>
            <span class="form-hint">把要用到的 CDN 库链接粘贴在这里，自动加载到页面上</span>
          </div>

          <span v-if="uploadError" class="form-error">{{ uploadError }}</span>

          <div class="upload-actions">
            <button type="button" class="comic-btn white" @click="closeUploadModal">取消</button>
            <button type="submit" class="comic-btn" :disabled="uploading">
              {{ uploading ? '发布中...' : '确认发布' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== 抽屉遮罩 ===== -->
    <Transition name="drawer">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false"></div>
    </Transition>

    <!-- ===== 抽屉 ===== -->
    <Transition name="drawer-slide">
      <aside v-if="drawerOpen" class="drawer">
        <div class="drawer-header">
          <span class="drawer-title">▼ 筛选排序</span>
          <button class="drawer-close" @click="drawerOpen = false">✕</button>
        </div>
        <div class="drawer-body">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            class="drawer-option"
            :class="{ 'drawer-option--active': currentFilter === opt.value }"
            @click="selectFilter(opt.value)"
          >
            <span class="option-icon">{{ opt.icon }}</span>
            <span class="option-label">{{ opt.label }}</span>
            <span v-if="currentFilter === opt.value" class="option-check">★</span>
          </button>
        </div>
        <div class="drawer-footer">
          <button class="comic-btn small white" @click="drawerOpen = false">关 闭</button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const router = useRouter()
const API_BASE = '/api'

const { isLoggedIn, token } = useAuth()

// ── 筛选 ──
const drawerOpen = ref(false)
const currentFilter = ref('daily')
const filterOptions = [
  { value: 'daily', label: '当日热门', icon: '🔥' },
  { value: 'monthly', label: '本月热门', icon: '⭐' },
  { value: 'most-liked', label: '最高点赞', icon: '❤' },
  { value: 'most-viewed', label: '最高浏览', icon: '👁' },
]
const currentFilterLabel = computed(() => {
  const opt = filterOptions.find(o => o.value === currentFilter.value)
  return opt ? `${opt.icon} ${opt.label}` : ''
})

function selectFilter(value) {
  currentFilter.value = value
  drawerOpen.value = false
  fetchWorks()
}

// ── 作品列表 ──
const works = ref([])
const loading = ref(false)

async function apiRequest(url, options = {}) {
  const headers = { ...options.headers }
  if (token.value) headers['Authorization'] = `Bearer ${token.value}`
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  return res.json()
}

async function fetchWorks() {
  loading.value = true
  try {
    const res = await apiRequest(`/works?filter=${currentFilter.value}`)
    if (res.code === 200) {
      works.value = res.data.list.map(w => ({ ...w, _liked: false, _collected: false, _iframeActive: false }))
      setTimeout(setupIframeObserver, 50)
    }
  } catch (e) {
    console.error('[PerfectCase]', e)
  } finally {
    loading.value = false
  }
}

// ── iframe 懒加载 ──
let iframeObserver = null

function setupIframeObserver() {
  if (iframeObserver) iframeObserver.disconnect()
  iframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cardEl = entry.target.closest('.case-card')
        if (!cardEl) return
        const index = Array.from(cardEl.parentElement.children).indexOf(cardEl)
        if (index >= 0 && works.value[index]) {
          works.value[index]._iframeActive = true
        }
        iframeObserver.unobserve(entry.target)
      }
    })
  }, { rootMargin: '200px' })

  setTimeout(() => {
    document.querySelectorAll('.case-preview').forEach(el => {
      iframeObserver.observe(el)
    })
  }, 100)
}

function goDetail(id) {
  router.push(`/WorkDetail/${id}`)
}

async function handleLike(item) {
  if (!isLoggedIn.value) return
  try {
    const res = await apiRequest(`/works/${item.id}/like`, { method: 'POST' })
    if (res.code === 200) {
      item._liked = res.data.liked
      item.like_count += res.data.liked ? 1 : -1
    }
  } catch (e) {
    console.error(e)
  }
}

async function handleCollect(item) {
  if (!isLoggedIn.value) return
  try {
    const res = await apiRequest(`/works/${item.id}/collect`, { method: 'POST' })
    if (res.code === 200) {
      item._collected = res.data.collected
      item.collect_count += res.data.collected ? 1 : -1
    }
  } catch (e) {
    console.error(e)
  }
}

// ── 上传作品 ──
const showUploadModal = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const coverInputRef = ref(null)
const coverPreview = ref('')

const uploadForm = reactive({
  title: '',
  description: '',
  coverFile: null,
  html_code: '',
  css_code: '',
  js_code: '',
  dependencies: '',
})

function triggerCoverUpload() {
  coverInputRef.value?.click()
}

function handleCoverChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadForm.coverFile = file
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverPreview.value = URL.createObjectURL(file)
}

function closeUploadModal() {
  showUploadModal.value = false
  uploadError.value = ''
  uploadForm.title = ''
  uploadForm.description = ''
  uploadForm.coverFile = null
  uploadForm.html_code = ''
  uploadForm.css_code = ''
  uploadForm.js_code = ''
  uploadForm.dependencies = ''
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value)
    coverPreview.value = ''
  }
}

async function handleUpload() {
  if (!uploadForm.title) {
    uploadError.value = '请输入作品名称'
    return
  }
  if (!uploadForm.coverFile) {
    uploadError.value = '请上传运行截图'
    return
  }

  uploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('cover', uploadForm.coverFile)
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description)
    formData.append('html_code', uploadForm.html_code)
    formData.append('css_code', uploadForm.css_code)
    formData.append('js_code', uploadForm.js_code)
    formData.append('dependencies', uploadForm.dependencies)

    const headers = {}
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(`${API_BASE}/works`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(r => r.json())

    if (res.code === 200) {
      closeUploadModal()
      fetchWorks()
    } else {
      uploadError.value = res.msg || '发布失败'
    }
  } catch (e) {
    uploadError.value = '网络错误'
  } finally {
    uploading.value = false
  }
}

onMounted(fetchWorks)

onBeforeUnmount(() => {
  if (iframeObserver) iframeObserver.disconnect()
})
</script>

<style lang="scss" scoped>
.case-page {
  position: relative;
  min-height: 100vh;
  padding: 4.5rem 1.5rem 3rem;
  overflow: hidden;
}

.page-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* ── 背景装饰 ── */
.page-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.bg-sfx {
  position: absolute;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-weight: 900;
  color: #0a0a0a;
  -webkit-text-stroke: 1px #f8f8f8;
  paint-order: stroke fill;
  opacity: 0.08;
  white-space: nowrap;
}
.bg-sfx--1 { font-size: 6rem; top: 4%; left: -2%; transform: rotate(-12deg); }
.bg-sfx--2 { font-size: 5rem; top: 18%; right: -1%; transform: rotate(8deg); }
.bg-sfx--3 { font-size: 4.5rem; bottom: 12%; left: 5%; transform: rotate(-5deg); opacity: 0.06; }
.bg-burst {
  position: absolute;
  font-size: 2.5rem;
  color: #ffd700;
  opacity: 0.25;
  animation: starPulse 1.2s ease-in-out infinite alternate;
}
.bg-burst--1 { top: 8%; right: 12%; }
.bg-burst--2 { bottom: 20%; right: 8%; animation-delay: 0.4s; }
@keyframes starPulse {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.25) rotate(15deg); }
}

/* ── 页头 ── */
.page-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.header-badge { display: inline-block; font-family: 'Bangers', 'Impact', sans-serif; font-size: 0.9rem; letter-spacing: 3px; color: #fff; background: #000; padding: 0.3rem 1.2rem; border: 2px solid #fff; box-shadow: 3px 3px 0 #555; transform: rotate(-1deg); }
.page-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 3rem; color: #000; text-shadow: 3px 3px 0 #fff, 5px 5px 0 rgba(0, 0, 0, 0.25); letter-spacing: 2px; line-height: 1.1; margin: 0; }
.page-desc { font-size: 1.05rem; font-weight: 500; color: #333; margin: 0; }

/* ── 筛选栏 ── */
.filter-bar { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.filter-label { font-family: 'Bangers', 'Impact', sans-serif; font-size: 0.9rem; letter-spacing: 1px; color: #fff; background: #000; padding: 0.4rem 1rem; border: 2px solid #fff; box-shadow: 3px 3px 0 #555; }
.upload-btn { margin-left: auto; background: #ffd700; color: #000; border-color: #000; box-shadow: 4px 4px 0 #000; }

/* ── 案例网格 ── */
.case-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

.case-card {
  position: relative;
  background: #fff;
  border: 4px solid #000;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  flex-direction: column;
  &:hover { transform: translateY(-4px); box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.25); }
}
.case-card:nth-child(odd) { transform: rotate(-0.5deg); }
.case-card:nth-child(even) { transform: rotate(0.5deg); }
.case-card:hover { transform: translateY(-4px) rotate(0deg) !important; }

.panel-tape { position: absolute; z-index: 2; width: 50px; height: 14px; background: #f0f0f0; border: 2px solid #000; box-shadow: -2px 2px rgba(0, 0, 0, 0.3); }
.panel-tape--left { top: -4px; left: 20px; transform: skew(-12deg); }
.panel-tape--right { top: -4px; right: 20px; transform: skew(12deg); }

/* ── 封面预览 ── */
.case-preview { position: relative; z-index: 1; border-bottom: 3px solid #000; background: #fff; cursor: pointer; aspect-ratio: 16/10; overflow: hidden; }
.preview-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; pointer-events: auto; transform: scale(0.6); transform-origin: top left; width: 166.67%; height: 166.67%; }
.preview-placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.preview-placeholder .cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.placeholder-badge { position: absolute; bottom: 8px; right: 8px; background: #000; color: #ffd700; padding: 2px 10px; font-family: 'Bangers', sans-serif; font-size: 0.7rem; letter-spacing: 1px; border: 2px solid #ffd700; }

/* ── 项目介绍 ── */
.case-desc { position: relative; z-index: 1; padding: 0.8rem 1rem 0.5rem; cursor: pointer; }
.desc-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.05rem; letter-spacing: 1px; color: #000; margin: 0 0 0.3rem; }
.desc-text { font-size: 0.85rem; font-weight: 500; color: #555; line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.desc-enter-btn {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.35rem 0.8rem;
  font-family: 'Bangers', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: #fff;
  background: #000;
  border: 2px solid #ffd700;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
}
.case-card:hover .desc-enter-btn {
  opacity: 1;
  transform: translateY(0);
}

/* ── 用户信息 ── */
.case-user { position: relative; z-index: 1; display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 1rem 1rem; margin-top: auto; border-top: 2px dashed #ddd; cursor: default; }
.user-avatar { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; border: 2px solid #fff; box-shadow: 2px 2px 0 #555; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.avatar-text { font-family: 'Bangers', 'Impact', sans-serif; font-size: 0.9rem; color: #fff; letter-spacing: 1px; }
.user-meta { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; }
.user-name { font-family: 'Bangers', 'Impact', sans-serif; font-size: 0.85rem; letter-spacing: 1px; color: #000; }
.user-lv { font-size: 0.7rem; font-weight: 700; color: #888; }
.case-stats { display: flex; gap: 0.3rem; align-items: center; }
.stat-item { font-size: 0.7rem; font-weight: 600; color: #555; white-space: nowrap; }
.stat-btn { font-size: 0.7rem; font-weight: 600; color: #888; background: none; border: none; cursor: pointer; padding: 2px 4px; transition: color 0.15s; &:hover { color: #000; } &.active { color: #e74c3c; } &:disabled { cursor: not-allowed; } }

/* ── 空状态 ── */
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
.empty-text { font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.2rem; color: #888; letter-spacing: 1px; }

/* ════════════════════════════════════
   上传弹窗
   ════════════════════════════════════ */
.upload-overlay { position: fixed; inset: 0; z-index: 9998; background: rgba(0, 0, 0, 0.6); display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 2rem 1rem; }
.upload-modal { width: min(95vw, 600px); background: #fff; border: 4px solid #000; box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.25); font-family: 'Comic Neue', cursive, sans-serif; }
.upload-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.2rem; border-bottom: 3px solid #000; background: #ffd700; }
.upload-title { font-size: 1.15rem; font-weight: 800; color: #000; }
.upload-close { width: 32px; height: 32px; border: 2px solid #000; background: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; &:hover { background: #ff4444; color: #fff; } }

.upload-form { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem; max-height: 70vh; overflow-y: auto; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-label { font-size: 0.85rem; font-weight: 800; color: #000; }
.required { color: #e74c3c; }
.form-input { padding: 0.6rem 0.8rem; border: 3px solid #000; font-family: inherit; font-size: 0.9rem; resize: vertical; &:focus { outline: none; border-color: #ffd700; } ::selection { color: #000; } }
.form-textarea { min-height: 50px; }
.form-code { font-family: 'Courier New', monospace; font-size: 0.8rem; background: #1e1e2e; color: #e0e0e0; border-color: #333; min-height: 80px; ::selection { color: #000; } }
.form-hint { font-size: 0.75rem; color: #888; word-break: break-all; }

.cover-upload { width: 100%; min-height: 120px; border: 3px dashed #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: border-color 0.2s; &:hover { border-color: #000; } }
.cover-preview { width: 100%; max-height: 200px; object-fit: contain; }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; color: #aaa; }
.cover-icon { font-size: 2rem; }

.upload-actions { display: flex; gap: 0.8rem; justify-content: flex-end; padding-top: 0.5rem; }
.form-error { color: #e74c3c; font-size: 0.85rem; font-weight: 600; }

/* ════════════════════════════════════
   抽屉
   ════════════════════════════════════ */
.drawer-overlay { position: fixed; inset: 0; z-index: 20000; background: rgba(0, 0, 0, 0.5); }
.drawer { position: fixed; top: 0; left: 0; z-index: 21000; width: 280px; height: 100vh; background: #fff; border-right: 4px solid #000; box-shadow: 8px 0 0 rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1rem; border-bottom: 3px solid #000; background: #000; }
.drawer-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.1rem; letter-spacing: 2px; color: #fff; }
.drawer-close { font-family: 'Bangers', sans-serif; font-size: 1rem; color: #fff; background: none; border: 2px solid #fff; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { background: #fff; color: #000; } }
.drawer-body { flex: 1; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; }
.drawer-option { display: flex; align-items: center; gap: 0.7rem; width: 100%; padding: 0.9rem 1rem; background: #fff; border: 3px solid #000; box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.15); cursor: pointer; font-family: 'Bangers', 'Impact', sans-serif; font-size: 1rem; letter-spacing: 1px; color: #000; &:hover { transform: translate(1px, 1px); box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18); } &--active { background: #000; color: #fff; box-shadow: 5px 5px 0 #555; border-color: #fff; } }
.option-icon { font-size: 1.1rem; }
.option-label { flex: 1; text-align: left; }
.option-check { font-size: 0.9rem; }
.drawer-footer { padding: 0.8rem 1rem; border-top: 3px solid #000; text-align: center; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-slide-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.drawer-slide-leave-active { transition: transform 0.2s ease; }
.drawer-slide-enter-from { transform: translateX(-100%); }
.drawer-slide-leave-to { transform: translateX(-100%); }

/* ── 漫画风格按钮 ── */
.comic-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 1rem 2.2rem; font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.2rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px;
  color: #fff; background: #000; border: 3px solid #fff;
  box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000; transition: all 0.1s ease; cursor: pointer; min-width: 120px;
  &:hover { transform: translate(2px, 2px); box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000; background: #1a1a1a; }
  &:active { transform: translate(6px, 6px); box-shadow: 2px 2px 0 #fff, 3px 3px 0 #000; background: #333; }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000; }
  &.small { padding: 0.6rem 1.2rem; font-size: 0.9rem; min-width: auto; }
  &.white { background: #fff; color: #000; border-color: #000; box-shadow: 4px 4px 0 #000, 6px 6px 0 rgba(0, 0, 0, 0.2); &:hover { background: #f0f0f0; } &:active { background: #ddd; } }
}

/* ════════════════════════════════════
   响应式
   ════════════════════════════════════ */
@media (max-width: 767px) {
  .case-page { padding: 2.5rem 0.5rem 1.5rem; }
  .page-title { font-size: 1.6rem; }
  .case-grid { grid-template-columns: 1fr; gap: 1rem; }
  .case-card { transform: none !important; &:hover { transform: translateY(-2px) !important; } }
  .upload-modal { width: 95vw; }
  .drawer { width: 260px; }
  .bg-sfx, .bg-burst { display: none; }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .case-grid { grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
}
@media (min-width: 1024px) {
  .case-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
