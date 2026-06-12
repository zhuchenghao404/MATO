<template>
    <div>
        <div class="demo-wrapper" style="margin-top:20px; margin-bottom: 20px;">
            <header class="manga-nav">
                <div class="nav-container">
                    <div class="logo">
                        <span class="burst">💢</span>
                        <span>MATO!</span>
                        <span style="background:transparent; color:#000; padding:0;">码途</span>
                    </div>

                    <!-- ===== 用户图标 ===== -->
                    <div ref="userWidgetRef" class="user-widget" @click.stop="handleUserClick" style="cursor:pointer">
                        <div class="user-avatar-wrap">
                            <svg class="exp-arc" viewBox="0 0 100 50">
                                <path
                                    d="M 6 50 A 44 44 0 0 1 94 50"
                                    fill="none"
                                    stroke="#bfdbfe"
                                    stroke-width="6"
                                    stroke-linecap="round"
                                />
                                <path
                                    class="exp-arc-fill"
                                    d="M 6 50 A 44 44 0 0 1 94 50"
                                    fill="none"
                                    stroke="#2563eb"
                                    stroke-width="6"
                                    stroke-linecap="round"
                                    :stroke-dasharray="expDashArray"
                                />
                            </svg>
                            <img class="user-avatar-img" :src="userAvatar" alt="用户头像">
                        </div>
                        <div class="user-info">
                            <span class="user-level">LV.{{ userLevel }}</span>
                            <span class="user-name">{{ userName }}</span>
                        </div>
                        <!-- 经验数值（无文字标签） -->
                        <div class="user-exp-nums">
                            <span class="exp-cur">{{ userExp }}</span>
                            <span class="exp-sep">/</span>
                            <span class="exp-max">{{ expMax }}</span>
                        </div>
                        <!-- 已登录下拉菜单 -->
                        <div v-if="isLoggedIn && showUserMenu" class="user-dropdown" @click.stop>
                            <button class="dropdown-btn" @click.stop="handleGoProfile">个人中心</button>
                            <button class="dropdown-btn logout-btn" @click.stop="handleLogout">退出登录</button>
                        </div>
                    </div>
                    <div class="burger" id="burgerBtn">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <nav class="nav-menu" id="navMenu">
                        <ul>
                            <li v-for="(todo,index) in todolist" 
                            :key="index">
                                <router-link 
                                    :to="todo.path"
                                    custom
                                    v-slot="{ navigate, isActive }"
                                >
                                    <a 
                                        @click="handleNavClick(todo, navigate)"
                                        :class="{ active: isActive }"
                                        @mouseenter="handleMouseEnter"
                                    >{{ todo.name }}</a>
                                </router-link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        </div>
        <div 
        v-if="isLoading" 
        class="comic-loading-overlay"
        :class="{ 'hide': !isLoading }"
        >
            <div>
                <span class="comic-loading-text">LOADING</span>
                <span class="comic-loading-dots"></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js'

const route = useRoute();
const router = useRouter();

/* ===== 用户数据 ===== */
const { isLoggedIn, userName, userAvatar, userLevel, userExp, expMax, logout, openAuthModal } = useAuth()
const showUserMenu = ref(false)
const userWidgetRef = ref(null)

function handleUserClick() {
  if (isLoggedIn.value) {
    showUserMenu.value = !showUserMenu.value
  } else {
    openAuthModal()
  }
}

function handleLogout() {
  logout()
  showUserMenu.value = false
  router.push('/Home')
}

function handleGoProfile() {
  showUserMenu.value = false
  router.push('/Profile')
}

/** 点击页面其他地方关闭下拉菜单 */
function handleClickOutside(e) {
  if (userWidgetRef.value && !userWidgetRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

/** 经验条弧长（上半圆周长 π*r ≈ 3.1416 * 44 ≈ 138.2） */
const expDashArray = computed(() => {
    const circumference = Math.PI * 44 // 半圆弧长
    const progress = Math.min(userExp.value / expMax.value, 1)
    const filled = circumference * progress
    return `${filled} ${circumference}`
})

const todolist = [
    { path: '/Home', name:'HOME' },
    { path: '/SkillLearning', name:'技能学习' },
    { path: '/SkillToUp', name:'技能闯关' },
    { path: '/PerfectCase', name:'优秀案例' },
    { path: '/Pen', name:'自由画笔' }
]

const isLoading = ref(false);

function getVisitedPages() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem('visited_pages') || '[]'))
  } catch { return new Set() }
}

function markVisited(path) {
  const visited = getVisitedPages()
  visited.add(path)
  sessionStorage.setItem('visited_pages', JSON.stringify([...visited]))
}

function isVisited(path) {
  return getVisitedPages().has(path)
}

