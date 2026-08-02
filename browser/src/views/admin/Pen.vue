<template>
  <div class="pen-page">
    <!-- 顶部工具栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="goHome">← 返回</button>
      <div class="top-center">
        <input
          v-model="codeState.title"
          class="title-input"
          placeholder="未命名 Pen"
          maxlength="50"
        />
      </div>
      <div class="top-actions">
        <button class="tool-btn" @click="run" title="运行 (Ctrl+S)">▶ 运行</button>
        <button class="tool-btn" @click="formatCode" title="格式化代码">✧ 格式化</button>
        <button class="tool-btn save" @click="saveToMyCode" :disabled="saving" title="保存到我的代码">
          {{ saving ? '⏳' : '💾' }} 我的代码
        </button>
        <button class="tool-btn upload" @click="uploadToCase" :disabled="saving" title="投稿到优秀案例">
          📤 投稿
        </button>
      </div>
    </div>

    <!-- 左右分栏 -->
    <div class="editor-layout" ref="layoutRef">
      <!-- 左侧：代码面板 -->
      <div class="editor-panel" :style="{ width: leftWidth + 'px' }">
        <div class="panel-header">
          <div class="panel-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="{ active: activeTab === tab.key }"
              @click="switchTab(tab.key)"
              class="panel-tab"
            >
              <span class="tab-dot" :class="'tab-dot--' + tab.color"></span>
              {{ tab.label }}
            </button>
          </div>
          <button class="btn-copy" @click="copyCode">📋 复制</button>
        </div>
        <div class="editor-body">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            :ref="el => setEditorRef(tab.key, el)"
            class="cm-editor-host"
            :class="{ 'cm-editor-host--active': activeTab === tab.key }"
          ></div>
        </div>
        <!-- 依赖管理 -->
        <div class="deps-bar">
          <span class="deps-label">📦 CDN 依赖（每行一个 URL）：</span>
          <div class="deps-list">
            <div v-for="(dep, i) in depList" :key="i" class="dep-tag">
              <span class="dep-tag-text">{{ depText(dep) }}</span>
              <span class="dep-tag-rm" @click="removeDep(i)">×</span>
            </div>
            <input
              v-model="depInput"
              class="dep-input"
              placeholder="输入 CDN 地址按回车添加，如 https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"
              @keydown.enter.prevent="addDep"
            />
          </div>
        </div>
      </div>

      <!-- 拖拽分隔条 -->
      <div class="divider" @mousedown="startDrag" ref="dividerRef">
        <div class="divider-handle"></div>
      </div>

      <!-- 右侧：预览面板 -->
      <div class="preview-panel" :style="{ width: rightWidth + 'px' }">
        <div class="panel-header">
          <div class="panel-tabs">
            <span class="panel-tab active">
              <span class="tab-dot tab-dot--green"></span>
              预览
            </span>
          </div>
          <span class="panel-info" v-if="lastRunTime">上次运行: {{ lastRunTime }}</span>
        </div>
        <div class="preview-body">
          <iframe
            v-if="previewHTML"
            ref="previewRef"
            class="preview-iframe"
            :srcdoc="previewHTML"
            sandbox="allow-scripts"
            title="实时预览"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { keymap as cmKeymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion } from '@codemirror/autocomplete'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'
import { usePenCode, buildPenPreview } from '../../composables/usePenCode.js'

const router = useRouter()
const API_BASE = '/api'
const { isLoggedIn, token } = useAuth()

// 持久化状态
const codeState = usePenCode()

const title = computed({
  get: () => codeState.title,
  set: v => codeState.title = v,
})

const activeTab = ref('html')
const layoutRef = ref(null)
const dividerRef = ref(null)
const previewRef = ref(null)
const lastRunTime = ref('')
const previewHTML = ref('')
const saving = ref(false)
const depInput = ref('')

