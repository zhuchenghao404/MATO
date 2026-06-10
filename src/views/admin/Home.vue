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
                    <button class="comic-btn login-btn" @click="openAuth">登 录 / 注 册</button>
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

        <Transition name="auth-shell">
            <section v-if="isAuthOpen" class="auth-overlay" @click.self="closeAuth">
                <button class="auth-close" type="button" aria-label="关闭登录窗口" @click="closeAuth">x</button>

                <div class="auth-dialog">
                    <aside ref="authStage" class="auth-showcase" aria-hidden="true">
                        <div ref="tiltScene" class="tilt-scene">
                            <div class="tilt-card">
                                <div class="burst-label">MATO!</div>
                                <div class="comic-orbit orbit-one">HTML</div>
                                <div class="comic-orbit orbit-two">CSS</div>
                                <div class="comic-orbit orbit-three">JS</div>
                                <div class="tilt-avatar-stack">
                                    <img class="avatar-card avatar-card-man" :src="manAvatar" alt="">
                                    <img class="avatar-card avatar-card-woman" :src="womanAvatar" alt="">
                                </div>
                                <p class="showcase-title">JOIN THE CODE QUEST</p>
                                <p class="showcase-copy">选择身份，上传头像，然后继续你的前端冒险。</p>
                            </div>
                        </div>
                    </aside>

                    <main class="auth-main">
                        <div class="auth-head">
                            <div>
                                <span class="auth-kicker">ACCOUNT</span>
                                <h2>{{ isForgot ? '重置密码' : (isRegister ? '创建你的 MATO 账号' : '欢迎回来') }}</h2>
                            </div>
                            <div class="auth-toggle" role="tablist" aria-label="登录注册切换">
                                <button
                                    type="button"
                                    :class="{ active: authMode === 'login' }"
                                    @click="switchMode('login')"
                                >
                                    登录
                                </button>
                                <button
                                    type="button"
                                    :class="{ active: authMode === 'register' }"
                                    @click="switchMode('register')"
                                >
                                    注册
                                </button>
                            </div>
                        </div>

                        <div v-if="isRegister" class="avatar-preview" :class="{ 'avatar-preview--circle': isRegister }">
                            <div class="avatar-picker" :class="{ 'avatar-picker--circle': isRegister }" @click="handleAvatarClick">
                                <img :src="activeAvatar" alt="用户头像预览">
                                <span>上传头像</span>
                            </div>
                            <div class="avatar-note">
                                <strong>{{ form.gender === 'female' ? '已选择女性默认头像' : '已选择男性默认头像' }}</strong>
                                <span>选择性别即自动设置头像</span>
                            </div>
                        </div>

                        <Transition name="form-swap" mode="out-in">
                            <form :key="authMode + forgotStep" class="auth-form" @submit.prevent="handleAuthSubmit" autocomplete="off">

                                <!-- ===== 登录模式 ===== -->
                                <template v-if="authMode === 'login'">
                                    <label class="field">
                                        <span>名称 / 邮箱</span>
                                        <input v-model="form.name" type="text" placeholder="输入昵称或邮箱" autocomplete="off">
                                    </label>
                                    <label class="field">
                                        <span>密码</span>
                                        <div class="pw-wrap">
                                            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="输入密码" autocomplete="new-password">
                                            <button type="button" class="pw-toggle" @click="showPassword = !showPassword" tabindex="-1">
                                                {{ showPassword ? '🙈' : '👁' }}
                                            </button>
                                        </div>
                                    </label>
                                    <button class="comic-btn auth-submit" type="submit" :disabled="submitting">
                                        {{ submitting ? '处理中...' : '登 录' }}
                                    </button>
                                    <div class="mode-links">
                                        <button class="mode-link" type="button" @click="switchMode('register')">
                                            还没有账号？立即注册
                                        </button>
                                        <button class="mode-link forgot-link" type="button" @click="switchMode('forgot')">
                                            忘记密码？
                                        </button>
                                    </div>
                                </template>

                                <!-- ===== 注册模式 ===== -->
                                <template v-if="authMode === 'register'">
                                    <label class="field">
                                        <span>名称</span>
                                        <input v-model="form.name" type="text" placeholder="输入你的昵称" autocomplete="off">
                                    </label>
                                    <label class="field">
                                        <span>密码</span>
                                        <div class="pw-wrap">
                                            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="输入密码" autocomplete="new-password">
                                            <button type="button" class="pw-toggle" @click="showPassword = !showPassword" tabindex="-1">
                                                {{ showPassword ? '🙈' : '👁' }}
                                            </button>
                                        </div>
                                    </label>
                                    <p class="pw-hint">
                                        密码需8-20位，含大小写字母和数字
                                    </p>
                                    <label class="field">
                                        <span>确认密码</span>
                                        <div class="pw-wrap">
                                            <input v-model="form.password2" :type="showPassword ? 'text' : 'password'" placeholder="再次输入密码" autocomplete="new-password">
                                        </div>
                                    </label>
                                    <div class="gender-group">
                                        <span>性别</span>
                                        <div class="gender-options">
                                            <label :class="{ checked: form.gender === 'male' }">
                                                <input v-model="form.gender" type="radio" value="male" autocomplete="off">
                                                <img :src="manAvatar" alt="">
                                                <strong>男生</strong>
                                            </label>
                                            <label :class="{ checked: form.gender === 'female' }">
                                                <input v-model="form.gender" type="radio" value="female" autocomplete="off">
                                                <img :src="womanAvatar" alt="">
                                                <strong>女生</strong>
                                            </label>
                                        </div>
                                    </div>
                                    <!-- 人机验证 -->
                                    <div class="captcha-slider-wrap">
                                        <div
                                            ref="sliderTrackRef"
                                            class="captcha-track"
                                            :class="{
                                                'captcha-track--success': captchaVerified,
                                                'captcha-track--dragging': captchaDragging,
                                            }"
                                            @mousedown="onSliderStart"
                                            @touchstart.prevent="onSliderStart"
                                        >
                                            <div class="captcha-fill" :style="{ width: captchaProgress + '%' }"></div>
                                            <span v-if="!captchaVerified" class="captcha-hint">► 拖动滑块验证</span>
                                            <span v-else class="captcha-hint captcha-hint--done">★ 验证通过</span>
                                            <div
                                                ref="sliderThumbRef"
                                                class="captcha-thumb"
                                                :class="{ 'captcha-thumb--done': captchaVerified }"
                                                :style="{ left: captchaProgress + '%' }"
                                            >
                                                <span v-if="!captchaVerified">►</span>
                                                <span v-else>✓</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="email-group">
                                        <label class="field">
                                            <span>邮箱</span>
                                            <input v-model="form.email" type="email" placeholder="输入邮箱接收验证码" autocomplete="off">
                                        </label>
                                        <button
                                            type="button"
                                            class="comic-btn send-code-btn"
                                            :disabled="!captchaVerified || sendingCode || sendCooldown > 0"
                                            @click="handleSendCode"
                                        >
                                            {{ sendCooldown > 0 ? `${sendCooldown}s` : '发送验证码' }}
                                        </button>
                                    </div>
                                    <label class="field">
                                        <span>验证码</span>
                                        <input v-model="form.code" type="text" placeholder="输入6位验证码" maxlength="6" autocomplete="off">
                                    </label>
                                    <button class="comic-btn auth-submit" type="submit" :disabled="submitting || !captchaVerified">
                                        {{ submitting ? '处理中...' : '注 册' }}
                                    </button>
                                    <button class="mode-link" type="button" @click="switchMode('login')">
                                        已有账号？去登录
                                    </button>
                                </template>

                                <!-- ===== 忘记密码模式 ===== -->
                                <template v-if="authMode === 'forgot'">
                                    <!-- 人机验证 -->
                                    <div class="captcha-slider-wrap">
                                        <div
                                            ref="sliderTrackRef"
                                            class="captcha-track"
                                            :class="{
                                                'captcha-track--success': captchaVerified,
                                                'captcha-track--dragging': captchaDragging,
                                            }"
                                            @mousedown="onSliderStart"
                                            @touchstart.prevent="onSliderStart"
                                        >
                                            <div class="captcha-fill" :style="{ width: captchaProgress + '%' }"></div>
                                            <span v-if="!captchaVerified" class="captcha-hint">► 拖动滑块验证</span>
                                            <span v-else class="captcha-hint captcha-hint--done">★ 验证通过</span>
                                            <div
                                                ref="sliderThumbRef"
                                                class="captcha-thumb"
                                                :class="{ 'captcha-thumb--done': captchaVerified }"
                                                :style="{ left: captchaProgress + '%' }"
                                            >
                                                <span v-if="!captchaVerified">►</span>
                                                <span v-else>✓</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="email-group">
                                        <label class="field">
                                            <span>邮箱</span>
                                            <input v-model="form.email" type="email" placeholder="输入注册时使用的邮箱" autocomplete="off">
                                        </label>
                                        <button
                                            type="button"
                                            class="comic-btn send-code-btn"
                                            :disabled="!captchaVerified || sendingCode || sendCooldown > 0"
                                            @click="handleSendCode"
                                        >
                                            {{ sendCooldown > 0 ? `${sendCooldown}s` : '发送验证码' }}
                                        </button>
                                    </div>
                                    <label class="field">
                                        <span>验证码</span>
                                        <input v-model="form.code" type="text" placeholder="输入6位验证码" maxlength="6" autocomplete="off">
                                    </label>
                                    <label class="field">
                                        <span>新密码</span>
                                        <div class="pw-wrap">
                                            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="输入新密码" autocomplete="new-password">
                                            <button type="button" class="pw-toggle" @click="showPassword = !showPassword" tabindex="-1">
                                                {{ showPassword ? '🙈' : '👁' }}
                                            </button>
                                        </div>
                                    </label>
                                    <p class="pw-hint">
                                        密码需8-20位，含大小写字母和数字
                                    </p>
                                    <label class="field">
                                        <span>确认新密码</span>
                                        <div class="pw-wrap">
                                            <input v-model="form.password2" :type="showPassword ? 'text' : 'password'" placeholder="再次输入新密码" autocomplete="new-password">
                                        </div>
                                    </label>
                                    <button class="comic-btn auth-submit" type="submit" :disabled="submitting || !captchaVerified">
                                        {{ submitting ? '处理中...' : '重置密码' }}
                                    </button>
                                    <button class="mode-link" type="button" @click="switchMode('login')">
                                        ← 返回登录
                                    </button>
                                </template>
                            </form>
                        </Transition>
                    </main>
                </div>
            </section>
        </Transition>
    </div>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import manAvatar from '../../assets/HOMEImage/man.png'
