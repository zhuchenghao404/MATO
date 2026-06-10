# AJAX 教程

AJAX 就是 JavaScript 与服务端交互的手段。

**全称**：Async JavaScript and XML（异步 JavaScript 和 XML）

---

## 概述

AJAX 是前后端交互的能力——客户端向服务端发送消息并接收响应。

- 不是一门新语言，而是使用现有标准的新方法
- 可在**不刷新页面**的情况下更新页面内容
- 分为**同步（sync）**和**异步（async）**，默认异步

### 什么是异步请求？

AJAX 发送请求时**不影响**用户的其他操作。请求与用户操作走两条路，互不影响。

### 什么是同步请求？

发送请求后页面像「卡住」一样，必须等 AJAX 返回后才能继续操作——类似排队，前一个人办完，后一个人才能办。

### AJAX 的优势

| 优势 | 说明 |
|------|------|
| 无需插件 | 原生 JS 即可 |
| 用户体验好 | 无刷新获取数据 |
| 减轻负担 | 减少服务端与带宽压力 |

**缺点**：搜索引擎支持度不够，动态数据不在初始 HTML 中。

---

## AJAX 操作流程

1. 服务端取出数据库数据
2. 转成 **JSON 字符串**，通过 AJAX 返回前台
3. 前台用 `JSON.parse` 解析，循环渲染到页面
4. 反之，前端数据通过 AJAX 提交到 PHP 等后端，再写入数据库

---

## AJAX 的使用

JavaScript 内置 **XMLHttpRequest** 构造函数创建 AJAX 对象。

### 1. 创建 AJAX 对象

```javascript
// 现代浏览器
const xhr = new XMLHttpRequest()

// IE9 以下（了解）
// const xhr = new ActiveXObject('Microsoft.XMLHTTP')
```

### 2. 配置链接信息

```javascript
// xhr.open(请求方式, 请求地址, 是否异步)
xhr.open('get', './data.php')  // 默认 true 异步
```

### 3. 发送请求

```javascript
xhr.send()
```

### 4. 获取响应

需满足两个条件：

1. **HTTP 状态码** 200 ~ 299（`xhr.status`）
2. **AJAX 状态码** `readyState === 4`

#### AJAX 状态码（readyState）

| 值 | 含义 |
|----|------|
| 0 | 未初始化，open 未执行 |
| 1 | 配置完成，open 已执行 |
| 2 | send 已执行 |
| 3 | 正在解析响应 |
| 4 | 解析完毕，可使用响应 |

#### readyStateChange 事件

```javascript
const xhr = new XMLHttpRequest()
xhr.open('get', './data.php')
xhr.send()

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
    console.log(xhr.responseText)
  }
}
```

---

## 携带参数

### GET 请求

参数直接拼接在 URL 后：

```javascript
xhr.open('get', './data.php?a=100&b=200')
xhr.send()
```

### POST 请求

参数放在**请求体**中，不在 URL 拼接：

```javascript
xhr.open('post', './data.php')
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
xhr.send('username=小明&age=18')
```

### GET 还是 POST？

| 场景 | 推荐 |
|------|------|
| 简单、可缓存 | GET |
| 更新服务器文件/数据库 | POST |
| 发送大量数据 | POST |
| 未知字符的用户输入 | POST 更稳定 |

---

## AJAX 封装

```javascript
function $ajax({ type = 'get', url, data, success, error }) {
  let xhr
  try {
    xhr = new XMLHttpRequest()
  } catch (e) {
    xhr = new ActiveXObject('Microsoft.XMLHTTP')
  }

  if (type === 'get' && data) {
    url += '?' + querystring(data)
  }

  xhr.open(type, url, true)

  if (type === 'get') {
    xhr.send()
  } else {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(data ? querystring(data) : null)
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success && success(xhr.responseText)
      } else {
        error && error('Error：' + xhr.status)
      }
    }
  }
}

function querystring(obj) {
  let str = ''
  for (const key in obj) {
    str += key + '=' + obj[key] + '&'
  }
  return str.substring(0, str.length - 1)
}
```

**使用示例**：

```javascript
$ajax({
  url: 'api/user.php',
  data: { username: '小明', age: 18 },
  success(result) {
    alert('GET 请求到的数据：' + result)
  },
  error(msg) {
    alert('请求错误：' + msg)
  }
})
```

---

## 现代替代：fetch API

```javascript
fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => {
    document.getElementById('content').innerHTML = data.result
  })
  .catch(err => console.error(err))
```

> 实际项目中更推荐使用 `fetch` 或 `axios`，Promise 风格更易维护。详见 [Promise 教程](./06-promise.md)。

---

## 小结

AJAX 实现了**无刷新数据交互**，是 SPA 和现代 Web 应用的基础。理解 XMLHttpRequest 的原理后，学习 fetch、Promise、async/await 会更加顺畅。