const tabs = [
  { key: 'html', label: 'HTML', color: 'red' },
  { key: 'css', label: 'CSS', color: 'blue' },
  { key: 'js', label: 'JS', color: 'yellow' },
]

// CDN 依赖列表
const depList = ref([])
if (codeState.deps) {
  depList.value = codeState.deps.split('\n').map(l => l.trim()).filter(Boolean)
}

function depText(url) {
  try { return new URL(url).hostname + '...' }
  catch { return url.substring(0, 30) + (url.length > 30 ? '...' : '') }
}

function addDep() {
  const val = depInput.value.trim()
  if (!val) return
  if (!depList.value.includes(val)) depList.value.push(val)
  codeState.deps = depList.value.join('\n')
  depInput.value = ''
  scheduleRun()
}

function removeDep(i) {
  depList.value.splice(i, 1)
  codeState.deps = depList.value.join('\n')
  scheduleRun()
}

// 编辑器实例
const editors = {}
const editorRefs = {}

function setEditorRef(key, el) {
  if (el) editorRefs[key] = el
}

// 分栏宽度
const leftWidth = ref(Math.floor(window.innerWidth * 0.45))
const rightWidth = ref(Math.floor(window.innerWidth * 0.55 - 8))
const MIN_WIDTH = 200

function initLayout() {
  if (!layoutRef.value) return
  const total = layoutRef.value.offsetWidth - 8
  leftWidth.value = Math.floor(total * 0.45)
  rightWidth.value = total - leftWidth.value
}

// 拖拽
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

// 创建编辑器
function createEditor(key) {
  const langMap = { html, css, js: javascript }
  const editorEl = editorRefs[key]
  if (!editorEl) return

  const updateListener = EditorView.updateListener.of(update => {
    if (update.docChanged) {
      codeState[key] = update.state.doc.toString()
      scheduleRun()
    }
  })

  const state = EditorState.create({
    doc: codeState[key] || '',
    extensions: [
      basicSetup,
      langMap[key](),
      oneDark,
      autocompletion({ override: [completions(key)] }),
      updateListener,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '14px' },
        '.cm-gutters': { borderRight: '1px solid #333' },
      }),
      EditorView.lineWrapping,
      keymap(),
    ],
  })

  editors[key] = new EditorView({ state, parent: editorEl })
}

// 键盘快捷键
function keymap() {
  return cmKeymap.of([{
    key: 'Ctrl-s',
    run: () => { run(); return true },
  }, {
    key: 'Mod-s',
    run: () => { run(); return true },
  }])
}

// 语言补全
function completions(key) {
  return context => {
    const word = context.matchBefore(/\w*/)
    if (!word || word.from === word.to) return null
    const htmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'a', 'img', 'button', 'input', 'form', 'ul', 'li', 'section', 'header', 'footer', 'nav', 'main', 'article', 'table', 'tr', 'td', 'th']
    const cssProps = ['color', 'background', 'margin', 'padding', 'border', 'font-size', 'width', 'height', 'display', 'position', 'flex', 'grid', 'align-items', 'justify-content', 'background-color', 'border-radius', 'box-shadow', 'transition', 'transform', 'opacity', 'z-index']
    const jsKeywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'console', 'document', 'window', 'addEventListener', 'querySelector', 'getElementById', 'classList', 'setTimeout', 'fetch', 'async', 'await', 'Promise', 'map', 'filter', 'reduce', 'forEach', 'Math']
    let options = []
    if (key === 'html') options = htmlTags
    else if (key === 'css') options = cssProps
    else if (key === 'js') options = jsKeywords
    return { from: word.from, options: options.map(tag => ({ label: tag, type: 'keyword' })) }
  }
}

function switchTab(key) {
  activeTab.value = key
  nextTick(() => {
    editors[key]?.focus()
    editors[key]?.requestMeasure()
  })
}

function getCode(key) {
  return editors[key]?.state?.doc?.toString() || codeState[key] || ''
}

