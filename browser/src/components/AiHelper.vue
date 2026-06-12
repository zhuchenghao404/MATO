<template>
    <div class="ai-helper">
        <!-- 悬浮按钮 -->
        <button
            class="ai-fab"
            :class="{ 'ai-fab--active': isOpen }"
            @click="togglePanel"
            @mousedown.prevent="startDragFab"
            aria-label="AI助手"
            :style="fabPos"
        >
            <span class="ai-fab__icon">
                <template v-if="isOpen">✕</template>
                <img v-else :src="aiIcon" alt="AI" class="ai-fab__img" width="56" height="56" />
            </span>
        </button>

        <!-- AI面板 -->
        <Transition name="ai-panel">
            <div v-if="isOpen" class="ai-panel" :style="panelPos">
                <div class="ai-panel__header" @mousedown.prevent="startDragPanel">
                    <span class="ai-panel__title">✨ AI助手</span>
                    <span class="ai-panel__drag-hint">↕ 拖拽移动</span>
                    <button class="ai-panel__close" @click.stop="togglePanel">✕</button>
                </div>
                <div class="ai-panel__body" ref="bodyRef">
                    <div v-if="isLoading" class="ai-loading">
                        <span class="ai-loading__dots">
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                        正在分析题目
                    </div>
                    <div v-else class="ai-content" v-html="renderedResponse"></div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, reactive } from 'vue'
import { marked } from 'marked'
import aiIcon from '../assets/aicon.png'

const props = defineProps({
    question: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    topic: { type: String, default: '' },
})

const isOpen = ref(false)
const aiResponse = ref('')
const isLoading = ref(false)
const lastQuestion = ref('')
const bodyRef = ref(null)

// ── 拖拽状态 ──
const fabPos = reactive({ right: '20px', bottom: '20px' })
const panelPos = reactive({ right: '76px', bottom: '20px' })
let dragging = null // 'fab' | 'panel' | null
let dragStart = { x: 0, y: 0, startX: 0, startY: 0 }

function startDragFab(e) {
  dragging = 'fab'
  dragStart = { x: e.clientX, y: e.clientY, startX: parseInt(fabPos.right) || 20, startY: parseInt(fabPos.bottom) || 20 }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function startDragPanel(e) {
  dragging = 'panel'
  dragStart = { x: e.clientX, y: e.clientY, startX: parseInt(panelPos.right) || 76, startY: parseInt(panelPos.bottom) || 20 }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  if (dragging === 'fab') {
    fabPos.right = Math.max(0, Math.min(window.innerWidth - 60, dragStart.startX - dx)) + 'px'
    fabPos.bottom = Math.max(0, Math.min(window.innerHeight - 60, dragStart.startY - dy)) + 'px'
  } else if (dragging === 'panel') {
    panelPos.right = Math.max(0, Math.min(window.innerWidth - 360, dragStart.startX - dx)) + 'px'
    panelPos.bottom = Math.max(0, Math.min(window.innerHeight - 420, dragStart.startY - dy)) + 'px'
  }
}

function stopDrag() {
  dragging = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 生成题目标识，用于判断是否需要重新请求
const questionKey = computed(() => {
    const optText = props.options.map(o => `${o.key}:${o.text}`).join('|')
    return `${props.question}||${optText}||${props.type}`
})

// 使用 marked 渲染 Markdown
const renderedResponse = computed(() => {
    if (!aiResponse.value) return ''
    return marked.parse(aiResponse.value)
})

// 自动滚动到底部
async function scrollToBottom() {
    await nextTick()
    if (bodyRef.value) {
        bodyRef.value.scrollTop = bodyRef.value.scrollHeight
    }
}

// 切换面板
function togglePanel() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        fetchAnswer()
    }
}

// 请求 AI 解答
async function fetchAnswer() {
    // 题目未变则使用缓存
    if (questionKey.value === lastQuestion.value && aiResponse.value) {
        return
    }

    if (!props.question) return

    isLoading.value = true
    aiResponse.value = ''
    lastQuestion.value = questionKey.value

    try {
        const response = await fetch('/api/ai/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: props.question,
                options: props.options,
                type: props.type,
                topic: props.topic,
            }),
        })

        const data = await response.json()

        if (!response.ok || data.code !== 200) {
            aiResponse.value = data.msg || '请求失败，请稍后再试'
        } else {
            aiResponse.value = data.data || '(无回复)'
        }
    } catch (err) {
        console.error('AI助手请求失败:', err)
        aiResponse.value = '网络错误，请检查连接后重试'
    } finally {
        isLoading.value = false
        scrollToBottom()
    }
}

