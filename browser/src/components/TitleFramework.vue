<template>
    <div class="challenge-page">
        <!-- 背景装饰 -->
        <div class="page-bg" aria-hidden="true">
            <span class="bg-sfx bg-sfx--1">QUIZ!</span>
            <span class="bg-sfx bg-sfx--2">FOCUS</span>
            <span class="bg-sfx bg-sfx--3">GO!!</span>
            <span class="bg-burst bg-burst--1">★</span>
            <span class="bg-burst bg-burst--2">✦</span>
        </div>

        <!-- 返回按钮：fixed 左上角 -->
        <button class="back-btn" @click="handleBack">
            <span class="back-arrow">←</span>
            <span class="back-text">BACK</span>
        </button>

        <div class="page-inner">
            <!-- 空题库提示 -->
            <div v-if="questions.length === 0" class="empty-bank">
                <div class="empty-bank__icon">📚</div>
                <h2 class="empty-bank__title">{{ skill }} 题库暂未开放</h2>
                <p class="empty-bank__desc">题库正在建设中，稍后再来挑战吧！</p>
                <button class="comic-btn" @click="handleBack">返回</button>
            </div>

            <template v-else>
            <!-- 页头 -->
            <header class="page-header">
                <span class="header-badge">★ {{ skill }} CHALLENGE ★</span>
                <h1 class="page-title">{{ skill }} 闯关</h1>
                <p class="page-desc">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</p>
                <button
                    class="dots-toggle"
                    @click="dotsExpanded = !dotsExpanded"
                >{{ dotsExpanded ? '收起题号 ▲' : '展开题号 ▼' }}</button>
            </header>

            <!-- 进度指示器（可折叠横向滚动） -->
            <div class="progress-dots-wrap" :class="{ 'progress-dots-wrap--expanded': dotsExpanded }">
                <div class="progress-dots">
                    <span
                        v-for="(q, i) in questions"
                        :key="i"
                        class="dot"
                        :class="{
                            'dot--done': answeredSet.has(i),
                            'dot--active': i === currentIndex,
                            'dot--locked': !answeredSet.has(i) && i !== currentIndex,
                            'dot--clickable': answeredSet.has(i) || i === currentIndex,
                        }"
                        @click="goToQuestion(i)"
                    >{{ answeredSet.has(i) ? '✓' : i + 1 }}</span>
                </div>
            </div>

            <!-- 主面板 -->
            <section class="question-panel">
                <div class="panel-tape panel-tape--left"></div>
                <div class="panel-tape panel-tape--right"></div>

                <!-- 题目区 -->
                <div class="question-section">
                    <div class="question-header">
                        <span class="q-number">Q{{ currentIndex + 1 }}</span>
                        <span class="q-type-badge" :class="`q-type-badge--${currentQ.type}`">
                            {{ typeLabel }}
                        </span>
                        <span class="q-exp-badge">{{ isExpCapped ? 'MAX' : '+' + expReward + ' EXP' }}</span>
                    </div>
                    <div class="question-body">
                        <p class="question-text">{{ currentQ.question }}</p>
                        <!-- code-fix 题：展示有问题的代码 -->
                        <div v-if="currentQ.type === 'code-fix' && currentQ.codeBefore" class="question-code-snippet">
                            <div class="code-label">▼ 有问题的代码</div>
                            <pre><code>{{ currentQ.codeBefore }}</code></pre>
                        </div>
                    </div>
                </div>

                <!-- 作答区 -->
                <!-- 1. 选择题（单选 / 多选） -->
                <div v-if="isChoice" class="answer-section">
                    <p class="choice-hint" v-if="!isCurrentAnswered">{{ isMulti ? '（多选）' : '（单选）点击选项作答' }}</p>
                    <div class="options-grid" :class="{ 'options-grid--multi': isMulti }">
                        <button
                            v-for="opt in currentQ.options"
                            :key="opt.key"
                            class="option-btn"
                            :class="{
                                'option-btn--selected': isMulti
                                    ? selectedKeys.has(opt.key)
                                    : selectedOption === opt.key,
                                'option-btn--correct': isCurrentAnswered && currentQ.answer.includes(opt.key),
                                'option-btn--wrong': isCurrentAnswered && (isMulti ? selectedKeys.has(opt.key) : selectedOption === opt.key) && !currentQ.answer.includes(opt.key),
                            }"
                            @click="toggleOption(opt.key)"
                            :disabled="isCurrentAnswered"
                        >
                            <span class="option-key">{{ opt.key }}</span>
                            <span class="option-text">{{ opt.text }}</span>
                        </button>
                    </div>
                </div>

                <!-- 2. 代码纠错题 -->
                <div v-else-if="currentQ.type === 'code-fix'" class="answer-section">
                    <div class="code-fix-editor">
                        <span class="code-fix-label">✎ 你的修正代码</span>
                        <textarea
                            v-model="userAnswer"
                            class="code-textarea"
                            :placeholder="isCurrentAnswered ? '' : '// 写出修正后的完整代码…'"
                            spellcheck="false"
                            :disabled="isCurrentAnswered"
                        ></textarea>
                    </div>
                </div>

                <!-- 3. 编程题 -->
                <div v-else-if="currentQ.type === 'programming'" class="answer-section">
                    <div class="prog-editor">
                        <span class="prog-label">✎ 你的代码</span>
                        <textarea
                            v-model="userAnswer"
                            class="code-textarea prog-textarea"
                            :placeholder="isCurrentAnswered ? '' : '// 在此编写代码…'"
                            spellcheck="false"
                            :disabled="isCurrentAnswered"
                        ></textarea>
                    </div>
                </div>

                <!-- 结果提示区 -->
                <div v-if="resultMsg" class="result-msg" :class="resultMsg.type">
                    <span class="result-icon">{{ resultMsg.type === 'correct' ? '★' : '✗' }}</span>
                    <span class="result-text">{{ resultMsg.text }}</span>
                    <!-- 答错后显示查看解析按钮 -->
                    <button
                        v-if="resultMsg.type === 'wrong' && currentQ.explanation"
                        class="explain-btn"
                        @click="showExplanation = !showExplanation"
                    >{{ showExplanation ? '收起解析 ▲' : '查看解析 ▼' }}</button>
                </div>

                <!-- 答案解析 -->
                <div v-if="showExplanation && currentQ.explanation" class="explanation-box">
                    <span class="explanation-label">✎ 解析</span>
                    <p class="explanation-text">{{ currentQ.explanation }}</p>
                </div>

                <!-- 底部按钮区 -->
                <div class="action-area">
                    <!-- 未作答：显示确定按钮 -->
                    <template v-if="!isCurrentAnswered">
                        <button
                            class="comic-btn confirm-btn"
                            type="button"
                            @click="confirmAnswer"
                            :disabled="!canSubmit"
                        >确 定</button>
                    </template>
                    <!-- 已作答：显示结果 + 上下题导航 -->
                    <template v-else>
                        <div class="next-btn-wrap">
                            <div class="nav-btns">
                                <button
                                    v-if="currentIndex > 0"
                                    class="comic-btn prev-btn"
                                    @click="goToQuestion(currentIndex - 1)"
                                >← 上一题</button>
                                <button
                                    v-if="currentIndex < questions.length - 1"
                                    class="comic-btn next-btn"
                                    @click="goNext"
                                >下一题 →</button>
                                <button
                                    v-if="currentIndex === questions.length - 1"
                                    class="comic-btn finish-btn"
                                    @click="handleBack"
                                >完成闯关 ★</button>
                            </div>
                        </div>
                    </template>
                </div>
            </section>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth.js'