import womanAvatar from '../../assets/HOMEImage/woman.png'
import { useAuth } from '../../stores/auth.js'

const gsap = inject('$gsap')
const ScrollTrigger = inject('$ScrollTrigger')
const route = useRoute()

const { isLoggedIn, login, register, resetPassword, sendEmailCode } = useAuth()

const isAuthOpen = ref(false)
const authMode = ref('login')
const forgotStep = ref('email')
const authStage = ref(null)
const tiltScene = ref(null)
const submitting = ref(false)
const sendingCode = ref(false)
const sendCooldown = ref(0)
const showPassword = ref(false)

// 人机验证 - 滑块
const sliderTrackRef = ref(null)
const sliderThumbRef = ref(null)
const captchaVerified = ref(false)
const captchaDragging = ref(false)
const captchaProgress = ref(0)
let captchaAnimId = null
const CAPTCHA_THRESHOLD = 88 // 滑动超过此百分比即通过

const form = reactive({
    name: '',
    password: '',
    password2: '',
    gender: 'male',
    email: '',
    code: '',
})

const isRegister = computed(() => authMode.value === 'register')
const isForgot = computed(() => authMode.value === 'forgot')
const defaultAvatar = computed(() => form.gender === 'female' ? womanAvatar : manAvatar)
const activeAvatar = computed(() => defaultAvatar.value)

