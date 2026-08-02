<template>
    <div ref="container">

        <div v-if="!isChallengePage" class="tabbar" ref="tabbar">
            <Tabbar />
        </div>

        <div class="body" :class="{ 'body--no-tabbar': isChallengePage }">
            <router-view />
        </div>

        <!-- 全局登录/注册弹窗 -->
        <AuthModal />

    </div>
</template>

<script setup>
import Tabbar from './components/Tabbar.vue'
import AuthModal from './components/AuthModal.vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ref, computed, onMounted, onUnmounted, onUpdated } from 'vue'
import { useRoute } from 'vue-router'

gsap.registerPlugin(ScrollTrigger)

const container = ref(null)
const tabbar = ref(null)
const route = useRoute()

const isChallengePage = computed(() => route.path.startsWith('/Challenge') || route.path.startsWith('/WorkDetail') || route.path.startsWith('/Pen') || route.path.startsWith('/Profile') || route.path.startsWith('/admin') || route.path.startsWith('/Messages') || route.path.startsWith('/SocialList'))

let ctx = null
let isHidden = false

onMounted(() => {

    ctx = gsap.context(() => {

        ScrollTrigger.create({
            start: 0,
            end: 'max',

            onUpdate(self) {
                if (!tabbar.value) return

                // 向下滚动
                if (self.direction === 1 && !isHidden) {

                    isHidden = true

                    gsap.to(tabbar.value, {
                        yPercent: -100,
                        duration: 0.5,
                        ease: 'back.in'
                    })
                }

                // 向上滚动
                if (self.direction === -1 && isHidden) {

                    isHidden = false

                    gsap.to(tabbar.value, {
                        yPercent: 0,
                        duration: 0.5,
                        ease: 'back.out'
                    })
                }
            }
        })

    }, container)

})

onUnmounted(() => {
    ctx?.revert()
})

onUpdated(() => {
    // 路由切换时恢复 tabbar 显示
    isHidden = false
    if (tabbar.value) {
        gsap.to(tabbar.value, {
            yPercent: 0,
            duration: 0.3
        })
    }
})
</script>

<style lang="scss" scoped>
.tabbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;

    /* 提升动画性能 */
    will-change: transform;
}

.body {
    width: 96%;
    min-height: 100vh;
    margin: 120px auto 0;

    &--no-tabbar {
        margin-top: 0;
        width: 100%;
    }
}

/* ==================== 响应式 ==================== */

/* 手机端 */
@media (max-width: 767px) {
    .body {
        width: 94%;
        margin-top: 90px;

        &--no-tabbar {
            margin-top: 0;
            width: 100%;
        }
    }
}

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) {
    .body {
        width: 94%;
        margin-top: 100px;

        &--no-tabbar {
            margin-top: 0;
            width: 100%;
        }
    }
}
</style>