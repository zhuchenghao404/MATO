<template>
    <div class="challenge-page">
        <!-- 背景装饰：拟声词 + 速度线 -->
        <div class="page-bg" aria-hidden="true">
            <span class="bg-sfx bg-sfx--1">LEVEL UP!</span>
            <span class="bg-sfx bg-sfx--2">POW!</span>
            <span class="bg-sfx bg-sfx--3">GO!!</span>
            <span class="bg-burst bg-burst--1">★</span>
            <span class="bg-burst bg-burst--2">★</span>
            <span class="bg-line bg-line--1"></span>
            <span class="bg-line bg-line--2"></span>
        </div>

        <div class="page-inner">
            <header class="page-header">
                <span class="header-badge">★ SKILL CHALLENGE ★</span>
                <div class="title-row">
                    <h1 class="page-title">技能闯关</h1>
                    <div class="mode-toggle">
                        <button
                            class="mode-btn"
                            :class="{ 'mode-btn--active': mode === 'challenge' }"
                            @click="toggleMode"
                        >
                            闯关
                        </button>
                        <button
                            class="mode-btn mode-btn--right"
                            :class="{ 'mode-btn--active': mode === 'train' }"
                            @click="toggleMode"
                        >
                            训练
                        </button>
                    </div>
                </div>
                <p class="page-desc">{{ pageDesc }}</p>
            </header>

            <section class="track-panel">
                <div class="panel-tape panel-tape--left"></div>
                <div class="panel-tape panel-tape--right"></div>

                <div class="track-grid">
                    <article
                        v-for="(skill, index) in skills"
                        :key="skill.name"
                        class="skill-card"
                        :class="[
                            `skill-card--${index + 1}`,
                            { 'skill-card--wide': skill.wide }
                        ]"
                        @click="goChallenge(skill.name)"
                    >
                        <span class="card-level">Lv.{{ index + 1 }}</span>
                        <span class="card-icon">{{ skill.icon }}</span>
                        <div class="card-body">
                            <h3 class="card-title">{{ skill.name }}</h3>
                            <span class="card-tag">{{ skill.tag }}</span>
                        </div>
                        <span class="card-status">{{ cardStatus }}</span>
                        <span
                            v-if="index < skills.length - 1"
                            class="card-connector"
                            aria-hidden="true"
                        >→</span>
                    </article>
                </div>
            </section>

            <footer class="page-footer">
                <p class="footer-tip">慢慢来，才更快 — 每闯一关，代码就多一分底气</p>
                <div class="footer-tags">
                    <span class="footer-tag">即学即练</span>
                    <span class="footer-tag">趣味闯关</span>
                    <span class="footer-tag">成长可见</span>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const router = useRouter()
const { isLoggedIn } = useAuth()

const mode = ref('challenge') // 'challenge' | 'train'

const skills = [
    { name: 'HTML', icon: '📄', tag: '结构基础' },
    { name: 'CSS', icon: '🎨', tag: '样式魔法' },
    { name: 'Flex布局和Grid布局', icon: '📐', tag: '布局进阶', wide: true },
    { name: 'JavaScript', icon: '⚡', tag: '交互核心' },
    { name: 'Ajax', icon: '🌐', tag: '数据通信' },
    { name: 'Promise', icon: '⏳', tag: '异步编程' },
]

const pageDesc = computed(() => {
    return mode.value === 'challenge'
        ? '选择一个技能，开始挑战吧！'
        : '选择一个技能，开始训练吧！'
})

const cardStatus = computed(() => {
    return mode.value === 'challenge' ? '待挑战' : '待训练'
})

function toggleMode() {
    mode.value = mode.value === 'challenge' ? 'train' : 'challenge'
}

function goChallenge(skillName) {
    if (!isLoggedIn.value) {
        router.push('/Home?auth=open')
        return
    }
    const path = mode.value === 'challenge' ? `/Challenge/${skillName}` : `/Train/${skillName}`
    router.push(path)
}
</script>

<style lang="scss" scoped>
.challenge-page {
    position: relative;
    min-height: calc(100vh - 120px);
    padding: 2rem 1.5rem 3rem;
    overflow: hidden;
}