let ctx = null
let authTiltCleanup = null
let cooldownTimer = null

function openAuth() {
    isAuthOpen.value = true
    document.body.style.overflow = 'hidden'
    forgotStep.value = 'email'
    resetCaptcha()
    nextTick(() => {
        initAuthTilt()
    })
}

function closeAuth() {
    isAuthOpen.value = false
    document.body.style.overflow = ''
    destroyAuthTilt()
}

async function handleSendCode() {
    if (!form.email.trim()) {
        alert('请输入邮箱地址')
        return
    }
    sendingCode.value = true
    const codeType = isForgot.value ? 'reset' : 'register'
    const { success, msg } = await sendEmailCode(form.email.trim(), codeType)
    sendingCode.value = false

    if (success) {
        sendCooldown.value = 60
        cooldownTimer = setInterval(() => {
            sendCooldown.value--
            if (sendCooldown.value <= 0) {
                clearInterval(cooldownTimer)
                cooldownTimer = null
            }
        }, 1000)
    }
    alert(msg)
}

async function handleAuthSubmit() {
    submitting.value = true

    if (isForgot.value) {
        // 忘记密码
        if (!form.email.trim() || !form.code.trim()) {
            alert('请填写邮箱和验证码')
            submitting.value = false
            return
        }
        const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/
        if (!pwRegex.test(form.password)) {
            alert('密码需8-20位，含大小写字母和数字')
            submitting.value = false
            return
        }
        if (form.password !== form.password2) {
            alert('两次输入的密码不一致')
            submitting.value = false
            return
        }
        const { success, msg } = await resetPassword(
            form.email.trim(),
            form.code.trim(),
            form.password
        )
        submitting.value = false
        if (success) {
            alert('密码重置成功，请登录')
            switchMode('login')
        } else {
            alert(msg)
        }
        return
    }

    if (isRegister.value) {
        // 验证密码规则：8-20位，含大小写字母和数字
        const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/
        if (!pwRegex.test(form.password)) {
            alert('密码需8-20位，含大小写字母和数字')
            submitting.value = false
            return
        }
        if (form.password !== form.password2) {
            alert('两次输入的密码不一致')
            submitting.value = false
            return
        }
        if (!form.email.trim() || !form.code.trim()) {
            alert('请填写邮箱和验证码')
            submitting.value = false
            return
        }
        const { success, msg } = await register(
            form.name.trim(),
            form.password,
            form.gender,
            form.email.trim(),
            form.code.trim()
        )
        submitting.value = false
        if (success) {
            closeAuth()
        } else {
            alert(msg)
        }
    } else {
        if (!form.name.trim() || !form.password.trim()) {
            submitting.value = false
            return
        }
        const { success, msg } = await login(form.name.trim(), form.password)
        submitting.value = false
        if (success) {
            closeAuth()
        } else {
            alert(msg)
        }
    }
}

