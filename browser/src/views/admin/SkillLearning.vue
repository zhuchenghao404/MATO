<template>
  <div class="learning-page" :class="{ 'is-compact': isCompact }">
    <!-- 触控端：固定顶栏 + 底栏 + 底部弹层（手机 + 平板） -->
    <Teleport to="body">
      <div v-if="isCompact" class="m-shell">
        <header class="m-header">
          <span class="m-header-icon">{{ currentCourse.icon }}</span>
          <div class="m-header-text">
            <span class="m-header-badge">{{ currentCourse.badge }}</span>
            <span class="m-header-title">{{ currentCourse.title }}</span>
          </div>
        </header>

        <nav class="m-tabbar" aria-label="学习导航">
          <button
            type="button"
            class="m-tab"
            :class="{ active: courseSheetOpen }"
            @click="toggleCourseSheet"
          >
            <span class="m-tab-icon">📚</span>
            <span class="m-tab-label">课程</span>
          </button>
          <button
            type="button"
            class="m-tab"
            :class="{ active: sectionSheetOpen }"
            :disabled="!headings.length"
            @click="toggleSectionSheet"
          >
            <span class="m-tab-icon">📑</span>
            <span class="m-tab-label">目录</span>
          </button>
          <button type="button" class="m-tab" @click="scrollToTop">
            <span class="m-tab-icon">↑</span>
            <span class="m-tab-label">顶部</span>
          </button>
          <button
            v-if="nextCourse"
            type="button"
            class="m-tab m-tab--accent"
            @click="selectCourse(nextCourse.id)"
          >
            <span class="m-tab-icon">→</span>
            <span class="m-tab-label">下一章</span>
          </button>
          <button
            v-else-if="prevCourse"
            type="button"
            class="m-tab"
            @click="selectCourse(prevCourse.id)"
          >
            <span class="m-tab-icon">←</span>
            <span class="m-tab-label">上一章</span>
          </button>
        </nav>

        <div
          v-if="courseSheetOpen || sectionSheetOpen"
          class="m-mask"
          @click="closeAllSheets"
        />

        <!-- 课程选择 -->
        <div v-if="courseSheetOpen" class="m-sheet">
          <div class="m-sheet-head">
            <h3>选择课程</h3>
            <button type="button" class="m-sheet-close" @click="courseSheetOpen = false">✕</button>
          </div>
          <div class="m-sheet-body">
            <button
              v-for="course in courses"
              :key="course.id"
              type="button"
              class="m-course-card"
              :class="{ active: currentCourseId === course.id }"
              @click="selectCourse(course.id)"
            >
              <span class="m-course-icon">{{ course.icon }}</span>
              <span class="m-course-meta">
                <span class="m-course-name">{{ course.title }}</span>
                <span class="m-course-desc">{{ course.description }}</span>
              </span>
              <span class="m-course-badge">{{ course.badge }}</span>
            </button>
          </div>
        </div>

        <!-- 章节目录 -->
        <div v-if="sectionSheetOpen" class="m-sheet m-sheet--toc">
          <div class="m-sheet-head">
            <h3>本章目录</h3>
            <button type="button" class="m-sheet-close" @click="sectionSheetOpen = false">✕</button>
          </div>
          <nav class="m-sheet-body m-toc-list">
            <a
              v-for="h in headings"
              :key="'m-' + h.id"
              href="#"
              class="m-toc-item"
              :class="{ 'is-h3': h.level === 3, active: activeHeadingId === h.id }"
              @click.prevent="scrollToHeading(h.id)"
            >
              {{ h.text }}
            </a>
          </nav>
        </div>
      </div>
    </Teleport>

    <!-- 桌面端：左侧导航 -->
    <aside v-show="!isCompact" class="doc-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">学习路径</h2>
        <p class="sidebar-desc">HTML → CSS → JS → 异步</p>
      </div>

      <nav class="course-nav">
        <button
          v-for="course in courses"
          :key="course.id"
          class="course-item"
          :class="{ active: currentCourseId === course.id }"
          @click="selectCourse(course.id)"
        >
          <span class="course-icon">{{ course.icon }}</span>
          <span class="course-info">
            <span class="course-name">{{ course.title }}</span>
            <span class="course-badge">{{ course.badge }}</span>
          </span>
        </button>
      </nav>

      <div v-if="headings.length" class="section-nav">
        <p class="section-nav-title">本章目录</p>
        <a
          v-for="h in headings"
          :key="h.id"
          :href="'#' + h.id"
          class="section-link"
          :class="{ 'is-h3': h.level === 3, active: activeHeadingId === h.id }"
          @click.prevent="scrollToHeading(h.id)"
        >
          {{ h.text }}
        </a>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="doc-main">
      <header class="doc-header">
        <div class="doc-header-text">
          <span class="doc-badge">{{ currentCourse.badge }}</span>
          <h1 class="doc-title">{{ currentCourse.title }}</h1>
          <p class="doc-desc">{{ currentCourse.description }}</p>
        </div>
        <div class="doc-nav-arrows">
          <button
            v-if="prevCourse"
            class="nav-arrow"
            @click="selectCourse(prevCourse.id)"
          >
            ← {{ prevCourse.title }}
          </button>
          <button
            v-if="nextCourse"
            class="nav-arrow next"
            @click="selectCourse(nextCourse.id)"
          >
            {{ nextCourse.title }} →
          </button>
        </div>
      </header>

      <article
        ref="articleRef"
        class="doc-content markdown-body"
        v-html="renderedHtml"
      />

      <AiBubble :container-ref="articleRef" :context="currentCourse.title" />

      <footer class="doc-footer">
        <button
          v-if="prevCourse"
          class="footer-nav prev"
          @click="selectCourse(prevCourse.id)"
        >
          <small>上一章</small>
          <strong>{{ prevCourse.title }}</strong>
        </button>
        <button
          v-if="nextCourse"
          class="footer-nav next"
          @click="selectCourse(nextCourse.id)"
        >
          <small>下一章</small>
          <strong>{{ nextCourse.title }}</strong>
        </button>
      </footer>
    </main>

    <!-- 右侧 TOC（桌面端） -->
    <aside v-if="headings.length" class="doc-toc">
      <p class="toc-title">On this page</p>
      <a
        v-for="h in headings"
        :key="'toc-' + h.id"
        :href="'#' + h.id"
        class="toc-link"
        :class="{ 'is-h3': h.level === 3, active: activeHeadingId === h.id }"
        @click.prevent="scrollToHeading(h.id)"
      >
        {{ h.text }}
      </a>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courses, getCourseById } from '../../content/learning/index.js'
