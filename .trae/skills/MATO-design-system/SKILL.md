---
name: "MATO-design-system"
description: "MATO 前端学习网站专属 UI 设计系统，基于黑白漫画/美式卡通风格。触发词：做页面、设计组件、加按钮、做卡片、MATO 风格、漫画风格、卡通风格、UI 组件、页面布局。"
---

# MATO Design System

本技能定义了 MATO（码途）网站的完整 UI 设计系统。MATO 是一个前端学习平台，整体视觉风格为**黑白漫画/美式卡通（Comic/Manga Aesthetic）**，结合粗黑边框、硬阴影、网点纹理、动态拟声词等漫画元素，营造趣味、活力、沉浸的学习体验。

---

## 1. 何时使用

当用户做出以下任何请求时，**必须遵循此设计系统的规则**来构建 UI 组件、页面或样式：

- 新建页面、修改页面布局或添加新组件
- 添加按钮、卡片、面板、表单、标签、弹窗等 UI 元素
- 提及"MATO 风格"、"漫画风格"、"卡通风格"、"和现有风格一致"
- 任何 UI/UX 设计相关决策

---

## 2. 核心设计原则

1. **硬朗几何**：所有边框均为实心黑色（无圆角或极少圆角），阴影为无模糊的硬 offset。
2. **双层阴影**：元素底部使用 2 层 box-shadow 模拟漫画分镜的立体感。
3. **网点纹理**：大量使用 `radial-gradient(circle, ...)` 的 halftone dot 效果模拟日式漫画网点纸。
4. **动态反馈**：悬停/点击有"被按下"的物理感（translate + box-shadow 缩小），而非柔和过渡。
5. **微旋转**：卡片、标签、徽章等元素带有 0.5~3 度的细微旋转，模拟手工拼贴的不完美感。
6. **拟声词装饰**：页面背景常有 GO!、WOW、POW、LEVEL UP! 等漫画拟声词作为低透明度水印。
7. **响应式三档**：移动端 (<768px) / 平板 (768-1023px) / 桌面 (≥1024px)。

---

## 3. 色彩系统

```css
:root {
    --comic-black: #0a0a0a;   /* 主黑色 */
    --comic-white: #f8f8f8;   /* 主白色（漫画纸色） */
    --comic-gray:  #333;      /* 深灰（正文） */
    --accent:      #000;      /* 强调色（可换为 #c00 做红色点缀） */
}
```

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 页面背景 | `#f5f5f5` | 浅灰底，模拟旧漫画纸质感 |
| 纯白面板 | `#ffffff` | 卡片、面板主背景 |
| 漫画白面板 | `#f8f8f8` | 带网点纹理的面板背景 |
| 黑色块 | `#000000` / `#0a0a0a` | 按钮主色、标题色 |
| 黄色点缀 | `#ffd700` | 星星、徽章中的金色 |
| 红色强调 | `#c00` | 危险按钮/强调色 |
| 文字色 | `#333` / `#555` / `#888` | 各级文字深浅 |
| 绿色点缀 | `#4ecdc4` | 偶尔用于彩色装饰 |
| 珊瑚色点缀 | `#ff6b6b` | 偶尔用于彩色装饰 |

---

## 4. 字体系统

| 用途 | 字体栈 | 特征 |
|------|--------|------|
| **主标题/LOGO** | `'Bangers', 'Impact', 'Arial Black', sans-serif` | 全大写、粗体、`letter-spacing: -2px~3px`、text-shadow 硬阴影 |
| **导航/按钮/标签** | `'Bangers', 'Impact', sans-serif` | 全大写、`font-weight: 900`、`letter-spacing: 1-2px` |
| **正文/描述** | `'Comic Neue', cursive` | 手写感、`font-weight: 700-800` |
| **学习内容/代码** | `-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif` | 可读性优先，覆盖漫画字体 |

### 漫画字效（标题用）
```css
.comic-title {
    font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
    color: var(--comic-white);
    -webkit-text-stroke: 4px #000;    /* 黑色描边 */
    text-stroke: 4px #000;
    paint-order: stroke fill;
    text-shadow:
        6px 6px 0 var(--comic-black),
        8px 8px 0 rgba(0, 0, 0, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

---

## 5. 边框与阴影系统

### 标准边框
```css
border: 3px solid #000;      /* 常规 */
border: 4px solid #000;      /* 面板级 */
border: 5px solid #000;      /* 弹窗级 */
```

### 阴影规范
```css
/* 小元素（标签、徽章） */
box-shadow: 2px 2px 0 #aaa;
/* 标准卡片 */
box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.2);
/* 大面板/弹窗 */
box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
/* 登录弹窗（双层阴影） */
box-shadow: 16px 16px 0 rgba(0, 0, 0, 0.7);
```

**关键规则**：阴影 `blur-radius` 始终为 `0`，使用 `spread-radius` 为 0 的纯 offset 实现硬阴影。

---

## 6. 组件库

### 6.1 按钮 `.comic-btn`

```html
<button class="comic-btn">按 钮 文 字</button>
```

```css
.comic-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2.2rem;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #fff;
    background: #000;
    border: 3px solid #fff;
    box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000;
    transition: all 0.1s ease;
    cursor: pointer;
    min-width: 160px;
}

