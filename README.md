# MATO（码途）

> 🚀 一个面向零基础前端学习者的互动式编程学习平台 —— 「学中做、做中学」
>
> 🤖 *本项目由 AI 辅助开发*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![AI-Powered](https://img.shields.io/badge/AI-Powered-8A2BE2)

---

## 📖 项目简介

**MATO（码途）** 是一个专为零基础前端学习者打造的互动式编程学习平台。我们相信编程最好的学习方式是"动手做"——平台围绕 **阅读教程 → 闯关答题 → 在线编码 → 作品展示** 四个递进环节，形成完整的学习闭环。

### 核心特色

- 📚 **6 大前端技能教程**：HTML、CSS、JavaScript、Flex & Grid、动画、综合实战
- ⚔️ **四大题型闯关**：选择题、填空题、纠错题、编程题
- ✍️ **在线三栏编辑器**：基于 CodeMirror 6，实时预览 HTML/CSS/JS 代码
- 🤖 **AI 答疑助手**：DeepSeek 驱动，代码解释、答题辅助、智能判题、多轮对话
- 🏆 **游戏化等级体系**：15 级成长路径，签到/答题赚取经验值
- 🎨 **作品广场**：发布作品、点赞收藏、评论互动
- 👥 **社交功能**：关注/粉丝、私信聊天
- 🛡️ **管理后台**：数据仪表盘、用户管理、作品审核、评论管理

### 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3 + Vite + Element Plus + Pinia |
| **代码编辑器** | CodeMirror 6 |
| **动画** | GSAP + ScrollTrigger |
| **后端** | Node.js + Express |
| **数据库** | MySQL |
| **AI** | DeepSeek API |
| **认证** | JWT + bcryptjs |
| **图表** | ECharts |
| **测试** | Playwright |

---

## 🗄️ 数据库设计

> 后端不开启时，可以手动在 MySQL 中执行以下 SQL 创建数据库和表。

### 1. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS mato DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mato;
```

### 2. 表结构

#### users —— 用户表（核心）

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) DEFAULT '',
  gender ENUM('male','female') DEFAULT 'male',
  avatar VARCHAR(255) DEFAULT NULL,
  bio VARCHAR(100) DEFAULT '',
  exp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '0=禁用 1=正常',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### works —— 作品表

```sql
CREATE TABLE IF NOT EXISTS works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover VARCHAR(255),
  html_code TEXT,
  css_code TEXT,
  js_code TEXT,
  dependencies TEXT COMMENT 'CDN依赖 JSON数组',
  like_count INT DEFAULT 0,
  collect_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  status TINYINT DEFAULT 0 COMMENT '0=待审 1=已发布 2=草稿',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### sign_logs —— 签到日志表

```sql
CREATE TABLE IF NOT EXISTS sign_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sign_date DATE NOT NULL,
  exp_reward INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### exp_logs —— 经验日志表

```sql
CREATE TABLE IF NOT EXISTS exp_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT '' COMMENT '签到/答题',
  exp INT NOT NULL DEFAULT 0,
  remark VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### level_configs —— 等级配置表

```sql
CREATE TABLE IF NOT EXISTS level_configs (
  level INT PRIMARY KEY,
  exp_required INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始数据（15级）
INSERT INTO level_configs (level, exp_required) VALUES
  (1, 0), (2, 100), (3, 300), (4, 600), (5, 1000),
  (6, 1500), (7, 2100), (8, 2800), (9, 3600), (10, 4500),
  (11, 5500), (12, 6600), (13, 7800), (14, 9100), (15, 10500);
```

#### work_views —— 作品浏览记录表

```sql
CREATE TABLE IF NOT EXISTS work_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '可为NULL（未登录浏览）',
  work_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### work_likes —— 作品点赞表

```sql
CREATE TABLE IF NOT EXISTS work_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  work_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_work (user_id, work_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### work_collections —— 作品收藏表

```sql
CREATE TABLE IF NOT EXISTS work_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  work_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_work (user_id, work_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### comments —— 评论表

```sql
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  work_id INT NOT NULL,
  content TEXT NOT NULL,
  parent_id INT DEFAULT NULL COMMENT '回复的评论ID，支持嵌套',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### ai_usage —— AI 调用限额表

```sql
CREATE TABLE IF NOT EXISTS ai_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_ip VARCHAR(45) NOT NULL COMMENT '用户ID或IP',
  usage_date DATE NOT NULL,
  count INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_ip_date (user_ip, usage_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### question_records —— 答题记录表

```sql
CREATE TABLE IF NOT EXISTS question_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  skill VARCHAR(50) NOT NULL DEFAULT '' COMMENT '技能分类',
  answer TEXT,
  is_correct TINYINT NOT NULL DEFAULT 0,
  exp_reward INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_question_skill (user_id, question_id, skill)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### follows —— 关注关系表

```sql
CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL COMMENT '关注者',
  followee_id INT NOT NULL COMMENT '被关注者',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_follower_followee (follower_id, followee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### messages —— 私信表

```sql
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_from_to (from_user_id, to_user_id),
  INDEX idx_to_from (to_user_id, from_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. 数据库关系图

```
users ──1:N──> works
users ──1:N──> question_records
users ──1:N──> sign_logs
users ──1:N──> exp_logs
users ──N:N──> users (via follows: 关注/粉丝)
users ──N:N──> works (via work_likes: 点赞)
users ──N:N──> works (via work_collections: 收藏)
works ──1:N──> comments (支持 parent_id 嵌套回复)
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **MySQL** >= 5.7

### 1. 克隆项目

```bash
git clone https://github.com/zhuchenghao404/MATO.git
cd MATO
```

### 2. 配置数据库

- 创建 MySQL 数据库（名字默认 `mato`）
- 执行上方 [数据库设计](#️-数据库设计) 中的建表 SQL
- 编辑 `server/.env` 文件，配置数据库连接信息：

```env
# 运行环境
NODE_ENV=development

# 服务端口
PORT=3000

# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mato

# JWT 密钥（请更换为随机字符串）
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# DeepSeek AI 配置（可选，不配则 AI 功能不可用）
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### 3. 安装依赖 & 启动

```bash
# 安装根目录依赖
npm install

# 安装前后端依赖
cd server && npm install && cd ..
cd browser && npm install && cd ..

# 启动开发模式（同时启动前后端）
npm run dev

# 前端访问：http://localhost:5173
# 后端 API：http://localhost:3000
```

### 4. 生产部署

```bash
npm run build     # 构建前端
npm start         # 构建 + Express 托管静态文件
```

### 5. 默认管理员

首次启动自动创建管理员账号：

| 用户名 | 密码 |
|--------|------|
| admin | admin |

管理员后台入口：`/admin/dashboard`

---

## 📡 API 概览

| 模块 | 路径前缀 | 认证 | 主要功能 |
|------|---------|------|---------|
| 认证 | `/api/auth` | 否 | 注册、登录、邮箱验证码 |
| 用户 | `/api/user` | 是* | 个人资料、签到、等级、头像上传 |
| 作品 | `/api/works` | 部分 | 作品 CRUD、点赞、收藏、评论、浏览 |
| AI | `/api/ai` | 否* | 代码解释、答题辅助、智能判题、追问（日限10次） |
| 答题 | `/api/quiz` | 是 | 提交答案、答题记录 |
| 社交 | `/api/social` | 是 | 关注/取关、私信、未读计数 |
| 管理 | `/api/admin` | 是 | 数据统计、用户/作品/评论管理（仅 admin） |
| 健康 | `/api/health` | 否 | 服务健康检查 |

> 完整 API 文档详见 `server/src/routes/` 目录下的各路由文件。

---

## 📁 项目结构

```
MATO/
├── browser/               # 前端 Vue 3 项目
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── views/         # 页面组件
│   │   ├── data/          # 教程数据（Markdown）
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia 状态管理
│   │   └── assets/        # 静态资源
│   └── vite.config.js
├── server/                # 后端 Express 项目
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── middleware/    # 中间件
│   │   ├── initDB.js      # 数据库初始化
│   │   └── db.js          # 数据库连接池
│   └── app.js             # 入口文件
├── docs/                  # 项目文档（不上传）
├── ppt/                   # 演示幻灯片（不上传）
├── prototype/             # 原型文件（不上传）
└── package.json           # 根 monorepo 脚本
```

---

## 🤖 AI 开发说明

本项目由 **AI（人工智能）辅助开发**，包括但不限于：

- 前端页面组件生成
- 后端 API 接口实现
- 数据库表结构设计
- 测试用例编写
- 项目文档撰写

AI 工具在这个过程中提供了代码生成、问题诊断、方案建议等辅助，最终由开发者审查、调整和集成。这使得项目在短时间内具备了完整的功能闭环。

---

## 📄 License

MIT License © 2025