import { renderMarkdown, extractHeadings } from '../../utils/markdown.js'
import AiBubble from '../../components/AiBubble.vue'

const route = useRoute()
const router = useRouter()

const courseSheetOpen = ref(false)
const sectionSheetOpen = ref(false)
const isCompact = ref(false)
const articleRef = ref(null)
const activeHeadingId = ref('')

let compactMql = null

function getScrollOffset() {
  return isCompact.value ? 100 : 100
}

function toggleCourseSheet() {
  sectionSheetOpen.value = false
  courseSheetOpen.value = !courseSheetOpen.value
}

function toggleSectionSheet() {
  if (!headings.value.length) return
  courseSheetOpen.value = false
  sectionSheetOpen.value = !sectionSheetOpen.value
}

function closeAllSheets() {
  courseSheetOpen.value = false
  sectionSheetOpen.value = false
}

function scrollToTop() {
  closeAllSheets()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function syncCompactState(mql) {
  isCompact.value = mql.matches
  if (!mql.matches) {
    courseSheetOpen.value = false
    sectionSheetOpen.value = false
  }
  syncBodyScrollLock()
}

const currentCourseId = computed(() => {
  const id = route.query.course
  return courses.some((c) => c.id === id) ? id : courses[0].id
})

const currentCourse = computed(() => getCourseById(currentCourseId.value))

const currentIndex = computed(() =>
  courses.findIndex((c) => c.id === currentCourseId.value)
)

const prevCourse = computed(() =>
  currentIndex.value > 0 ? courses[currentIndex.value - 1] : null
)

const nextCourse = computed(() =>
  currentIndex.value < courses.length - 1
    ? courses[currentIndex.value + 1]
    : null
)

const renderedHtml = computed(() => renderMarkdown(currentCourse.value.content))

const headings = computed(() => extractHeadings(currentCourse.value.content))

function selectCourse(id) {
  closeAllSheets()
  if (route.query.course !== id) {
    router.push({ path: '/SkillLearning', query: { course: id } })
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToHeading(id) {
  closeAllSheets()
  const el = document.getElementById(id)
  if (el) {
    const offset = getScrollOffset()
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    activeHeadingId.value = id
  }
}

let observer = null

function setupHeadingObserver() {
  observer?.disconnect()
  const ids = headings.value.map((h) => h.id)
  if (!ids.length) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length) {
        activeHeadingId.value = visible[0].target.id
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
  )

  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
}

watch(currentCourseId, () => {
  closeAllSheets()
  nextTick(setupHeadingObserver)
})

function syncBodyScrollLock() {
  document.body.style.overflow =
    courseSheetOpen.value || sectionSheetOpen.value ? 'hidden' : ''
}

watch([courseSheetOpen, sectionSheetOpen], () => {
  syncBodyScrollLock()
})

onMounted(() => {
  if (!route.query.course) {
    router.replace({ path: '/SkillLearning', query: { course: courses[0].id } })
  }
  compactMql = window.matchMedia('(max-width: 1023px)')
  syncCompactState(compactMql)
  compactMql.addEventListener('change', syncCompactState)
  nextTick(setupHeadingObserver)
})

onUnmounted(() => {
  observer?.disconnect()
  compactMql?.removeEventListener('change', syncCompactState)
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
/* 教程页独立排版：清晰可读 + 边框/阴影保留漫画装饰，不用全局 h1/h2 漫画字效 */
$font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
  'Microsoft YaHei', 'Helvetica Neue', sans-serif;
$font-mono: 'Consolas', 'Courier New', monospace;
$font-accent: 'Bangers', 'Impact', sans-serif;

.learning-page {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
  position: relative;
  font-family: $font-sans;
  font-size: 15px;
  line-height: 1.7;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;

  /* 覆盖 page.css 全局漫画 h1/h2（负字距 + 阴影会导致中文重叠/重影） */
  h1,
  h2,
  h3,
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    font-family: $font-sans !important;
    letter-spacing: normal !important;
    text-transform: none !important;
    text-shadow: none !important;
    -webkit-text-stroke: 0 !important;
    text-stroke: 0 !important;
    paint-order: initial !important;
    color: #1a1a1a !important;
    font-weight: 600;
  }
}

/* ========== 侧边栏 ========== */
.doc-sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 1rem 0.75rem 2rem;
  border-right: 3px solid var(--comic-black);
  background: var(--comic-white);
  z-index: 10;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--comic-black);
  }
}

