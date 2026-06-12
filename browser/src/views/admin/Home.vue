<template>
  <div>
    <!-- ═══════════════════ HERO ═══════════════════ -->
    <section class="hero-section">
      <div class="hero-speedlines" aria-hidden="true"></div>
      <div class="contain">
        <div class="hero-text">
          <div class="hero-badge" ref="heroBadge">
            <span class="badge-star">*</span> WELCOME TO <span class="badge-star">*</span>
          </div>
          <h1 class="hero-logo" ref="heroLogo">MATO<span class="hero-sub">码途</span></h1>
          <p class="hero-title">专门为前端学习者设计的网站</p>
          <p class="hero-desc">
            从 HTML 到 Vue，从基础到进阶<br>
            系统化前端学习路径 + 趣味闯关 + 实战案例<br>
            让你的每一行代码都有成长的痕迹
          </p>
          <div class="hero-features">
            <span class="feature-tag">体系教学</span>
            <span class="feature-tag">闯关挑战</span>
            <span class="feature-tag">优秀案例</span>
            <span class="feature-tag">自由画笔</span>
          </div>
          <div v-if="!isLoggedIn" class="hero-actions">
            <button class="comic-btn login-btn" @click="openAuthModal">登 录 / 注 册</button>
          </div>
          <div class="hero-sfx">
            <span class="sfx sfx-1">GO!</span>
            <span class="sfx sfx-2">WOW</span>
            <span class="sfx sfx-3">>></span>
            <span class="sfx sfx-4">CODE!</span>
          </div>
        </div>
        <div class="hero-visual" ref="heroVisual">
          <div class="comic-frame hero-frame">
            <img src="../../assets/HOMEImage/main.png" alt="MATO 码途">
            <div class="code-typing-overlay" aria-hidden="true">
              <div class="code-lines">
                <span class="code-line" v-for="(line, i) in typingLines" :key="i"
                  :style="{ opacity: i < currentLine ? 1 : 0 }">
                  {{ line }}
                </span>
                <span class="cursor-blink">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 四大特色 ═══════════════════ -->
    <section class="features-section" ref="featuresSection">
      <h2 class="section-title">为什么选择 MATO？</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="f in features" :key="f.title" :ref="el => featureRefs.push(el)">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3 class="feature-card-title">{{ f.title }}</h3>
          <p class="feature-card-desc">{{ f.desc }}</p>
          <div class="feature-sfx-label">{{ f.sfx }}</div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 漫画叙事长卷 ═══════════════════ -->
    <section class="comic-journey" ref="journeySection">
      <h2 class="section-title">从第一行代码开始</h2>
      <p class="section-subtitle">滚动看看你的前端冒险之旅</p>

      <div class="journey-strip" ref="journeyStrip">
        <div class="journey-track" ref="journeyTrack">
          <!-- Panel 1 -->
          <div class="journey-panel">
            <div class="panel-inner comic-panel-journey">
              <div class="panel-scene">
                <div class="scene-illustration scene-start">
                  <div class="illust-code-editor">
                    <div class="editor-line"></div>
                    <div class="editor-line short"></div>
                    <div class="editor-cursor"></div>
                  </div>
                  <div class="illust-question-mark">?</div>
                </div>
              </div>
              <div class="panel-speech">
                <span class="speech-text">我该从哪里开始？</span>
              </div>
              <div class="panel-number">01</div>
            </div>
          </div>

          <!-- Panel 2 -->
          <div class="journey-panel">
            <div class="panel-inner comic-panel-journey">
              <div class="panel-scene">
                <div class="scene-illustration scene-writing">
                  <div class="tag-cloud">
                    <span class="tag-html">&lt;h1&gt;</span>
                    <span class="tag-css">.class { }</span>
                    <span class="tag-js">function()</span>
                  </div>
                  <div class="illust-pen"></div>
                </div>
              </div>
              <div class="panel-speech">
                <span class="speech-text">写下第一行代码</span>
              </div>
              <div class="panel-number">02</div>
            </div>
          </div>

          <!-- Panel 3 -->
          <div class="journey-panel">
            <div class="panel-inner comic-panel-journey">
              <div class="panel-scene">
                <div class="scene-illustration scene-animate">
                  <div class="animate-balls">
                    <div class="anim-ball ball-1"></div>
                    <div class="anim-ball ball-2"></div>
                    <div class="anim-ball ball-3"></div>
                  </div>
                  <div class="anim-sparkle">✨</div>
                </div>
              </div>
              <div class="panel-speech">
                <span class="speech-text">让页面动起来！</span>
              </div>
              <div class="panel-number">03</div>
            </div>
          </div>

          <!-- Panel 4 -->
          <div class="journey-panel">
            <div class="panel-inner comic-panel-journey">
              <div class="panel-scene">
                <div class="scene-illustration scene-publish">
                  <div class="publish-rocket">🚀</div>
                  <div class="publish-rays"></div>
                </div>
              </div>
              <div class="panel-speech">
                <span class="speech-text">发布你的作品！</span>
              </div>
              <div class="panel-number">04</div>
            </div>
          </div>
        </div>
      </div>

      <div class="journey-actionlines" aria-hidden="true"></div>
    </section>

    <!-- ═══════════════════ 学习路径 ═══════════════════ -->
    <section class="skills-study" ref="skillsSection">
      <h2 class="skills-title">学习路径</h2>
      <div class="skills-row">
        <div class="skill-item" v-for="(s, i) in skills" :key="s.name" :ref="el => skillRefs[i] = el">
          <span class="skill-name">{{ s.name }}</span>
          <span class="skill-badge">{{ s.badge }}</span>
          <span class="skill-desc">{{ s.desc }}</span>
        </div>
      </div>
      <p class="skills-tagline">慢慢来，才更快</p>
      <h2 class="go-title">在 MATO，可以做到即学即练习</h2>
    </section>

    <!-- ═══════════════════ 实时代码演示 ═══════════════════ -->
    <section class="demo-section" ref="demoSection">
      <h2 class="section-title">看看能做什么</h2>
      <p class="section-subtitle">用 MATO 画笔，几分钟就能写出这样的效果</p>
      <div class="demo-frame comic-frame" ref="demoFrame">
        <div class="demo-window-bar">
          <span class="demo-dot demo-dot--red"></span>
          <span class="demo-dot demo-dot--yellow"></span>
          <span class="demo-dot demo-dot--green"></span>
          <span class="demo-title">Pen Demo — 实时预览</span>
        </div>
        <div class="demo-content">
          <div class="demo-inner">
            <div class="demo-ball"></div>
            <div class="demo-text">Hello MATO!</div>
            <div class="demo-particles">
              <span v-for="n in 12" :key="n" class="particle" :style="{ '--i': n }"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ 优秀案例 ═══════════════════ -->
    <section class="works-section" ref="worksSection">
      <h2 class="section-title">优秀案例</h2>
      <p class="section-subtitle">来自学习者的精彩作品</p>
      <div class="works-grid">
        <div class="work-card comic-frame" v-for="w in showcaseWorks" :key="w.id"
          :ref="el => workRefs.push(el)" @click="$router.push('/PerfectCase')">
          <div class="work-cover" :style="{ background: w.bg }">
            <span class="work-emoji">{{ w.emoji }}</span>
          </div>
          <div class="work-info">
            <h4 class="work-title">{{ w.title }}</h4>
            <p class="work-author">by {{ w.author }}</p>
          </div>
        </div>
      </div>
      <div class="works-cta">
        <button class="comic-btn" @click="$router.push('/PerfectCase')">查看更多案例 →</button>
      </div>
    </section>

    <!-- ═══════════════════ CTA ═══════════════════ -->
    <section class="cta-section" ref="ctaSection">
      <div class="cta-speedlines" aria-hidden="true"></div>
      <div class="cta-content">
        <h2 class="cta-title">准备好开始你的前端冒险了吗？</h2>
        <p class="cta-desc">加入 MATO，从第一行 HTML 开始，写出属于你的代码</p>
        <div class="cta-actions" v-if="!isLoggedIn">
          <button class="comic-btn cta-btn" @click="openAuthModal">立 即 加 入</button>
        </div>
        <div class="cta-actions" v-else>
          <button class="comic-btn cta-btn" @click="$router.push('/SkillLearning')">开 始 学 习</button>
          <button class="comic-btn white cta-btn" @click="$router.push('/Pen')">去 画 笔</button>
        </div>
      </div>
      <div class="cta-sfx">
        <span class="cta-sfx-text sfx-bam">BAM!</span>
        <span class="cta-sfx-text sfx-pow">POW!</span>
        <span class="cta-sfx-text sfx-zap">ZAP!</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../stores/auth.js'

