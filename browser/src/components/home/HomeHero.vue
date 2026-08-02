<template>
  <section class="hero" ref="heroRef">
    <!-- 背景层：速度线 + 装饰 -->
    <div class="hero__bg" data-parallax="bg" aria-hidden="true">
      <div class="speedlines"></div>
      <span class="bg-sfx bg-sfx--1">GO!</span>
      <span class="bg-sfx bg-sfx--2">WOW</span>
      <span class="bg-sfx bg-sfx--3">>></span>
    </div>

    <!-- 中景层：主要内容 -->
    <div class="hero__mid" data-parallax="mid">
      <div class="hero__contain">
        <div class="hero__text">
          <div class="hero__badge" ref="badgeRef">
            <span class="badge-star">*</span> WELCOME TO <span class="badge-star">*</span>
          </div>
          <h1 class="hero__logo" ref="logoRef">
            MATO<span class="hero__sub">码途</span>
          </h1>
          <p class="hero__title">专门为前端学习者设计的网站</p>
          <p class="hero__desc">
            从 HTML 到 Vue，从基础到进阶<br>
            系统化前端学习路径 + 趣味闯关 + 实战案例<br>
            让你的每一行代码都有成长的痕迹
          </p>
          <div class="hero__tags">
            <span class="tag" v-for="t in tags" :key="t">{{ t }}</span>
          </div>
          <div v-if="!isLoggedIn" class="hero__actions">
            <button class="comic-btn hero__cta" @click="openAuthModal">登 录 / 注 册</button>
          </div>
        </div>

        <div class="hero__visual" ref="visualRef">
          <div class="comic-frame hero__frame">
            <img src="../../assets/HOMEImage/main.png" alt="MATO 码途" loading="eager">
            <div class="code-overlay" aria-hidden="true">
              <div class="code-lines">
                <span
                  v-for="(line, i) in typingLines" :key="i"
                  class="code-line"
                  :style="{ opacity: i < currentLine ? 1 : 0 }"
                >{{ line }}</span>
                <span class="cursor">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 前景层：大号装饰文字 -->
    <div class="hero__fg" data-parallax="fg" aria-hidden="true">
      <span class="fg-sfx fg-sfx--1">CODE!</span>
      <span class="fg-sfx fg-sfx--2">BAM!</span>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../stores/auth.js'

const gsap = inject('$gsap')
const { isLoggedIn, openAuthModal } = useAuth()

const tags = ['体系教学', '闯关挑战', '优秀案例', '自由画笔']

const typingLines = [
  'const mato = {',
  '  mission: "让前端学习更有趣",',
  '  stack: ["HTML", "CSS", "JS", "Vue"],',
  '  ready: true',
  '};',
  'mato.start();',
]
const currentLine = ref(0)
let typingTimer = null

const heroRef = ref(null)
const badgeRef = ref(null)
const logoRef = ref(null)
const visualRef = ref(null)

function startTyping() {
  let i = 0
  currentLine.value = 0
  typingTimer = setInterval(() => {
    i++
    currentLine.value = i
    if (i >= typingLines.length - 1) clearInterval(typingTimer)
  }, 200)
}

let ctx = null
let mouseHandler = null

