<template>
  <section class="journey" ref="sectionRef">
    <h2 class="journey__title">从第一行代码开始</h2>
    <p class="journey__subtitle">滚动看看你的前端冒险之旅</p>

    <!-- 进度指示器 -->
    <div class="journey__progress" ref="progressRef">
      <span
        v-for="(_, i) in panels" :key="i"
        class="progress-dot"
        :class="{ 'progress-dot--active': i <= activePanel }"
      ></span>
    </div>

    <div class="journey__strip" ref="stripRef">
      <div class="journey__track" ref="trackRef">
        <div v-for="(p, i) in panels" :key="i" class="panel" :ref="el => panelRefs[i] = el">
          <div class="panel__inner">
            <div class="panel__scene" :class="`scene--${p.scene}`">
              <div class="scene__illust" v-html="p.illust"></div>
            </div>
            <div class="panel__speech">
              <span class="speech-text">{{ p.text }}</span>
            </div>
            <div class="panel__number">{{ String(i + 1).padStart(2, '0') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="journey__actionlines" aria-hidden="true"></div>
  </section>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

const gsap = inject('$gsap')
const ScrollTrigger = inject('$ScrollTrigger')

const panels = [
  {
    scene: 'start',
    text: '我该从哪里开始？',
    illust: `<div class="mock-editor">
      <div class="mock-line"></div><div class="mock-line short"></div>
      <div class="mock-cursor"></div>
    </div><div class="mock-q">?</div>`,
  },
  {
    scene: 'write',
    text: '写下第一行代码',
    illust: `<div class="tag-cloud">
      <span class="tag-h">&lt;h1&gt;</span>
      <span class="tag-c">.class { }</span>
      <span class="tag-j">function()</span>
    </div>`,
  },
  {
    scene: 'animate',
    text: '让页面动起来！',
    illust: `<div class="balls">
      <div class="ball ball--1"></div>
      <div class="ball ball--2"></div>
      <div class="ball ball--3"></div>
    </div><div class="sparkle">✨</div>`,
  },
  {
    scene: 'publish',
    text: '发布你的作品！',
    illust: `<div class="rocket">🚀</div><div class="rays"></div>`,
  },
]

const sectionRef = ref(null)
const stripRef = ref(null)
const trackRef = ref(null)
const progressRef = ref(null)
const panelRefs = ref([])
const activePanel = ref(0)
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.fromTo('.journey__title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    gsap.fromTo('.journey__subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.15,
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )

    // 桌面端横向滚动
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      gsap.to(trackRef.value, {
        x: () => -(trackRef.value.scrollWidth - stripRef.value.offsetWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 10%',
          end: () => `+=${trackRef.value.scrollWidth - stripRef.value.offsetWidth}`,
          pin: stripRef.value,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            activePanel.value = Math.min(
              panels.length - 1,
              Math.floor(self.progress * panels.length)
            )
          },
        },
      })
    })
  }, sectionRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.journey {
  padding: 5rem 2rem 2rem; overflow: hidden; position: relative;
}
.journey__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: clamp(2rem, 4vw, 2.8rem);
  text-align: center; color: var(--comic-black);
  text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
  margin: 0 0 0.5rem;
}
.journey__subtitle {
  text-align: center; font-family: 'Comic Neue', cursive; font-size: 1.1rem;
  color: #666; margin: 0 0 1rem;
}

/* 进度点 */
.journey__progress {
  display: flex; justify-content: center; gap: 0.6rem; margin-bottom: 1.5rem;
}
.progress-dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid var(--comic-black); background: transparent;
  transition: background 0.3s ease, transform 0.3s ease;
  &--active { background: var(--comic-black); transform: scale(1.2); }
}

/* 长卷 */
.journey__strip { width: 100%; overflow: hidden; }
.journey__track {
  display: flex; gap: 2rem; width: max-content; will-change: transform;
}

.panel {
  min-width: min(380px, 80vw); flex-shrink: 0;
}
.panel__inner {
  background: #fff; border: 5px solid var(--comic-black);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.15);
  height: 420px; display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}

