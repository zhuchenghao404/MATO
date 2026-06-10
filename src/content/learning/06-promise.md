# Promise 教程

Promise 是表示**异步操作最终完成或失败**的对象，充当异步结果的「占位符」，解决了传统回调的深层嵌套问题（回调地狱）。

---

## 什么是 Promise

Promise 是一个**构造函数**，需通过 `new` 创建实例。

```javascript
const promise = new Promise((resolve, reject) => {
  // 同步或异步操作
})
```

### Promise 的状态

| 状态 | 说明 |
|------|------|
| pending（进行中） | 初始状态，操作未完成 |
| fulfilled（已成功） | 异步操作完成 |
| rejected（已失败） | 异步操作失败 |

> 状态一旦改变就**不可再变**，成功与失败之间不可逆。

### 改变状态

- `resolve()` — 改为 fulfilled
- `reject()` — 改为 rejected

```javascript
const promise = new Promise((resolve, reject) => {
  resolve()   // 成功
  // reject() // 失败
})
```

### Promise 的结果

`PromiseResult` 记录异步操作结果，由 `resolve(value)` 或 `reject(reason)` 的参数决定。

```javascript
const promise = new Promise((resolve, reject) => {
  resolve('success')
  // reject('失败')
})

promise.then(
  value => console.log('成功：' + value),
  reason => console.log('失败：' + reason)
)
```

---

## Promise 实例方法

### .then(onFulfilled, onRejected)

处理成功或失败结果，**返回新 Promise**，支持链式调用。

```javascript
fetchData()
  .then(data => processData(data))
  .then(processed => saveData(processed))
  .catch(err => handleError(err))
```

#### 链式调用注意事项

**1. 返回值处理**

- 未 `return` → 下一级收到 `undefined`
- 返回普通值 → 直接传递
- 返回新 Promise → 下一级等待其状态变更

```javascript
fetchData()
  .then(step1)
  .then(step2)
  .catch(err => console.error('全局捕获:', err))
```

**2. 错误处理**

链中任一环节抛出错误或返回 rejected Promise，会跳过后续 `.then()`，直到最近的 `.catch()`。

```javascript
fetchData()
  .then(step1)
  .catch(err => {
    console.error('步骤1错误:', err)
    return fallbackData  // 返回降级数据，继续执行
  })
  .then(step2)
```

**3. 避免嵌套陷阱**

```javascript
// ❌ 错误：嵌套
fetchData().then(data => {
  saveData(data).then(() => { /* ... */ })
})

// ✅ 正确：链式
fetchData()
  .then(data => saveData(data))
  .then(() => nextStep())
```

**4. this 绑定**

`.then()` 回调中 `this` 默认指向全局对象，箭头函数可保留外层 `this`。

### .catch(onRejected)

捕获链式调用中的错误，等价于 `.then(null, onRejected)`。

### .finally(onFinally)

无论成功或失败都会执行，适合清理资源（如关闭 loading）。

```javascript
showLoading()
fetch('/api/data')
  .then(res => res.json())
  .then(data => render(data))
  .catch(err => showError(err))
  .finally(() => hideLoading())
```

---

## Promise 静态方法

### Promise.resolve(value)

返回已成功的 Promise。

```javascript
Promise.resolve(42).then(v => console.log(v))  // 42
```

### Promise.reject(reason)

返回已失败的 Promise。

```javascript
Promise.reject('失败').catch(e => console.log(e))  // "失败"
```

### Promise.all(iterable)

所有 Promise 都成功才成功，任一失败则立即失败。

```javascript
Promise.all([p1, p2, p3])
  .then(results => console.log(results))
  .catch(err => console.error(err))
```

> 适合**彼此依赖**或**任一 reject 需立即结束**的场景。

### Promise.allSettled(iterable)

等所有 Promise 都 settled（成功或失败）后返回结果数组。

```javascript
Promise.allSettled([p1, p2])
  .then(results => {
    // [{ status: 'fulfilled', value: '...' }, { status: 'rejected', reason: '...' }]
    console.log(results)
  })
```

> 适合多个**互不依赖**的异步任务，且需要知道**每个**的结果。

---

## 与 async/await 配合

```javascript
async function loadData() {
  try {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('网络错误')
    const data = await res.json()
    return data
  } catch (err) {
    console.error(err)
  }
}
```

| 特性 | Promise | async/await |
|------|---------|-------------|
| 语法 | 链式 .then | 同步写法 |
| 错误处理 | .catch() | try/catch |
| 可读性 | 复杂逻辑易嵌套 | 更接近同步代码 |

---

## 小结

Promise 让异步代码**线性化、可组合**，是 modern JavaScript 异步编程的基石。掌握 `.then` 链式调用、错误传播和 `Promise.all` / `allSettled` 的区别，是编写健壮前端代码的必备技能。
