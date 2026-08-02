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

                <!-- 聊天消息区 -->
                <div class="ai-panel__body" ref="bodyRef">
                    <!-- 初始状态：询问用户是否需要解答 -->
                    <div v-if="!hasStarted && !isLoading" class="ai-welcome">
                        <div class="ai-welcome__icon">🤔</div>
                        <p class="ai-welcome__text">需要 AI 帮你解答这道题吗？</p>
                        <p class="ai-welcome__hint">
                            <template v-if="aiRemaining !== null">今日剩余 {{ aiRemaining }} 次 AI 额度</template>
                            <template v-else>每次解答消耗 1 次 AI 额度，每日共 10 次</template>
                        </p>
                        <div class="ai-welcome__actions">
                            <button class="ai-welcome__btn ai-welcome__btn--primary" @click="startAnswer">
                                ✨ 解答
                            </button>
                            <span class="ai-welcome__or">或</span>
                            <button class="ai-welcome__btn ai-welcome__btn--ghost" @click="togglePanel">
                                先看看
                            </button>
                        </div>
                    </div>

                    <!-- 加载中 -->
                    <div v-if="isLoading && chatMessages.length === 0" class="ai-loading">
                        <span class="ai-loading__dots"><span>.</span><span>.</span><span>.</span></span>
                        正在分析题目
                    </div>

                    <!-- 消息列表 -->
                    <template v-for="(msg, i) in chatMessages" :key="i">
                        <div class="chat-bubble" :class="'chat-bubble--' + msg.role">
                            <div class="chat-bubble__label">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
                            <div class="chat-bubble__content" v-html="mdToHtml(msg.content)"></div>
                        </div>
                    </template>

                    <!-- 追问时加载中 -->
                    <div v-if="isLoading && chatMessages.length > 0" class="ai-loading">
                        <span class="ai-loading__dots"><span>.</span><span>.</span><span>.</span></span>
                        AI 正在回复
                    </div>
                </div>

                <!-- 追问输入框（仅在已开始对话后显示） -->
                <div v-if="hasStarted" class="ai-panel__input">
                    <textarea
                        v-model="followUpText"
                        class="follow-input"
                        placeholder="继续追问..."
                        rows="2"
                        maxlength="500"
                        @keydown.enter.exact.prevent="sendFollowUp"
                    ></textarea>
                    <button
                        class="follow-send"
                        :disabled="!followUpText.trim() || isLoading"
                        @click="sendFollowUp"
                        title="发送 (Enter)"
                    >发送</button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, reactive } from 'vue'
import { marked } from 'marked'
import { useAuth } from '../stores/auth.js'
import aiIcon from '../assets/aicon.png'

const { token } = useAuth()

const props = defineProps({
    question: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    topic: { type: String, default: '' },
})

const isOpen = ref(false)
const isLoading = ref(false)
const hasStarted = ref(false)
const lastQuestion = ref('')
const bodyRef = ref(null)
const followUpText = ref('')
const aiRemaining = ref(null)  // AI 剩余次数

// 聊天消息列表 [{ role: 'user'|'assistant', content: '...' }]
const chatMessages = ref([])

// ── 拖拽状态 ──
const fabPos = reactive({ right: '20px', bottom: '20px' })
const panelPos = reactive({ right: '76px', bottom: '20px' })
let dragging = null
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
    panelPos.bottom = Math.max(0, Math.min(window.innerHeight - 480, dragStart.startY - dy)) + 'px'
  }
}

function stopDrag() {
  dragging = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Markdown 渲染
function mdToHtml(text) {
    if (!text) return ''
    return marked.parse(text)
}

const questionKey = computed(() => {
    const optText = props.options.map(o => `${o.key}:${o.text}`).join('|')
    return `${props.question}||${optText}||${props.type}`
})

// 自动滚动到底部
async function scrollToBottom() {
    await nextTick()
    if (bodyRef.value) {
        bodyRef.value.scrollTop = bodyRef.value.scrollHeight
    }
}

function togglePanel() {
    isOpen.value = !isOpen.value
    // 关闭时重置状态
    if (!isOpen.value) {
        hasStarted.value = false
        chatMessages.value = []
    }
}

// 用户点击"解答"按钮
function startAnswer() {
    hasStarted.value = true
    fetchAnswer()
}

// 初始请求 AI 解答
async function fetchAnswer() {
    if (questionKey.value === lastQuestion.value && chatMessages.value.length > 0) return
    if (!props.question) return

    isLoading.value = true
    chatMessages.value = []
    lastQuestion.value = questionKey.value

    // 构建用户问题的显示文本
    const optText = props.options?.length
        ? '\n选项：' + props.options.map(o => `${o.key}. ${o.text}`).join('  ')
        : ''
    const questionPreview = props.question + optText

    try {
        const headers = { 'Content-Type': 'application/json' }
        if (token.value) headers['Authorization'] = `Bearer ${token.value}`
        const response = await fetch('/api/ai/solve', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                question: props.question,
                options: props.options,
                type: props.type,
                topic: props.topic,
            }),
        })
        const data = await response.json()
        if (data.remaining !== undefined) aiRemaining.value = data.remaining
        const content = data.code === 200 ? (data.data || '(无回复)') : (data.msg || '请求失败')
        chatMessages.value = [
            { role: 'user', content: questionPreview },
            { role: 'assistant', content },
        ]
    } catch {
        chatMessages.value = [
            { role: 'user', content: questionPreview },
            { role: 'assistant', content: '网络错误，请检查连接后重试' },
        ]
    } finally {
        isLoading.value = false
        scrollToBottom()
    }
}

