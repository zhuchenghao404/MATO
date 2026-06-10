<template>
    <div>
        <div class="contain">
            <div class="hero-text">
                <div class="hero-badge">
                    <span class="badge-star">*</span> WELCOME TO <span class="badge-star">*</span>
                </div>
                <h1 class="hero-logo">MATO<span class="hero-sub">码途</span></h1>
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
                </div>
            </div>

            <div class="hero-visual">
                <div class="comic-frame">
                    <img src="../../assets/HOMEImage/main.png" alt="MATO 码途 - 前端学习平台">
                </div>
            </div>
        </div>

        <div class="skills-study">
            <h2 class="skills-title">学习路径</h2>
            <div class="skills-row">
                <div class="skill-item">
                    <span class="skill-name">HTML</span>
                    <span class="skill-badge">结构</span>
                </div>
                <span class="skill-arrow">-></span>
                <div class="skill-item">
                    <span class="skill-name">CSS</span>
                    <span class="skill-badge">样式</span>
                </div>
                <span class="skill-arrow">-></span>
                <div class="skill-item">
                    <span class="skill-name">JavaScript</span>
                    <span class="skill-badge">交互</span>
                </div>
                <span class="skill-arrow">-></span>
                <div class="skill-item">
                    <span class="skill-name">Vue3</span>
                    <span class="skill-badge">框架</span>
                </div>
            </div>
            <p class="skills-tagline">慢慢来，才更快</p>
            <h1 class="go-title">在 MATO，可以做到即学即练习</h1>
        </div>
    </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../stores/auth.js'

const gsap = inject('$gsap')
const ScrollTrigger = inject('$ScrollTrigger')

const { isLoggedIn, openAuthModal } = useAuth()

let ctx = null

onMounted(() => {

    ctx = gsap.context(() => {
        gsap.registerPlugin(ScrollTrigger)

        const mm = gsap.matchMedia()

        mm.add('(min-width: 1024px)', () => {
            gsap.fromTo('.go-title',
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.go-title',
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    }
                }
            )
        })

        mm.add('(min-width: 768px) and (max-width: 1023px)', () => {
            gsap.fromTo('.go-title',
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.go-title',
                        start: 'top 88%',
                        toggleActions: 'play none none none',
                    }
                }
            )
        })

        mm.add('(max-width: 767px)', () => {
            gsap.fromTo('.go-title',
                { opacity: 0, y: 30, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.go-title',
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    }
                }
            )
        })
    })
})

onUnmounted(() => {
    ctx?.revert()
})
</script>

<style lang="scss" scoped>
.contain {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    min-height: 78vh;
    padding: 2rem;
    max-width: 1300px;
    margin: 0 auto;
    position: relative;
}

.hero-text {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.hero-badge {
    display: inline-block;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    letter-spacing: 4px;
    color: var(--comic-white);
    background: var(--comic-black);
    padding: 0.3rem 1rem;
    border: 2px solid var(--comic-white);
    box-shadow: 3px 3px 0 #555;
    width: fit-content;
    transform: rotate(-1deg);
}

.badge-star {
    color: #ffd700;
    display: inline-block;
    animation: starPulse 0.8s ease-in-out infinite alternate;
}

@keyframes starPulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.3); }
}

.hero-logo {
    font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
    font-size: 5rem;
    color: var(--comic-black);
    text-shadow:
        4px 4px 0 var(--comic-white),
        6px 6px 0 rgba(0, 0, 0, 0.3);
    letter-spacing: 3px;
    line-height: 1;
    margin: 0;
    padding: 0;
}

.hero-sub {
    font-size: 2rem;
    color: #fff;
    background: var(--comic-black);
    padding: 0 0.5rem;
    margin-left: 0.4rem;
    display: inline-block;
    transform: skew(-3deg);
    text-shadow: 2px 2px 0 #555;
    vertical-align: middle;
}

.hero-title {
    font-family: 'Comic Neue', 'Bangers', cursive;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--comic-gray);
    letter-spacing: 1px;
    margin-top: 0.2rem;
}

.hero-desc {
    font-family: 'Comic Neue', cursive;
    font-size: 1.05rem;
    color: #555;
    line-height: 1.8;
    margin-top: 0.3rem;
}

.hero-features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.3rem;
}

.feature-tag {
    font-family: 'Comic Neue', 'Bangers', cursive;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--comic-black);
    background: #fff;
    border: 2px solid var(--comic-black);
    padding: 0.3rem 0.8rem;
    box-shadow: 2px 2px 0 #aaa;
    transform: rotate(-0.5deg);
    transition: all 0.15s ease;
}

.feature-tag:hover {
    transform: rotate(1deg) translateY(-2px);
    box-shadow: 4px 4px 0 #555;
    background: var(--comic-black);
    color: var(--comic-white);
}

.hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.login-btn {
    font-size: 1.3rem !important;
    padding: 1rem 3rem !important;
    min-width: 220px !important;
}

.hero-sfx {
    position: relative;
    margin-top: 0.5rem;
    height: 0;
    pointer-events: none;
}

.sfx {
    position: absolute;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-weight: 900;
    color: var(--comic-black);
    -webkit-text-stroke: 1px var(--comic-white);
    text-stroke: 1px var(--comic-white);
    paint-order: stroke fill;
    opacity: 0.15;
    z-index: 0;
}

.sfx-1 {
    font-size: 5rem;
    top: -140px;
    left: 20px;
    transform: rotate(-8deg);
}