.page-inner {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

/* ==================== 背景装饰 ==================== */
.page-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.bg-sfx {
    position: absolute;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-weight: 900;
    color: var(--comic-black);
    -webkit-text-stroke: 1px var(--comic-white);
    text-stroke: 1px var(--comic-white);
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

.bg-line {
    position: absolute;
    background: repeating-linear-gradient(
        -45deg, transparent, transparent 8px,
        rgba(0, 0, 0, 0.04) 8px, rgba(0, 0, 0, 0.04) 16px
    );
}

.bg-line--1 { width: 180px; height: 180px; top: 30%; left: -40px; transform: rotate(15deg); }
.bg-line--2 { width: 140px; height: 140px; bottom: 25%; right: -30px; transform: rotate(-10deg); }

/* ==================== 页头 ==================== */
.page-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    position: relative;
    z-index: 100;
}

.header-badge {
    display: inline-block;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.95rem;
    letter-spacing: 3px;
    color: var(--comic-white);
    background: var(--comic-black);
    padding: 0.3rem 1.2rem;
    border: 2px solid var(--comic-white);
    box-shadow: 3px 3px 0 #555;
    transform: rotate(-1deg);
}

.page-title {
    font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
    font-size: 3.5rem;
    color: var(--comic-black);
    text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0, 0, 0, 0.25);
    letter-spacing: 2px;
    line-height: 1.1;
    margin: 0;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin: 0.5rem 0;
    position: relative;
    z-index: 100;
}

.mode-toggle {
    display: inline-grid;
    grid-template-columns: repeat(2, 1fr);
    border: 3px solid #000;
    box-shadow: 5px 5px 0 #000;
    background: #fff;
    overflow: hidden;
    z-index: 100;
    position: relative;
}

.mode-btn {
    padding: 0.65rem 0.85rem;
    border: 0;
    background: #fff;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.05rem;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 60px;
    font-weight: bold;
    text-transform: uppercase;
}

.mode-btn--right {
    border-left: 3px solid #000;
}

.mode-btn--active {
    background: #000;
    color: #fff;
}

.page-desc {
    font-family: 'Comic Neue', cursive;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--comic-gray);
    max-width: 480px;
}

.learning-spark {
    position: relative;
    width: min(420px, 100%);
    height: 78px;
    margin-top: 0.7rem;
}

.spark-doc {
    position: absolute;
    z-index: 1;
    top: 18px;
    display: grid;
    place-items: center;
    width: 72px;
    height: 46px;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    letter-spacing: 1px;
    color: var(--comic-black);
    background: var(--comic-white);
    border: 3px solid var(--comic-black);
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.18);
    animation: docBounce 1.8s ease-in-out infinite;

    &::before {
        content: '';
        position: absolute;
        top: -3px; right: -3px;
        width: 18px; height: 18px;
        background: #f4d35e;
        border-left: 3px solid var(--comic-black);
        border-bottom: 3px solid var(--comic-black);
        clip-path: polygon(0 0, 100% 100%, 0 100%);
    }
}

.spark-doc--1 { left: 8%; transform: rotate(-5deg); }
.spark-doc--2 { left: 50%; animation-delay: 0.18s; transform: translateX(-50%) rotate(3deg); }
.spark-doc--3 { right: 8%; animation-delay: 0.36s; transform: rotate(-2deg); }

.spark-beam {
    position: absolute;
    z-index: 0;
    left: 2%; right: 2%; top: 38px;
    height: 10px;
    border: 2px solid var(--comic-black);
    background: repeating-linear-gradient(
        90deg, #f4d35e 0, #f4d35e 16px,
        #ff6b6b 16px, #ff6b6b 32px,
        #4ecdc4 32px, #4ecdc4 48px
    );
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18);
    transform: skew(-12deg);
    animation: beamSlide 1.2s linear infinite;
}

.spark-star, .spark-bubble {
    position: absolute;
    z-index: 2;
    font-family: 'Bangers', 'Impact', sans-serif;
    color: var(--comic-black);
    text-shadow: 2px 2px 0 var(--comic-white);
}