function switchMode(mode) {
    authMode.value = mode
    forgotStep.value = 'email'
    // 切换模式时重置滑块验证和表单
    resetCaptcha()
    // 切换到忘记密码或登录时清空表单
    if (mode === 'forgot' || mode === 'login') {
        Object.assign(form, {
            name: '',
            password: '',
            password2: '',
            gender: 'male',
            email: '',
            code: '',
        })
    }
}

function resetCaptcha() {
    captchaVerified.value = false
    captchaDragging.value = false
    captchaProgress.value = 0
    if (captchaAnimId) {
        cancelAnimationFrame(captchaAnimId)
        captchaAnimId = null
    }
}

function onSliderStart(e) {
    if (captchaVerified.value) return
    captchaDragging.value = true

    const track = sliderTrackRef.value
    if (!track) return
    const trackRect = track.getBoundingClientRect()

    const getX = (ev) => {
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX
        return Math.max(0, Math.min(clientX - trackRect.left, trackRect.width))
    }

    const onMove = (ev) => {
        if (!captchaDragging.value) return
        const x = getX(ev)
        const pct = (x / trackRect.width) * 100
        captchaProgress.value = Math.min(pct, 100)
    }

    const onEnd = () => {
        if (!captchaDragging.value) return
        captchaDragging.value = false
        if (captchaProgress.value >= CAPTCHA_THRESHOLD) {
            captchaVerified.value = true
            captchaProgress.value = 100
        } else {
            // 未达到阈值，弹回
            animateReset()
        }
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)
        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
}

function animateReset() {
    const start = captchaProgress.value
    const duration = 200
    const startTime = performance.now()

    function step(now) {
        const elapsed = now - startTime
        const t = Math.min(elapsed / duration, 1)
        // ease-in-out
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        captchaProgress.value = start * (1 - ease)
        if (t < 1) {
            captchaAnimId = requestAnimationFrame(step)
        } else {
            captchaProgress.value = 0
            captchaAnimId = null
        }
    }
    captchaAnimId = requestAnimationFrame(step)
}

function handleAvatarClick() {
    alert('此功能不可用')
}

function initAuthTilt() {
    destroyAuthTilt()

    if (!gsap || !authStage.value || !tiltScene.value) return

    const mobileQuery = window.matchMedia('(max-width: 767px)')
    if (mobileQuery.matches) return

    const stage = authStage.value
    const scene = tiltScene.value
    const rotateXTo = gsap.quickTo(scene, 'rotationX', { duration: 0.6, ease: 'power2.out' })
    const rotateYTo = gsap.quickTo(scene, 'rotationY', { duration: 0.6, ease: 'power2.out' })
    const shadowXTo = gsap.quickTo(scene, '--shadow-x', { duration: 0.6, ease: 'power2.out' })
    const shadowYTo = gsap.quickTo(scene, '--shadow-y', { duration: 0.6, ease: 'power2.out' })
    const glowXTo = gsap.quickTo(scene, '--glow-x', { duration: 0.6, ease: 'power2.out' })
    const glowYTo = gsap.quickTo(scene, '--glow-y', { duration: 0.6, ease: 'power2.out' })

    gsap.set(scene, {
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        '--shadow-x': 14,
        '--shadow-y': 14,
        '--glow-x': 45,
        '--glow-y': 35,
    })

    const onMove = (event) => {
        const rect = stage.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5

        rotateXTo(y * -18)
        rotateYTo(x * 18)
        shadowXTo(14 + x * -22)
        shadowYTo(14 + y * -22)
        glowXTo(50 + x * 34)
        glowYTo(44 + y * 30)
    }

    const onLeave = () => {
        rotateXTo(0)
        rotateYTo(0)
        shadowXTo(14)
        shadowYTo(14)
        glowXTo(45)
        glowYTo(35)
    }

    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)

    authTiltCleanup = () => {
        stage.removeEventListener('mousemove', onMove)
        stage.removeEventListener('mouseleave', onLeave)
        onLeave()
    }
}