function buildPreview() {
  return buildPenPreview(getCode('html'), getCode('css'), getCode('js'), codeState.deps)
}

let runTimer = null
function scheduleRun() {
  clearTimeout(runTimer)
  runTimer = setTimeout(() => {
    previewHTML.value = buildPreview()
  }, 400)
}

function run() {
  previewHTML.value = buildPreview()
  const now = new Date()
  lastRunTime.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
}

function formatCode() {
  const key = activeTab.value
  const code = getCode(key)
  if (!code) return
  if (key === 'html') {
    let formatted = code
      .replace(/>\s+</g, '>\n<')
      .replace(/(<[^/][^>]*>)([^<]+)(<\/[^>]+>)/g, (_, open, text, close) => {
        if (text.trim()) return `${open}\n  ${text.trim()}\n${close}`
        return _
      })
    editors[key]?.dispatch({
      changes: { from: 0, to: editors[key].state.doc.length, insert: formatted }
    })
  } else if (key === 'css') {
    let formatted = code
      .replace(/}/g, '}\n')
      .replace(/\{/g, ' {\n  ')
      .replace(/;/g, ';\n  ')
      .replace(/;\s*\n\s*}/g, ';\n}')
    editors[key]?.dispatch({
      changes: { from: 0, to: editors[key].state.doc.length, insert: formatted }
    })
  }
}

function copyCode() {
  const code = getCode(activeTab.value)
  navigator.clipboard.writeText(code).catch(() => {})
}

async function apiPost(url, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token.value) headers['Authorization'] = `Bearer ${token.value}`
  const res = await fetch(`${API_BASE}${url}`, { method: 'POST', headers, body: JSON.stringify(body) })
  return res.json()
}

function goHome() {
  handleGoBack()
}

function handleGoBack() {
  const fromPath = sessionStorage.getItem('mato_from_path')
  if (fromPath) {
    sessionStorage.removeItem('mato_from_path')
    router.push(fromPath)
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/Home')
  }
}

