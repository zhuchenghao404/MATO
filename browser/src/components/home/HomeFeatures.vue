<template>
  <section class="features" ref="sectionRef">
    <h2 class="features__title">为什么选择 MATO？</h2>
    <div class="features__grid">
      <div
        v-for="(f, i) in features" :key="f.title"
        class="card"
        :class="`card--${i}`"
        :ref="el => cardRefs[i] = el"
      >
        <div class="card__sfx">{{ f.sfx }}</div>
        <div class="card__icon">{{ f.icon }}</div>
        <h3 class="card__title">{{ f.title }}</h3>
        <p class="card__desc">{{ f.desc }}</p>
        <!-- hover 速度线 -->
        <div class="card__speedlines" aria-hidden="true"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

const gsap = inject('$gsap')

const features = [
  { icon: '📚', title: '体系教学', desc: '从 HTML 到 Vue3，循序渐进的系统化课程，每个知识点都有配套练习', sfx: 'CLICK!' },
  { icon: '⚔️', title: '闯关挑战', desc: '趣味问答 + 实时代码挑战，答对升级、解锁成就，让学习像游戏一样上瘾', sfx: 'LEVEL UP!' },
  { icon: '🏆', title: '优秀案例', desc: '社区作品展示，看看别人用同样的技术做出了什么，互相学习共同进步', sfx: 'WOW!' },
  { icon: '🎨', title: '自由画笔', desc: '在线代码编辑器，HTML/CSS/JS 三栏实时预览，随心创作并分享你的作品', sfx: 'CREATE!' },
]

const sectionRef = ref(null)
const cardRefs = ref([])
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.fromTo('.features__title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    cardRefs.value.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(el,
        { y: 60, opacity: 0, rotation: i % 2 === 0 ? -3 : 3, scale: 0.95 },
        { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.7, delay: i * 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true } }
      )
    })
  }, sectionRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.features {
  padding: 5rem 2rem 3rem; max-width: 1300px; margin: 0 auto;
}
.features__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: clamp(2rem, 4vw, 2.8rem);
  text-align: center; color: var(--comic-black);
  text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
  margin: 0 0 2.5rem;
}
.features__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;
}

.card {
  background: #fff; border: 4px solid var(--comic-black);
  box-shadow: 6px 6px 0 rgba(0,0,0,0.15);
  padding: 2rem 1.5rem; text-align: center; position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden; cursor: default;
  &:nth-child(odd) { transform: rotate(-0.8deg); }
  &:nth-child(even) { transform: rotate(0.8deg); }
  &:hover {
    transform: translateY(-8px) rotate(0deg) !important;
    box-shadow: 10px 10px 0 rgba(0,0,0,0.2);
  }
}
.card__sfx {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%) rotate(-3deg);
  font-family: 'Bangers', sans-serif; font-size: 0.75rem; color: #fff;
  background: var(--comic-black); padding: 0.15rem 0.8rem;
  border: 1px solid #fff; white-space: nowrap; z-index: 2;
}
.card__icon { font-size: 3rem; margin-bottom: 0.8rem; }
.card__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.5rem;
  color: var(--comic-black); margin: 0 0 0.5rem; letter-spacing: 1px;
}
.card__desc {
  font-family: 'Comic Neue', cursive; font-size: 0.95rem;
  color: #555; line-height: 1.6; margin: 0;
}

/* hover 速度线 */
.card__speedlines {
  position: absolute; inset: 0; pointer-events: none; opacity: 0;
  transition: opacity 0.3s ease;
  background:
    repeating-linear-gradient(
      -45deg,
      transparent, transparent 6px,
      rgba(0,0,0,0.02) 6px, rgba(0,0,0,0.02) 8px
    );
}
.card:hover .card__speedlines { opacity: 1; }

@media (max-width: 767px) {
  .features { padding: 3rem 1rem 2rem; }
  .features__grid { grid-template-columns: 1fr; }
  .card { transform: none !important; }
}
</style>