const gsap = inject('$gsap')
const ScrollTrigger = inject('$ScrollTrigger')

const { isLoggedIn, openAuthModal } = useAuth()

// 代码打字
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

// 四大特色
const features = [
  { icon: '📚', title: '体系教学', desc: '从 HTML 到 Vue3，循序渐进的系统化课程，每个知识点都有配套练习', sfx: 'CLICK!' },
  { icon: '⚔️', title: '闯关挑战', desc: '趣味问答 + 实时代码挑战，答对升级、解锁成就，让学习像游戏一样上瘾', sfx: 'LEVEL UP!' },
  { icon: '🏆', title: '优秀案例', desc: '社区作品展示，看看别人用同样的技术做出了什么，互相学习共同进步', sfx: 'WOW!' },
  { icon: '🎨', title: '自由画笔', desc: '在线代码编辑器，HTML/CSS/JS 三栏实时预览，随心创作并分享你的作品', sfx: 'CREATE!' },
]
const featureRefs = []

// 学习路径
const skills = [
  { name: 'HTML', badge: '结构', desc: '网页骨架' },
  { name: 'CSS', badge: '样式', desc: '视觉魔法' },
  { name: 'JavaScript', badge: '交互', desc: '动态逻辑' },
  { name: 'Vue3', badge: '框架', desc: '现代开发' },
]
const skillRefs = reactive({})