// 追问
async function sendFollowUp() {
    const text = followUpText.value.trim()
    if (!text || isLoading.value) return

    followUpText.value = ''
    chatMessages.value.push({ role: 'user', content: text })
    isLoading.value = true
    scrollToBottom()

    try {
        const headers = { 'Content-Type': 'application/json' }
        if (token.value) headers['Authorization'] = `Bearer ${token.value}`
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages: chatMessages.value.slice(-10), // 最近10条
                topic: props.topic,
            }),
        })
        const data = await response.json()
        if (data.remaining !== undefined) aiRemaining.value = data.remaining
        const content = data.code === 200 ? (data.data || '(无回复)') : (data.msg || '请求失败')
        chatMessages.value.push({ role: 'assistant', content })
    } catch {
        chatMessages.value.push({ role: 'assistant', content: '网络错误，请重试' })
    } finally {
        isLoading.value = false
        scrollToBottom()
    }
}

// 题目变化时：自动收起面板，重置为待确认状态
watch(questionKey, (newKey) => {
    if (newKey !== lastQuestion.value) {
        isOpen.value = false
        hasStarted.value = false
        chatMessages.value = []
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
.ai-helper > * { pointer-events: auto; }

/* 悬浮按钮 */
.ai-fab {
    width: 56px; height: 56px; border-radius: 50%;
    border: 3px solid #000; background: #000; color: #fff;
    font-size: 1.5rem; cursor: grab; padding: 0;
    box-shadow: 3px 3px 0 #000;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex; align-items: center; justify-content: center;
    position: fixed; z-index: 2;
    &:hover { transform: scale(1.1); box-shadow: 4px 4px 0 #000; }
    &:active { transform: scale(0.95); box-shadow: 2px 2px 0 #000; }
    &--active { background: #ff6b6b; border-color: #000; }
}
.ai-fab__icon { line-height: 1; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; }
.ai-fab__img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }

/* AI面板 */
.ai-panel {
    position: fixed;
    right: 76px; bottom: 20px;
    width: 380px; height: 460px;
    background: #fff; border: 3px solid #000;
    border-radius: 12px; box-shadow: 5px 5px 0 #000;
    display: flex; flex-direction: column; overflow: hidden;
    transform-origin: bottom right;
}
.ai-panel-enter-active { animation: aiPanelIn 0.25s ease-out; }
.ai-panel-leave-active { animation: aiPanelOut 0.2s ease-in; }

@keyframes aiPanelIn {
    from { opacity: 0; transform: scale(0.5) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes aiPanelOut {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to { opacity: 0; transform: scale(0.5) translateY(20px); }
}

/* 面板头部 */
.ai-panel__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.5rem 1rem; background: #ffd700;
    border-bottom: 3px solid #000; flex-shrink: 0; cursor: grab; user-select: none;
}
.ai-panel__drag-hint { font-size: 0.7rem; color: rgba(0,0,0,0.35); margin-left: auto; margin-right: 8px; }
.ai-panel__title { font-family: 'Bangers','Impact',sans-serif; font-size: 1.1rem; letter-spacing: 2px; color: #000; font-weight: 900; }
.ai-panel__close {
    width: 26px; height: 26px; border-radius: 50%; border: 2px solid #000;
    background: #fff; color: #000; font-size: 0.8rem; font-weight: 900;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 2px 2px 0 #000; transition: transform 0.1s, background 0.1s;
    &:hover { background: #ff6b6b; color: #fff; transform: scale(1.1); }
}

/* 消息区 */
.ai-panel__body {
    flex: 1; overflow-y: auto; padding: 0.8rem;
    display: flex; flex-direction: column; gap: 0.6rem;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
}

/* 聊天气泡 */
.chat-bubble {
    max-width: 90%;
    &--assistant { align-self: flex-start; }
    &--user { align-self: flex-end; }
}
.chat-bubble__label {
    font-size: 0.65rem; font-weight: 700; margin-bottom: 2px; padding: 0 4px;
}
.chat-bubble--assistant .chat-bubble__label { color: #8b5cf6; }
.chat-bubble--user .chat-bubble__label { color: #3b82f6; text-align: right; }

.chat-bubble__content {
    padding: 0.55rem 0.75rem; border-radius: 8px;
    font-size: 0.82rem; line-height: 1.65; color: #222; word-break: break-word;
}
.chat-bubble--assistant .chat-bubble__content {
    background: #f5f0ff; border: 1px solid #e0d4ff;
    border-radius: 0 8px 8px 8px;
}
.chat-bubble--user .chat-bubble__content {
    background: #e8f0fe; border: 1px solid #bfd4f7;
    border-radius: 8px 0 8px 8px;
}

/* Markdown 内容 */
.chat-bubble__content :deep(h1), .chat-bubble__content :deep(h2), .chat-bubble__content :deep(h3) {
    font-family: 'Bangers','Impact',sans-serif; color: #000;
    margin: 0.5rem 0 0.3rem; letter-spacing: 1px; font-size: 0.95rem;
}
.chat-bubble__content :deep(p) { margin: 0.3rem 0; }
.chat-bubble__content :deep(ul), .chat-bubble__content :deep(ol) { margin: 0.3rem 0; padding-left: 1rem; }
.chat-bubble__content :deep(li) { margin: 0.15rem 0; }
.chat-bubble__content :deep(code) {
    font-family: 'JetBrains Mono','Fira Code','Consolas',monospace;
    font-size: 0.78rem; background: #1e1e2e; color: #cdd6f4;
    padding: 0.1rem 0.35rem; border-radius: 3px; border: 1px solid #000;
}
.chat-bubble__content :deep(pre) {
    background: #1e1e2e; border: 2px solid #000; border-radius: 4px;
    padding: 0.6rem; overflow-x: auto; margin: 0.4rem 0;
    code { background: none; border: none; padding: 0; color: #cdd6f4; }
}
.chat-bubble__content :deep(strong) { color: #000; font-weight: 800; }

/* 欢迎状态 */
.ai-welcome {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; text-align: center;
    padding: 1rem;
}
.ai-welcome__icon { font-size: 3rem; margin-bottom: 0.8rem; }
.ai-welcome__text {
    font-size: 1rem; font-weight: 700; color: #222; margin: 0 0 0.3rem;
}
.ai-welcome__hint {
    font-size: 0.72rem; color: #999; margin: 0 0 1.2rem;
}
.ai-welcome__actions {
    display: flex; align-items: center; gap: 0.6rem;
}
.ai-welcome__btn {
    padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.88rem;
    font-weight: 700; cursor: pointer; border: 2px solid #000;
    transition: transform 0.1s, box-shadow 0.1s;
    &:hover { transform: translate(1px, 1px); }
    &--primary {
        background: #ffd700; color: #000;
        box-shadow: 3px 3px 0 #000;
    }
    &--ghost {
        background: #fff; color: #666; border-color: #ddd;
    }
}
.ai-welcome__or { font-size: 0.75rem; color: #bbb; }

/* 加载动画 */
.ai-loading {
    display: flex; align-items: center; gap: 0.5rem;
    color: #999; font-size: 0.8rem; padding: 0.3rem 0;
}
.ai-loading__dots {
    display: inline-flex; gap: 2px;
    span { animation: dotBounce 1.2s infinite; font-weight: 900; font-size: 1rem; color: #ffd700; }
    span:nth-child(2) { animation-delay: 0.2s; }
    span:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes dotBounce {
    0%,60%,100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-3px); }
}

/* 追问输入区 */
.ai-panel__input {
    display: flex; gap: 0.4rem; padding: 0.5rem 0.7rem;
    border-top: 2px solid #eee; flex-shrink: 0;
}
.follow-input {
    flex: 1;
    padding: 0.4rem 0.6rem; border: 2px solid #ddd; border-radius: 6px;
    font-size: 0.78rem; font-family: inherit; color: #333; resize: none;
    outline: none;
    &:focus { border-color: #ffd700; }
    &::placeholder { color: #bbb; }
}
.follow-send {
    padding: 0 1rem; border: 2px solid #000; border-radius: 6px;
    background: #ffd700; color: #000; font-weight: 700; font-size: 0.78rem;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    font-family: 'Bangers',sans-serif; letter-spacing: 1px;
    &:hover { background: #ffe44d; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

/* 响应式 */
@media (max-width: 767px) {
    .ai-panel { width: calc(100vw - 32px); height: 420px; right: 8px !important; }
    .ai-fab { right: 8px !important; }
    .chat-bubble { max-width: 95%; }
}
</style>
