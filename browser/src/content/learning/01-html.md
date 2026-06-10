# HTML 教程

HTML（HyperText Markup Language）即超文本标记语言，是 Web 开发的三大核心技术之一（与 CSS、JavaScript 并列）。

> **超文本**：内容比普通文本更丰富。**标记**：通过标签符号描述结构。**语言**：标签的写法、读音与使用规则构成标记语言。

---

## HTML 简介

### 什么是 HTML？

HTML 通过**标签（tags）**定义网页的结构和内容。浏览器读取 HTML 文档，解析后渲染成用户可见的页面。

### HTML 基础结构

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>网页标题</title>
</head>
<body>
  <h1>我的第一个网页</h1>
  <p>这是一个段落。</p>
</body>
</html>
```

| 标签 | 含义 |
|------|------|
| `<!DOCTYPE html>` | 声明文档类型为 HTML5 |
| `<html>` | 根元素，包裹整个页面 |
| `<head>` | 存放元数据（标题、字符集、CSS 链接等） |
| `<meta charset="UTF-8">` | 设置字符编码，支持中文 |
| `<title>` | 浏览器标签页标题 |
| `<body>` | 所有可见内容 |

### HTML5 语义标签

HTML5 新增语义标签，提升可读性和 SEO：

```html
<header>页眉</header>
<nav>导航栏</nav>
<main>主要内容</main>
<article>独立内容</article>
<section>区域块</section>
<footer>页脚</footer>
```

---

## HTML 标签

HTML 标签分为**单标签**和**双标签**：

- **单标签**：`<标签名/>`（`/` 可省略）
- **双标签**：`<标签名>标签体</标签名>`

**标签属性**可以给标签添加附加信息，如 `id`、`class`、`style` 等。

---

## HTML4 标签认知

### 排版标签

| 标签名 | 标签含义 | 类型 |
|--------|----------|------|
| h1-h6 | 标题 | 双标签 |
| p | 段落 | 双标签 |
| div | 无含义，纯排版盒子 | 双标签 |

### 语义化标签

| 标签名 | 标签含义 | 类型 |
|--------|----------|------|
| em | 重要的阅读内容 | 双标签 |
| strong | 十分重要，比 em 更重要 | 双标签 |
| span | 无语义，包裹短语 | 双标签 |

> 标签的形式可通过 CSS 调节，但**语义很重要**——代码清晰、SEO 优化、方便设备解析。

### 块级元素与行内元素

- **块级元素**：单独占一行；可包含块级和行内元素
- **行内元素**：不独占一行；可包含行内元素，不可包含块级元素

### 文本标签

`span` 是小型的 `div`，用于包裹短语。

### 图片标签

标签名 `<img/>`，单标签。

| 属性 | 说明 |
|------|------|
| src | 图片路径 |
| alt | 无法加载时的描述 |
| width / height | 宽高 |

### 超链接

标签名 `<a></a>`，双标签。

| 属性 | 说明 |
|------|------|
| href | 跳转地址 |
| target | `_self` 本窗口 / `_blank` 新窗口 |
| id / name | 锚点标识 |

```html
<!-- 唤起设备应用 -->
<a href="tel:10010">电话联系</a>
<a href="mailto:10010@qq.com">邮件联系</a>
<a href="sms:10086">短信联系</a>
```

### 列表

- **有序列表**：`<ol><li></li></ol>`
- **无序列表**：`<ul><li></li></ul>`
- **自定义列表**：`dl` + `dt`（术语）+ `dd`（解释）

```html
<h2>如何高效的学习？</h2>
<dl>
  <dt>做好笔记</dt>
  <dd>笔记是我们以后复习的一个抓手</dd>
  <dt>多加练习</dt>
  <dd>只有敲出来的代码，才是自己的</dd>
  <dt>别怕出错</dt>
  <dd>错很正常，改正后并记住，就是经验</dd>