function destroyAuthTilt() {
    authTiltCleanup?.()
    authTiltCleanup = null
}

onMounted(() => {
    // 通过 ?auth=open 自动打开登录框
    if (route.query.auth === 'open') {
        openAuth()
    }

    if (!gsap || !ScrollTrigger) return

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
    destroyAuthTilt()
    ctx?.revert()
    document.body.style.overflow = ''
    if (cooldownTimer) clearInterval(cooldownTimer)
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

.auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1rem, 3vw, 2.5rem);
    background:
        linear-gradient(135deg, rgba(10, 10, 10, 0.88), rgba(245, 245, 245, 0.55)),
        radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px);
    background-size: auto, 18px 18px;
    backdrop-filter: blur(8px);
}

.auth-close {
    position: fixed;
    top: clamp(1rem, 3vw, 2rem);
    right: clamp(1rem, 3vw, 2rem);
    z-index: 2;
    width: 46px;
    height: 46px;
    border: 3px solid #000;
    background: #fff;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.55rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: 5px 5px 0 #000;
    transition: transform 0.14s ease, box-shadow 0.14s ease;
}

.auth-close:hover {
    transform: translate(3px, 3px) rotate(5deg);
    box-shadow: 2px 2px 0 #000;
}

.auth-dialog {
    width: min(1120px, 100%);
    max-height: calc(100vh - clamp(2rem, 6vw, 5rem));
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(390px, 0.78fr);
    background: var(--comic-white);
    border: 5px solid #000;
    box-shadow: 16px 16px 0 rgba(0, 0, 0, 0.7);
    overflow-y: auto;
}

.auth-showcase {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: clamp(1.5rem, 4vw, 3rem);
    background:
        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 0 2px, transparent 2px 16px),
        #eeeeee;
    border-right: 5px solid #000;
    perspective: 1000px;
}

.tilt-scene {
    --shadow-x: 14;
    --shadow-y: 14;
    --glow-x: 45;
    --glow-y: 35;
    width: min(430px, 100%);
    aspect-ratio: 0.84;
    transform-style: preserve-3d;
    will-change: transform;
}

.tilt-card {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background:
        radial-gradient(circle at calc(var(--glow-x) * 1%) calc(var(--glow-y) * 1%), rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.42) 24%, transparent 44%),
        linear-gradient(150deg, #ffffff 0%, #f5f5f5 52%, #dcdcdc 100%);
    border: 5px solid #000;
    box-shadow:
        calc(var(--shadow-x) * 1px) calc(var(--shadow-y) * 1px) 0 #000,
        calc(var(--shadow-x) * 1.55px) calc(var(--shadow-y) * 1.55px) 0 rgba(0, 0, 0, 0.22);
    transform-style: preserve-3d;
}

.tilt-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(0, 0, 0, 0.13) 1.5px, transparent 1.5px);
    background-size: 16px 16px;
    opacity: 0.55;
}

.burst-label {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 2;
    padding: 0.25rem 0.9rem;
    color: #fff;
    background: #000;
    border: 3px solid #fff;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: clamp(1.7rem, 3vw, 2.5rem);
    letter-spacing: 2px;
    text-shadow: 2px 2px 0 #555;
    box-shadow: 5px 5px 0 #000;
    transform: translateZ(55px) rotate(-4deg);
}

.comic-orbit {
    position: absolute;
    z-index: 2;
    padding: 0.25rem 0.7rem;
    border: 3px solid #000;
    background: #fff;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.25rem;
    box-shadow: 4px 4px 0 #999;
    transform: translateZ(44px);
}

.orbit-one {
    top: 22%;
    right: 10%;
    transform: translateZ(64px) rotate(7deg);
}