// 作品展示
const showcaseWorks = [
  { id: 101, title: '贪吃蛇游戏', author: 'admin', emoji: '🐍', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 102, title: 'CSS 动画卡片', author: '张三', emoji: '🎴', bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 103, title: '响应式导航栏', author: '赵六', emoji: '🧭', bg: 'linear-gradient(135deg, #1d1e2b, #2d3047)' },
]
const workRefs = []

// DOM refs
const heroBadge = ref(null)
const heroLogo = ref(null)
const heroVisual = ref(null)
const featuresSection = ref(null)
const journeySection = ref(null)
const journeyStrip = ref(null)
const journeyTrack = ref(null)
const skillsSection = ref(null)
const demoSection = ref(null)
const demoFrame = ref(null)
const worksSection = ref(null)
const ctaSection = ref(null)

let ctx = null

onMounted(() => {
  startTyping()

  ctx = gsap.context(() => {
    // ── Hero 入场 ──
    const heroTL = gsap.timeline({ defaults: { ease: 'back.out(1.4)', duration: 0.7 } })
    heroTL.fromTo(heroBadge.value, { y: -30, opacity: 0 }, { y: 0, opacity: 1 })
      .fromTo(heroLogo.value, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1 }, '-=0.35')
      .fromTo('.hero-title', { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.25')
      .fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.2')
      .fromTo('.feature-tag', { y: 15, opacity: 0, stagger: 0.06 }, { y: 0, opacity: 1 }, '-=0.1')
      .fromTo(heroVisual.value, { x: 60, opacity: 0 }, { x: 0, opacity: 1 }, '-=0.4')

    // SFX 浮动
    gsap.to('.sfx-1', { y: -8, rotation: -5, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to('.sfx-4', { y: 6, rotation: 3, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 })

    const mm = gsap.matchMedia()

    // ── 漫画长卷：横向滚动驱动 ──
    mm.add('(min-width: 768px)', () => {
      const panels = gsap.utils.toArray('.journey-panel')
      const trackWidth = panels.length * 100 // vw

      gsap.to(journeyTrack.value, {
        x: () => -(journeyTrack.value.scrollWidth - journeyStrip.value.offsetWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: journeySection.value,
          start: 'top 15%',
          end: () => `+=${journeyTrack.value.scrollWidth}`,
          pin: journeyStrip.value,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
    })

    // ── 长卷面板标题入场 ──
    mm.add('(min-width: 1px)', () => {
      gsap.fromTo('.section-title', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: journeySection.value, start: 'top 90%', once: true },
      })
    })

    // ── 特色卡片 ──
    mm.add('(min-width: 1px)', () => {
      featureRefs.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el, { y: 50, opacity: 0, rotation: i % 2 === 0 ? -2 : 2 }, {
          y: 0, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: featuresSection.value, start: 'top 80%', once: true },
        })
      })
    })

    // ── 技能卡片 ──
    mm.add('(min-width: 768px)', () => {
      Object.values(skillRefs).forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el, { y: 60, opacity: 0, scale: 0.85 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.65, delay: i * 0.12,
          ease: 'elastic.out(1, 0.4)',
          scrollTrigger: { trigger: '.skills-row', start: 'top 80%', once: true },
        })
      })
    })

    // ── go-title ──
    mm.add('(min-width: 1px)', () => {
      gsap.fromTo('.go-title', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.go-title', start: 'top 85%', once: true },
      })
    })

    // ── Demo 框 ──
    mm.add('(min-width: 1px)', () => {
      gsap.fromTo(demoFrame.value, { scale: 0.9, opacity: 0, y: 30 }, {
        scale: 1, opacity: 1, y: 0, duration: 1, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: demoSection.value, start: 'top 80%', once: true },
      })
    })

    // ── 作品卡片 ──
    mm.add('(min-width: 1px)', () => {
      workRefs.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el, { y: 50, opacity: 0, rotation: i % 2 === 0 ? -3 : 3 }, {
          y: 0, opacity: 1, duration: 0.7, delay: i * 0.12,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: worksSection.value, start: 'top 80%', once: true },
        })
      })
    })

    // ── CTA ──
    mm.add('(min-width: 1px)', () => {
      gsap.fromTo('.cta-title', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ctaSection.value, start: 'top 85%', once: true },
      })
      gsap.fromTo('.cta-desc', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, delay: 0.2,
        scrollTrigger: { trigger: ctaSection.value, start: 'top 85%', once: true },
      })
      gsap.fromTo('.cta-actions', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, delay: 0.35,
        scrollTrigger: { trigger: ctaSection.value, start: 'top 85%', once: true },
      })
    })
  })
})