.sidebar-header {
  padding: 0 0.5rem 1rem;
  border-bottom: 2px dashed var(--comic-black);
  margin-bottom: 1rem;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--comic-black);
  margin-bottom: 0.25rem;
}

.sidebar-desc {
  font-size: 0.8125rem;
  color: #666;
}

.course-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    background: #f0f0f0;
    border-color: var(--comic-black);
    transform: translateX(3px);
  }

  &.active {
    background: var(--comic-black);
    color: #fff;
    border-color: var(--comic-black);
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);

    .course-badge {
      background: #fff;
      color: var(--comic-black);
    }
  }
}

.course-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.course-name {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.35;
}

.course-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: var(--comic-black);
  color: #fff;
  padding: 0.05rem 0.4rem;
  align-self: flex-start;
  border: 1px solid #fff;
}

.section-nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  margin-bottom: 0.6rem;
  padding: 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.toc-title {
  font-family: $font-accent;
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  color: #888;
  margin-bottom: 0.6rem;
  padding: 0 0.5rem;
}

.section-link,
.toc-link {
  display: block;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
  color: var(--comic-gray);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: all 0.12s ease;
  line-height: 1.4;

  &.is-h3 {
    padding-left: 1.2rem;
    font-size: 0.78rem;
  }

  &:hover,
  &.active {
    color: var(--comic-black);
    border-left-color: var(--comic-black);
    background: rgba(0, 0, 0, 0.04);
  }
}

/* ========== 主内容 ========== */
.doc-main {
  min-width: 0;
  padding: 0 2rem 3rem;
}

.doc-header {
  padding: 1.5rem 0 1rem;
  border-bottom: 3px solid var(--comic-black);
  margin-bottom: 2rem;
}

/* ========== 触控端布局（手机 + 平板 ≤1023px） ========== */
.learning-page.is-compact {
  grid-template-columns: 1fr;
  max-width: 100%;

  .doc-sidebar,
  .sidebar-overlay {
    display: none !important;
  }

  .doc-header {
    display: none;
  }

  .doc-footer {
    display: none;
  }

  .doc-main {
    padding: 3rem 1.5rem calc(4.75rem + env(safe-area-inset-bottom, 0px));
    max-width: 820px;
    margin: 0 auto;
    width: 100%;
  }

  .doc-content {
    :deep(h2),
    :deep(h3) {
      scroll-margin-top: 96px;
    }
  }
}

.doc-badge {
  display: inline-block;
  font-family: $font-accent;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  background: var(--comic-black);
  color: #fff;
  padding: 0.2rem 0.65rem;
  margin-bottom: 0.5rem;
}

.doc-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--comic-black);
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.doc-desc {
  font-size: 0.9375rem;
  color: #666;
  line-height: 1.6;
}