function showComicLoading() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 1400);
}

function handleNavClick(todo, navigate) {
  // 如果点击的是当前页面，不触发遮罩
  if (route.path === todo.path) {
    navigate();
    return;
  }
  // 如果该页面已经访问过，跳过加载遮罩
  if (!isVisited(todo.path)) {
    showComicLoading();
  }
  markVisited(todo.path)
  navigate();
}

// 鼠标悬浮特效（PC端 >= 1024px）
function handleMouseEnter(e) {
    if (window.innerWidth >= 1024) {
        const target = e.currentTarget;
        const boom = document.createElement('small');
        boom.innerText = '!! 咚 !!';
        boom.style.position = 'absolute';
        boom.style.top = '-30px';
        boom.style.left = '10px';
        boom.style.fontSize = '14px';
        boom.style.fontWeight = 'bold';
        boom.style.background = 'black';
        boom.style.color = 'white';
        boom.style.padding = '2px 6px';
        boom.style.border = '1px solid white';
        boom.style.fontFamily = "'Comic Neue'";
        boom.style.whiteSpace = 'nowrap';
        boom.style.zIndex = '99';
        boom.style.transform = 'rotate(-5deg)';
        boom.style.pointerEvents = 'none';
        const existing = target.querySelector('.fly-comic');
        if (existing) existing.remove();
        boom.classList.add('fly-comic');
        target.style.position = 'relative';
        target.appendChild(boom);
        setTimeout(() => boom.remove(), 500);
    }
}