import htmlQuestions from '../data/html.json'
import cssQuestions from '../data/css.json'
import flexAndGridQuestions from '../data/flex-and-grid.json'
import jsQuestions from '../data/javascript.json'
import ajaxQuestions from '../data/ajax.json'
import processQuestions from '../data/process.json'

const props = defineProps({
    skill: { type: String, required: true },
})

const router = useRouter()
const { isLoggedIn, addExp, token, userExp } = useAuth()

const API_BASE = '/api'

async function apiRequest(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
    return res.json()
}

// ── 题库映射 ─────────────────────────────────────
const questionMap = {
    'HTML': htmlQuestions,
    'CSS': cssQuestions,
    'Flex布局和Grid布局': flexAndGridQuestions,
    'JavaScript': jsQuestions,
    'Ajax': ajaxQuestions,
    'Promise': processQuestions,
}

const questions = computed(() => {
    const bank = questionMap[props.skill]
    // 空数组或空文件（undefined/null）都返回空
    return Array.isArray(bank) ? bank : []
})

// ── 当前题目 ─────────────────────────────────────
const currentIndex = ref(0)
const dotsExpanded = ref(false)
const currentQ = computed(() => questions.value[currentIndex.value] || {})

// ── 题型判断 ─────────────────────────────────────
// JSON 中 "single-choice" / "multiple-choice" → 统一 choice 类型，内部 isMulti 区分
const isChoice = computed(() =>
    currentQ.value.type === 'single-choice' || currentQ.value.type === 'multiple-choice'
)
const isMulti = computed(() => currentQ.value.type === 'multiple-choice')