.spark-star--1 {
    left: 2%; top: 2px;
    font-size: 1.8rem;
    color: #f4d35e;
    animation: popStar 1.4s ease-in-out infinite;
}

.spark-star--2 {
    right: 3%; top: 0;
    font-size: 1.6rem;
    color: #ff6b6b;
    animation: popStar 1.4s ease-in-out 0.4s infinite;
}

.spark-bubble {
    left: 50%; bottom: -2px;
    padding: 0.18rem 0.7rem;
    font-size: 0.9rem;
    letter-spacing: 1px;
    background: #4ecdc4;
    border: 2px solid var(--comic-black);
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18);
    transform: translateX(-50%) rotate(-2deg);
    animation: bubblePunch 1.8s ease-in-out infinite;
}

@keyframes docBounce {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
}

@keyframes beamSlide {
    0% { background-position: 0 0; }
    100% { background-position: 48px 0; }
}

@keyframes popStar {
    0%, 100% { transform: scale(0.9) rotate(-8deg); }
    50% { transform: scale(1.25) rotate(10deg); }
}

@keyframes bubblePunch {
    0%, 100% { transform: translateX(-50%) rotate(-2deg) scale(1); }
    50% { transform: translateX(-50%) rotate(2deg) scale(1.08); }
}

/* ==================== 闯关面板 ==================== */
.track-panel {
    position: relative;
    background: var(--comic-white);
    border: 4px solid var(--comic-black);
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    padding: 2.5rem 2rem;
    overflow: hidden;
}

.panel-tape {
    position: absolute;
    z-index: 2;
    width: 70px; height: 18px;
    background: #f0f0f0;
    border: 2px solid var(--comic-black);
    box-shadow: -2px 2px rgba(0, 0, 0, 0.3);
}

.panel-tape--left { top: -6px; left: 28px; transform: skew(-12deg); }
.panel-tape--right { top: -6px; right: 28px; transform: skew(12deg); }

.track-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.8rem 2rem;
}

/* ==================== 技能卡片 ==================== */
.skill-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.4rem 1.6rem;
    background: #fff;
    border: 3px solid var(--comic-black);
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-4px) rotate(0deg) !important;
        box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.22);
        .card-icon { transform: scale(1.15) rotate(-5deg); }
    }

    &--1 { transform: rotate(-1deg); }
    &--2 { transform: rotate(1deg); }
    &--3 { transform: rotate(-0.5deg); }
    &--4 { transform: rotate(0.8deg); }
    &--5 { transform: rotate(-0.8deg); }
    &--6 { transform: rotate(0.5deg); }

    &--wide .card-title { font-size: 1.15rem; }
}

.card-level {
    flex-shrink: 0;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 1px;
    color: var(--comic-white);
    background: var(--comic-black);
    padding: 0.2rem 0.55rem;
    border: 1px solid #fff;
    transform: rotate(-3deg);
}

.card-icon {
    flex-shrink: 0;
    font-size: 2rem;
    line-height: 1;
    transition: transform 0.15s ease;
}

.card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.card-title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.35rem;
    color: var(--comic-black);
    letter-spacing: 0.5px;
    line-height: 1.2;
    margin: 0;
}

.card-tag {
    display: inline-block;
    width: fit-content;
    font-family: 'Comic Neue', cursive;
    font-size: 0.72rem;
    font-weight: 700;
    color: #555;
    background: #f0f0f0;
    border: 1px dashed var(--comic-black);
    padding: 0.1rem 0.5rem;
}

.card-status {
    flex-shrink: 0;
    font-family: 'Comic Neue', cursive;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--comic-white);
    background: #888;
    padding: 0.2rem 0.6rem;
    border: 2px solid var(--comic-black);
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
    transform: rotate(2deg);
}

.card-connector { display: none; }

/* ==================== 页脚 ==================== */
.page-footer {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.footer-tip {
    font-family: 'Comic Neue', cursive;
    font-size: 1.05rem;
    font-weight: 700;
    color: #555;
    position: relative;

    &::after {
        content: '';
        display: block;
        width: 60%;
        height: 3px;
        background: var(--comic-black);
        margin: 0.5rem auto 0;
    }
}

.footer-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
}