function startTyping() {
  let i = 0
  currentLine.value = 0
  typingTimer = setInterval(() => {
    i++
    currentLine.value = i
    if (i >= typingLines.length - 1) clearInterval(typingTimer)
  }, 200)
}

onUnmounted(() => {
  ctx?.revert()
  if (typingTimer) clearInterval(typingTimer)
})
</script>

<style lang="scss" scoped>
/* ═══════════ HERO ═══════════ */
.hero-section { position: relative; overflow: hidden; }
.hero-speedlines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(-15deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 16px);
  pointer-events: none; z-index: 0;
}
.contain {
  display: flex; align-items: center; justify-content: center; gap: 3rem;
  min-height: 78vh; padding: 2rem; max-width: 1300px; margin: 0 auto;
  position: relative; z-index: 1;
}
.hero-text { flex: 1 1 50%; display: flex; flex-direction: column; gap: 0.6rem; }
.hero-badge {
  display: inline-block; font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem; letter-spacing: 4px; color: var(--comic-white);
  background: var(--comic-black); padding: 0.3rem 1rem;
  border: 2px solid var(--comic-white); box-shadow: 3px 3px 0 #555;
  width: fit-content; transform: rotate(-1deg);
}
.badge-star { color: #ffd700; display: inline-block; animation: starPulse 0.8s ease-in-out infinite alternate; }
@keyframes starPulse { 0% { transform: scale(1); } 100% { transform: scale(1.3); } }
.hero-logo {
  font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif; font-size: 5rem;
  color: var(--comic-black); text-shadow: 4px 4px 0 var(--comic-white), 6px 6px 0 rgba(0,0,0,0.3);
  letter-spacing: 3px; line-height: 1; margin: 0; padding: 0;
}
.hero-sub { font-size: 2rem; color: #fff; background: var(--comic-black); padding: 0 0.5rem; margin-left: 0.4rem; display: inline-block; transform: skew(-3deg); text-shadow: 2px 2px 0 #555; vertical-align: middle; }
.hero-title { font-family: 'Comic Neue', 'Bangers', cursive; font-size: 1.4rem; font-weight: 800; color: var(--comic-gray); letter-spacing: 1px; }
.hero-desc { font-family: 'Comic Neue', cursive; font-size: 1.05rem; color: #555; line-height: 1.8; }
.hero-features { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.feature-tag {
  font-family: 'Comic Neue', 'Bangers', cursive; font-size: 0.9rem; font-weight: 700;
  color: var(--comic-black); background: #fff; border: 2px solid var(--comic-black);
  padding: 0.3rem 0.8rem; box-shadow: 2px 2px 0 #aaa; transform: rotate(-0.5deg);
  transition: all 0.15s ease; cursor: pointer;
}
.feature-tag:hover { transform: rotate(1deg) translateY(-2px); box-shadow: 4px 4px 0 #555; background: var(--comic-black); color: var(--comic-white); }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
.login-btn { font-size: 1.3rem !important; padding: 1rem 3rem !important; min-width: 220px !important; }
.hero-sfx { position: relative; margin-top: 0.5rem; height: 0; pointer-events: none; }
.sfx { position: absolute; font-family: 'Bangers', 'Impact', sans-serif; font-weight: 900; color: var(--comic-black); -webkit-text-stroke: 1px var(--comic-white); text-stroke: 1px var(--comic-white); paint-order: stroke fill; opacity: 0.15; z-index: 0; }
.sfx-1 { font-size: 5rem; top: -140px; left: 20px; transform: rotate(-8deg); }
.sfx-2 { font-size: 3.5rem; top: -100px; left: 180px; transform: rotate(5deg); opacity: 0.1; }
.sfx-3 { font-size: 4rem; top: -120px; left: 320px; transform: rotate(-3deg); opacity: 0.12; }
.sfx-4 { font-size: 2.5rem; top: -70px; left: 420px; transform: rotate(10deg); opacity: 0.08; color: #c00; }
.hero-visual { flex: 1 1 40%; display: flex; justify-content: center; align-items: center; position: relative; }
.hero-frame { max-width: 480px; position: relative; overflow: hidden !important; }
.hero-frame img { width: 100%; height: auto; display: block; }
.code-typing-overlay { position: absolute; bottom: 12px; left: 12px; right: 12px; background: rgba(10,10,10,0.88); border: 2px solid #444; border-radius: 6px; padding: 10px 14px; pointer-events: none; }
.code-lines { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.7; color: #98c379; }
.code-line { display: block; }
.cursor-blink { color: #ff6b35; animation: blink 0.8s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* ═══════════ 标题统一 ═══════════ */
.section-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 2.8rem; text-align: center; color: var(--comic-black); text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2); margin: 0 0 0.5rem; }
.section-subtitle { text-align: center; font-family: 'Comic Neue', cursive; font-size: 1.1rem; color: #666; margin: 0 0 2rem; }

/* ═══════════ 四大特色 ═══════════ */
.features-section { padding: 4rem 2rem 2rem; max-width: 1300px; margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
.feature-card {
  background: #fff; border: 3px solid var(--comic-black); box-shadow: 5px 5px 0 rgba(0,0,0,0.12);
  padding: 2rem 1.5rem; text-align: center; position: relative;
  transition: transform 0.2s, box-shadow 0.2s; cursor: default;
}
.feature-card:hover { transform: translateY(-6px); box-shadow: 8px 8px 0 rgba(0,0,0,0.18); }
.feature-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.feature-card-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.5rem; color: var(--comic-black); margin: 0 0 0.5rem; letter-spacing: 1px; }
.feature-card-desc { font-family: 'Comic Neue', cursive; font-size: 0.95rem; color: #555; line-height: 1.6; margin: 0; }
.feature-sfx-label { position: absolute; top: -14px; left: 50%; transform: translateX(-50%) rotate(-3deg); font-family: 'Bangers', sans-serif; font-size: 0.75rem; color: #fff; background: var(--comic-black); padding: 0.1rem 0.8rem; border: 1px solid #fff; white-space: nowrap; }

/* ═══════════ 漫画叙事长卷 ═══════════ */
.comic-journey {
  padding: 4rem 2rem 2rem;
  overflow: hidden;
  position: relative;
}

.journey-strip {
  width: 100%;
  overflow: hidden;
  margin-top: 2rem;
}

.journey-track {
  display: flex;
  gap: 2rem;
  will-change: transform;
  /* 4 panels * 30vw + 3 gaps */
  width: max-content;
}

.journey-panel {
  min-width: min(380px, 80vw);
  flex-shrink: 0;
}

.comic-panel-journey {
  background: #fff;
  border: 5px solid var(--comic-black);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.15);
  padding: 0;
  position: relative;
  height: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-scene {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%);
  border-bottom: 3px solid var(--comic-black);
}

/* Panel 1: 代码编辑器插画 */
.scene-illustration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.illust-code-editor {
  width: 200px;
  background: #1e1e1e;
  border: 2px solid #444;
  border-radius: 6px;
  padding: 16px 20px;
}

.editor-line {
  height: 8px;
  background: #444;
  border-radius: 2px;
  margin-bottom: 10px;
  animation: editorLinePulse 2s ease-in-out infinite;
  &.short { width: 60%; animation-delay: 0.3s; }
}

@keyframes editorLinePulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; background: #ff6b35; }
}

.editor-cursor {
  width: 2px; height: 16px;
  background: #ff6b35;
  animation: cursorFlicker 0.8s step-end infinite;
  margin-top: 4px;
}

@keyframes cursorFlicker {
  50% { opacity: 0; }
}

.illust-question-mark {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 6rem;
  color: rgba(0,0,0,0.08);
  animation: questionFloat 3s ease-in-out infinite;
}

@keyframes questionFloat {
  0%, 100% { transform: translateY(-50%) rotate(0deg); }
  50% { transform: translateY(-60%) rotate(5deg); }
}

/* Panel 2: 代码标签 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px;
}

.tag-html, .tag-css, .tag-js {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 8px 16px;
  border: 2px solid #000;
  background: #fff;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
}

.tag-html { color: #e44d26; transform: rotate(-3deg); }
.tag-css { color: #264de4; transform: rotate(2deg); margin-top: 20px; }
.tag-js { color: #f7df1e; transform: rotate(-1deg); margin-top: 10px; }

.illust-pen {
  position: absolute;
  bottom: 20px;
  right: 30px;
  width: 40px;
  height: 4px;
  background: var(--comic-black);
  border-radius: 2px;
  transform: rotate(-30deg);
  animation: penWrite 1.5s ease-in-out infinite;
}

@keyframes penWrite {
  0%, 100% { transform: rotate(-30deg) translateX(0); }
  50% { transform: rotate(-30deg) translateX(-15px); }
}

/* Panel 3: 动画球 */
.scene-animate {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.animate-balls {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.anim-ball {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.ball-1 { background: #ff6b35; animation: ballBounce 0.8s ease-in-out infinite; }
.ball-2 { background: #409eff; animation: ballBounce 0.9s ease-in-out 0.2s infinite; }
.ball-3 { background: #67c23a; animation: ballBounce 0.7s ease-in-out 0.4s infinite; }

@keyframes ballBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-40px); }
}

.anim-sparkle {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 2rem;
  animation: sparkleFloat 2s ease-in-out infinite;
}

@keyframes sparkleFloat {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.3) rotate(180deg); }
}

/* Panel 4: 火箭 */
.scene-publish {
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%);
  overflow: hidden;
}

.publish-rocket {
  font-size: 5rem;
  animation: rocketLaunch 2s ease-in-out infinite;
  z-index: 1;
  position: relative;
}

@keyframes rocketLaunch {
  0% { transform: translateY(20px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(20px); }
}

.publish-rays {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 120px;
  background: linear-gradient(to top, rgba(255,107,53,0.4), transparent);
  border-radius: 50% 50% 0 0;
  animation: rayPulse 1s ease-in-out infinite;
}

@keyframes rayPulse {
  0%, 100% { opacity: 0.3; transform: translateX(-50%) scaleY(0.8); }
  50% { opacity: 0.6; transform: translateX(-50%) scaleY(1.2); }
}

.panel-speech {
  padding: 16px 20px;
  background: #fff;
  position: relative;
}

.speech-text {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.3rem;
  color: var(--comic-black);
  letter-spacing: 0.5px;
}

.panel-number {
  position: absolute;
  top: 12px;
  left: 16px;
  font-family: 'Bangers', sans-serif;
  font-size: 2rem;
  color: #fff;
  background: var(--comic-black);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
}

/* 长卷底部速度线 */
.journey-actionlines {
  width: 100%;
  height: 3px;
  margin-top: 2rem;
  background: repeating-linear-gradient(
    90deg, var(--comic-black), var(--comic-black) 20px,
    transparent 20px, transparent 30px
  );
  opacity: 0.25;
}

/* ═══════════ 学习路径 ═══════════ */
.skills-study { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; max-width: 1300px; margin: 0 auto; }
.skills-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 2.8rem; color: var(--comic-black); text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2); letter-spacing: 2px; margin-bottom: 2rem; }
.skills-row { display: flex; align-items: flex-start; justify-content: center; gap: 1.5rem; width: 100%; flex-wrap: wrap; }
.skill-item { background: #fff; border: 3px solid #000; box-shadow: 5px 5px 0 rgba(0,0,0,0.2); padding: 1.5rem 1.8rem; text-align: center; min-width: 140px; position: relative; transition: transform 0.15s ease; cursor: pointer; }
.skill-item:hover { transform: translateY(-5px) rotate(-1deg); box-shadow: 8px 8px 0 rgba(0,0,0,0.25); }
.skill-name { display: block; font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.8rem; color: var(--comic-black); letter-spacing: 1px; }
.skill-badge { display: inline-block; margin-top: 0.4rem; font-family: 'Comic Neue', cursive; font-size: 0.75rem; font-weight: 700; color: #fff; background: var(--comic-black); padding: 0.15rem 0.7rem; border: 1px solid #fff; }
.skill-desc { display: block; font-family: 'Comic Neue', cursive; font-size: 0.8rem; color: #888; margin-top: 0.3rem; }
.skills-tagline { margin-top: 2.5rem; margin-bottom: 0.5rem; font-family: 'Comic Neue', cursive; font-size: 1.3rem; font-weight: 700; color: #555; position: relative; }
.skills-tagline::after { content: ''; display: block; width: 50%; height: 3px; background: var(--comic-black); margin: 0.5rem auto 0; }
.go-title { font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif; font-size: 3rem; color: #000; text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2); letter-spacing: 2px; margin: 0; }

/* ═══════════ Demo ═══════════ */
.demo-section { padding: 4rem 2rem; max-width: 900px; margin: 0 auto; }
.demo-frame { max-width: 700px; margin: 0 auto; padding: 0 !important; overflow: hidden !important; }
.demo-window-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #2d2d2d; border-bottom: 2px solid #000; }
.demo-dot { width: 12px; height: 12px; border-radius: 50%; }
.demo-dot--red { background: #ff5f57; }
.demo-dot--yellow { background: #febc2e; }
.demo-dot--green { background: #28c840; }
.demo-title { margin-left: 8px; font-family: 'Courier New', monospace; font-size: 12px; color: #999; }
.demo-content { background: #1a1a2e; padding: 3rem 2rem; min-height: 260px; display: flex; align-items: center; justify-content: center; position: relative; }
.demo-inner { text-align: center; position: relative; }
.demo-ball { width: 80px; height: 80px; margin: 0 auto 1.5rem; border-radius: 50%; background: linear-gradient(135deg, #ff6b35, #ff8c42); box-shadow: 0 0 40px rgba(255,107,53,0.4); animation: demoBounce 2s ease-in-out infinite; }
@keyframes demoBounce { 0%, 100% { transform: translateY(0) scale(1); } 30% { transform: translateY(-30px) scale(1.08); } 50% { transform: translateY(0) scale(0.95); } 70% { transform: translateY(-15px) scale(1.03); } }
.demo-text { font-family: 'Bangers', 'Impact', sans-serif; font-size: 2.4rem; color: #fff; text-shadow: 2px 2px 0 rgba(0,0,0,0.5); animation: demoTextGlow 2s ease-in-out infinite; }
@keyframes demoTextGlow { 0%, 100% { text-shadow: 2px 2px 0 rgba(0,0,0,0.5); } 50% { text-shadow: 0 0 20px rgba(255,107,53,0.5), 2px 2px 0 rgba(0,0,0,0.5); } }
.demo-particles { position: absolute; top: 50%; left: 50%; pointer-events: none; }
.particle { position: absolute; width: 6px; height: 6px; background: #ff6b35; border-radius: 50%; animation: particleFly 1.5s ease-out infinite; animation-delay: calc(var(--i) * 0.12s); opacity: 0; }
@keyframes particleFly { 0% { opacity: 1; transform: translate(0, 0) scale(1); } 100% { opacity: 0; transform: translate(calc(var(--i) * 15px - 45px), calc(var(--i) * -18px + 15px)) scale(0); } }

/* ═══════════ 作品 ═══════════ */
.works-section { padding: 4rem 2rem; max-width: 1300px; margin: 0 auto; }
.works-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.work-card { padding: 0 !important; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.work-card:hover { transform: translateY(-6px) rotate(1deg) !important; box-shadow: 10px 10px 0 var(--comic-black), 12px 12px 0 rgba(0,0,0,0.2) !important; }
.work-cover { height: 140px; display: flex; align-items: center; justify-content: center; }
.work-emoji { font-size: 3rem; }
.work-info { padding: 1rem 1.2rem; }
.work-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 1.2rem; color: var(--comic-black); margin: 0 0 0.3rem; }
.work-author { font-family: 'Comic Neue', cursive; font-size: 0.85rem; color: #888; margin: 0; }
.works-cta { text-align: center; margin-top: 2rem; }

/* ═══════════ CTA ═══════════ */
.cta-section { position: relative; padding: 5rem 2rem; overflow: hidden; background: var(--comic-black); text-align: center; }
.cta-speedlines { position: absolute; inset: 0; background: repeating-linear-gradient(25deg, transparent, transparent 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 12px); pointer-events: none; }
.cta-content { position: relative; z-index: 1; }
.cta-title { font-family: 'Bangers', 'Impact', sans-serif; font-size: 2.8rem; color: #fff; text-shadow: 3px 3px 0 rgba(0,0,0,0.5); margin: 0 0 0.8rem; }
.cta-desc { font-family: 'Comic Neue', cursive; font-size: 1.2rem; color: rgba(255,255,255,0.7); margin: 0 0 2rem; }
.cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.cta-btn { font-size: 1.4rem !important; padding: 1.1rem 3rem !important; min-width: 200px !important; }
.cta-sfx { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.cta-sfx-text { position: absolute; font-family: 'Bangers', 'Impact', sans-serif; font-weight: 900; -webkit-text-stroke: 1px rgba(255,255,255,0.3); text-stroke: 1px rgba(255,255,255,0.3); opacity: 0.08; }
.sfx-bam { font-size: 8rem; top: 20px; left: 5%; transform: rotate(-12deg); color: #ff6b35; }
.sfx-pow { font-size: 6rem; bottom: 10px; right: 8%; transform: rotate(8deg); color: #fff; }
.sfx-zap { font-size: 5rem; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-5deg); color: #409eff; }

/* ═══════════ 响应式 ═══════════ */
@media (min-width: 768px) and (max-width: 1023px) {
  .contain { gap: 1.5rem; padding: 1.5rem; min-height: 70vh; }
  .hero-logo { font-size: 3.5rem; }
  .hero-sub { font-size: 1.4rem; }
  .hero-title { font-size: 1.15rem; }
  .hero-desc { font-size: 0.95rem; }
  .hero-badge { font-size: 0.85rem; letter-spacing: 2px; }
  .feature-tag { font-size: 0.8rem; padding: 0.25rem 0.6rem; }
  .login-btn { font-size: 1.1rem !important; padding: 0.8rem 2.2rem !important; min-width: 180px !important; }
  .hero-visual .comic-frame { max-width: 340px; }
  .sfx-1 { font-size: 3.5rem; top: -100px; }
  .sfx-2 { font-size: 2.5rem; top: -70px; left: 130px; }
  .sfx-3 { font-size: 3rem; top: -85px; left: 240px; }
  .sfx-4 { display: none; }
  .section-title { font-size: 2.2rem; }
  .journey-panel { min-width: 320px; }
  .comic-panel-journey { height: 360px; }
  .panel-number { font-size: 1.6rem; width: 40px; height: 40px; }
  .skills-title { font-size: 2.2rem; }
  .go-title { font-size: 2rem; }
  .cta-title { font-size: 2.2rem; }
}

@media (max-width: 767px) {
  .contain { flex-direction: column-reverse; gap: 1.2rem; padding: 1rem; min-height: auto; }
  .hero-text { align-items: center; text-align: center; }
  .hero-logo { font-size: 2.8rem; }
  .hero-sub { font-size: 1.1rem; }
  .hero-title { font-size: 1rem; }
  .hero-desc { font-size: 0.9rem; line-height: 1.6; }
  .hero-badge { font-size: 0.75rem; letter-spacing: 2px; padding: 0.2rem 0.7rem; }
  .hero-features { justify-content: center; }
  .feature-tag { font-size: 0.75rem; padding: 0.2rem 0.5rem; }
  .hero-actions { justify-content: center; }
  .login-btn { font-size: 1rem !important; padding: 0.7rem 2rem !important; min-width: 180px !important; }
  .hero-sfx { display: none; }
  .hero-visual .comic-frame { max-width: 280px; }
  .code-typing-overlay { display: none; }
  .section-title { font-size: 1.8rem; }
  .section-subtitle { font-size: 0.95rem; }
  .features-grid { grid-template-columns: 1fr; }
  /* 手机端长卷改垂直堆叠 */
  .journey-strip { overflow: visible; }
  .journey-track { flex-direction: column; gap: 1.5rem; width: 100% !important; }
  .journey-panel { min-width: 100%; }
  .comic-panel-journey { height: auto; min-height: 260px; }
  .panel-scene { min-height: 180px; }
  .panel-number { font-size: 1.4rem; width: 36px; height: 36px; top: 8px; left: 10px; }
  .speech-text { font-size: 1.1rem; }
  .skills-study { padding: 2rem 1rem; }
  .skills-title { font-size: 1.8rem; }
  .skills-row { flex-direction: column; gap: 1rem; align-items: center; }
  .go-title { font-size: 1.4rem; }
  .demo-section { padding: 2rem 1rem; }
  .demo-content { padding: 2rem 1rem; min-height: 200px; }
  .demo-text { font-size: 1.6rem; }
  .cta-section { padding: 3rem 1rem; }
  .cta-title { font-size: 1.6rem; }
  .cta-desc { font-size: 0.95rem; }
  .cta-btn { font-size: 1.1rem !important; padding: 0.8rem 2rem !important; }
  .sfx-bam { font-size: 4rem; }
  .sfx-pow { font-size: 3rem; }
  .sfx-zap { font-size: 2.5rem; }
}
</style>