.doc-nav-arrows {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.nav-arrow {
  padding: 0.35rem 0.8rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: #fff;
  border: 2px solid var(--comic-black);
  cursor: pointer;
  transition: transform 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 3px 3px 0 var(--comic-black);
  }

  &.next {
    margin-left: auto;
  }
}

/* ========== Markdown 正文（类 Vue 文档排版） ========== */
.doc-content {
  :deep(h1) {
    display: none;
  }

  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 2.25rem 0 0.875rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--comic-black);
    scroll-margin-top: 100px;
    line-height: 1.4;
  }

  :deep(h3) {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 1.75rem 0 0.625rem;
    scroll-margin-top: 100px;
    line-height: 1.45;
  }

  :deep(h4) {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 1.25rem 0 0.5rem;
  }

  :deep(p),
  :deep(li) {
    font-size: 0.9375rem;
    line-height: 1.8;
    color: #333;
    margin-bottom: 0.75rem;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  :deep(blockquote) {
    margin: 1rem 0;
    padding: 0.75rem 1rem;
    border-left: 4px solid var(--comic-black);
    background: #f5f5f5;
    font-size: 0.9rem;
    border-radius: 0 4px 4px 0;

    p {
      margin-bottom: 0;
      color: #444;
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid #ddd;
    margin: 2rem 0;
  }

  :deep(code) {
    font-family: $font-mono;
    font-size: 0.875em;
    background: #f0f0f0;
    padding: 0.15em 0.35em;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    color: #c7254e;
  }

  :deep(pre) {
    margin: 1rem 0 1.25rem;
    padding: 1rem 1.15rem;
    background: #282c34;
    border: 2px solid var(--comic-black);
    border-radius: 6px;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.12);
    overflow-x: auto;

    code {
      background: none;
      border: none;
      padding: 0;
      color: #abb2bf;
      font-size: 0.875rem;
      line-height: 1.65;
    }
  }

  :deep(.table-wrap) {
    overflow-x: auto;
    margin: 1rem 0 1.25rem;
    border: 2px solid var(--comic-black);
    border-radius: 4px;
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  :deep(th) {
    background: #f5f5f5;
    color: #1a1a1a;
    padding: 0.6rem 0.85rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #ddd;
  }

  :deep(td) {
    padding: 0.55rem 0.85rem;
    border-bottom: 1px solid #eee;
    background: #fff;
  }

  :deep(tr:nth-child(even) td) {
    background: #fafafa;
  }

  :deep(a) {
    color: #2563eb;
    font-weight: 500;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.15s;

    &:hover {
      border-bottom-color: #2563eb;
      background: transparent;
      color: #1d4ed8;
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: #1a1a1a;
  }
}

/* ========== 页脚导航 ========== */
.doc-footer {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 3px solid var(--comic-black);
}

.footer-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 3px solid var(--comic-black);
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.15);
  cursor: pointer;
  text-align: left;
  transition: transform 0.12s ease;
  font-family: inherit;

  small {
    font-size: 0.75rem;
    color: #888;
  }

  strong {
    font-size: 1rem;
    font-weight: 600;
    color: var(--comic-black);
  }

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.2);
  }

  &.next {
    text-align: right;
    margin-left: auto;
    max-width: 50%;
  }

  &.prev {
    max-width: 50%;
  }
}

/* ========== 右侧 TOC ========== */
.doc-toc {
  display: none;
}

.sidebar-overlay {
  display: none;
}

/* ========== 桌面端（≥1024px） ========== */
@media (min-width: 1024px) {
  .learning-page {
    grid-template-columns: 240px 1fr;
  }
}

/* ========== 大屏：三栏 + 显示 TOC ========== */
@media (min-width: 1200px) {
  .learning-page {
    grid-template-columns: 240px 1fr 180px;
  }

  .doc-toc {
    display: block;
    position: sticky;
    top: 100px;
    align-self: start;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    padding: 1.5rem 0.5rem 2rem 1rem;
  }

  .section-nav {
    display: none;
  }
}