// 经验奖励
const expReward = computed(() => {
    const t = currentQ.value.type
    if (t === 'single-choice') return 50
    if (t === 'multiple-choice') return 100
    if (t === 'code-fix') return 100
    if (t === 'programming') return 100
    return 50
})

// 经验是否已达上限
const isExpCapped = computed(() => userExp.value >= 99999)

// 题型中文标签
const typeLabel = computed(() => {
    const t = currentQ.value.type
    if (t === 'single-choice') return '单选题'
    if (t === 'multiple-choice') return '多选题'
    if (t === 'code-fix') return '代码纠错'
    if (t === 'programming') return '编程题'
    return '问答题'
})

// ── 作答状态 ─────────────────────────────────────
const selectedOption = ref(null)    // 单选用
const selectedKeys = ref(new Set())  // 多选用
const userAnswer = ref('')

// ── 每道题的作答记录 ─────────────────────────────
const answeredSet = ref(new Set())      // 已作答的题号
const correctSet = ref(new Set())       // 答对的题号
const userSelections = ref({})          // { [index]: { selectedOption, selectedKeys, userAnswer, isCorrect } }

// 初始化：从后端加载已保存的答题记录
async function loadAnswers() {
    // 先重置状态
    currentIndex.value = 0
    dotsExpanded.value = false
    answeredSet.value = new Set()
    correctSet.value = new Set()
    userSelections.value = {}
    selectedOption.value = null
    selectedKeys.value = new Set()
    userAnswer.value = ''
    resultMsg.value = null
    showExplanation.value = false
    answered.value = false
    isCorrect.value = false

    if (!isLoggedIn.value || !token.value) return
    try {
        const res = await apiRequest('/quiz/my-answers')
        if (res.code === 200 && Array.isArray(res.data)) {
            // 构建 question_id → 本地索引 映射
            const idToIndex = {}
            questions.value.forEach((q, i) => { idToIndex[q.id] = i })

            const answeredVals = new Set()
            const correctVals = new Set()
            const selections = {}

            for (const record of res.data) {
                const idx = idToIndex[record.question_id]
                if (idx === undefined) continue
                if (record.is_correct === 1) answeredVals.add(idx)  // 只有答对的才锁定
                if (record.is_correct === 1) correctVals.add(idx)
                selections[idx] = {
                    userAnswer: record.user_answer || '',
                    isCorrect: record.is_correct === 1,
                }
            }

            answeredSet.value = answeredVals
            correctSet.value = correctVals
            userSelections.value = selections
        }
    } catch (err) {
        console.error('加载答题记录失败:', err)
    }
}

onMounted(loadAnswers)

// 切换技能时重置状态并重新加载
watch(() => props.skill, loadAnswers)

const isCurrentAnswered = computed(() => answeredSet.value.has(currentIndex.value))

const canSubmit = computed(() => {
    if (isCurrentAnswered.value) return false
    if (isChoice.value) {
        return isMulti.value
            ? selectedKeys.value.size > 0
            : selectedOption.value !== null
    }
    return userAnswer.value.trim().length > 0
})

function toggleOption(key) {
    if (isMulti.value) {
        const s = new Set(selectedKeys.value)
        s.has(key) ? s.delete(key) : s.add(key)
        selectedKeys.value = s
    } else {
        selectedOption.value = key
    }
}

// ── 答题结果 ─────────────────────────────────────
const answered = ref(false)
const isCorrect = ref(false)
const resultMsg = ref(null)
const showExplanation = ref(false)

