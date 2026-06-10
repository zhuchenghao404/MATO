---
name: quiz-generator
description: 从教学 Markdown 文档生成高质量实战练习题，输出为结构化 JSON 文件。支持自动创建新文件或匹配已有 JSON 文件追加写入。触发词：quiz、生成题目、生成题库、出题、练习题、闯关题、考试题、测试题。
---

# Quiz Generator Skill

## 用途

从教学类 Markdown 文档（HTML/CSS/JS/前端教程）中提取知识点，生成高质量实战练习题，输出为结构化 JSON 文件，供项目中的"技能闯关"功能使用。

## 触发条件

当用户提到以下关键词时启用此技能：
- 生成题目 / 生成题库 / 出题 / 练习题 / 闯关题 / 考试题 / 测试题
- quiz / generate questions / test bank

## 核心工作流

### 第1步：确定输入源

- 如果用户上传或指定了 MD 文件，读取该文件。
- 如果用户只给了主题（如"HTML题目"），去 `src/content/learning/` 目录找到对应 MD 文件。
- 如果没有对应 MD 文件，询问用户提供内容。

### 第2步：分析知识点

从文档中提取：
- 核心概念、标签、属性
- 最佳实践与常见错误
- 可出题的关键段落

### 第3步：生成题目

**题型配比**（可根据用户要求调整）：

| 题型 | 占比 | 说明 |
|------|------|------|
| code-fix | 35% | 给一段有 bug 的代码，要求修复 |
| single-choice | 25% | 4 个选项的单选题 |
| fill-blank | 15% | 填空题，关键概念填空 |
| scenario | 15% | 真实场景题，描述需求写代码 |
| true-false | 10% | 判断题 |

**难度配比**：easy 30% / medium 40% / hard 30%

**默认题量**：如果没有指定数量，默认 30 道。

### 第4步：输出 JSON 文件（重要）

#### 4.1 确定输出目录

所有题库 JSON 文件统一存放在项目目录：
```
src/content/quiz/
```

如果该目录不存在，先用 `Write` 工具创建第一个文件时会自动创建目录。

#### 4.2 命名规则

文件命名格式：`{主题}-quiz.json`
- 例如：`html-quiz.json`、`css-quiz.json`、`javascript-quiz.json`

#### 4.3 创建新文件还是追加已有文件

**优先匹配已有文件**：
1. 用 `Glob` 工具搜索 `src/content/quiz/*.json`，检查是否已有对应主题的题库文件。
2. 如果已有文件 → 用 `Read` 读取现有内容，在现有题目之后追加新题，**ID 续接**（从已有最大 ID+1 开始）。
3. 如果没有文件 → 用 `Write` 创建新文件，ID 从 1 开始。

#### 4.4 JSON 结构规范

每个题库文件是题目数组，单道题结构如下：

```json
{
  "id": 1,
  "type": "single-choice",
  "topic": "HTML",
  "chapter": "HTML基础标签",
  "difficulty": "easy",
  "question": "以下哪个标签用于定义 HTML 文档的根元素？",
  "options": [
    { "key": "A", "text": "<head>" },
    { "key": "B", "text": "<body>" },
    { "key": "C", "text": "<html>" },
    { "key": "D", "text": "<!DOCTYPE>" }
  ],
  "answer": "C",
  "explanation": "<html> 标签是 HTML 文档的根元素，包裹了 <head> 和 <body> 等所有其他元素。<!DOCTYPE> 是文档类型声明，不是标签。",
  "score": 5
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 唯一标识，从1递增。追加时续接已有最大ID |
| type | string | 是 | 题型：`single-choice` / `code-fix` / `fill-blank` / `scenario` / `true-false` |
| topic | string | 是 | 所属主题，如 "HTML"、"CSS"、"JavaScript"、"Vue3" |
| chapter | string | 是 | 所属章节，如 "HTML基础标签" |
| difficulty | string | 是 | 难度：`easy` / `medium` / `hard` |
| question | string | 是 | 题目内容 |
| options | array | 否 | 选项列表（仅 single-choice 必填），每项含 `key`(A/B/C/D) 和 `text` |
| answer | string | 是 | 正确答案。single-choice 填 key(如"C")，code-fill 填期望代码，fill-blank 填空词，true-false 填"true"/"false" |
| explanation | string | 是 | 答案解析，说明为什么选这个答案 |
| codeBefore | string | 否 | code-fix 题型：修复前的错误代码 |
| codeAfter | string | 否 | code-fix 题型：修复后的正确代码 |
| score | number | 否 | 分值，默认 5 分 |

#### 4.5 不同题型的 JSON 示例

**code-fix（代码修复题）**：
```json
{
  "id": 10,
  "type": "code-fix",
  "topic": "HTML",
  "chapter": "HTML基础标签",
  "difficulty": "medium",
  "question": "以下代码中的图片标签有错误，请修复它。",
  "codeBefore": "<img src='photo.jpg'></img>",
  "codeAfter": "<img src='photo.jpg' alt='照片'>",
  "answer": "<img src='photo.jpg' alt='照片'>",
  "explanation": "img 是自闭合标签，不需要 </img> 结束标签。同时应添加 alt 属性提供替代文本。",
  "score": 10
}
```

**fill-blank（填空题）**：
```json
{
  "id": 15,
  "type": "fill-blank",
  "topic": "CSS",
  "chapter": "CSS选择器",
  "difficulty": "easy",
  "question": "在 CSS 中，使用 `____` 选择器可以选中某个 id 的元素。",
  "answer": "#",
  "explanation": "# 是 ID 选择器的前缀，例如 #header 选中 id=\"header\" 的元素。",
  "score": 5
}
```

**true-false（判断题）**：
```json
{
  "id": 20,
  "type": "true-false",
  "topic": "JavaScript",
  "chapter": "变量与数据类型",
  "difficulty": "easy",
  "question": "在 JavaScript 中，let 声明的变量可以被重复声明。",
  "answer": "false",
  "explanation": "let 不允许在同一作用域内重复声明同名变量，const 也不允许，只有 var 可以。",
  "score": 5
}
```

#### 4.6 输出完成后必须告知用户

生成完成后必须报告：
- 文件路径
- 总题数（新题 + 已有题）
- 题型分布统计
- 难度分布统计

## 使用示例

**创建新题库**：
> 用户："基于 01-html.md 生成 50 道 HTML 闯关题"
>
> AI：读取 MD → 生成题目 → 搜索 `src/content/quiz/` → 没有 html-quiz.json → 创建新文件 → 报告统计

**追加已有题库**：
> 用户："再给 HTML 题库加 20 道代码修复题"
>
> AI：搜索 → 找到 `html-quiz.json` → 读取现有 50 道 → 生成 20 道新题（ID 51-70）→ 写入文件 → 报告统计

**指定题型和难度**：
> 用户："生成 30 道 CSS 题，重点单选题，难度偏简单"
>
> AI：调整配比（50% 单选 + 20% 填空 + 15% 判断 + 15% code-fix）→ 难度 easy 50% / medium 35% / hard 15%