.sfx-2 {
    font-size: 3.5rem;
    top: -100px;
    left: 180px;
    transform: rotate(5deg);
    opacity: 0.1;
}

.sfx-3 {
    font-size: 4rem;
    top: -120px;
    left: 320px;
    transform: rotate(-3deg);
    opacity: 0.12;
}

.hero-visual {
    flex: 1 1 40%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-visual .comic-frame {
    max-width: 480px;
}

.hero-visual .comic-frame img {
    width: 100%;
    height: auto;
    display: block;
}

.skills-study {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    max-width: 1300px;
    margin: 0 auto;
}

.skills-title {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 2.8rem;
    color: var(--comic-black);
    text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
    letter-spacing: 2px;
    margin-bottom: 2rem;
}

.skills-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
}

.skill-item {
    background: #fff;
    border: 3px solid #000;
    box-shadow: 5px 5px 0 rgba(0,0,0,0.2);
    padding: 1.5rem 1.8rem;
    text-align: center;
    min-width: 140px;
    position: relative;
    transition: transform 0.15s ease;
}

.skill-item:hover {
    transform: translateY(-5px);
    box-shadow: 8px 8px 0 rgba(0,0,0,0.25);
}

.skill-name {
    display: block;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.8rem;
    color: var(--comic-black);
    letter-spacing: 1px;
}

.skill-badge {
    display: inline-block;
    margin-top: 0.4rem;
    font-family: 'Comic Neue', cursive;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    background: var(--comic-black);
    padding: 0.15rem 0.7rem;
    border: 1px solid #fff;
}

.skill-arrow {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 2rem;
    color: var(--comic-black);
    font-weight: 900;
}

.skills-tagline {
    margin-top: 2.5rem;
    margin-bottom: 0.5rem;
    font-family: 'Comic Neue', cursive;
    font-size: 1.3rem;
    font-weight: 700;
    color: #555;
    position: relative;
}

.skills-tagline::after {
    content: '';
    display: block;
    width: 50%;
    height: 3px;
    background: var(--comic-black);
    margin: 0.5rem auto 0;
}

.go-title {
    font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
    font-size: 3rem;
    color: #000;
    text-shadow: 3px 3px 0 var(--comic-white), 5px 5px 0 rgba(0,0,0,0.2);
    letter-spacing: 2px;
    margin-top: 0;
    margin-bottom: 0;
}

@media (min-width: 768px) and (max-width: 1023px) {
    .contain {
        gap: 1.5rem;
        padding: 1.5rem;
        min-height: 70vh;
    }

    .hero-logo {
        font-size: 3.5rem;
    }

    .hero-sub {
        font-size: 1.4rem;
    }

    .hero-title {
        font-size: 1.15rem;
    }

    .hero-desc {
        font-size: 0.95rem;
    }

    .hero-badge {
        font-size: 0.85rem;
        letter-spacing: 2px;
    }

    .feature-tag {
        font-size: 0.8rem;
        padding: 0.25rem 0.6rem;
    }

    .login-btn {
        font-size: 1.1rem !important;
        padding: 0.8rem 2.2rem !important;
        min-width: 180px !important;
    }

    .hero-visual .comic-frame {
        max-width: 340px;
    }

    .sfx-1 {
        font-size: 3.5rem;
        top: -100px;
        left: 10px;
    }

    .sfx-2 {
        font-size: 2.5rem;
        top: -70px;
        left: 130px;
    }

    .sfx-3 {
        font-size: 3rem;
        top: -85px;
        left: 240px;
    }

    .skills-title {
        font-size: 2.2rem;
    }

    .skill-item {
        min-width: 110px;
        padding: 1.2rem 1.2rem;
    }

    .skill-name {
        font-size: 1.4rem;
    }

    .skills-tagline {
        font-size: 1.1rem;
    }

    .go-title {
        font-size: 2rem;
    }
}

@media (max-width: 767px) {
    .contain {
        flex-direction: column-reverse;
        gap: 1.2rem;
        padding: 1rem;
        min-height: auto;
    }

    .hero-text {
        align-items: center;
        text-align: center;
    }

    .hero-logo {
        font-size: 2.8rem;
    }

    .hero-sub {
        font-size: 1.1rem;
    }

    .hero-title {
        font-size: 1rem;
    }

    .hero-desc {
        font-size: 0.9rem;
        line-height: 1.6;
    }

    .hero-badge {
        font-size: 0.75rem;
        letter-spacing: 2px;
        padding: 0.2rem 0.7rem;
    }

    .hero-features {
        justify-content: center;
    }

    .feature-tag {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
    }

    .hero-actions {
        justify-content: center;
    }

    .login-btn {
        font-size: 1rem !important;
        padding: 0.7rem 2rem !important;
        min-width: 180px !important;
    }

    .hero-visual .comic-frame {
        max-width: 280px;
    }

    .hero-sfx {
        display: none;
    }

    .skills-study {
        padding: 2rem 1rem;
    }

    .skills-title {
        font-size: 1.8rem;
    }

    .skills-row {
        flex-direction: column;
        gap: 0.5rem;
    }

    .skill-arrow {
        transform: rotate(90deg);
        font-size: 1.5rem;
    }

    .skill-item {
        min-width: 160px;
        padding: 1rem 1.5rem;
    }

    .skill-name {
        font-size: 1.4rem;
    }

    .skills-tagline {
        font-size: 1.1rem;
    }

    .go-title {
        font-size: 1.4rem;
    }
}
</style>