function normalize(s) {
    return s.trim().replace(/\r\n/g, '\n')
}

function checkAnswer() {
    const q = currentQ.value
    const t = q.type

    if (t === 'single-choice') {
        return normalize(selectedOption.value) === normalize(q.answer)
    }
    if (t === 'multiple-choice') {
        const userAns = [...selectedKeys.value].sort().join('')
        const correctAns = normalize(q.answer)
        return userAns === correctAns
    }
    if (t === 'code-fix' || t === 'programming') {
        // 简单文本比对（可后续升级为更宽松的匹配逻辑）
        return normalize(userAnswer.value) === normalize(q.answer)
    }
    return false
}

function confirmAnswer() {
    isCorrect.value = checkAnswer()

    // 构造提交给后端的答案文本
    const submitAnswer = isChoice.value
        ? (isMulti.value ? [...selectedKeys.value].sort().join('') : selectedOption.value)
        : userAnswer.value

    // 记录本次作答
    userSelections.value[currentIndex.value] = {
        selectedOption: selectedOption.value,
        selectedKeys: new Set(selectedKeys.value),
        userAnswer: userAnswer.value,
        isCorrect: isCorrect.value,
    }

    if (isCorrect.value) {
        // 答对：锁定题目，加经验
        answeredSet.value.add(currentIndex.value)
        correctSet.value.add(currentIndex.value)
        if (isExpCapped.value) {
            resultMsg.value = { type: 'correct', text: '回答正确！经验已达上限（99999），不再增加。' }
        } else {
            resultMsg.value = { type: 'correct', text: `回答正确！+${expReward.value} 经验值` }
        }
        if (isLoggedIn.value) {
            syncExpAndRecord(submitAnswer)
        }
    } else {
        resultMsg.value = {
            type: 'wrong',
            text: '回答错误，再试一次吧！修改答案后点确定即可。'
        }
        // 答错仅记录，不加经验
        if (isLoggedIn.value) {
            apiRequest('/quiz/submit', {
                method: 'POST',
                body: JSON.stringify({
                    questionId: currentQ.value.id,
                    answer: submitAnswer,
                    isCorrect: false,
                    expReward: 0,
                }),
            }).catch(() => {})
        }
    }
}

/** 加经验并同步提交记录，两者顺序执行避免数据不一致 */
async function syncExpAndRecord(submitAnswer) {
    try {
        // 先加经验到数据库（已达上限则跳过）
        if (!isExpCapped.value) {
            await addExp(expReward.value)
        }
        // 再提交答题记录
        await apiRequest('/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({
                questionId: currentQ.value.id,
                answer: submitAnswer,
                isCorrect: true,
                expReward: isExpCapped.value ? 0 : expReward.value,
            }),
        })
    } catch (e) {
        console.error('同步经验失败:', e)
    }
}

function goNext() {
    currentIndex.value++
    restoreOrReset()
}

function goToQuestion(i) {
    // 可以跳转到：已答对的题、当前题、以及之前尝试过的题
    if (answeredSet.value.has(i) || i === currentIndex.value || userSelections.value[i]) {
        currentIndex.value = i
    }
}

function restoreOrReset() {
    const idx = currentIndex.value
    // 已答对 → 恢复状态并锁定
    if (answeredSet.value.has(idx)) {
        const prev = userSelections.value[idx]
        if (prev) {
            selectedOption.value = prev.selectedOption
            selectedKeys.value = prev.selectedKeys || new Set()
            userAnswer.value = prev.userAnswer || ''
            isCorrect.value = prev.isCorrect
            resultMsg.value = isExpCapped.value
                ? { type: 'correct', text: '回答正确！经验已达上限（99999），不再增加。' }
                : { type: 'correct', text: `回答正确！+${expReward.value} 经验值` }
            answered.value = true
        }
    }
    // 答错但已尝试 → 恢复已填内容，可继续修改
    else if (userSelections.value[idx]) {
        const prev = userSelections.value[idx]
        selectedOption.value = prev.selectedOption
        selectedKeys.value = prev.selectedKeys || new Set()
        userAnswer.value = prev.userAnswer || ''
        isCorrect.value = false
        resultMsg.value = { type: 'wrong', text: '回答错误，再试一次吧！修改答案后点确定即可。' }
        answered.value = false
    }
    // 全新题 → 清空
    else {
        resetState()
    }
}

