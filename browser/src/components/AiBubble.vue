<template>
  <Teleport to="body">
    <!-- 选中文本后出现的"问AI"触发按钮 -->
    <button
      v-if="showTrigger && !showPanel"
      ref="triggerRef"
      class="ai-trigger"
      :style="triggerStyle"
      @click="handleAsk"
    >
      问AI ✨
    </button>

    <!-- AI 回答面板 -->
    <div
      v-if="showPanel"
      class="ai-panel-overlay"
      @click.self="closePanel"
    >
      <div
        ref="panelRef"
        class="ai-panel"
        :style="panelStyle"
        @click.stop
      >
        <!-- 面板头部 -->
        <div class="ai-panel-header">
          <span class="ai-panel-label">✨ AI 解读</span>
          <button class="ai-panel-close" @click="closePanel">✕</button>
        </div>

        <!-- 选中文本摘要 -->
        <div class="ai-panel-quote">
          <span class="ai-quote-mark">"</span>
          <span class="ai-quote-text">{{ truncatedText }}</span>
          <span class="ai-quote-mark">"</span>
        </div>

        <!-- AI 回答内容 -->
        <div class="ai-panel-body">
          <div v-if="isLoading && !aiResponse" class="ai-loading">
            <span class="ai-loading-dot"></span>
            <span class="ai-loading-dot"></span>
            <span class="ai-loading-dot"></span>
          </div>
          <div
            v-else
            class="ai-response markdown-body"
            v-html="renderedResponse"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  containerRef: {
    type: Object,
    default: null
  },
  context: {
    type: String,
    default: ''
  }
})

const showTrigger = ref(false)
const showPanel = ref(false)
const selectedText = ref('')
const aiResponse = ref('')
const isLoading = ref(false)
const position = ref({ top: 0, left: 0 })
const triggerRef = ref(null)
const panelRef = ref(null)

// 光标动画计时器
let abortController = null

// 选中文本摘要（截断显示）
const truncatedText = computed(() => {
  const t = selectedText.value
  return t.length > 80 ? t.slice(0, 80) + '…' : t
})

// 渲染后的 Markdown 回答
const renderedResponse = computed(() => {
  if (!aiResponse.value) return ''
  return marked.parse(aiResponse.value)
})