/* ========== 手机端字号微调 ========== */
@media (max-width: 767px) {
  .learning-page.is-compact .doc-main {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .doc-content {
    :deep(h2) {
      font-size: 1.25rem;
    }

    :deep(h3) {
      font-size: 1.0625rem;
    }

    :deep(pre) {
      padding: 0.75rem;
      font-size: 0.78rem;
    }
  }
}
</style>

<!-- 触控端壳层：手机 + 平板，Teleport 到 body -->
<style lang="scss">
@media (max-width: 1023px) {
  .m-shell {
    pointer-events: none;
  }

  .m-shell > * {
    pointer-events: auto;
  }

  /* 顶栏：固定在站点导航下方 */
  .m-header {
    position: fixed;
    top: 88px;
    left: 0;
    right: 0;
    z-index: 9998;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    height: 48px;
    padding: 0 1rem;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e5e5e5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .m-header-icon {
    font-size: 1.35rem;
    flex-shrink: 0;
  }

  .m-header-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  .m-header-badge {
    font-size: 0.625rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .m-header-title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 底栏：始终可见 */
  .m-tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10002;
    display: flex;
    align-items: stretch;
    height: calc(56px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: #fff;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  }

  .m-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    border: none;
    background: transparent;
    color: #666;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.15s, background 0.15s;

    &:active:not(:disabled) {
      background: #f5f5f5;
    }

    &.active {
      color: #111;
      background: #f0f0f0;
    }

    &--accent {
      color: #111;
      font-weight: 600;
    }

    &:disabled {
      opacity: 0.35;
    }
  }

  .m-tab-icon {
    font-size: 1.125rem;
    line-height: 1;
  }

  .m-tab-label {
    font-size: 0.625rem;
    font-weight: 500;
  }

  /* 遮罩 */
  .m-mask {
    position: fixed;
    inset: 0;
    z-index: 10003;
    background: rgba(0, 0, 0, 0.45);
  }

  /* 底部弹层 */
  .m-sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    z-index: 10004;
    max-height: min(70vh, 480px);
    background: #fff;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    animation: m-sheet-in 0.25s ease;
  }

  @keyframes m-sheet-in {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .m-sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem 0.75rem;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;

    h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #111;
      margin: 0;
    }
  }

  .m-sheet-close {
    width: 2rem;
    height: 2rem;
    border: none;
    background: #f0f0f0;
    border-radius: 50%;
    font-size: 0.875rem;
    color: #333;
    cursor: pointer;
    line-height: 1;
  }

  .m-sheet-body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0.5rem 0.75rem 1rem;
  }

  /* 课程卡片 */
  .m-course-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem;
    margin-bottom: 0.5rem;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    background: #fff;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, background 0.15s;

    &.active {
      border-color: #111;
      background: #fafafa;
    }

    &:active {
      background: #f0f0f0;
    }
  }

  .m-course-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .m-course-meta {
    flex: 1;
    min-width: 0;
  }

  .m-course-name {
    display: block;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111;
    margin-bottom: 0.15rem;
  }

  .m-course-desc {
    display: block;
    font-size: 0.75rem;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .m-course-badge {
    flex-shrink: 0;
    font-size: 0.625rem;
    font-weight: 600;
    padding: 0.2rem 0.45rem;
    background: #111;
    color: #fff;
    border-radius: 4px;
  }

  /* 目录列表 */
  .m-toc-list {
    padding: 0.25rem 0;
  }

  .m-toc-item {
    display: block;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #444;
    text-decoration: none;
    border-bottom: 1px solid #f0f0f0;
    line-height: 1.45;

    &.is-h3 {
      padding-left: 1.75rem;
      font-size: 0.8125rem;
      color: #666;
    }

    &.active {
      color: #111;
      font-weight: 600;
      background: #f8f8f8;
    }

    &:active {
      background: #f0f0f0;
    }
  }

  /* 平板（768px+）：居中布局，双列课程卡片 */
  @media (min-width: 768px) {
    .m-header {
      top: 100px;
      height: 52px;
      padding: 0 max(1.5rem, calc((100% - 820px) / 2 + 1.5rem));
    }

    .m-header-title {
      font-size: 1.0625rem;
    }

    .m-tabbar {
      left: 50%;
      right: auto;
      width: min(820px, 100%);
      transform: translateX(-50%);
      border-left: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
      border-radius: 12px 12px 0 0;
    }

    .m-tab {
      flex-direction: row;
      gap: 0.35rem;
      padding: 0 0.75rem;
    }

    .m-tab-label {
      font-size: 0.8125rem;
    }

    .m-sheet {
      left: 50%;
      right: auto;
      width: min(600px, calc(100% - 2rem));
      transform: translateX(-50%);
      animation: m-sheet-in-tablet 0.25s ease;
    }

    @keyframes m-sheet-in-tablet {
      from { transform: translate(-50%, 100%); }
      to { transform: translate(-50%, 0); }
    }

    .m-sheet:not(.m-sheet--toc) .m-sheet-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.625rem;
      align-content: start;
    }

    .m-course-card {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 0;
      height: 100%;
    }

    .m-course-badge {
      align-self: flex-start;
      margin-top: 0.35rem;
    }
  }
}
</style>
