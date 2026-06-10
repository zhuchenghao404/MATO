---
name: "MATO-backend"
description: "MATO 后端服务技能。当需要后端接口、数据库操作、API 开发、启动后端服务时自动调用。后端项目位于 MATO-server 目录。"
---

# MATO Backend 技能

## 用途

本技能定义了 MATO 前端项目的后端服务规范。当 agent 需要：
- 编写或修改后端 API 接口
- 操作 MySQL 数据库
- 启动后端服务进行调试
- 前端报 "接口不存在" 或 404/500 错误时
- 需要根据数据库表结构生成接口

**必须自动调用此技能获取后端信息。**

---

## 1. 项目位置

| 项目 | 路径 | 端口 |
|------|------|------|
| 前端 | `d:\code\MATO` | 5173 (Vite) |
| 后端 | `d:\code\MATO-server` | 3000 |

前端 `vite.config.js` 中将 `/api` 代理到 `http://localhost:3000`。

---

## 2. 启动后端

如果后端项目已存在，使用以下步骤启动：

```powershell
# 进入后端目录
cd d:\code\MATO-server

# 安装依赖（如果 node_modules 不存在）
npm install

# 启动后端（通常是以下命令之一）
npm run dev
# 或
node server.js
# 或
node index.js
```

首次启动时，先检查 `d:\code\MATO-server` 目录是否存在。如果不存在， agent 应告知用户需要先创建后端项目。

---

## 3. 数据库配置

### MySQL 连接信息

通过 MCP MySQL 工具查询数据库。数据库名通过 MCP 配置获取。

### 数据表结构

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 用户表 | id, username, email, password, gender, avatar, bio, exp, level, status |
| `exp_logs` | 经验日志 | id, user_id, type, exp, remark, created_at |
| `level_configs` | 等级配置 | level, exp_required |
| `sign_logs` | 签到日志 | id, user_id, sign_date, exp_reward, created_at |
| `questions` | 题库 | id, type, topic, chapter, difficulty, question, options, answer, explanation, score |
| `question_records` | 答题记录 | id, user_id, question_id, answer, is_correct, exp_reward, created_at |
| `works` | 作品 | id, user_id, title, description, cover, demo_url, source_url, view_count, like_count, collect_count, comment_count, status |
| `comments` | 评论 | id, user_id, work_id, content, parent_id, created_at |
| `work_likes` | 作品点赞 | id, user_id, work_id, created_at |
| `work_collections` | 作品收藏 | id, user_id, work_id, created_at |

---

## 4. API 接口规范

所有接口前缀为 `/api`，响应格式统一为：

```json
{
  "code": 200,
  "msg": "success",
  "data": { ... }
}
```

错误响应：
```json
{
  "code": 400,
  "msg": "错误描述"
}
```

### 4.1 认证模块 `/api/auth`

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | `/api/auth/register` | 注册 | `{ username, password, gender, email, code }` |
| POST | `/api/auth/login` | 登录 | `{ username, password }` |
| POST | `/api/auth/send-code` | 发送邮箱验证码 | `{ email, type: "register" }` |

**登录/注册响应 data：**
```json
{
  "token": "jwt_token_string",
  "username": "...",
  "avatar": "...",
  "gender": "male",
  "email": "...",
  "bio": "...",
  "exp": 0,
  "level": 1
}
```

### 4.2 用户模块 `/api/user`

所有接口需携带 `Authorization: Bearer <token>` 头。

| 方法 | 路径 | 说明 | 请求体/说明 |
|------|------|------|-------------|
| GET | `/api/user/profile` | 获取个人信息 | 无 |
| PUT | `/api/user/profile` | 更新个人信息 | `{ username?, gender?, bio? }` |
| POST | `/api/user/avatar` | 上传头像 | FormData, 字段名 `avatar` |
| POST | `/api/user/exp/add` | 增加经验 | `{ amount, type, remark? }` |
| POST | `/api/user/reset-password` | 重置密码 | `{ email, code, password }` |
| POST | `/api/user/sign-in` | 每日签到 | `{}` |

**签到接口逻辑：**
- 查询 `sign_logs` 表中今天是否有该用户的签到记录
- 如果有，返回 `{ code: 400, msg: "今日已签到" }`
- 如果没有，插入签到记录，增加经验值（如 +10），更新 users.exp，返回：
```json
{
  "code": 200,
  "data": {
    "exp": 新总经验,
    "level": 可能的新等级,
    "exp_reward": 10
  }
}
```

**上传头像响应：**
```json
{
  "code": 200,
  "data": { "avatar": "http://localhost:3000/uploads/xxx.png" }
}
```

### 4.3 等级配置 `/api/level-configs`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/level-configs` | 获取所有等级经验阈值 |

**响应：**
```json
{
  "code": 200,
  "data": [
    { "level": 1, "exp_required": 0 },
    { "level": 2, "exp_required": 1000 },
    { "level": 3, "exp_required": 5000 },
    { "level": 4, "exp_required": 10000 },
    { "level": 5, "exp_required": 20000 }
  ]
}
```

---

## 5. 后端技术栈建议

```
- 运行环境: Node.js + Express
- 数据库: mysql2
- 认证: jsonwebtoken + bcryptjs
- 文件上传: multer
- 跨域: cors
- 邮件验证码: nodemailer
```

### 最小可用 package.json

```json
{
  "name": "mato-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "mysql2": "^3.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "nodemailer": "^6.9.0"
  }
}
```

---

## 6. Agent 使用流程

**当用户报告接口报错或需要后端功能时：**

1. 检查 `d:\code\MATO-server` 是否存在
   - 不存在 → 询问用户是否需要创建后端项目
   - 存在 → 继续
2. 检查后端是否在运行（`netstat -ano | findstr :3000`）
   - 未运行 → `cd d:\code\MATO-server && npm run dev`
   - 已运行 → 排查具体接口问题
3. 如需新建接口，参考第 4 节的接口规范编写
4. 数据库表结构可通过 MCP MySQL 工具实时查询
5. 前端 API 封装在 `d:\code\MATO\src\stores\auth.js` 中

---

## 7. 常用调试命令

```powershell
# 检查 3000 端口是否被占用
netstat -ano | findstr :3000

# 杀掉占用 3000 端口的进程（PID 替换为实际值）
taskkill /PID <PID> /F

# 启动后端
cd d:\code\MATO-server && npm run dev

# 测试接口
curl http://localhost:3000/api/level-configs
```
