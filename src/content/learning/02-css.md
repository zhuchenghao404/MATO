# CSS 教程

CSS（Cascading Style Sheets，层叠样式表）用于控制网页的**外观与布局**。HTML 负责结构，CSS 负责样式，两者配合才能呈现美观的页面。

> **样式表**：一组 CSS 规则的集合。**层叠**：多条规则作用于同一元素时，按优先级决定最终效果。

---

## CSS 基础

### CSS 的编写位置

| 方式 | 写法 | 特点 |
|------|------|------|
| 行内样式 | `<p style="color: red;">` | 优先级最高，不利于维护，不推荐 |
| 内部样式表 | `<style>` 写在 `<head>` 中 | 适合单页小项目 |
| 外部样式表 | `<link rel="stylesheet" href="style.css">` | **推荐**，样式与结构分离，可复用 |

```html
<head>
  <link rel="stylesheet" href="./css/style.css">
</head>
```

### 语法规范

一条 CSS 规则由**选择器**和**声明块**组成：

```css
选择器 {
  属性名: 属性值;
}
```

**示例**：

```css
h1 {
  color: blue;
  font-size: 24px;
}
```

- 每条声明以分号 `;` 结束
- 属性名与值之间用冒号 `: ` 分隔
- 注释写法：`/* 这是注释 */`

### 优先级（初步认识）

1. **!important** > 行内样式 > ID > 类/伪类/属性 > 元素/伪元素
2. 优先级相同时，**后写的覆盖先写的**

```css
p { color: red; }
.text { color: blue; }    /* 类选择器胜出 */
#title { color: green; }  /* ID 选择器胜出 */
```

---

## CSS 选择器

选择器决定样式**作用在哪些元素上**，是 CSS 的核心。

### 基本选择器

| 选择器 | 示例 | 说明 |
|--------|------|------|
| 通配 | `* { margin: 0; }` | 选中所有元素 |
| 元素 | `p { color: red; }` | 按标签名选择 |
| 类 | `.box { width: 100px; }` | 可复用，最常用 |
| ID | `#header { height: 60px; }` | 页面中应唯一 |
| 分组 | `h1, h2 { font-weight: bold; }` | 多选择器共享声明 |

### 复合选择器

| 选择器 | 示例 | 含义 |
|--------|------|------|
| 交集 | `p.text { }` | 同时满足 p 且 class 为 text |
| 后代 | `div p { }` | div 内部所有 p |
| 子代 | `div > p { }` | div 的直接子元素 p |
| 相邻兄弟 | `h1 + p { }` | 紧跟 h1 后的第一个 p |
| 通用兄弟 | `h1 ~ p { }` | h1 后面所有同级 p |

```css
.nav li a { color: #666; }       /* 后代 */
.menu > li { list-style: none; } /* 子代 */
h2 + p { margin-top: 0; }        /* 相邻兄弟 */
```

### 属性选择器

```css
input[type="text"] { border: 1px solid #ccc; }
a[href^="https"] { color: green; }   /* 以 https 开头 */
a[href$=".pdf"] { color: red; }      /* 以 .pdf 结尾 */
[class*="btn"] { cursor: pointer; } /* 包含 btn */
```

### 伪类选择器

伪类描述元素的**特殊状态**：

| 伪类 | 说明 |
|------|------|
| `:link` / `:visited` | 未访问 / 已访问链接 |
| `:hover` / `:active` | 悬停 / 按下 |
| `:focus` | 获得焦点 |
| `:first-child` / `:last-child` | 第一个 / 最后一个子元素 |
| `:nth-child(n)` | 第 n 个子元素，如 `even`、`2n+1` |
| `:not()` | 排除匹配项 |

```css
a:hover { text-decoration: underline; }
li:nth-child(2n+1) { background: #f5f5f5; }
input:focus { outline: 2px solid #409eff; }
```

### 伪元素选择器

伪元素在页面上**创建虚拟元素**：

| 伪元素 | 说明 |
|--------|------|
| `::before` / `::after` | 内容前 / 后插入 |
| `::first-letter` / `::first-line` | 首字母 / 首行 |
| `::selection` | 用户选中的文字 |

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

> CSS3 推荐伪元素用双冒号 `::`，伪类用单冒号 `:`。

### 优先级计算

用 **(a, b, c, d)** 四组数字衡量（从左到右比较）：

| 来源 | 计入 |
|------|------|
| 行内样式 | a = 1 |
| ID 选择器 | b + 1 |
| 类、属性、伪类 | c + 1 |
| 元素、伪元素 | d + 1 |

```css
#nav .item li { color: red; }  /* (0,1,1,1) 胜出 */
.nav .item li { color: blue; } /* (0,0,2,1) */
```

---

## CSS 三大特征

### 层叠性（Cascade）

相同或不同选择器对同一元素设置相同属性时，**后写的覆盖先写的**（优先级相同时）。

### 继承性（Inheritance）

子元素会**继承**父元素的某些样式：`color`、`font-family`、`font-size`、`line-height` 等。

**不可继承**：`width`、`height`、`margin`、`padding`、`border`、`background` 等。

```css
body { color: #333; font-size: 16px; }
.box { color: inherit; } /* 强制继承 */
```

### 优先级（Specificity）

三大特征共同决定最终样式：**继承 < 层叠 < 优先级**。

---

## CSS 常用属性

### 像素与颜色

**像素（px）** 是绝对长度单位。颜色表示方式：

| 方式 | 示例 |
|------|------|
| 关键字 | `red`、`transparent` |
| RGB / RGBA | `rgb(255,0,0)` / `rgba(255,0,0,0.5)` |
| 十六进制 | `#ff0000` / `#f00` |
| HSL | `hsl(0, 100%, 50%)` |