onMounted(() => {
    // 首次进入网站显示遮罩（Home 只显示一次）
    if (!isVisited(route.path)) {
        showComicLoading()
        markVisited(route.path)
    }

    const burger = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burger && navMenu) {
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            burger.style.transform = 'scale(0.94)';
            setTimeout(() => { burger.style.transform = ''; }, 120);
        });
        
        // 手机端点击导航链接后关闭菜单
        const allLinks = document.querySelectorAll('.nav-menu a');
        allLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.innerWidth < 768) {
                    navMenu.classList.remove('active');
                }
                // 点击小特效
                const temp = document.createElement('span');
                temp.innerText = '💢';
                temp.style.position = 'fixed';
                temp.style.left = (e.clientX - 15) + 'px';
                temp.style.top = (e.clientY - 20) + 'px';
                temp.style.fontSize = '28px';
                temp.style.fontWeight = 'bold';
                temp.style.pointerEvents = 'none';
                temp.style.zIndex = '9999';
                temp.style.transform = 'rotate(10deg)';
                temp.style.opacity = '1';
                temp.style.transition = 'opacity 0.3s ease';
                document.body.appendChild(temp);
                setTimeout(() => {
                    temp.style.opacity = '0';
                    setTimeout(() => temp.remove(), 300);
                }, 200);
            });
        });
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && navMenu) navMenu.classList.remove('active');
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
    .demo-wrapper {
        width: 100%;
        max-width: 1300px;
        margin: 0 auto;
    }

    /* ----- 漫画导航栏 ----- */
    .manga-nav {
        background-color: #FFFFFF;
        border: 4px solid #000000;
        border-radius: 0px;
        box-shadow: 8px 8px 0px 0px rgba(0,0,0,0.2);
        position: relative;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    /* 手绘撕裂/折角 */
    .manga-nav::before {
        content: "";
        position: absolute;
        top: -8px;
        left: 20px;
        width: 60px;
        height: 15px;
        background: #f5f5f5;
        border: 2px solid #000;
        transform: skew(-15deg);
        z-index: 2;
        box-shadow: -2px 2px 0 #000;
    }

    
    /* 悬停：导航栏上移5px，阴影上移 */
    .manga-nav:hover {
        transform: translateY(-5px);
        box-shadow: 8px 4px 0px 0px rgba(0,0,0,0.25);
    }

    .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        padding: 0.8rem 2rem;
        position: relative;
        z-index: 5;
    }

    /* LOGO 区域 */
    .logo {
        font-family: 'Bangers', cursive;
        font-size: 2.1rem;
        letter-spacing: 2px;
        color: #000;
        background: white;
        padding: 0 8px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transform: rotate(-1deg);
        border: 2.5px solid #000;
        box-shadow: 5px 5px 0 #000;
        transition: 0.1s linear;
        position: relative;
    }

    .logo::after {
        content: "";
        position: absolute;
        bottom: -14px;
        left: 15px;
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 8px solid transparent;
        border-top: 16px solid #000;
        filter: drop-shadow(2px 2px 0 #000);
        z-index: -1;
    }

    .logo span {
        background: #000;
        color: #FFF;
        padding: 0 12px;
        transform: skew(-5deg);
        display: inline-block;
        font-size: 1.7rem;
        text-shadow: 2px 2px 0 #555;
    }

    .logo .burst {
        font-size: 2rem;
        display: inline-block;
        animation: shakeF 0.2s infinite alternate;
    }

    @keyframes shakeF {
        0% { transform: translate(0px, 0px) rotate(0deg); }
        100% { transform: translate(1px, -1px) rotate(2deg); }
    }

    /* ----- 用户图标组件 ----- */
    .user-widget {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: #fff;
        padding: 0.3rem 0.8rem 0.3rem 0.5rem;
        transform: rotate(-0.5deg);
    }

    .user-avatar-wrap {
        position: relative;
        width: 48px;
        height: 48px;
        flex: 0 0 auto;
    }

    .exp-arc {
        position: absolute;
        top: 0;
        left: 50%;
        width: 110%;
        height: 55%;
        transform: translate(-50%, 0);
        pointer-events: none;
        z-index: 2;
    }

    .exp-arc path:first-of-type {
        opacity: 0.35;
    }

    .exp-arc-fill {
        transition: stroke-dasharray 0.4s ease;
    }

    .user-avatar-img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #000;
        background: #fff;
        display: block;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        line-height: 1.15;
    }

    .user-level {
        font-family: 'Bangers', 'Impact', sans-serif;
        font-size: 1.1rem;
        font-weight: 900;
        color: #000;
        letter-spacing: 1px;
        background: #ffd700;
        padding: 0 0.35rem;
        border: 2px solid #000;
        box-shadow: 2px 2px 0 #000;
    }

    .user-name {
        font-family: 'Comic Neue', cursive;
        font-size: 0.85rem;
        font-weight: 800;
        color: #111;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* 经验数值（无文字标签） */
    .user-exp-nums {
        display: flex;
        align-items: baseline;
        gap: 0.2rem;
        font-family: 'Bangers', 'Impact', sans-serif;
        font-size: 0.95rem;
        letter-spacing: 0.5px;
        color: #000;
    }

    .exp-cur {
        font-size: 1.05rem;
        font-weight: 900;
    }

    .exp-sep {
        font-size: 0.8rem;
        opacity: 0.5;
    }

    .exp-max {
        font-size: 0.85rem;
        opacity: 0.7;
    }

    /* 用户下拉菜单 */
    .user-widget {
        position: relative;
    }

    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 6px;
        background: #fff;
        border: 3px solid #000;
        box-shadow: 4px 4px 0 #000;
        z-index: 200;
        min-width: 110px;
    }

    .logout-btn {
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        font-family: 'Comic Neue', cursive;
        font-weight: 800;
        font-size: 0.9rem;
        color: #c00;
        background: #fff;
        border: none;
        cursor: pointer;
        text-align: center;
        transition: background 0.12s, color 0.12s;
        border-top: 2px solid #000;
    }

    .logout-btn:hover {
        background: #c00;
        color: #fff;
    }

    .dropdown-btn {
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        font-family: 'Comic Neue', cursive;
        font-weight: 800;
        font-size: 0.9rem;
        color: #000;
        background: #fff;
        border: none;
        cursor: pointer;
        text-align: center;
        transition: background 0.12s, color 0.12s;
    }

    .dropdown-btn:hover {
        background: #000;
        color: #fff;
    }

    /* 导航菜单 */
    .nav-menu ul {
        display: flex;
        list-style: none;
        gap: 0.6rem;
        margin: 0;
        padding: 0;
    }

    .nav-menu li {
        position: relative;
    }

    .nav-menu a {
        display: block;
        font-family: 'Bangers', 'Comic Neue', cursive;
        font-weight: 800;
        font-size: 1.3rem;
        text-transform: uppercase;
        text-decoration: none;
        color: #000000;
        background: #FFFFFF;
        padding: 0.6rem 1.3rem;
        border: 2.5px solid #000;
        transition: all 0.15s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        letter-spacing: 1px;
        position: relative;
        box-shadow: 3px 3px 0 #aaa;
        cursor: pointer;
    }

    /* 悬停样式 */
    .nav-menu a:hover {
        background: #000000;
        color: #FFFFFF;
        transform: scale(1.05) translateY(-3px);
        box-shadow: 6px 6px 0 #333;
        border-color: #fff;
    }

    .nav-menu a.active {
        background: #000000;
        color: #ffffff;
        border: 3px solid white;
        box-shadow: 5px 5px 0 #3a3a3a;
        position: relative;
    }

    .nav-menu a.active::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120%;
        height: 120%;
        background: repeating-radial-gradient(circle at 30% 40%, black 0px, black 2px, transparent 2px, transparent 6px);
        opacity: 0.2;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: -1;
    }

    /* 汉堡按钮 */
    .burger {
        display: none;
        flex-direction: column;
        justify-content: space-between;
        width: 44px;
        height: 34px;
        cursor: pointer;
        background: #000;
        padding: 6px 8px;
        border: 2px solid white;
        box-shadow: 4px 4px 0 #333;
        transition: 0.1s;
    }

    .burger span {
        display: block;
        height: 4px;
        width: 100%;
        background: white;
        border-radius: 0px;
        transition: 0.2s;
        border: 1px solid black;
    }

    .burger:hover {
        background: #2c2c2c;
        transform: scale(0.98);
        box-shadow: 1px 1px 0 #000;
    }

   
    @keyframes dotBlink {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
        100% { content: ""; }
    }

    /* ==================== 响应式 ==================== */

    /* ----- 手机端 (< 768px) : 汉堡菜单 + 纵向导航 ----- */
    @media (max-width: 767px) {
        .demo-wrapper {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
        }

        .burger {
            display: flex;
        }
        .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #FFFFFF;
            border-top: 4px solid black;
            border-bottom: 4px solid black;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
            z-index: 100;
            box-shadow: 0 10px 12px rgba(0,0,0,0.2);
        }
        .nav-menu.active {
            max-height: 400px;
            overflow-y: auto;
        }
        .nav-menu ul {
            flex-direction: column;
            padding: 0.6rem 0;
            gap: 0.6rem;
            align-items: center;
        }
        .nav-menu a {
            width: 80%;
            text-align: center;
            margin: 0 auto;
            font-size: 1rem;
            border-width: 3px;
            padding: 0.4rem 1.3rem;
        }
        .nav-container {
            padding: 0.4rem 0.6rem;
            flex-wrap: nowrap;
        }
        .logo {
            font-size: 1.1rem;
            padding: 0 4px;
            border-width: 2px;
            box-shadow: 3px 3px 0 #000;
            gap: 3px;
        }
        .logo span {
            font-size: 0.85rem;
            padding: 0 5px;
        }
        .logo .burst {
            font-size: 1.1rem;
        }
        .logo::after {
            display: none;
        }
        .manga-nav::before {
            left: 10px;
            width: 40px;
            height: 10px;
            top: -6px;
        }

        .user-widget {
            padding: 0.1rem 0.3rem;
            gap: 0.3rem;
        }

        .user-avatar-wrap {
            width: 30px;
            height: 30px;
        }

        .user-avatar-img {
            width: 30px;
            height: 30px;
            border-width: 2px;
        }

        .exp-arc {
            top: -2px;
            width: 120%;
            height: 60%;
        }

        .user-info {
            flex-direction: row;
            align-items: center;
            gap: 0.2rem;
        }

        .user-level {
            font-size: 0.7rem;
            padding: 0 0.2rem;
            border-width: 1.5px;
        }

        .user-name {
            font-size: 0.65rem;
            max-width: 45px;
        }

        .user-exp-nums {
            font-size: 0.65rem;
            gap: 0.1rem;
        }

        .exp-cur {
            font-size: 0.7rem;
        }

        .exp-max {
            font-size: 0.6rem;
        }

        .user-dropdown {
            right: 0;
            min-width: 80px;
        }

        .logout-btn, .dropdown-btn {
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
        }

        .manga-nav:hover {
            transform: none;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,0.2);
        }
    }

    /* ----- 平板端 (768px - 1023px) : 紧凑横向导航 ----- */
    @media (min-width: 768px) and (max-width: 1023px) {
        .burger {
            display: none;
        }
        .nav-menu {
            position: static;
            max-height: none;
            border: none;
            background: transparent;
            overflow: visible;
        }
        .nav-menu ul {
            flex-direction: row;
            gap: 0.3rem;
        }
        .nav-menu a {
            font-size: 0.85rem;
            padding: 0.4rem 0.8rem;
            border-width: 2px;
            box-shadow: 2px 2px 0 #aaa;
        }
        .nav-menu a:hover {
            box-shadow: 4px 4px 0 #333;
        }
        .nav-menu a.active {
            box-shadow: 3px 3px 0 #3a3a3a;
        }
        .nav-container {
            padding: 0.6rem 1.2rem;
        }
        .logo {
            font-size: 1.5rem;
        }
        .logo span {
            font-size: 1.1rem;
        }
    }

    /* ----- PC端 (>= 1024px) : 完整横向导航 ----- */
    @media (min-width: 1024px) {
        .burger {
            display: none;
        }
        .nav-menu {
            position: static;
            max-height: none;
            border: none;
            background: transparent;
            overflow: visible;
        }
        .nav-menu ul {
            flex-direction: row;
        }
    }
</style>