onMounted(() => {
  startTyping()
  ctx = gsap.context(() => {
    // 入场时间线：从空间深处推近
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(badgeRef.value,
      { y: -40, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6 }
    )
    .fromTo(logoRef.value,
      { scale: 0.5, opacity: 0, rotateX: 15 },
      { scale: 1, opacity: 1, rotateX: 0, duration: 0.9, ease: 'back.out(1.6)' },
      '-=0.3'
    )
    .fromTo('.hero__title',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      '-=0.3'
    )
    .fromTo('.hero__desc',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      '-=0.2'
    )
    .fromTo('.tag',
      { y: 15, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.06, duration: 0.4 },
      '-=0.15'
    )
    .fromTo(visualRef.value,
      { x: 80, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
      '-=0.5'
    )

    // 背景装饰浮动
    gsap.to('.bg-sfx--1', { y: -12, rotation: -6, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to('.bg-sfx--2', { y: 8, rotation: 4, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 })

    // 前景装饰浮动
    gsap.to('.fg-sfx--1', { y: -15, rotation: -3, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to('.fg-sfx--2', { y: 10, rotation: 5, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 })
  }, heroRef.value)

  // 鼠标视差
  mouseHandler = (e) => {
    if (!heroRef.value) return
    const rect = heroRef.value.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    const bg = heroRef.value.querySelector('[data-parallax="bg"]')
    const fg = heroRef.value.querySelector('[data-parallax="fg"]')
    if (bg) gsap.to(bg, { x: dx * -15, y: dy * -10, duration: 0.8, ease: 'power2.out' })
    if (fg) gsap.to(fg, { x: dx * 20, y: dy * 15, duration: 0.8, ease: 'power2.out' })
    if (visualRef.value) gsap.to(visualRef.value, { x: dx * 8, y: dy * 6, duration: 0.8, ease: 'power2.out' })
  }
  window.addEventListener('mousemove', mouseHandler)
})

onUnmounted(() => {
  ctx?.revert()
  if (typingTimer) clearInterval(typingTimer)
  if (mouseHandler) window.removeEventListener('mousemove', mouseHandler)
})
</script>

<style lang="scss" scoped>
.hero {
  position: relative; overflow: hidden; min-height: 78vh;
  perspective: 1000px;
}

/* ── 背景层 ── */
.hero__bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  will-change: transform;
}
.speedlines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(-15deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 16px);
}
.bg-sfx {
  position: absolute; font-family: 'Bangers', 'Impact', sans-serif;
  font-weight: 900; opacity: 0.12;
  -webkit-text-stroke: 1px var(--comic-white); text-stroke: 1px var(--comic-white);
  paint-order: stroke fill;
}
.bg-sfx--1 { font-size: 5rem; top: 15%; left: 3%; color: var(--comic-black); transform: rotate(-8deg); }
.bg-sfx--2 { font-size: 3.5rem; top: 25%; left: 15%; color: var(--comic-black); opacity: 0.08; transform: rotate(5deg); }
.bg-sfx--3 { font-size: 4rem; top: 60%; right: 5%; color: var(--comic-black); opacity: 0.1; transform: rotate(-3deg); }

/* ── 中景层 ── */
.hero__mid {
  position: relative; z-index: 1; will-change: transform;
}
.hero__contain {
  display: flex; align-items: center; justify-content: center; gap: 3rem;
  max-width: 1300px; margin: 0 auto; padding: 3rem 2rem; min-height: 78vh;
}
.hero__text { flex: 1 1 50%; display: flex; flex-direction: column; gap: 0.6rem; }

.hero__badge {
  display: inline-block; font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem; letter-spacing: 4px; color: var(--comic-white);
  background: var(--comic-black); padding: 0.3rem 1rem;
  border: 2px solid var(--comic-white); box-shadow: 3px 3px 0 #555;
  width: fit-content; transform: rotate(-1deg);
}
.badge-star { color: #ffd700; display: inline-block; animation: pulse 0.8s ease-in-out infinite alternate; }
@keyframes pulse { to { transform: scale(1.3); } }

.hero__logo {
  font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
  font-size: clamp(3rem, 6vw, 5.5rem); color: var(--comic-black);
  text-shadow: 4px 4px 0 var(--comic-white), 6px 6px 0 rgba(0,0,0,0.3);
  letter-spacing: 3px; line-height: 1; margin: 0;
}
.hero__sub {
  font-size: clamp(1.2rem, 2.5vw, 2rem); color: #fff;
  background: var(--comic-black); padding: 0 0.5rem; margin-left: 0.4rem;
  display: inline-block; transform: skew(-3deg);
  text-shadow: 2px 2px 0 #555; vertical-align: middle;
}
.hero__title {
  font-family: 'Comic Neue', 'Bangers', cursive; font-size: 1.4rem;
  font-weight: 800; color: var(--comic-gray); letter-spacing: 1px;
}
.hero__desc {
  font-family: 'Comic Neue', cursive; font-size: 1.05rem;
  color: #555; line-height: 1.8;
}
.hero__tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.tag {
  font-family: 'Comic Neue', 'Bangers', cursive; font-size: 0.9rem; font-weight: 700;
  color: var(--comic-black); background: #fff; border: 2px solid var(--comic-black);
  padding: 0.3rem 0.8rem; box-shadow: 2px 2px 0 #aaa; transform: rotate(-0.5deg);
  transition: all 0.15s ease; cursor: default;
  &:hover { transform: rotate(1deg) translateY(-2px); box-shadow: 4px 4px 0 #555; background: var(--comic-black); color: var(--comic-white); }
}
.hero__actions { margin-top: 1rem; }
.hero__cta { font-size: 1.3rem !important; padding: 1rem 3rem !important; min-width: 220px !important; }

/* ── 前景层 ── */
.hero__fg {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  will-change: transform;
}
.fg-sfx {
  position: absolute; font-family: 'Bangers', 'Impact', sans-serif;
  font-weight: 900; opacity: 0.06;
}
.fg-sfx--1 { font-size: 8rem; bottom: 10%; right: 8%; color: #c00; transform: rotate(10deg); }
.fg-sfx--2 { font-size: 6rem; top: 8%; right: 15%; color: var(--comic-black); transform: rotate(-5deg); }

/* ── 右侧视觉 ── */
.hero__visual {
  flex: 1 1 40%; display: flex; justify-content: center; align-items: center;
  will-change: transform;
}
.hero__frame { max-width: 480px; position: relative; overflow: hidden !important; }
.hero__frame img { width: 100%; height: auto; display: block; }
.code-overlay {
  position: absolute; bottom: 12px; left: 12px; right: 12px;
  background: rgba(10,10,10,0.88); border: 2px solid #444; border-radius: 6px;
  padding: 10px 14px; pointer-events: none;
}
.code-lines { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.7; color: #98c379; }
.code-line { display: block; }
.cursor { color: #ff6b35; animation: blink 0.8s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* ── 响应式 ── */
@media (max-width: 1023px) {
  .hero__contain { gap: 1.5rem; padding: 1.5rem; min-height: 70vh; }
  .hero__frame { max-width: 340px; }
  .bg-sfx--2 { left: 10%; }
  .fg-sfx--1 { font-size: 5rem; }
  .fg-sfx--2 { display: none; }
}
@media (max-width: 767px) {
  .hero { min-height: auto; }
  .hero__contain {
    flex-direction: column-reverse; gap: 1.2rem; padding: 1rem;
    min-height: auto; text-align: center; align-items: center;
  }
  .hero__badge { font-size: 0.75rem; letter-spacing: 2px; padding: 0.2rem 0.7rem; }
  .hero__title { font-size: 1rem; }
  .hero__desc { font-size: 0.9rem; line-height: 1.6; }
  .hero__tags { justify-content: center; }
  .tag { font-size: 0.75rem; padding: 0.2rem 0.5rem; }
  .hero__actions { justify-content: center; }
  .hero__cta { font-size: 1rem !important; padding: 0.7rem 2rem !important; min-width: 180px !important; }
  .hero__frame { max-width: 280px; }
  .code-overlay { display: none; }
  .bg-sfx, .fg-sfx { display: none; }
}
</style>