.comic-btn:hover {
    transform: translate(2px, 2px);
    box-shadow: 4px 4px 0 #fff, 6px 6px 0 #000;
    background: #1a1a1a;
}

.comic-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 2px 2px 0 #fff, 3px 3px 0 #000;
    background: #333;
}
```

**变体**：
- `.comic-btn.white` — 白底黑字反色按钮
- `.comic-btn.small` — 小号按钮 (padding: 0.7rem 1.2rem)
- `.comic-btn.danger` — 红色危险按钮 (background: #c00)

### 6.2 面板 `.comic-panel`

```html
<div class="comic-panel">内容</div>
```

```css
.comic-panel {
    background: var(--comic-white);
    color: var(--comic-black);
    border: 4px solid #000;
    box-shadow: 8px 8px 0 #000;
    padding: 20px;
    margin: 30px auto;
    max-width: 900px;
    position: relative;
    overflow: hidden;
}

/* 网点纹理叠加层（面板必须） */
.comic-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.08) 41%);
    pointer-events: none;
    opacity: 0.6;
}
```

### 6.3 相框 `.comic-frame`

```html
<div class="comic-frame">
    <img src="..." alt="">
</div>
```

```css
.comic-frame {
    position: relative;
    background: var(--comic-white);
    padding: 1.2rem;
    margin: 2rem auto;
    max-width: 100%;
    border: 8px solid var(--comic-black);
    box-shadow: 8px 8px 0 var(--comic-black), 10px 10px 0 rgba(0,0,0,0.3);
    overflow: hidden;
    display: inline-block;
}

/* 内层白边 */
.comic-frame::before {
    content: '';
    position: absolute;
    inset: 5px;
    border: 3px solid var(--comic-black);
    pointer-events: none;
}

/* 网点纹理 */
.comic-frame::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, transparent 45%, rgba(0,0,0,0.06) 46%);
    pointer-events: none;
    z-index: 1;
}

.comic-frame img {
    width: 100%;
    height: auto;
    display: block;
    border: 4px solid var(--comic-black);
    box-shadow: 4px 4px 0 var(--comic-black);
}

.comic-frame:hover {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px 0 var(--comic-black), 12px 12px 0 rgba(0,0,0,0.25);
    transition: all 0.3s ease;
}
```

### 6.4 漫画列表项 `li.comic-li`

```css
li.comic-li {
    font-size: clamp(1rem, 1.2vw, 1.4rem);
    font-weight: 900;
    font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
    color: #ffffff;
    -webkit-text-fill-color: #ffffff;
    -webkit-text-stroke: clamp(1px, 0.1vw, 2.2px) #000;
    paint-order: stroke fill;
    text-shadow: 3px 3px 0 #000, 5px 5px 0 rgba(0,0,0,0.7);
    cursor: pointer;
}

li.comic-li:hover {
    transform: scale(1.12) rotate(-3deg) translateY(-4px);
}
```

### 6.5 徽章/标签

```css
/* 标准徽章 — 黑底白字 + 微旋转 */
.badge {
    display: inline-block;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 0.95rem;
    letter-spacing: 3px;
    color: var(--comic-white);
    background: var(--comic-black);
    padding: 0.3rem 1.2rem;
    border: 2px solid var(--comic-white);
    box-shadow: 3px 3px 0 #555;
    transform: rotate(-1deg);
}

/* 功能标签 — 白底黑字 + 悬停反转 */
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
}

