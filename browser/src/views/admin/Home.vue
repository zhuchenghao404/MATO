<template>
  <div class="home" ref="homeRef">
    <!-- 滚动进度条 -->
    <div class="scroll-progress" ref="progressBarRef" aria-hidden="true">
      <div class="scroll-progress__fill"></div>
      <span class="scroll-progress__label">SCROLL</span>
    </div>

    <HomeHero />
    <HomeFeatures />
    <HomeJourney />
    <HomeSkills />
    <HomeDemo />
    <HomeWorks />
    <HomeCTA />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import HomeHero from '../../components/home/HomeHero.vue'
import HomeFeatures from '../../components/home/HomeFeatures.vue'
import HomeJourney from '../../components/home/HomeJourney.vue'
import HomeSkills from '../../components/home/HomeSkills.vue'
import HomeDemo from '../../components/home/HomeDemo.vue'
import HomeWorks from '../../components/home/HomeWorks.vue'
import HomeCTA from '../../components/home/HomeCTA.vue'

const gsap = inject('$gsap')
const ScrollTrigger = inject('$ScrollTrigger')

const homeRef = ref(null)
const progressBarRef = ref(null)
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    // 全局滚动进度条
    gsap.to('.scroll-progress__fill', {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: homeRef.value,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    })

    // Section 入场：微妙的向上推入（不改 opacity，避免内容发白）
    const sections = homeRef.value.querySelectorAll('section')
    sections.forEach((sec, i) => {
      if (i === 0) return
      gsap.fromTo(sec,
        { y: 20 },
        {
          y: 0, duration: 0.5, ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 95%',
            end: 'top 80%',
            scrub: 0.3,
          },
        }
      )
    })
  }, homeRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.home {
  position: relative;
}

/* ── 滚动进度条 ── */
.scroll-progress {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9998;
  height: 3px; background: rgba(0,0,0,0.08);
  pointer-events: none;
}
.scroll-progress__fill {
  height: 100%; background: var(--comic-black);
  transform-origin: left; transform: scaleX(0);
  will-change: transform;
}
.scroll-progress__label {
  position: absolute; top: 6px; right: 12px;
  font-family: 'Bangers', sans-serif; font-size: 0.6rem;
  color: var(--comic-black); opacity: 0.3; letter-spacing: 2px;
}
</style>
