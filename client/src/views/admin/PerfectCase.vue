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

            <!-- 筛选栏 -->
            <div class="filter-bar">
                <button class="comic-btn small" @click="drawerOpen = true">
                    ☰ 筛选
                </button>
                <span class="filter-label">{{ currentFilterLabel }}</span>
            </div>

            <!-- 案例网格 -->
            <div class="case-grid">
                <article
                    v-for="(item, index) in filteredCases"
                    :key="item.id"
                    class="case-card"
                    :class="`case-card--${index + 1}`"
                >
                    <div class="panel-tape panel-tape--left"></div>
                    <div class="panel-tape panel-tape--right"></div>

                    <!-- 代码效果预览 -->
                    <div class="case-preview">
                        <div class="preview-toolbar">
                            <span class="toolbar-dot toolbar-dot--red"></span>
                            <span class="toolbar-dot toolbar-dot--yellow"></span>
                            <span class="toolbar-dot toolbar-dot--green"></span>
                            <span class="toolbar-label">{{ item.lang }}</span>
                        </div>
                        <div class="preview-content">
                            <div class="preview-inner" v-html="item.previewHTML"></div>
                        </div>
                    </div>

                    <!-- 项目介绍 -->
                    <div class="case-desc">
                        <h3 class="desc-title">{{ item.title }}</h3>
                        <p class="desc-text">{{ item.description }}</p>
                    </div>

                    <!-- 用户信息 -->
                    <div class="case-user">
                        <div class="user-avatar">
                            <span class="avatar-text">{{ item.user.name[0] }}</span>
                        </div>
                        <div class="user-meta">
                            <span class="user-name">{{ item.user.name }}</span>
                            <span class="user-lv">Lv.{{ item.user.level }}</span>
                        </div>
                        <div class="case-stats">
                            <span class="stat-item">❤ {{ item.likes }}</span>
                            <span class="stat-item">👁 {{ item.views }}</span>
                        </div>
                    </div>
                </article>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredCases.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <p class="empty-text">还没有相关案例，快来成为第一个吧！</p>
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
import { ref, computed } from 'vue'

// ── 抽屉状态 ──
const drawerOpen = ref(false)

const filterOptions = [
    { value: 'daily', label: '当日热门', icon: '🔥' },
    { value: 'monthly', label: '本月热门', icon: '⭐' },
    { value: 'most-liked', label: '最高点赞', icon: '❤' },
    { value: 'most-viewed', label: '最高浏览', icon: '👁' },
]

const currentFilter = ref('daily')

const currentFilterLabel = computed(() => {
    const opt = filterOptions.find(o => o.value === currentFilter.value)
    return opt ? `${opt.icon} ${opt.label}` : ''
})

function selectFilter(value) {
    currentFilter.value = value
    drawerOpen.value = false
}

// ── 假数据 ──
const cases = [
    {
        id: 1,
        title: '霓虹风格个人主页',
        description: '用 CSS 实现了一个充满赛博朋克风格的个人主页，包含动态霓虹灯边框和闪烁的星星背景。',
        lang: 'HTML / CSS',
        likes: 128,
        views: 3402,
        previewHTML: `
            <div class="demo-neon">
                <div class="neon-card">
                    <div class="neon-avatar"></div>
                    <div class="neon-name">CYBER</div>
                    <div class="neon-tag"># 前端探险家</div>
                </div>
                <div class="neon-glow"></div>
            </div>
        `,
        user: { name: '小明同学', level: 4 },
    },
    {
        id: 2,
        title: 'Flex 响应式导航栏',
        description: '用 Flex 布局实现的自适应导航栏，在手机和平板上自动折叠为汉堡菜单，动画过渡丝滑。',
        lang: 'HTML / CSS',
        likes: 96,
        views: 2105,
        previewHTML: `
            <div class="demo-nav">
                <div class="demo-nav-bar">
                    <div class="demo-logo">LOGO</div>
                    <div class="demo-links">
                        <span>首页</span>
                        <span>课程</span>
                        <span>案例</span>
                        <span>关于</span>
                    </div>
                    <div class="demo-hamburger">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `,
        user: { name: '代码小鹿', level: 3 },
    },
]