.orbit-two {
    left: 9%;
    bottom: 30%;
    transform: translateZ(52px) rotate(-9deg);
}

.orbit-three {
    right: 13%;
    bottom: 20%;
    transform: translateZ(72px) rotate(5deg);
}

.tilt-avatar-stack {
    position: absolute;
    inset: 19% 10% auto;
    height: 50%;
    transform: translateZ(40px);
}

.avatar-card {
    position: absolute;
    width: 58%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(8px 10px 0 rgba(0, 0, 0, 0.22));
}

.avatar-card-man {
    left: 6%;
    bottom: 0;
    transform: rotate(-8deg);
}

.avatar-card-woman {
    right: 2%;
    bottom: -4%;
    transform: rotate(7deg);
}

.showcase-title {
    position: absolute;
    left: 1.4rem;
    right: 1.4rem;
    bottom: 5.3rem;
    z-index: 2;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.6rem);
    line-height: 0.95;
    letter-spacing: 2px;
    text-shadow: 3px 3px 0 #fff, 5px 5px 0 rgba(0, 0, 0, 0.22);
    transform: translateZ(58px);
}

.showcase-copy {
    position: absolute;
    left: 1.4rem;
    right: 1.4rem;
    bottom: 2rem;
    z-index: 2;
    color: #333;
    font-weight: 800;
    line-height: 1.55;
    transform: translateZ(46px);
}

.auth-main {
    min-width: 0;
    min-height: 0;
    padding: clamp(1.5rem, 4vw, 3rem);
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.auth-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1.8rem;
}

.auth-kicker {
    display: inline-block;
    margin-bottom: 0.45rem;
    padding: 0.15rem 0.65rem;
    background: #000;
    color: #fff;
    border: 2px solid #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    letter-spacing: 2px;
    box-shadow: 3px 3px 0 #999;
}

.auth-head h2 {
    margin: 0;
    padding: 0;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1;
    letter-spacing: 1px;
    text-shadow: 3px 3px 0 #f0f0f0, 5px 5px 0 rgba(0, 0, 0, 0.2);
}

.auth-toggle {
    display: inline-grid;
    grid-template-columns: repeat(2, 1fr);
    border: 3px solid #000;
    box-shadow: 5px 5px 0 #000;
    background: #fff;
    overflow: hidden;
    flex: 0 0 auto;
}

.auth-toggle button {
    min-width: 74px;
    padding: 0.65rem 0.85rem;
    border: 0;
    background: #fff;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.05rem;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
}

.auth-toggle button + button {
    border-left: 3px solid #000;
}

.auth-toggle button.active {
    background: #000;
    color: #fff;
}

.avatar-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 3px solid #000;
    background: #f6f6f6;
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.22);
    margin-bottom: 1.5rem;
}

.avatar-picker {
    position: relative;
    flex: 0 0 auto;
    width: 94px;
    height: 94px;
    cursor: pointer;
}

.avatar-picker img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 3px solid #000;
    background: #fff;
    box-shadow: 4px 4px 0 #000;
}

.avatar-picker--circle img {
    border-radius: 50%;
}

.avatar-preview--circle {
    border-style: dashed;
}

.avatar-picker span {
    position: absolute;
    left: 50%;
    bottom: -0.4rem;
    transform: translateX(-50%) rotate(-2deg);
    width: max-content;
    max-width: 118px;
    padding: 0.16rem 0.45rem;
    background: #000;
    color: #fff;
    border: 2px solid #fff;
    font-size: 0.72rem;
    font-weight: 900;
    box-shadow: 2px 2px 0 #000;
}

.avatar-note {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    color: #333;
}

.avatar-note strong {
    color: #000;
    font-size: 1rem;
}

.avatar-note span {
    font-size: 0.9rem;
}

.avatar-cropper {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border: 3px solid #000;
    background:
        repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.05) 0 2px, transparent 2px 14px),
        #fff;
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.22);
    margin: -0.5rem 0 1.5rem;
}

.crop-head {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    color: #000;
}

.crop-head strong {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.2rem;
    letter-spacing: 1px;
}

.crop-head span {
    color: #555;
    font-size: 0.85rem;
    font-weight: 800;
}

.crop-frame {
    position: relative;
    width: 220px;
    aspect-ratio: 1;
    overflow: hidden;
    touch-action: none;
    cursor: grab;
    user-select: none;
    border: 4px solid #000;
    background: #e9e9e9;
    box-shadow: 5px 5px 0 #000;
}

.crop-frame--circle {
    border-radius: 50%;
}