</dl>
```

### 表格

| 标签名 | 含义 |
|--------|------|
| table | 表格 |
| caption | 表格标题 |
| thead / tbody / tfoot | 头部 / 主体 / 脚注 |
| tr | 一行 |
| th / td | 表头单元格 / 数据单元格 |

**常用属性**：`cellspacing`（单元格间距）、`cellpadding`（内容与边框间距）、`colspan` / `rowspan`（合并列/行）。

### 常用标签补充

| 标签 | 含义 | 类型 |
|------|------|------|
| br | 换行 | 单标签 |
| hr | 分割线 | 单标签 |
| pre | 按原文显示 | 双标签 |

### 表单

表单供用户交互，用于收集数据。除文本输入框外，控件都应有 `name` 和 `value`。

**input 的 type 属性值**：

| 值 | 说明 |
|----|------|
| text | 文本 |
| password | 密码 |
| radio | 单选框 |
| checkbox | 复选框 |
| hidden | 隐藏域 |
| submit / reset / button | 提交 / 重置 / 普通按钮 |

**文本域** `<textarea>`：用 `rows`、`cols` 控制默认行列，不能写 `type` 属性。

**下拉框**：

```html
<select name="from">
  <option value="黑">黑龙江</option>
  <option value="辽">辽宁</option>
  <option value="粤" selected>广东</option>
</select>
```

> 若 option 未设置 value，默认提交 option 中间的文字，性能较差。`selected` 为默认选中项。

**label 标签**：与表单控件关联，点击文字即可聚焦。

1. `label` 的 `for` 等于控件的 `id`
2. 把控件套在 `label` 里面

### 框架标签

`<iframe>` 用于嵌入其他页面（了解即可）。

### HTML 全局属性

常见：`id`、`class`、`style`、`title`、`lang` 等。

### meta 元信息

```html
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="keywords" content="关键词,逗号分隔">
<meta name="description" content="80字以内网站描述">
<meta name="author" content="作者">
<meta http-equiv="refresh" content="10;url=http://www.baidu.com">
```

---

## HTML5

> IE 9+ 才支持 HTML5，且 IE9 仅支持部分新特性。

### 新增布局标签

| 标签 | 含义 |
|------|------|
| header | 页眉 |
| footer | 页脚 |
| nav | 导航 |
| article | 文章、帖子、新闻等 |
| section | 文档中的某段文字 |
| aside | 侧边栏 |
| main | 主要内容（几乎不用） |

**article 与 section**：article 强调独立性（如一本小说），section 强调分段（如章节）。

### 新增状态标签

**meter** — 标量测量：

```html
<meter value="10" min="0" max="100" low="20" high="80" optimum="100"></meter>
```

**progress** — 进度指示器：

```html
<progress value="60" max="100"></progress>
```

### 新增列表标签

```html
<input type="text" list="mydata">
<datalist id="mydata">
  <option value="周冬雨"></option>
  <option value="周杰伦"></option>
</datalist>

<details>
  <summary>如何走上人生巅峰？</summary>
  <p>一步一步走呗</p>
</details>
```

### 新增文本标签

**文本注音**：

```html
<ruby>你好<rt>こんにちは</rt></ruby>
```

**mark** — 标记搜索结果关键字。

### 新增表单功能

**表单控件新属性**：

| 属性 | 功能 |
|------|------|
| placeholder | 输入提示 |
| required | 必填 |
| autofocus | 自动聚焦 |
| autocomplete | 自动完成 on/off |
| pattern | 正则验证 |

**input 新 type**：

| 值 | 功能 |
|----|------|
| email / url | 格式验证 |
| number / tel / search | 数字 / 电话 / 搜索 |
| range / color | 范围 / 颜色选择 |
| date / month / week / time | 日期时间选择 |

**form 新属性**：`novalidate` — 提交时不验证。

---

## 新增多媒体标签

### 视频 video

```html
<video src="video.mp4" controls width="640" height="360"
       poster="cover.jpg" preload="auto" muted loop>
</video>
```

| 属性 | 说明 |
|------|------|
| src | 视频地址 |
| controls | 显示控制条 |
| autoplay | 自动播放（通常需 muted） |
| poster | 封面图 |
| preload | none / metadata / auto |

### 音频 audio

属性与 video 类似：`src`、`controls`、`muted`、`autoplay`、`loop`、`preload`。

---

## 小结

HTML 负责**结构**，语义化标签让代码更易读、更利于 SEO。配合 CSS 做样式、JavaScript 做交互，构成完整的前端页面。