.feature-tag:hover {
    transform: rotate(1deg) translateY(-2px);
    box-shadow: 4px 4px 0 #555;
    background: var(--comic-black);
    color: var(--comic-white);
}
```

### 6.6 表单输入框

```css
.form-input {
    width: 100%;
    min-height: 52px;
    padding: 0.8rem 1rem;
    border: 3px solid #000;
    background: #fff;
    color: #111;
    font-weight: 800;
    outline: none;
    box-shadow: 4px 4px 0 #c9c9c9;
    transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.form-input:focus {
    background: #f7f7f7;
    box-shadow: 6px 6px 0 #000;
    transform: translateY(-2px);
}
```

### 6.7 开关切换

```css
.toggle-group {
    display: inline-grid;
    grid-template-columns: repeat(2, 1fr);
    border: 3px solid #000;
    box-shadow: 5px 5px 0 #000;
    background: #fff;
    overflow: hidden;
}

.toggle-group button {
    padding: 0.65rem 0.85rem;
    border: 0;
    background: #fff;
    color: #000;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-size: 1.05rem;
    cursor: pointer;
}

.toggle-group button + button {
    border-left: 3px solid #000;
}

.toggle-group button.active {
    background: #000;
    color: #fff;
}
```

### 6.8 技能/闯关卡片

```css
.skill-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.4rem 1.6rem;
    background: #fff;
    border: 3px solid var(--comic-black);
    box-shadow: 5px 5px 0 rgba(0,0,0,0.18);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    transform: rotate(-1deg); /* 不规则排列 */
}

.skill-card:hover {
    transform: translateY(-4px) rotate(0deg) !important;
    box-shadow: 8px 8px 0 rgba(0,0,0,0.22);
}
```

### 6.9 加载过渡动画

```html
<div class="comic-loading-overlay">
    <div>
        <span class="comic-loading-text">LOADING</span>
        <span class="comic-loading-dots"></span>
    </div>
</div>
```

```css
.comic-loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255,255,255,0.98);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.comic-loading-text {
    font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
    font-size: clamp(4rem, 12vw, 9rem);
    font-weight: 600;
    color: var(--comic-black);
    -webkit-text-stroke: 4px var(--comic-white);
    paint-order: stroke fill;
    text-shadow: 6px 6px 0 var(--comic-black);
    text-transform: uppercase;
}
```

---

## 7. 视觉装饰元素

### 7.1 网点纹理（Halftone Dots）

```css
/* 全局背景网点 */
body {
    background: #f5f5f5;
    background-image: radial-gradient(circle at 30% 40%, rgba(0,0,0,0.08) 1.5px, transparent 1.5px);
    background-size: 18px 18px;
}

/* 大面板网点叠加 */
.panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.08) 41%);
    pointer-events: none;
    opacity: 0.6;
}
```

### 7.2 漫画拟声词（SFX）

```html
<span class="bg-sfx bg-sfx--1">GO!</span>
<span class="bg-sfx--2">WOW</span>
<span class="bg-sfx--3">LEVEL UP!</span>
```

```css
.bg-sfx {
    position: absolute;
    font-family: 'Bangers', 'Impact', sans-serif;
    font-weight: 900;
    color: var(--comic-black);
    -webkit-text-stroke: 1px var(--comic-white);
    paint-order: stroke fill;
    opacity: 0.08;
    pointer-events: none;
}

.bg-sfx--1 {
    font-size: 6rem;
    top: 4%;
    left: -2%;
    transform: rotate(-12deg);
}
```

### 7.3 速度线

```css
/* 45度条纹速度线 */
.speed-lines {
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,255,255,0.1) 10px,
        rgba(255,255,255,0.1) 20px
    );
}

/* -45度条纹速度线 */
.speed-lines-reverse {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 8px,
        rgba(0,0,0,0.04) 8px,
        rgba(0,0,0,0.04) 16px
    );
}
```

### 7.4 胶带装饰

```css
.panel-tape {
    position: absolute;
    z-index: 2;
    width: 70px;
    height: 18px;
    background: #f0f0f0;
    border: 2px solid var(--comic-black);
    box-shadow: -2px 2px rgba(0,0,0,0.3);
}

.panel-tape--left {
    top: -6px;
    left: 28px;
    transform: skew(-12deg);
}

.panel-tape--right {
    top: -6px;
    right: 28px;
    transform: skew(12deg);
}
```

### 7.5 折角效果

```css
.fold-corner::before {
    content: '';
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
```

---

## 8. 动画规范

### 8.1 GSAP 滚动动画（页面入场）

MATO 项目使用 GSAP + ScrollTrigger 实现滚动入场动画：

```js
// 在 App.vue 中全局注册
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// 典型用法：元素从下方淡入
gsap.fromTo('.target',
    { opacity: 0, y: 50, scale: 0.95 },
    {
        opacity: 1, y: 0, scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.target',
            start: 'top 85%',
            toggleActions: 'play none none none',
        }
    }
)
```

### 8.2 Vue Transition

```css
/* 弹窗入场 */
.popup-enter-active { transition: opacity 0.26s ease; }
.popup-leave-active { transition: opacity 0.26s ease; }
.popup-enter-from, .popup-leave-to { opacity: 0; }
.popup-enter-from .dialog { transform: translateY(28px) scale(0.97); }
.popup-leave-to .dialog { opacity: 0; transform: translateY(28px) scale(0.97); }