.crop-frame:active {
    cursor: grabbing;
}

.crop-frame img {
    position: absolute;
    top: 0;
    left: 0;
    max-width: none;
    object-fit: cover;
    transform-origin: 0 0;
    will-change: transform, width, height;
    pointer-events: none;
}

.crop-mask,
.crop-crosshair {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.crop-mask {
    border: 3px solid #fff;
    box-shadow: inset 0 0 0 2px #000;
    background:
        linear-gradient(to right, transparent 32.8%, rgba(255, 255, 255, 0.42) 33%, rgba(255, 255, 255, 0.42) 33.6%, transparent 33.8%, transparent 66.2%, rgba(255, 255, 255, 0.42) 66.4%, rgba(255, 255, 255, 0.42) 67%, transparent 67.2%),
        linear-gradient(to bottom, transparent 32.8%, rgba(255, 255, 255, 0.42) 33%, rgba(255, 255, 255, 0.42) 33.6%, transparent 33.8%, transparent 66.2%, rgba(255, 255, 255, 0.42) 66.4%, rgba(255, 255, 255, 0.42) 67%, transparent 67.2%);
}

.crop-mask--circle {
    border-radius: 50%;
    border-color: #fff;
    box-shadow: inset 0 0 0 3px #000;
    background:
        radial-gradient(circle, transparent 32%, rgba(255,255,255,0.5) 32.5%, rgba(255,255,255,0.5) 33.5%, transparent 34%);
}

.crop-crosshair::before,
.crop-crosshair::after {
    content: '';
    position: absolute;
    background: rgba(0, 0, 0, 0.28);
}

.crop-crosshair::before {
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    transform: translateX(-50%);
}

.crop-crosshair::after {
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);
}

.crop-controls {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
}

.crop-controls label {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.crop-controls label span {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    color: #000;
    letter-spacing: 1px;
}

.crop-controls input[type='range'] {
    width: 100%;
    accent-color: #000;
    cursor: pointer;
}

.crop-controls button {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    border: 3px solid #000;
    background: #fff;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #000;
    transition: transform 0.14s ease, box-shadow 0.14s ease;
}

.crop-controls button:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #000;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.field span,
.gender-group > span {
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1rem;
    letter-spacing: 1px;
}

.field input {
    width: 100%;
    min-height: 52px;
    padding: 0.8rem 1rem;
    border: 3px solid #000;
    background: #fff;
    color: #111;
    font: inherit;
    font-weight: 800;
    outline: none;
    box-shadow: 4px 4px 0 #c9c9c9;
    transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.field input:focus {
    background: #f7f7f7;
    box-shadow: 6px 6px 0 #000;
    transform: translateY(-2px);
}

.gender-group {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.gender-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
}

.gender-options label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 74px;
    padding: 0.7rem;
    border: 3px solid #000;
    background: #fff;
    cursor: pointer;
    box-shadow: 4px 4px 0 #c9c9c9;
    transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.gender-options label:hover,
.gender-options label.checked {
    background: #000;
    color: #fff;
    box-shadow: 6px 6px 0 #777;
    transform: translateY(-2px);
}

.gender-options input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.gender-options img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border: 2px solid currentColor;
    background: #fff;
}

.gender-options strong {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.25rem;
    letter-spacing: 1px;
}

.email-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.pw-hint {
    color: #666;
    font-size: 0.8rem;
    font-weight: 800;
    margin: -0.5rem 0 0;
    padding-left: 0.2rem;
}

.pw-wrap {
    position: relative;
    display: flex;
}

.pw-wrap input {
    flex: 1;
    padding-right: 3rem;
}

.pw-toggle {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.3rem 0.5rem;
    line-height: 1;
}

.send-code-btn {
    width: 100%;
    background: #2563eb !important;
    color: #fff !important;
    border: 3px solid #000;
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
    box-shadow: 4px 4px 0 #1d4ed8;
}

.send-code-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
}

/* ── 人机验证 - 滑块 ── */
.captcha-slider-wrap {
    margin: 0.2rem 0 0.2rem;
}

.captcha-track {
    position: relative;
    height: 50px;
    background: #f0f0f0;
    border: 3px solid #000;
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    transition: border-color 0.2s;
}

.captcha-track--dragging {
    border-color: #555;
}

.captcha-track--success {
    border-color: #155724;
    background: #d4edda;
}

.captcha-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: #a8e6cf;
    transition: width 0.05s linear;
    pointer-events: none;
}

.captcha-track--success .captcha-fill {
    background: #4ecdc4;
}

