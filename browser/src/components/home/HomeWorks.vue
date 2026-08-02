<template>
  <section class="works" ref="sectionRef">
    <h2 class="works__title">优秀案例</h2>
    <p class="works__subtitle">来自学习者的精彩作品</p>

    <div v-if="loading" class="works__loading">
      <span class="loading-text">加载中...</span>
    </div>
    <div v-else class="works__grid">
      <div
        v-for="(w, i) in displayWorks" :key="w.id"
        class="work-card comic-frame"
        :ref="el => cardRefs[i] = el"
        @click="$router.push('/PerfectCase')"
      >
        <div class="work-card__cover" :style="{ background: w.coverBg }">
          <img v-if="w.cover && !w._imgErr" :src="w.cover" :alt="w.title"
            class="work-card__img" @error="w._imgErr = true" loading="lazy">
          <span v-else class="work-card__emoji">{{ w.emoji }}</span>
        </div>
        <div class="work-card__info">
          <h4 class="work-card__title">{{ w.title }}</h4>
          <p class="work-card__author">by {{ w.author }}</p>
        </div>
      </div>
    </div>

    <div class="works__cta">
      <button class="comic-btn" @click="$router.push('/PerfectCase')">查看更多案例 →</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

const gsap = inject('$gsap')
const API_BASE = '/api'

// 默认展示数据（API 失败时的兜底）
const fallbackWorks = [
  { id: 101, title: '贪吃蛇游戏', author: 'admin', emoji: '🐍', coverBg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 102, title: 'CSS 动画卡片', author: '张三', emoji: '🎴', coverBg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 103, title: '响应式导航栏', author: '赵六', emoji: '🧭', coverBg: 'linear-gradient(135deg, #1d1e2b, #2d3047)' },
]

const coverBgs = [
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #1d1e2b, #2d3047)',
]
const emojis = ['🐍', '🎴', '🧭', '🚀', '✨', '🎮']

const works = ref([])
const loading = ref(true)

const displayWorks = computed(() => {
  if (works.value.length === 0) return fallbackWorks
  return works.value.slice(0, 3).map((w, i) => ({
    ...w,
    coverBg: coverBgs[i % coverBgs.length],
    emoji: emojis[i % emojis.length],
    author: w.user?.name || '匿名',
    _imgErr: false,
  }))
})

async function fetchWorks() {
  try {
    const res = await fetch(`${API_BASE}/works?filter=most-liked&pageSize=3`)
    const data = await res.json()
    if (data.code === 200 && data.data?.list?.length > 0) {
      works.value = data.data.list
    }
  } catch {
    // 使用兜底数据
  } finally {
    loading.value = false
  }
}

const sectionRef = ref(null)
const cardRefs = ref([])
let ctx = null

onMounted(() => {
  fetchWorks()

  ctx = gsap.context(() => {
    gsap.fromTo('.works__title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    gsap.fromTo('.works__subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.1,
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    // 等数据加载后再动画
    setTimeout(() => {
      cardRefs.value.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el,
          { y: 50, opacity: 0, rotation: i % 2 === 0 ? -3 : 3 },
          { y: 0, opacity: 1, rotation: 0, duration: 0.7, delay: i * 0.12,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true } }
        )
      })
    }, 100)
  }, sectionRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.works {
  padding: 5rem 2rem; max-width: 1300px; margin: 0 auto;
}
.works__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: clamp(2rem, 4vw, 2.8rem);
  text-align: center; color: var(--comic-black);
  text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
  margin: 0 0 0.5rem;
}
.works__subtitle {
  text-align: center; font-family: 'Comic Neue', cursive; font-size: 1.1rem;
  color: #666; margin: 0 0 2rem;
}
.works__loading {
  text-align: center; padding: 3rem;
}
.loading-text {
  font-family: 'Comic Neue', cursive; font-size: 1.1rem; color: #999;
}

.works__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;
}

.work-card {
  padding: 0 !important; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-6px) rotate(1deg) !important;
    box-shadow: 10px 10px 0 var(--comic-black), 12px 12px 0 rgba(0,0,0,0.2) !important;
  }
}
.work-card__cover {
  height: 150px; display: flex; align-items: center; justify-content: center;
  overflow: hidden; border-bottom: 3px solid var(--comic-black);
}
.work-card__img {
  width: 100%; height: 100%; object-fit: cover;
}
.work-card__emoji { font-size: 3rem; }
.work-card__info { padding: 1rem 1.2rem; }
.work-card__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.2rem;
  color: var(--comic-black); margin: 0 0 0.3rem;
}
.work-card__author {
  font-family: 'Comic Neue', cursive; font-size: 0.85rem; color: #888; margin: 0;
}
.works__cta { text-align: center; margin-top: 2rem; }

@media (max-width: 767px) {
  .works { padding: 3rem 1rem; }
}
</style>