function resetState() {
    answered.value = false
    isCorrect.value = false
    resultMsg.value = null
    showExplanation.value = false
    selectedOption.value = null
    selectedKeys.value = new Set()
    userAnswer.value = ''
}

// 切题后自动恢复/重置
watch(currentIndex, restoreOrReset)

// ── 返回按钮 ─────────────────────────────────────
function handleBack() {
    sessionStorage.setItem('skip_loading', '1')
    router.push('/SkillToUp')
}
</script>

<style lang="scss" scoped>
/* 空题库提示 */
.empty-bank {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
}
.empty-bank__icon { font-size: 4rem; }
.empty-bank__title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 2.5rem;
    color: #000;
    margin: 0;
    text-shadow: 3px 3px 0 #fff, 5px 5px 0 rgba(0,0,0,0.15);
}
.empty-bank__desc {
    font-size: 1.1rem;
    font-weight: 500;
    color: #555;
    margin: 0;
}

.challenge-page {
    position: relative;
    min-height: 100vh;
    padding: 4.5rem 1.5rem 3rem;
    overflow: hidden;
}

.page-inner {
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

/* 背景装饰 */
.page-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.bg-sfx {
    position: absolute;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-weight: 900;
    color: var(--comic-black, #0a0a0a);
    -webkit-text-stroke: 1px var(--comic-white, #f8f8f8);
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

/* 返回按钮 */
.back-btn {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 30000;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 1.1rem;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: 1.5px;
    color: #000;
    background: #fff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;

    &:hover {
        transform: translate(1px, 1px);
        box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
        background: #000;
        color: #fff;
    }
}

/* 页头 */
.page-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
}
.header-badge {
    display: inline-block;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.9rem;
    letter-spacing: 3px;
    color: #fff;
    background: #000;
    padding: 0.3rem 1.2rem;
    border: 2px solid #fff;
    box-shadow: 3px 3px 0 #555;
    transform: rotate(-1deg);
}
.page-title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 3rem;
    color: #000;
    text-shadow: 3px 3px 0 #fff, 5px 5px 0 rgba(0, 0, 0, 0.25);
    letter-spacing: 2px;
    line-height: 1.1;
    margin: 0;
}
.page-desc {
    font-size: 1.05rem;
    font-weight: 500;
    color: #333;
    margin: 0;
}

/* 进度指示器 */
.dots-toggle {
    display: none;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 1px;
    background: #000;
    color: #fff;
    border: 2px solid #000;
    padding: 0.3rem 1rem;
    cursor: pointer;
    box-shadow: 3px 3px 0 #555;
    transition: transform 0.12s;

    &:hover { transform: translate(1px, 1px); }
}
.progress-dots-wrap {
    max-height: none;
    overflow: hidden;
    transition: max-height 0.3s ease;
}
.progress-dots {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
}
.dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.85rem;
    border: 2px solid #000;
    background: #fff;
    box-shadow: 2px 2px 0 #aaa;
    transition: all 0.2s;

    &--done {
        background: #4ecdc4;
        color: #fff;
    }
    &--active {
        background: #000;
        color: #fff;
        transform: scale(1.2);
        box-shadow: 3px 3px 0 #555;
    }
    &--clickable {
        cursor: pointer;
        &:hover { transform: scale(1.15); }
    }
}

/* 主面板 */
.question-panel {
    position: relative;
    background: #fff;
    border: 4px solid #000;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    padding: 2rem 2rem 1.5rem;
    overflow: hidden;
    font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.04) 41%);
        pointer-events: none;
        opacity: 0.5;
    }
}
.panel-tape {
    position: absolute;
    z-index: 2;
    width: 70px;
    height: 18px;
    background: #f0f0f0;
    border: 2px solid #000;
    box-shadow: -2px 2px rgba(0, 0, 0, 0.3);
}
.panel-tape--left { top: -6px; left: 28px; transform: skew(-12deg); }
.panel-tape--right { top: -6px; right: 28px; transform: skew(12deg); }

