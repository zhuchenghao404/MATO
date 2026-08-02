<template>
  <section class="skills" ref="sectionRef">
    <h2 class="skills__title">学习路径</h2>
    <div class="skills__tree">
      <div class="tree-line" aria-hidden="true"></div>
      <div
        v-for="(s, i) in skills" :key="s.name"
        class="node"
        :ref="el => nodeRefs[i] = el"
      >
        <div class="node__dot">
          <span class="node__index">{{ i + 1 }}</span>
        </div>
        <div class="node__card">
          <span class="node__name">{{ s.name }}</span>
          <span class="node__badge">{{ s.badge }}</span>
          <span class="node__desc">{{ s.desc }}</span>
        </div>
      </div>
    </div>
    <p class="skills__tagline">慢慢来，才更快</p>
    <h2 class="skills__go">在 MATO，可以做到即学即练习</h2>
  </section>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

const gsap = inject('$gsap')

const skills = [
  { name: 'HTML', badge: '结构', desc: '网页骨架' },
  { name: 'CSS', badge: '样式', desc: '视觉魔法' },
  { name: 'JavaScript', badge: '交互', desc: '动态逻辑' },
  { name: 'Vue3', badge: '框架', desc: '现代开发' },
]

const sectionRef = ref(null)
const nodeRefs = ref([])
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.fromTo('.skills__title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true } }
    )

    // 连接线生长动画
    gsap.fromTo('.tree-line',
      { scaleY: 0 },
      { scaleY: 1, duration: 1.2, ease: 'power2.out', transformOrigin: 'top center',
        scrollTrigger: { trigger: '.skills__tree', start: 'top 80%', once: true } }
    )

    // 节点依次弹入
    nodeRefs.value.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(el,
        { x: i % 2 === 0 ? -60 : 60, opacity: 0, scale: 0.85 },
        { x: 0, opacity: 1, scale: 1, duration: 0.65, delay: i * 0.15,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: { trigger: '.skills__tree', start: 'top 75%', once: true } }
      )
    })

    gsap.fromTo('.skills__tagline',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6,
        scrollTrigger: { trigger: '.skills__tagline', start: 'top 90%', once: true } }
    )
    gsap.fromTo('.skills__go',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.skills__go', start: 'top 88%', once: true } }
    )
  }, sectionRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<style lang="scss" scoped>
.skills {
  padding: 5rem 2rem; max-width: 900px; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center;
}
.skills__title {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: clamp(2rem, 4vw, 2.8rem);
  color: var(--comic-black);
  text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
  letter-spacing: 2px; margin: 0 0 2.5rem;
}

.skills__tree {
  position: relative; display: flex; flex-direction: column; gap: 1.5rem;
  width: 100%; max-width: 600px;
}
.tree-line {
  position: absolute; left: 24px; top: 0; bottom: 0; width: 3px;
  background: var(--comic-black); opacity: 0.2;
  transform-origin: top center;
}

.node {
  display: flex; align-items: center; gap: 1.2rem;
  position: relative; z-index: 1;
}
.node__dot {
  width: 50px; height: 50px; flex-shrink: 0;
  background: var(--comic-black); border: 3px solid var(--comic-white);
  box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
}
.node__index {
  font-family: 'Bangers', sans-serif; font-size: 1.2rem; color: #ffd700;
}
.node__card {
  background: #fff; border: 3px solid var(--comic-black);
  box-shadow: 5px 5px 0 rgba(0,0,0,0.12);
  padding: 1rem 1.5rem; flex: 1;
  display: flex; align-items: center; gap: 1rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
  &:hover {
    transform: translateY(-4px) rotate(-0.5deg);
    box-shadow: 8px 8px 0 rgba(0,0,0,0.18);
  }
}
.node__name {
  font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.6rem;
  color: var(--comic-black); letter-spacing: 1px; min-width: 100px;
}
.node__badge {
  font-family: 'Comic Neue', cursive; font-size: 0.75rem; font-weight: 700;
  color: #fff; background: var(--comic-black);
  padding: 0.15rem 0.7rem; border: 1px solid #fff;
}
.node__desc {
  font-family: 'Comic Neue', cursive; font-size: 0.85rem; color: #888;
  margin-left: auto;
}

.skills__tagline {
  margin-top: 2.5rem; font-family: 'Comic Neue', cursive; font-size: 1.3rem;
  font-weight: 700; color: #555; text-align: center;
  &::after {
    content: ''; display: block; width: 50%; height: 3px;
    background: var(--comic-black); margin: 0.5rem auto 0;
  }
}
.skills__go {
  font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
  font-size: clamp(1.8rem, 3.5vw, 3rem); color: #000;
  text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
  letter-spacing: 2px; margin: 1rem 0 0; text-align: center;
}

@media (max-width: 767px) {
  .skills { padding: 3rem 1rem; }
  .skills__title { font-size: 1.8rem; }
  .node__card { flex-direction: column; align-items: flex-start; gap: 0.4rem; }
  .node__desc { margin-left: 0; }
  .skills__go { font-size: 1.4rem; }
}
</style>
