<template>
  <section class="cta" ref="sectionRef">
    <div class="cta__speedlines" aria-hidden="true"></div>
    <div class="cta__content">
      <h2 class="cta__title" ref="titleRef">准备好开始你的前端冒险了吗？</h2>
      <p class="cta__desc">加入 MATO，从第一行 HTML 开始，写出属于你的代码</p>
      <div class="cta__actions" v-if="!isLoggedIn">
        <button class="comic-btn cta__btn" @click="openAuthModal">立 即 加 入</button>
      </div>
      <div class="cta__actions" v-else>
        <button class="comic-btn cta__btn" @click="$router.push('/SkillLearning')">开 始 学 习</button>
        <button class="comic-btn white cta__btn" @click="$router.push('/Pen')">去 画 笔</button>
      </div>
    </div>
    <div class="cta__sfx" aria-hidden="true">
      <span class="sfx-text sfx--bam">BAM!</span>
      <span class="sfx-text sfx--pow">POW!</span>
      <span class="sfx-text sfx--zap">ZAP!</span>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../stores/auth.js'

const gsap = inject('$gsap')
const { isLoggedIn, openAuthModal } = useAuth()

const sectionRef = ref(null)
const titleRef = ref(null)
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.fromTo('.cta__title',
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    gsap.fromTo('.cta__desc',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.15,
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    gsap.fromTo('.cta__actions',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3,
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
  }, sectionRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.cta {
  position: relative; padding: 5rem 2rem; overflow: hidden;
  background: var(--comic-black); text-align: center;
}
.cta__speedlines {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(25deg, transparent, transparent 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 12px);
}
.cta__content { position: relative; z-index: 1; }
.cta__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: #fff; text-shadow: 3px 3px 0 rgba(0,0,0,0.5); margin: 0 0 0.8rem;
}
.cta__desc {
  font-family: 'Comic Neue', cursive; font-size: 1.2rem;
  color: rgba(255,255,255,0.7); margin: 0 0 2rem;
}
.cta__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.cta__btn { font-size: 1.4rem !important; padding: 1.1rem 3rem !important; min-width: 200px !important; }

.cta__sfx { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.sfx-text {
  position: absolute; font-family: 'Bangers', 'Impact', sans-serif;
  font-weight: 900; opacity: 0.06;
  -webkit-text-stroke: 1px rgba(255,255,255,0.3); text-stroke: 1px rgba(255,255,255,0.3);
}
.sfx--bam { font-size: 8rem; top: 20px; left: 5%; transform: rotate(-12deg); color: #ff6b35; }
.sfx--pow { font-size: 6rem; bottom: 10px; right: 8%; transform: rotate(8deg); color: #fff; }
.sfx--zap { font-size: 5rem; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-5deg); color: #409eff; }

@media (max-width: 767px) {
  .cta { padding: 3rem 1rem; }
  .cta__desc { font-size: 0.95rem; }
  .cta__btn { font-size: 1.1rem !important; padding: 0.8rem 2rem !important; }
  .sfx--bam { font-size: 4rem; }
  .sfx--pow { font-size: 3rem; }
  .sfx--zap { font-size: 2.5rem; }
}
</style>