/* 表单切换 */
.swap-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.swap-enter-from { opacity: 0; transform: translateX(18px); }
.swap-leave-to { opacity: 0; transform: translateX(-18px); }
```

### 8.3 CSS 关键帧动画

```css
/* 星星闪烁 */
@keyframes starPulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.3); }
}

/* 弹跳 */
@keyframes docBounce {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
}

/* 导航栏隐藏/显示 */
/* 使用 GSAP: gsap.to(el, { yPercent: -100, duration: 0.5, ease: 'back.in' }) */
/* 恢复: gsap.to(el, { yPercent: 0, duration: 0.5, ease: 'back.out' }) */
```

---

## 9. 布局规范

### 内容区布局
```css
.content-area {
    width: 96%;
    max-width: 1300px;
    margin: 120px auto 0;  /* 顶部留出 tabbar 空间 */
    min-height: 100vh;
}
```

### 响应式断点

| 断点 | 范围 | 布局特点 |
|------|------|----------|
| 手机 | `max-width: 767px` | 单列、汉堡菜单、`margin-top: 90px`、`width: 94%` |
| 平板 | `768px - 1023px` | 紧凑布局、`margin-top: 100px`、`width: 94%` |
| 桌面 | `min-width: 1024px` | 完整布局、横向导航、`margin-top: 120px`、`width: 96%` |

### Tabbar 导航栏
- `position: fixed; top: 0; z-index: 9999; width: 100%`
- 向下滚动时隐藏（GSAP `yPercent: -100`），向上滚动时显示（GSAP `yPercent: 0`）
- 导航项悬停：`background: #000; color: #fff; transform: scale(1.05) translateY(-3px)`

### 弹窗/遮罩
```css
.overlay {
    position: fixed;
    inset: 0;
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 网点纹理 + 半透明渐变 */
    background:
        linear-gradient(135deg, rgba(10,10,10,0.88), rgba(245,245,245,0.55)),
        radial-gradient(circle at 30% 40%, rgba(255,255,255,0.16) 1.5px, transparent 1.5px);
    background-size: auto, 18px 18px;
    backdrop-filter: blur(8px);
}
```

**弹窗打开时必须锁定 body 滚动**：
```js
document.body.style.overflow = 'hidden'   // 打开时
document.body.style.overflow = ''         // 关闭时（及 onUnmounted 保底恢复）
```

---

## 10. 常见模式速查

### 新建页面的标准模板

```vue
<template>
  <div class="new-page">
    <!-- 背景拟声词装饰 -->
    <div class="page-bg" aria-hidden="true">
      <span class="bg-sfx bg-sfx--1">TITLE!</span>
    </div>

    <div class="page-inner">
      <!-- 页面头部徽章 + 标题 + 描述 -->
      <header class="page-header">
        <span class="header-badge">★ SECTION ★</span>
        <h1 class="page-title">页面标题</h1>
        <p class="page-desc">页面描述文字</p>
      </header>

      <!-- 主内容面板 -->
      <section class="track-panel">
        <!-- 胶带装饰 -->
        <div class="panel-tape panel-tape--left"></div>
        <div class="panel-tape panel-tape--right"></div>
        <!-- 内容 -->
      </section>

      <footer class="page-footer">
        <p class="footer-tip">页脚文字</p>
      </footer>
    </div>
  </div>
</template>
```

### 最小化设计检查清单

在提交任何 UI 代码前，确认以下事项：
- [ ] 所有按钮使用 `.comic-btn` 类或其变体
- [ ] 所有面板使用 `border: 4px solid #000` + `box-shadow: 8px 8px 0 rgba(0,0,0,0.2)`
- [ ] 阴影 blur-radius 始终为 0（硬阴影）
- [ ] 标题/徽章使用 `'Bangers', 'Impact'` 字体族
- [ ] 正文使用 `'Comic Neue', cursive` 字体族
- [ ] 学习内容区使用系统字体覆盖漫画字体
- [ ] 悬停效果为"物理位移"而非柔和过渡
- [ ] 微旋转应用于静态元素（卡片、标签、徽章）
- [ ] 面板 `.comic-panel` 包含 `::after` 网点纹理叠加
- [ ] 弹窗/遮罩打开时 `body { overflow: hidden }`
- [ ] 响应式三档均已覆盖