/* 题目区 */
.question-section {
    position: relative;
    z-index: 1;
    margin-bottom: 1.8rem;
    padding-bottom: 1.5rem;
    border-bottom: 3px dashed #000;
}
.question-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}
.q-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 36px;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.2rem;
    letter-spacing: 1px;
    color: #fff;
    background: #000;
    border: 2px solid #fff;
    box-shadow: 3px 3px 0 #555;
    padding: 0 0.5rem;
    transform: rotate(-2deg);
}
.q-type-badge {
    font-size: 0.78rem;
    font-weight: 800;
    padding: 0.2rem 0.7rem;
    border: 2px solid #000;
    color: #000;
    background: #fff;
    box-shadow: 2px 2px 0 #aaa;

    &--single-choice { background: #fff; }
    &--multiple-choice { background: #a8e6cf; }
    &--code-fix { background: #ffd700; }
    &--programming { background: #4ecdc4; }
}
.q-exp-badge {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 1px;
    color: #fff;
    background: #ff6b6b;
    padding: 0.15rem 0.6rem;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #000;
    margin-left: auto;
}
.question-body { font-size: 1.15rem; font-weight: 500; color: #111; line-height: 1.8; }
.question-text { margin: 0; }
.question-code-snippet {
    margin-top: 0.8rem;
    background: #1e1e2e;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.18);
    overflow-x: auto;

    .code-label {
        padding: 0.4rem 1rem;
        font-family: 'Bangers', sans-serif;
        font-size: 0.8rem;
        letter-spacing: 1px;
        color: #fff;
        background: #333;
        border-bottom: 2px solid #000;
    }
    pre { margin: 0; padding: 1rem 1.2rem; }
    code {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.88rem;
        color: #cdd6f4;
        line-height: 1.65;
        white-space: pre;
    }
}

/* 作答区 */
.answer-section { position: relative; z-index: 1; }
.choice-hint {
    font-size: 0.85rem;
    font-weight: 500;
    color: #666;
    margin: 0 0 0.8rem;
}
.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;

    &--multi .option-btn { cursor: pointer; }
}
.option-btn {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 1rem 1.2rem;
    background: #fff;
    border: 3px solid #000;
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.1s ease;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    color: #111;

    &:hover {
        transform: translate(1px, 1px);
        box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.22);
        background: #f0f0f0;
    }
    &--selected {
        background: #000 !important;
        color: #fff !important;
        border-color: #fff;
        box-shadow: 5px 5px 0 #000;
        transform: translate(1px, 1px);
        .option-key { background: #fff; color: #000; border-color: #000; }
    }
    &--correct {
        background: #d4edda !important;
        border-color: #155724 !important;
        color: #155724 !important;
        .option-key { background: #155724; color: #fff; border-color: #155724; }
    }
    &--wrong {
        background: #f8d7da !important;
        border-color: #721c24 !important;
        color: #721c24 !important;
        .option-key { background: #721c24; color: #fff; border-color: #721c24; }
    }
    &:disabled {
        cursor: default;
        opacity: 0.85;
    }
}
.option-key {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.95rem;
    font-weight: 900;
    color: #fff;
    background: #000;
    border: 2px solid #fff;
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
    transform: rotate(-2deg);
}
.option-text { flex: 1; line-height: 1.4; }

/* 代码编辑区 */
.code-fix-editor, .prog-editor {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}
.code-fix-label, .prog-label {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 1px;
    color: #fff;
    background: #4ecdc4;
    padding: 0.25rem 0.8rem;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #555;
    transform: rotate(-1deg);
    width: fit-content;
}
.code-textarea {
    width: 100%;
    min-height: 160px;
    padding: 1rem 1.2rem;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.88rem;
    line-height: 1.65;
    color: #cdd6f4;
    background: #1e1e2e;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.18);
    outline: none;
    resize: vertical;

    &:focus { box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.25); }
    &::placeholder { color: #6c7086; font-style: italic; }
}
.prog-textarea { min-height: 220px; }

/* 结果提示 */
.result-msg {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-top: 1rem;
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.18);

    &.correct {
        background: #d4edda;
        .result-icon { color: #155724; font-size: 1.4rem; }
    }
    &.wrong {
        background: #f8d7da;
        .result-icon { color: #721c24; font-size: 1.4rem; }
    }
}
.result-text { flex: 1; }

.explain-btn {
    flex-shrink: 0;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 1px;
    color: #000;
    background: #ffeeba;
    border: 2px solid #000;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    box-shadow: 2px 2px 0 #aaa;
    transition: transform 0.1s;
    &:hover { transform: translate(1px, 1px); }
}

.explanation-box {
    position: relative;
    z-index: 1;
    margin-top: 0.8rem;
    padding: 1rem 1.2rem;
    background: #fffbe6;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.12);
}

.explanation-label {
    display: inline-block;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
    color: #fff;
    background: #000;
    padding: 0.15rem 0.6rem;
    margin-bottom: 0.5rem;
    transform: rotate(-1deg);
}

.explanation-text {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    line-height: 1.7;
}

/* 底部按钮区 */
.action-area {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    margin-top: 1.8rem;
    padding-top: 1.5rem;
    border-top: 3px dashed #000;
}
.next-btn-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
}
.next-hint, .wrong-hint {
    font-weight: 500;
    font-size: 0.9rem;
}
.next-hint { color: #155724; }
.wrong-hint { color: #721c24; }

/* 漫画风格按钮 */
.comic-btn {
    padding: 0.85rem 2.5rem;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.3rem;
    font-weight: 900;
    letter-spacing: 4px;
    color: #fff;
    background: #000;
    border: 3px solid #000;
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;

    &:hover {
        transform: translate(1px, 1px);
        box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
        background: #333;
    }
    &:active {
        transform: translate(4px, 4px);
        box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
.next-btn { background: #4ecdc4; color: #000; }
.finish-btn { background: #ffd700; color: #000; }
.prev-btn { background: #f0f0f0; color: #000; }
.nav-btns {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    justify-content: center;
}

/* 响应式 */
@media (max-width: 767px) {
    .challenge-page { padding: 2.5rem 0.5rem 1.5rem; }
    .page-inner { gap: 0.6rem; }
    .page-title { font-size: 1.6rem; text-shadow: 2px 2px 0 #fff, 3px 3px 0 rgba(0, 0, 0, 0.15); }
    .page-desc { font-size: 0.9rem; }
    .back-btn { top: 0.5rem; left: 0.5rem; padding: 0.3rem 0.7rem; font-size: 0.8rem; }
    /* 题号：默认折叠，点击展开后横向滚动 */
    .dots-toggle { display: inline-block; }
    .progress-dots-wrap {
        max-height: 0;
        &--expanded {
            max-height: 380px;
            overflow-y: auto;
        }
    }
    .progress-dots {
        flex-wrap: nowrap;
        justify-content: flex-start;
        overflow-x: auto;
        padding: 0.5rem 0;
        gap: 0.35rem;
        -webkit-overflow-scrolling: touch;
        &::-webkit-scrollbar { height: 3px; }
        &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    }
    .dot {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        font-size: 0.75rem;
    }
    /* 题目面板 */
    .question-panel { padding: 1rem 0.8rem 0.8rem; font-size: 0.95rem; }
    .question-body { font-size: 1rem; line-height: 1.7; }
    .options-grid { grid-template-columns: 1fr; gap: 0.5rem; }
    .option-btn { padding: 0.7rem 0.8rem; font-size: 0.95rem; }
    .option-key { width: 28px; height: 28px; font-size: 0.85rem; }
    .code-textarea { min-height: 100px; font-size: 0.8rem; }
    .prog-textarea { min-height: 140px; }
    .explain-btn { font-size: 0.65rem; padding: 0.15rem 0.4rem; }
    .explanation-box { padding: 0.7rem 0.8rem; }
    .explanation-text { font-size: 0.85rem; }
    .comic-btn { padding: 0.65rem 1.5rem; font-size: 1rem; letter-spacing: 2px; }
    .confirm-btn { width: 100%; }
    .nav-btns { flex-direction: column; width: 100%; .comic-btn { width: 100%; } }
    .bg-sfx, .bg-burst { display: none; }
}
@media (min-width: 768px) and (max-width: 1023px) {
    .challenge-page { padding: 3.5rem 1.2rem 2.5rem; }
    .page-title { font-size: 2.5rem; }
    .question-panel { padding: 1.5rem 1.5rem 1.2rem; }
    .dots-toggle { display: none; }
}
</style>