### 字体与文本

```css
body {
  font: 16px/1.6 "Microsoft YaHei", Arial, sans-serif;
  color: #333;
  text-align: center;
  text-decoration: none;
  text-indent: 2em;
  letter-spacing: 1px;
  white-space: nowrap;
  text-overflow: ellipsis; /* 配合 overflow:hidden */
}
```

### 列表、表格、背景、鼠标

```css
ul { list-style: none; }

table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 8px; }

.hero {
  background: #eee url("bg.jpg") no-repeat center/cover;
}

a { cursor: pointer; }
.disabled { cursor: not-allowed; }
```

---

## 盒子模型

每个 HTML 元素都是一个**矩形盒子**：content → padding → border → margin。

### 长度单位

| 单位 | 说明 |
|------|------|
| px | 绝对像素 |
| em | 相对当前元素 font-size |
| rem | 相对根元素 font-size |
| % | 相对父元素对应属性 |

### display 显示模式

| 值 | 特点 |
|----|------|
| block | 独占一行，可设宽高 |
| inline | 不换行，宽高由内容决定 |
| inline-block | 行内排列，可设宽高 |
| none | 不显示，不占空间 |

### margin / padding / border

```css
.box {
  width: 200px;
  padding: 10px 20px;
  border: 2px solid #409eff;
  margin: 0 auto;       /* 水平居中块级元素 */
  border-radius: 8px;
}
```

### 塌陷、合并与溢出

- **塌陷**：父元素与子元素上外边距重叠 → 父元素加 `overflow: hidden` 或 `padding-top`
- **合并**：相邻兄弟上下 margin 取较大值，非相加
- **溢出**：`overflow: hidden / auto / scroll`

```css
.ellipsis {
  width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

### 空白间隙问题

inline-block 元素间的 HTML 换行会产生间隙。解决：`父 font-size:0` 或改用 `flex`。

---

## 浮动

`float` 让元素**脱离普通文档流**，向左或向右贴靠，行内元素会环绕它。

```css
.img-left { float: left; width: 200px; margin-right: 16px; }
```

**影响**：父元素高度塌陷；后续元素可能被覆盖。

**清除浮动**（推荐伪元素法）：

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

也可给父元素 `overflow: hidden` 或 `display: flow-root` 触发 BFC。

> 现代布局更推荐 **Flexbox / Grid** 替代浮动排版。

---

## 定位

| 值 | 说明 |
|----|------|
| static | 默认，按文档流排列 |
| relative | 相对自身原位置偏移，原空间保留 |
| absolute | 相对**最近已定位祖先**偏移，脱离文档流 |
| fixed | 相对视口固定 |
| sticky | 滚动到阈值前像 relative，之后像 fixed |

```css
.parent { position: relative; }
.child { position: absolute; top: 0; right: 0; }

.fixed-header {
  position: fixed; top: 0; width: 100%; z-index: 100;
}
```

**z-index**：仅对非 static 元素生效，数值越大越靠前。

**居中技巧**：

```css
/* 水平居中 */
.center { width: 300px; margin: 0 auto; }

/* 绝对定位居中 */
.box {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

/* Flex 居中（推荐） */
.parent { display: flex; justify-content: center; align-items: center; }
```

---

## 布局

### 版心

**版心**是页面主要内容区域的固定宽度，通常居中显示：

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
```

### Normalize.css

不同浏览器对 HTML 有**默认样式差异**。Normalize.css 保留有用默认值、修正浏览器 bug，比暴力清零的 Reset CSS 更温和：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css/normalize.css">
```

---

## CSS3

CSS3 引入大量新特性，旧浏览器可能需要**私有前缀**（`-webkit-`、`-moz-`、`-ms-`、`-o-`）。现代开发可借助 Autoprefixer 自动处理。

### box-sizing / 阴影 / 透明度

```css
* { box-sizing: border-box; } /* 宽高含 padding 和 border */

.card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  border-radius: 12px;
}
```

### 背景、边框、文本

```css
.banner {
  background-size: cover;
  background-clip: padding-box;
  border-image: url(border.png) 30 round;
}
.title {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  word-break: break-all;
}
```

### 渐变与 Web 字体

```css
.gradient {
  background: linear-gradient(to right, #667eea, #764ba2);
  background: radial-gradient(circle, #fff, #409eff);
}

@font-face {
  font-family: "MyFont";
  src: url("myfont.woff2") format("woff2");
}
```

### 2D / 3D 变换

```css
.transform-2d {
  transform: translate(50px, 20px) rotate(45deg) scale(1.2);
  transform-origin: center center;
}

.scene { perspective: 800px; }
.card-3d {
  transform: rotateY(45deg);
  transform-style: preserve-3d;
}
```

### 过渡与动画

```css
.btn {
  transition: background 0.3s ease, transform 0.2s;
}
.btn:hover { transform: scale(1.05); }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-20px); }
}
.ball { animation: bounce 1s ease-in-out infinite; }
/* animation: name duration timing-function delay iteration-count direction fill-mode */
```

### 多列布局

```css
.article {
  column-count: 3;
  column-gap: 30px;
  column-rule: 1px solid #ddd;
}
```

---

## 小结

CSS 让网页从「纯结构」变为「有设计感的界面」。掌握**选择器、三大特征、盒子模型**是基础；**Flex / Grid** 已逐步取代浮动；**CSS3** 提供阴影、渐变、变换、动画等丰富效果。

建议学习路径：基础语法 → 选择器与优先级 → 盒模型 → 定位 → Flexbox/Grid → CSS3 动画与响应式。