// 题目变化时，如果面板打开则自动重新请求
watch(questionKey, (newKey) => {
    if (isOpen.value && newKey !== lastQuestion.value) {
        fetchAnswer()
    }
})
</script>

<style lang="scss" scoped>
.ai-helper {
    position: fixed;
    z-index: 9999;
    inset: 0;
    pointer-events: none;
}

.ai-helper > * {
    pointer-events: auto;
}

/* 悬浮按钮 */
.ai-fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 3px solid #000;
    background: #000;
    color: #fff;
    font-size: 1.5rem;
    cursor: grab;
    padding: 0;
    box-shadow: 3px 3px 0 #000;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 2;

    &:hover {
        transform: scale(1.1);
        box-shadow: 4px 4px 0 #000;
    }

    &:active {
        transform: scale(0.95);
        box-shadow: 2px 2px 0 #000;
    }

    &--active {
        background: #ff6b6b;
        border-color: #000;
    }
}

.ai-fab__icon {
    line-height: 1;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-fab__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
}

/* AI面板 */
.ai-panel {
    position: fixed;
    right: 76px;
    bottom: 20px;
    width: 350px;
    height: 400px;
    background: #fff;
    border: 3px solid #000;
    border-radius: 12px;
    box-shadow: 5px 5px 0 #000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
}

/* 面板入场动画 */
.ai-panel-enter-active {
    animation: aiPanelIn 0.25s ease-out;
}
.ai-panel-leave-active {
    animation: aiPanelOut 0.2s ease-in;
}

@keyframes aiPanelIn {
    from {
        opacity: 0;
        transform: scale(0.5) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes aiPanelOut {
    from {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    to {
        opacity: 0;
        transform: scale(0.5) translateY(20px);
    }
}

/* 面板头部 */
.ai-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    background: #ffd700;
    border-bottom: 3px solid #000;
    flex-shrink: 0;
    cursor: grab;
    user-select: none;
}

.ai-panel__drag-hint {
    font-size: 0.7rem;
    color: rgba(0,0,0,0.35);
    margin-left: auto;
    margin-right: 8px;
}

.ai-panel__title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.15rem;
    letter-spacing: 2px;
    color: #000;
    font-weight: 900;
}

.ai-panel__close {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #000;
    background: #fff;
    color: #000;
    font-size: 0.85rem;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 2px 0 #000;
    transition: transform 0.1s, background 0.1s;

    &:hover {
        background: #ff6b6b;
        color: #fff;
        transform: scale(1.1);
    }
}

/* 面板内容区 */
.ai-panel__body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    font-size: 0.9rem;
    line-height: 1.7;
    color: #222;
    word-break: break-word;

    &::-webkit-scrollbar {
        width: 5px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
    }
}

/* Loading 状态 */
.ai-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-weight: 500;
    padding: 0.5rem 0;
}

.ai-loading__dots {
    display: inline-flex;
    gap: 2px;

    span {
        animation: dotBounce 1.2s infinite;
        font-weight: 900;
        font-size: 1.2rem;
        color: #ffd700;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
    }
}

@keyframes dotBounce {
    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-3px); }
}

/* Markdown 渲染内容 */
.ai-content {
    :deep(h1), :deep(h2), :deep(h3) {
        font-family: 'Bangers', 'Impact', sans-serif;
        color: #000;
        margin: 0.8rem 0 0.4rem;
        letter-spacing: 1px;
    }

    :deep(h1) { font-size: 1.3rem; }
    :deep(h2) { font-size: 1.15rem; }
    :deep(h3) { font-size: 1.05rem; }

    :deep(p) {
        margin: 0.4rem 0;
    }

    :deep(ul), :deep(ol) {
        margin: 0.4rem 0;
        padding-left: 1.2rem;
    }

    :deep(li) {
        margin: 0.2rem 0;
    }

    :deep(code) {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.82rem;
        background: #1e1e2e;
        color: #cdd6f4;
        padding: 0.15rem 0.4rem;
        border-radius: 3px;
        border: 1px solid #000;
    }

    :deep(pre) {
        background: #1e1e2e;
        border: 2px solid #000;
        border-radius: 4px;
        padding: 0.8rem;
        overflow-x: auto;
        margin: 0.5rem 0;

        code {
            background: none;
            border: none;
            padding: 0;
            color: #cdd6f4;
        }
    }

    :deep(strong) {
        color: #000;
        font-weight: 800;
    }

    :deep(em) {
        color: #555;
    }

    :deep(blockquote) {
        border-left: 3px solid #ffd700;
        padding-left: 0.8rem;
        margin: 0.5rem 0;
        color: #555;
    }
}

/* 响应式 */
@media (max-width: 767px) {
    .ai-panel {
        width: calc(100vw - 40px);
    }
}
</style>