.footer-tag {
    font-family: 'Comic Neue', 'Bangers', cursive;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--comic-black);
    background: #fff;
    border: 2px solid var(--comic-black);
    padding: 0.3rem 0.8rem;
    box-shadow: 2px 2px 0 #aaa;
    transform: rotate(-0.5deg);
    transition: all 0.15s ease;

    &:hover {
        transform: rotate(1deg) translateY(-2px);
        box-shadow: 4px 4px 0 #555;
        background: var(--comic-black);
        color: var(--comic-white);
    }

    &:nth-child(2) { transform: rotate(0.8deg); }
    &:nth-child(3) { transform: rotate(-0.8deg); }
}

/* ==================== 平板 ==================== */
@media (min-width: 768px) and (max-width: 1023px) {
    .challenge-page { padding: 1.5rem 1.2rem 2.5rem; }
    .page-title { font-size: 2.8rem; }
    .page-desc { font-size: 1rem; }
    .track-panel { padding: 2rem 1.5rem; }
    .track-grid { gap: 1.4rem 1.5rem; }
    .skill-card { padding: 1.2rem 1.2rem; gap: 0.8rem; }
    .card-title { font-size: 1.15rem; }
    .card-icon { font-size: 1.6rem; }
    .bg-sfx--1 { font-size: 4.5rem; }
    .bg-sfx--2 { font-size: 3.5rem; }
    .bg-sfx--3 { display: none; }
}

/* ==================== 手机 ==================== */
@media (max-width: 767px) {
    .challenge-page { min-height: auto; padding: 1.2rem 1rem 2rem; }
    .page-inner { gap: 1.8rem; }
    .header-badge { font-size: 0.75rem; letter-spacing: 2px; padding: 0.25rem 0.8rem; }
    .page-title { font-size: 2.2rem; }
    .page-desc { font-size: 0.9rem; }
    .title-row { gap: 1rem; }
    .mode-toggle { box-shadow: 3px 3px 0 #000; }
    .mode-btn { padding: 0.5rem 0.7rem; font-size: 0.9rem; }
    .learning-spark { width: min(320px, 100%); height: 68px; }
    .spark-doc { width: 58px; height: 38px; font-size: 0.82rem; border-width: 2px; }
    .spark-doc::before { width: 14px; height: 14px; border-left-width: 2px; border-bottom-width: 2px; }
    .spark-beam { top: 32px; height: 8px; }
    .spark-bubble { font-size: 0.75rem; }
    .track-panel { padding: 1.5rem 1rem; box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.18); }
    .panel-tape { width: 50px; height: 14px; }
    .track-grid { grid-template-columns: 1fr; gap: 1.2rem; }
    .skill-card { padding: 1.1rem 1rem; transform: none !important; &--wide .card-title { font-size: 1rem; } }
    .card-title { font-size: 1.1rem; }
    .card-icon { font-size: 1.5rem; }
    .card-status { font-size: 0.68rem; padding: 0.15rem 0.45rem; }
    .card-connector {
        display: block;
        position: absolute;
        bottom: -1.1rem; left: 50%;
        transform: translateX(-50%) rotate(90deg);
        font-family: 'Bangers', 'Impact', sans-serif;
        font-size: 1.2rem;
        color: var(--comic-black);
        opacity: 0.35;
        z-index: 2;
    }
    .footer-tip { font-size: 0.9rem; }
    .footer-tag { font-size: 0.75rem; padding: 0.25rem 0.6rem; }
    .bg-sfx, .bg-burst, .bg-line { display: none; }
}

/* ==================== 大屏 ==================== */
@media (min-width: 1024px) {
    .challenge-page { padding: 2.5rem 2rem 3.5rem; }
    .track-grid { grid-template-columns: repeat(3, 1fr); gap: 2rem 1.8rem; }
    .skill-card--wide { grid-column: span 2; }
    .page-title { font-size: 4rem; }
    .track-panel { padding: 3rem 2.5rem; }
}
</style>