// 触发按钮位置
const triggerStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`
}))

// 面板位置
const panelStyle = computed(() => {
  const pos = position.value
  const vw = window.innerWidth
  const vh = window.innerHeight
  const panelW = Math.min(400, vw - 32)
  let left = pos.left
  let top = pos.top

  // 右边界
  if (left + panelW > vw - 16) {
    left = Math.max(16, vw - panelW - 16)
  }
  // 左边界
  if (left < 16) {
    left = 16
  }
  // 底部边界：面板向上展示
  if (top + 350 > vh) {
    top = Math.max(16, pos.top - 350)
  }

  return {
    '--panel-left': `${left}px`,
    '--panel-top': `${top}px`,
    '--panel-w': `${panelW}px`
  }
})

// 监听文本选中
function handleMouseUp(e) {
  // 点击面板内部不处理
  if (panelRef.value?.contains(e.target)) return
  if (triggerRef.value?.contains(e.target)) return

  // 稍微延迟让浏览器完成选中
  setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      showTrigger.value = false
      return
    }

    const text = sel.toString().trim()
    if (text.length <= 2) {
      showTrigger.value = false
      return
    }

    // 如果指定了容器，检查选中是否在容器内
    if (props.containerRef?.value) {
      const container = props.containerRef.value
      if (!container.contains(sel.anchorNode)) {
        showTrigger.value = false
        return
      }
    }

    // 获取选区位置
    try {
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft

      position.value = {
        top: rect.top + scrollTop - 40,
        left: rect.left + scrollLeft + rect.width / 2 - 42
      }
    } catch {
      showTrigger.value = false
      return
    }

    selectedText.value = text
    showTrigger.value = true
  }, 10)
}

// 点击"问AI"按钮
async function handleAsk() {
  showTrigger.value = false

  // 计算面板出现位置（在选区上方居中）
  const sel = window.getSelection()
  if (sel && !sel.isCollapsed) {
    try {
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft

      position.value = {
        top: rect.top + scrollTop - 10,
        left: rect.left + scrollLeft + rect.width / 2 - 200
      }
    } catch {
      // 保持原位置
    }
  }

  showPanel.value = true
  aiResponse.value = ''
  isLoading.value = true

  await fetchAiExplanation()
}

// 请求 AI 解释
async function fetchAiExplanation() {
  abortController = new AbortController()

  try {
    const response = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: selectedText.value, context: props.context }),
      signal: abortController.signal,
    })

    const data = await response.json()

    if (!response.ok || data.code !== 200) {
      aiResponse.value = data.msg || `请求失败 (${response.status})`
    } else {
      aiResponse.value = data.data || '(无回复)'
    }
  } catch (err) {
    if (err.name === 'AbortError') return
    aiResponse.value = '网络异常，请检查连接后重试。'
  } finally {
    isLoading.value = false
  }
}

// 关闭面板
function closePanel() {
  showPanel.value = false
  aiResponse.value = ''
  isLoading.value = false
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

// ESC 关闭
function handleKeydown(e) {
  if (e.key === 'Escape' && showPanel.value) {
    closePanel()
  }
}

// 点击面板外部关闭（在 overlay 层已通过 @click.self 处理）
// 额外：当选中变化时隐藏触发按钮
function handleSelectionChange() {
  if (showPanel.value) return
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.toString().trim().length <= 2) {
    showTrigger.value = false
  }
}

onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('selectionchange', handleSelectionChange)
  if (abortController) {
    abortController.abort()
  }
})
</script>

<style scoped lang="scss">
$font-accent: 'Bangers', 'Impact', sans-serif;
$font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
  'Microsoft YaHei', 'Helvetica Neue', sans-serif;
$font-mono: 'Consolas', 'Courier New', monospace;

/* ========== 触发按钮 ========== */
.ai-trigger {
  position: absolute;
  z-index: 9999;
  padding: 5px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: $font-sans;
  color: #fff;
  background: var(--comic-black);
  border: 2px solid var(--comic-black);
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  white-space: nowrap;
  user-select: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.35);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.25);
  }
}

/* ========== 面板遮罩 ========== */
.ai-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.15);
  animation: ai-overlay-in 0.15s ease;
}

@keyframes ai-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ========== AI 面板 ========== */
.ai-panel {
  position: absolute;
  top: var(--panel-top);
  left: var(--panel-left);
  width: var(--panel-w);
  max-height: min(420px, 70vh);
  background: #fff;
  border: 3px solid var(--comic-black);
  border-radius: 10px;
  box-shadow: 4px 4px 0 #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ai-panel-in 0.2s ease;
  font-family: $font-sans;
}

@keyframes ai-panel-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 面板头部 */
.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background: var(--comic-black);
  color: #fff;
  flex-shrink: 0;
}

.ai-panel-label {
  font-family: $font-accent;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.ai-panel-close {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  background: transparent;
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

/* 选中文本摘要 */
.ai-panel-quote {
  padding: 0.6rem 0.85rem;
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.8125rem;
  color: #555;
  line-height: 1.5;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 2px;
}

.ai-quote-mark {
  font-family: Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--comic-black);
  line-height: 1;
}

.ai-quote-text {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

/* 面板主体 */
.ai-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.85rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #333;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
}

/* loading 动画 */
.ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 1.5rem 0;
}

.ai-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--comic-black);
  animation: ai-dot-bounce 1.2s infinite ease-in-out;

  &:nth-child(2) {
    animation-delay: 0.15s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
}

@keyframes ai-dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* AI 回答的 Markdown 样式 */
.ai-response {
  :deep(p) {
    margin-bottom: 0.6rem;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: #1a1a1a;
  }

  :deep(code) {
    font-family: $font-mono;
    font-size: 0.8em;
    background: #f0f0f0;
    padding: 0.1em 0.3em;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    color: #c7254e;
  }

  :deep(pre) {
    margin: 0.5rem 0;
    padding: 0.6rem 0.75rem;
    background: #282c34;
    border: 2px solid var(--comic-black);
    border-radius: 4px;
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
    overflow-x: auto;

    code {
      background: none;
      border: none;
      padding: 0;
      color: #abb2bf;
      font-size: 0.8rem;
      line-height: 1.5;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.25rem;
    margin-bottom: 0.5rem;
  }

  :deep(li) {
    margin-bottom: 0.25rem;
  }

  :deep(blockquote) {
    margin: 0.5rem 0;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--comic-black);
    background: #f5f5f5;
    border-radius: 0 4px 4px 0;
    font-size: 0.85rem;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    font-family: $font-sans;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0.75rem 0 0.35rem;
    letter-spacing: normal;
    text-transform: none;
    text-shadow: none;
  }

  :deep(h2) { font-size: 1rem; }
  :deep(h3) { font-size: 0.95rem; }
  :deep(h4) { font-size: 0.9rem; }
}

/* ========== 手机端响应式 ========== */
@media (max-width: 767px) {
  .ai-panel {
    position: fixed !important;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-height: 65vh;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
    animation: ai-panel-in-mobile 0.25s ease;
  }

  .ai-panel-overlay {
    background: rgba(0, 0, 0, 0.3);
  }
}

@keyframes ai-panel-in-mobile {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