const filteredCases = computed(() => {
    const arr = [...cases]
    switch (currentFilter.value) {
        case 'most-liked':
            arr.sort((a, b) => b.likes - a.likes)
            break
        case 'most-viewed':
            arr.sort((a, b) => b.views - a.views)
            break
        case 'daily':
        case 'monthly':
        default:
            break
    }
    return arr
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

/* ── 筛选栏 ── */
.filter-bar {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}
.filter-label {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.9rem;
    letter-spacing: 1px;
    color: #fff;
    background: #000;
    padding: 0.4rem 1rem;
    border: 2px solid #fff;
    box-shadow: 3px 3px 0 #555;
}

/* ── 案例网格 ── */
.case-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.case-card {
    position: relative;
    background: #fff;
    border: 4px solid #000;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.25);
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.04) 41%);
        pointer-events: none;
        opacity: 0.5;
    }
}

.case-card:nth-child(odd) {
    transform: rotate(-0.5deg);
}
.case-card:nth-child(even) {
    transform: rotate(0.5deg);
}
.case-card:hover {
    transform: translateY(-4px) rotate(0deg) !important;
}

.panel-tape {
    position: absolute;
    z-index: 2;
    width: 50px;
    height: 14px;
    background: #f0f0f0;
    border: 2px solid #000;
    box-shadow: -2px 2px rgba(0, 0, 0, 0.3);
}
.panel-tape--left { top: -4px; left: 20px; transform: skew(-12deg); }
.panel-tape--right { top: -4px; right: 20px; transform: skew(12deg); }

/* ── 代码预览 ── */
.case-preview {
    position: relative;
    z-index: 1;
    border-bottom: 3px solid #000;
    background: #1e1e2e;
}

.preview-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.5rem 0.8rem;
    background: #2d2d3f;
    border-bottom: 2px solid #000;
}
.toolbar-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #000;
    &--red { background: #ff5f57; }
    &--yellow { background: #ffbd2e; }
    &--green { background: #28c840; }
}
.toolbar-label {
    margin-left: auto;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 1px;
    color: #aaa;
}

.preview-content {
    padding: 1.2rem;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-inner {
    width: 100%;
}

/* demo 1 - 霓虹卡片 */
:deep(.demo-neon) {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding: 1rem;
}
:deep(.neon-card) {
    width: 100%;
    max-width: 200px;
    padding: 1.2rem;
    background: #1a1a2e;
    border: 2px solid #0ff;
    box-shadow: 0 0 10px #0ff, 0 0 20px rgba(0, 255, 255, 0.3);
    text-align: center;
    position: relative;
}
:deep(.neon-avatar) {
    width: 50px;
    height: 50px;
    margin: 0 auto 0.5rem;
    border: 2px solid #f0f;
    border-radius: 50%;
    box-shadow: 0 0 8px #f0f;
}
:deep(.neon-name) {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.1rem;
    color: #0ff;
    letter-spacing: 2px;
}
:deep(.neon-tag) {
    font-size: 0.7rem;
    color: #f0f;
    margin-top: 0.3rem;
}
:deep(.neon-glow) {
    position: absolute;
    width: 80%;
    height: 40px;
    bottom: -10px;
    background: linear-gradient(to bottom, rgba(0, 255, 255, 0.2), transparent);
    filter: blur(6px);
}

/* demo 2 - 导航栏 */
:deep(.demo-nav-bar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    background: #fff;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
}
:deep(.demo-logo) {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    letter-spacing: 2px;
    color: #000;
}
:deep(.demo-links) {
    display: flex;
    gap: 0.6rem;
    span {
        font-size: 0.7rem;
        font-weight: 700;
        color: #333;
        padding: 0.2rem 0.4rem;
        border: 1px solid transparent;
        &:hover { border-color: #000; }
    }
}
:deep(.demo-hamburger) {
    display: none;
    flex-direction: column;
    gap: 3px;
    span {
        display: block;
        width: 18px;
        height: 2px;
        background: #000;
    }
}

/* ── 项目介绍 ── */
.case-desc {
    position: relative;
    z-index: 1;
    padding: 0.8rem 1rem 0.5rem;
}
.desc-title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.05rem;
    letter-spacing: 1px;
    color: #000;
    margin: 0 0 0.3rem;
}
.desc-text {
    font-size: 0.85rem;
    font-weight: 500;
    color: #555;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* ── 用户信息 ── */
.case-user {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 1rem 1rem;
    margin-top: auto;
    border-top: 2px dashed #ddd;
}
.user-avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border: 2px solid #fff;
    box-shadow: 2px 2px 0 #555;
    transform: rotate(-2deg);
}
.avatar-text {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.9rem;
    color: #fff;
    letter-spacing: 1px;
}
.user-meta {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    flex: 1;
}
.user-name {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 1px;
    color: #000;
}
.user-lv {
    font-size: 0.7rem;
    font-weight: 700;
    color: #888;
}
.case-stats {
    display: flex;
    gap: 0.5rem;
}
.stat-item {
    font-size: 0.7rem;
    font-weight: 600;
    color: #555;
    white-space: nowrap;
}

/* ── 空状态 ── */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
.empty-text {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.2rem;
    color: #888;
    letter-spacing: 1px;
}

/* ════════════════════════════════════
   抽屉
   ════════════════════════════════════ */
.drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 20000;
    background: rgba(0, 0, 0, 0.5);
}

.drawer {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 21000;
    width: 280px;
    height: 100vh;
    background: #fff;
    border-right: 4px solid #000;
    box-shadow: 8px 0 0 rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1rem;
    border-bottom: 3px solid #000;
    background: #000;
}
.drawer-title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 2px;
    color: #fff;
}
.drawer-close {
    font-family: 'Bangers', sans-serif;
    font-size: 1rem;
    color: #fff;
    background: none;
    border: 2px solid #fff;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.1s;
    &:hover { background: #fff; color: #000; }
}

.drawer-body {
    flex: 1;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
}

.drawer-option {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.9rem 1rem;
    background: #fff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    letter-spacing: 1px;
    color: #000;

    &:hover {
        transform: translate(1px, 1px);
        box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18);
    }

    &--active {
        background: #000;
        color: #fff;
        box-shadow: 5px 5px 0 #555;
        border-color: #fff;
    }
}
.option-icon { font-size: 1.1rem; }
.option-label { flex: 1; text-align: left; }
.option-check { font-size: 0.9rem; }

.drawer-footer {
    padding: 0.8rem 1rem;
    border-top: 3px solid #000;
    text-align: center;
}

/* ── 抽屉过渡动画 ── */
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }

.drawer-slide-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.drawer-slide-leave-active { transition: transform 0.2s ease; }
.drawer-slide-enter-from { transform: translateX(-100%); }
.drawer-slide-leave-to { transform: translateX(-100%); }

/* ── 漫画风格按钮（复用） ── */
.comic-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2.2rem;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #fff;
    background: #000;
    border: 3px solid #fff;
    box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000;
    transition: all 0.1s ease;
    cursor: pointer;
    min-width: 120px;

    &:hover {
        transform: translate(2px, 2px);
        box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000;
        background: #1a1a1a;
    }
    &:active {
        transform: translate(6px, 6px);
        box-shadow: 2px 2px 0 #fff, 3px 3px 0 #000;
        background: #333;
    }

    &.small {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
        min-width: auto;
    }

    &.white {
        background: #fff;
        color: #000;
        border-color: #000;
        box-shadow: 4px 4px 0 #000, 6px 6px 0 rgba(0, 0, 0, 0.2);
        &:hover { background: #f0f0f0; }
        &:active { background: #ddd; }
    }
}

/* ════════════════════════════════════
   响应式
   ════════════════════════════════════ */
@media (max-width: 767px) {
    .case-page { padding: 2.5rem 0.5rem 1.5rem; }
    .page-inner { gap: 0.6rem; }
    .page-title { font-size: 1.6rem; text-shadow: 2px 2px 0 #fff, 3px 3px 0 rgba(0, 0, 0, 0.15); }
    .page-desc { font-size: 0.9rem; }
    .header-badge { font-size: 0.75rem; padding: 0.2rem 0.8rem; }

    .case-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .case-card {
        transform: none !important;
        &:hover { transform: translateY(-2px) !important; }
    }

    .preview-content { min-height: 90px; padding: 0.8rem; }
    .desc-title { font-size: 0.95rem; }
    .desc-text { font-size: 0.8rem; }

    .drawer { width: 260px; }
    .bg-sfx, .bg-burst { display: none; }
}

@media (min-width: 768px) and (max-width: 1023px) {
    .case-page { padding: 3.5rem 1.2rem 2.5rem; }
    .page-title { font-size: 2.5rem; }

    .case-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.2rem;
    }
}

@media (min-width: 1024px) {
    .case-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>