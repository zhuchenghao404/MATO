<template>
  <section class="demo" ref="sectionRef">
    <h2 class="demo__title">看看能做什么</h2>
    <p class="demo__subtitle">用 MATO 画笔，几分钟就能写出这样的效果</p>
    <div class="demo__frame comic-frame" ref="frameRef">
      <div class="demo__bar">
        <span class="dot dot--r"></span>
        <span class="dot dot--y"></span>
        <span class="dot dot--g"></span>
        <span class="demo__bar-title">Pen Demo — 实时预览</span>
      </div>
      <div class="demo__content">
        <div class="demo__inner">
          <div class="demo__ball"></div>
          <div class="demo__text">Hello MATO!</div>
          <div class="demo__particles">
            <span v-for="n in 12" :key="n" class="particle" :style="{ '--i': n }"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

const gsap = inject('$gsap')

const sectionRef = ref(null)
const frameRef = ref(null)
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.fromTo('.demo__title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    gsap.fromTo('.demo__subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.1,
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )
    gsap.fromTo(frameRef.value,
      { scale: 0.85, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 1, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 80%', once: true } }
    )
  }, sectionRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.demo {
  padding: 5rem 2rem; max-width: 900px; margin: 0 auto;
}
.demo__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: clamp(2rem, 4vw, 2.8rem);
  text-align: center; color: var(--comic-black);
  text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
  margin: 0 0 0.5rem;
}
.demo__subtitle {
  text-align: center; font-family: 'Comic Neue', cursive; font-size: 1.1rem;
  color: #666; margin: 0 0 2rem;
}
.demo__frame {
  max-width: 700px; margin: 0 auto; padding: 0 !important; overflow: hidden !important;
}
.demo__bar {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px; background: #2d2d2d; border-bottom: 2px solid #000;
}
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot--r { background: #ff5f57; }
.dot--y { background: #febc2e; }
.dot--g { background: #28c840; }
.demo__bar-title {
  margin-left: 8px; font-family: 'Courier New', monospace;
  font-size: 12px; color: #999;
}
.demo__content {
  background: #1a1a2e; padding: 3rem 2rem; min-height: 260px;
  display: flex; align-items: center; justify-content: center;
}
.demo__inner { text-align: center; position: relative; }
.demo__ball {
  width: 80px; height: 80px; margin: 0 auto 1.5rem; border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  box-shadow: 0 0 40px rgba(255,107,53,0.4);
  animation: ballBounce 2s ease-in-out infinite;
}
@keyframes ballBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-30px) scale(1.08); }
  50% { transform: translateY(0) scale(0.95); }
  70% { transform: translateY(-15px) scale(1.03); }
}
.demo__text {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: 2.4rem;
  color: #fff; text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  animation: glow 2s ease-in-out infinite;
}
@keyframes glow {
  0%, 100% { text-shadow: 2px 2px 0 rgba(0,0,0,0.5); }
  50% { text-shadow: 0 0 20px rgba(255,107,53,0.5), 2px 2px 0 rgba(0,0,0,0.5); }
}
.demo__particles {
  position: absolute; top: 50%; left: 50%; pointer-events: none;
}
.particle {
  position: absolute; width: 6px; height: 6px; background: #ff6b35;
  border-radius: 50%; opacity: 0;
  animation: fly 1.5s ease-out infinite;
  animation-delay: calc(var(--i) * 0.12s);
}
@keyframes fly {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(calc(var(--i) * 15px - 45px), calc(var(--i) * -18px + 15px)) scale(0); }
}

@media (max-width: 767px) {
  .demo { padding: 3rem 1rem; }
  .demo__content { padding: 2rem 1rem; min-height: 200px; }
  .demo__text { font-size: 1.6rem; }
}
</style>
