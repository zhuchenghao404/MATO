# Flexbox 与 CSS Grid 教程

Flexbox 和 CSS Grid 是现代 CSS 布局的两大核心方案。

> **Flexbox**：一维布局，沿主轴排列子项。**Grid**：二维布局，同时控制行与列。

---

## 1. Flex vs Grid 区别（一维 vs 二维）

| 特性 | Flexbox | CSS Grid |
|------|---------|----------|
| 维度 | 一维（行 **或** 列） | 二维（行 **和** 列） |
| 适用场景 | 导航栏、工具栏、卡片内对齐 | 页面骨架、复杂网格 |
| 空间模型 | 内容驱动，再分配剩余空间 | 先定义轨道，再放入内容 |

**选择原则**：单行/列分配 → Flex；同时控制行列 → Grid。实践中常组合：外层 Grid 定骨架，内层 Flex 做局部对齐。

```css
.nav    { display: flex; gap: 1rem; }
.layout { display: grid; grid-template-columns: 200px 1fr; }
```

---

## 2. Flex 容器属性

### display / flex-direction / flex-wrap / flex-flow

```css
.container {
  display: flex;              /* 或 inline-flex */
  flex-direction: row;        /* row | row-reverse | column | column-reverse */
  flex-wrap: wrap;            /* nowrap | wrap | wrap-reverse */
  flex-flow: row wrap;        /* direction + wrap 简写 */
}
```

| flex-direction | 主轴方向 |
|----------------|----------|
| `row`（默认） | 水平，左→右 |
| `column` | 垂直，上→下 |
| `*-reverse` | 反向 |

### justify-content / align-items / align-content

| 属性 | 作用轴 | 常用值 |
|------|--------|--------|
| `justify-content` | 主轴 | `flex-start` `center` `space-between` `space-evenly` |
| `align-items` | 交叉轴 | `stretch`（默认） `center` `flex-start` `baseline` |
| `align-content` | 多行时的交叉轴 | 同 justify-content，需 `flex-wrap: wrap` |

### 水平垂直居中两种方法

**方法一：justify-content + align-items**

```css
.center-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
```

**方法二：子项 margin: auto**

```css
.center-box { display: flex; height: 300px; }
.center-box .item { margin: auto; }
```

---

## 3. Flex 项目属性

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `flex-basis` | 初始主轴尺寸 | `auto` |
| `order` | 排序，越小越靠前 | `0` |
| `flex-grow` | 剩余空间分配比例 | `0` |
| `flex-shrink` | 不足时收缩比例 | `1` |
| `align-self` | 覆盖容器 align-items | `auto` |

### flex 简写

`flex: grow shrink basis`

```css
.sidebar { flex: 0 0 240px; }  /* 固定 240px，不增不缩 */
.main    { flex: 1; }           /* 占满剩余空间 */
.item    { flex: 2 1 auto; }    /* 剩余空间分 2 份 */
```

```html
<div class="container">
  <div class="sidebar">侧边栏</div>
  <div class="main">主内容</div>
</div>
```

```css
.container { display: flex; }
```

---

## 4. Grid 容器属性

### display / grid-template-columns / grid-template-rows / gap

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: 80px auto 60px;
  gap: 16px;                          /* 或 row-gap / column-gap */
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

### grid-template-areas / grid-template 简写

```css
.layout {
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr 40px;
  /* 简写：grid-template: rows / columns */
  grid-template: 80px 1fr 60px / 200px 1fr;
}
.header  { grid-area: header; }
```

### 隐式轨道 / grid-auto-flow

未在模板中声明的行/列为**隐式轨道**，由 `grid-auto-rows` / `grid-auto-columns` 控制。

| grid-auto-flow | 效果 |
|----------------|------|
| `row`（默认） | 按行填充 |
| `column` | 按列填充 |
| `dense` | 紧凑填充空隙 |

```css
.masonry {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 10px;
  grid-auto-flow: dense;
}
```

### justify-items / align-items / place-items / justify-content / align-content / place-content

| 属性 | 作用 |
|------|------|
| `justify-items` / `align-items` | 子项在各自**单元格**内对齐 |
| `place-items` | 上述两者简写 |
| `justify-content` / `align-content` | **整个网格**在容器内对齐 |
| `place-content` | 上述两者简写 |

```css
.grid { place-items: center; place-content: center; }
```

---

## 5. Grid 项目属性

### grid-column / grid-row / grid-area

```css
.item {
  grid-column: 1 / 3;           /* 跨 2 列 */
  grid-row: 2 / span 2;         /* 从第 2 行起跨 2 行 */
  grid-area: 1 / 1 / 3 / 3;     /* row-start / col-start / row-end / col-end */
  grid-area: header;             /* 命名区域 */
}
```

### justify-self / align-self / place-self / z-index

覆盖容器级对齐，仅作用于当前项。跨格重叠时用 `z-index` 控制层叠。

```css
.item   { place-self: center end; }
.overlay { grid-column: 1 / -1; grid-row: 1; z-index: 10; }
```

---

## 6. 实际应用

### 响应式布局

```css
.page {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .page { grid-template-columns: 1fr; }
  .toolbar { flex-direction: column; }
}
```

`auto-fit` + `minmax()` 让列数随视口自动增减。

### 瀑布流

```css
.waterfall {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 8px;
  grid-auto-flow: dense;
  gap: 12px;
}
.waterfall .card { grid-row-end: span var(--row-span); }
```

JS 计算卡片高度并设置 `--row-span`，配合 `dense` 减少空隙。

### 表单布局

```css
.form {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px 16px;
  align-items: center;
}
.form .full { grid-column: 1 / -1; }
```

---

## 7. 对比表格：Grid vs Flexbox

| 对比项 | Flexbox | CSS Grid |
|--------|---------|----------|
| 布局维度 | 一维 | 二维 |
| 空间分配 | `flex-grow` 伸缩 | `fr` 单位 |
| 对齐 | `justify-content` / `align-items` | `justify-*` / `align-*` / `place-*` |
| 项目定位 | `order` 调序 | `grid-column` / `grid-row` 精确定位 |
| 区域命名 | 无 | `grid-template-areas` |
| 典型用途 | 组件排列、导航、居中 | 页面布局、仪表盘、画廊 |
| 学习曲线 | 较低 | 稍高，功能更强 |

**实践建议**：页面骨架用 **Grid**，组件内部用 **Flex**，合理组合写出简洁可维护的布局。