// 保存到我的代码
async function saveToMyCode() {
  if (!isLoggedIn.value) {
    alert('请先登录')
    router.push('/Profile')
    return
  }
  saving.value = true
  try {
    const data = await apiPost('/works/save-pen', {
      title: codeState.title || '未命名 Pen',
      html_code: getCode('html'),
      css_code: getCode('css'),
      js_code: getCode('js'),
      dependencies: codeState.deps,
    })
    alert(data.msg || (data.code === 200 ? '保存成功！' : '保存失败'))
  } catch (e) {
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 投稿到优秀案例
async function uploadToCase() {
  if (!isLoggedIn.value) {
    alert('请先登录')
    router.push('/Profile')
    return
  }
  saving.value = true
  try {
    const data = await apiPost('/works/save-pen', {
      title: codeState.title || '未命名 Pen',
      html_code: getCode('html'),
      css_code: getCode('css'),
      js_code: getCode('js'),
      dependencies: codeState.deps,
      for_case: true,
    })
    if (data.code === 200) {
      alert('投稿成功！等待审核后将在优秀案例中展示。')
    } else {
      alert(data.msg || '投稿失败')
    }
  } catch (e) {
    alert('投稿失败，请重试')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await nextTick()
  initLayout()
  tabs.forEach(tab => createEditor(tab.key))
  await nextTick()
  switchTab('html')
  if (codeState.html) previewHTML.value = buildPreview()
  window.addEventListener('resize', initLayout)
})

onUnmounted(() => {
  clearTimeout(runTimer)
  Object.values(editors).forEach(e => e.destroy())
  window.removeEventListener('resize', initLayout)
})
</script>

<style lang="scss" scoped>
.pen-page {
  height: 100vh;
  background: #1e1e2e;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 1rem;
  background: #16161e;
  border-bottom: 2px solid #2d2d3f;
  gap: 1rem;
  flex-shrink: 0;
  height: 44px;
}

.back-btn {
  padding: 0.3rem 0.7rem;
  border: 2px solid #444;
  background: #2d2d3f;
  color: #ccc;
  font-family: 'Bangers', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  &:hover { background: #3d3d5f; color: #fff; }
}

.top-center { flex: 1; }
.title-input {
  width: 100%;
  max-width: 400px;
  padding: 0.3rem 0.6rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #fff;
  font-family: 'Bangers', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-bottom-color: #ffd700; }
  &::placeholder { color: #555; }
}

.top-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

.tool-btn {
  padding: 0.3rem 0.8rem;
  border: 1px solid #444;
  background: #2d2d3f;
  color: #ccc;
  font-size: 0.75rem;
  font-family: 'Bangers', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  &:hover { background: #3d3d5f; color: #fff; }
  &.save { border-color: #ffd700; color: #ffd700; &:hover { background: #ffd700; color: #000; } }
  &.upload { border-color: #28c840; color: #28c840; &:hover { background: #28c840; color: #000; } }
}

.editor-layout { flex: 1; display: flex; overflow: hidden; min-height: 0; }
.editor-panel { display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; }
.preview-panel { display: flex; flex-direction: column; overflow: hidden; flex: 1; }

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
.panel-tabs { display: flex; gap: 0; height: 100%; }
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
  &.active { color: #fff; border-bottom-color: #ffd700; }
}
.tab-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  &--red { background: #ff5f57; } &--blue { background: #5e9cf2; }
  &--yellow { background: #ffbd2e; } &--green { background: #28c840; }
}
.panel-info { font-size: 0.7rem; color: #555; font-family: monospace; }
.btn-copy {
  display: flex; align-items: center; gap: 4px;
  padding: 2px 8px; border: 1px solid #444; background: transparent;
  color: #888; font-size: 0.7rem; cursor: pointer; border-radius: 4px; white-space: nowrap;
  &:hover { color: #fff; border-color: #ffd700; }
}

.editor-body { flex: 1; overflow: hidden; position: relative; background: #282c34; }
.cm-editor-host { position: absolute; inset: 0; display: none; &--active { display: block; } }

/* CDN 依赖栏 */
.deps-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #1a1a2e;
  border-top: 1px solid #2d2d3f;
  flex-shrink: 0;
  min-height: 30px;
  flex-wrap: wrap;
}
.deps-label { font-size: 0.7rem; color: #666; white-space: nowrap; }
.deps-list { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; flex: 1; }
.dep-tag {
  display: flex; align-items: center; gap: 3px;
  padding: 1px 6px; background: #2d2d3f; border-radius: 3px; font-size: 0.65rem;
  color: #aaa; white-space: nowrap;
}
.dep-tag-rm { cursor: pointer; color: #f55; font-weight: bold; &:hover { color: #f00; } }
.dep-input {
  flex: 1; min-width: 150px;
  padding: 2px 6px; background: #282c34; border: 1px solid #333; border-radius: 3px;
  color: #aaa; font-size: 0.7rem; outline: none; font-family: monospace;
  &:focus { border-color: #ffd700; color: #fff; }
}

.preview-body { flex: 1; overflow: hidden; background: #fff; }
.preview-iframe { width: 100%; height: 100%; border: none; }

.divider {
  width: 8px; background: #2d2d3f; cursor: col-resize;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  &:hover { background: #ffd700; }
}
.divider-handle { width: 2px; height: 30px; background: #555; border-radius: 1px; }
.divider:hover .divider-handle { background: #000; }

@media (max-width: 767px) {
  .editor-layout { flex-direction: column; }
  .editor-panel { width: 100% !important; height: 45vh; flex-shrink: 0; }
  .preview-panel { width: 100% !important; flex: 1; }
  .divider { width: 100%; height: 6px; cursor: row-resize; }
  .divider-handle { width: 30px; height: 2px; }
  .top-bar { padding: 0.3rem 0.5rem; }
  .title-input { font-size: 0.85rem; }
}
</style>