.captcha-hint {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Comic Neue', 'Microsoft YaHei', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    color: #888;
    pointer-events: none;
    white-space: nowrap;
    z-index: 1;
}

.captcha-hint--done {
    color: #155724;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.05rem;
    letter-spacing: 2px;
}

.captcha-thumb {
    position: absolute;
    top: -2px;
    left: 0;
    z-index: 2;
    width: 48px;
    height: calc(100% + 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border: 3px solid #fff;
    box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
    cursor: grab;
    transition: box-shadow 0.15s;
    will-change: left;
}

.captcha-thumb span {
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.1rem;
    color: #fff;
    letter-spacing: 1px;
}

.captcha-track--dragging .captcha-thumb {
    cursor: grabbing;
    box-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.captcha-thumb--done {
    background: #155724;
    border-color: #fff;
    cursor: default;
    box-shadow: 2px 2px 0 #0a3a16;
    width: 52px;
}

.captcha-thumb--done span {
    font-size: 1.3rem;
}

.auth-submit {
    width: 100%;
    margin-top: 0.4rem;
}

.mode-link {
    align-self: center;
    border: 0;
    background: transparent;
    color: #000;
    font-weight: 900;
    cursor: pointer;
    padding: 0.35rem 0.5rem;
    border-bottom: 3px solid #000;
    transition: transform 0.16s ease;
}

.mode-link:hover {
    transform: translateY(-2px);
}

.mode-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.forgot-link {
    border-bottom-color: #888;
    color: #888;
    font-size: 0.85rem;
}

.auth-shell-enter-active,
.auth-shell-leave-active {
    transition: opacity 0.26s ease;
}

.auth-shell-enter-active .auth-dialog,
.auth-shell-leave-active .auth-dialog {
    transition: transform 0.34s cubic-bezier(0.2, 0.9, 0.25, 1.15), opacity 0.28s ease;
}

.auth-shell-enter-from,
.auth-shell-leave-to {
    opacity: 0;
}

.auth-shell-enter-from .auth-dialog,
.auth-shell-leave-to .auth-dialog {
    opacity: 0;
    transform: translateY(28px) scale(0.97);
}

.form-swap-enter-active,
.form-swap-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.form-swap-enter-from {
    opacity: 0;
    transform: translateX(18px);
}

.form-swap-leave-to {
    opacity: 0;
    transform: translateX(-18px);
}

.crop-pop-enter-active,
.crop-pop-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.crop-pop-enter-from,
.crop-pop-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
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

    .auth-dialog {
        grid-template-columns: 0.9fr 1fr;
    }

    .auth-head {
        flex-direction: column;
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

    .auth-overlay {
        align-items: stretch;
        padding: 0;
        overflow-y: auto;
    }

    .auth-close {
        top: 0.75rem;
        right: 0.75rem;
        width: 40px;
        height: 40px;
        font-size: 1.35rem;
    }

    .auth-dialog {
        width: 100%;
        max-height: none;
        grid-template-columns: 1fr;
        border: 0;
        box-shadow: none;
        overflow-y: visible;
    }

    .auth-showcase {
        border-right: 0;
        border-bottom: 5px solid #000;
        min-height: 270px;
        padding: 1.2rem 4rem 1.2rem 1rem;
    }

    .tilt-scene {
        width: min(260px, 100%);
        transform: none !important;
    }

    .showcase-copy {
        display: none;
    }

    .showcase-title {
        bottom: 1.4rem;
        font-size: 1.5rem;
    }

    .burst-label {
        font-size: 1.45rem;
    }

    .comic-orbit {
        font-size: 0.95rem;
    }

    .auth-main {
        padding: 1.3rem;
        justify-content: flex-start;
        overflow-y: visible;
    }

    .auth-head {
        flex-direction: column;
        margin-bottom: 1.2rem;
    }

    .auth-toggle {
        width: 100%;
    }

    .avatar-preview {
        align-items: flex-start;
        padding: 0.8rem;
    }

    .avatar-picker {
        width: 78px;
        height: 78px;
    }

    .avatar-cropper {
        grid-template-columns: 1fr;
        justify-items: center;
        gap: 0.85rem;
        padding: 0.85rem;
    }

    .crop-head {
        width: 100%;
        align-items: flex-start;
        flex-direction: column;
        gap: 0.25rem;
    }

    .crop-frame {
        width: min(220px, 100%);
    }

    .crop-controls {
        width: 100%;
    }

    .gender-options {
        grid-template-columns: 1fr;
    }
}
</style>