.panel__scene {
  flex: 1; display: flex; align-items: center; justify-content: center;
  border-bottom: 3px solid var(--comic-black); position: relative;
  background: linear-gradient(180deg, #f8f8f8, #e8e8e8);
}
.scene--animate { background: linear-gradient(180deg, #1a1a2e, #16213e); }
.scene--publish { background: linear-gradient(180deg, #0a0a1a, #1a1a3e); overflow: hidden; }

.scene__illust { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }

/* 面板内 CSS 插画 */
:deep(.mock-editor) {
  width: 200px; background: #1e1e1e; border: 2px solid #444;
  border-radius: 6px; padding: 16px 20px;
}
:deep(.mock-line) {
  height: 8px; background: #444; border-radius: 2px; margin-bottom: 10px;
  animation: linePulse 2s ease-in-out infinite;
  &.short { width: 60%; animation-delay: 0.3s; }
}
@keyframes linePulse {
  0%, 100% { opacity: 0.4; } 50% { opacity: 1; background: #ff6b35; }
}
:deep(.mock-cursor) {
  width: 2px; height: 16px; background: #ff6b35; margin-top: 4px;
  animation: blink 0.8s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }
:deep(.mock-q) {
  position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
  font-family: 'Bangers', sans-serif; font-size: 6rem; color: rgba(0,0,0,0.08);
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(-50%) rotate(0); }
  50% { transform: translateY(-60%) rotate(5deg); }
}

:deep(.tag-cloud) { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; padding: 20px; }
:deep(.tag-h), :deep(.tag-c), :deep(.tag-j) {
  font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: 700;
  padding: 8px 16px; border: 2px solid #000; background: #fff;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
}
:deep(.tag-h) { color: #e44d26; transform: rotate(-3deg); }
:deep(.tag-c) { color: #264de4; transform: rotate(2deg); margin-top: 20px; }
:deep(.tag-j) { color: #f7df1e; transform: rotate(-1deg); margin-top: 10px; }

:deep(.balls) { display: flex; gap: 16px; align-items: flex-end; }
:deep(.ball) {
  width: 36px; height: 36px; border-radius: 50%;
}
:deep(.ball--1) { background: #ff6b35; animation: bounce 0.8s ease-in-out infinite; }
:deep(.ball--2) { background: #409eff; animation: bounce 0.9s ease-in-out 0.2s infinite; }
:deep(.ball--3) { background: #67c23a; animation: bounce 0.7s ease-in-out 0.4s infinite; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); } 50% { transform: translateY(-40px); }
}
:deep(.sparkle) {
  position: absolute; top: 20px; right: 30px; font-size: 2rem;
  animation: sparkle 2s ease-in-out infinite;
}
@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0); } 50% { transform: scale(1.3) rotate(180deg); }
}

:deep(.rocket) {
  font-size: 5rem; z-index: 1; position: relative;
  animation: rocket 2s ease-in-out infinite;
}
@keyframes rocket {
  0% { transform: translateY(20px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(20px); }
}
:deep(.rays) {
  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 60px; height: 120px;
  background: linear-gradient(to top, rgba(255,107,53,0.4), transparent);
  border-radius: 50% 50% 0 0; animation: rayPulse 1s ease-in-out infinite;
}
@keyframes rayPulse {
  0%, 100% { opacity: 0.3; transform: translateX(-50%) scaleY(0.8); }
  50% { opacity: 0.6; transform: translateX(-50%) scaleY(1.2); }
}

.panel__speech { padding: 16px 20px; background: #fff; }
.speech-text {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.3rem;
  color: var(--comic-black); letter-spacing: 0.5px;
}
.panel__number {
  position: absolute; top: 12px; left: 16px;
  font-family: 'Bangers', sans-serif; font-size: 2rem; color: #fff;
  background: var(--comic-black); width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
}

.journey__actionlines {
  width: 100%; height: 3px; margin-top: 2rem;
  background: repeating-linear-gradient(90deg, var(--comic-black), var(--comic-black) 20px, transparent 20px, transparent 30px);
  opacity: 0.25;
}

/* 响应式 */
@media (max-width: 767px) {
  .journey__strip { overflow: visible; }
  .journey__track { flex-direction: column; gap: 1.5rem; width: 100% !important; }
  .panel { min-width: 100%; }
  .panel__inner { height: auto; min-height: 260px; }
  .panel__scene { min-height: 180px; }
  .panel__number { font-size: 1.4rem; width: 36px; height: 36px; top: 8px; left: 10px; }
  .speech-text { font-size: 1.1rem; }
  .journey__progress { display: none; }
}
</style>
