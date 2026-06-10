# JavaScript 教程

JavaScript（简称 JS）是 Web 三大核心技术之一，负责网页的交互与动态行为。本教程系统介绍从基础语法到 ES6+ 现代特性的核心知识。

---

## JavaScript 简介

### 起源与发展

JavaScript 诞生于 1995 年，由 Brendan Eich 在 Netscape 公司仅用 10 天设计完成，最初名为 LiveScript，后更名为 JavaScript。尽管名字含「Java」，两者并无直接关系。

- **1997**：ECMA 发布 ECMAScript 标准（ES1）
- **2009**：ES5 发布，奠定现代 JS 基础
- **2015**：ES6（ES2015）发布，引入 let/const、箭头函数、Class 等
- **此后**：每年迭代（ES2016 ~ ES2024），持续演进

### 三大组成部分

| 组成部分 | 说明 |
|----------|------|
| **ECMAScript** | 语言核心：语法、类型、语句、关键字、内置对象 |
| **DOM** | 操作 HTML 文档的 API，将页面元素表示为对象树 |
| **BOM** | 操作浏览器窗口的 API，如 `window`、`location` |

### 语言特点

1. **解释型语言**：无需编译，由引擎逐行解释执行
2. **动态类型**：变量类型在运行时确定，可随时改变
3. **基于原型的面向对象**：通过原型链实现继承
4. **单线程**：主线程执行代码，异步通过事件循环处理
5. **跨平台**：浏览器、Node.js、移动端均可运行

---

## 使用与输出

### script 标签

```html
<script>console.log('Hello JS')</script>
<script src="app.js"></script>
```

| 属性 | 说明 |
|------|------|
| `defer` | 延迟执行，HTML 解析完毕后按顺序执行 |
| `async` | 异步加载，下载完立即执行 |
| `type="module"` | ES6 模块化脚本，自动 defer |

### 输出方式

```javascript
alert('弹窗提示')                        // 阻塞页面
console.log('日志')                      // 开发调试首选
console.warn('警告'); console.error('错误')
document.write('<h1>Hello</h1>')         // 不推荐，覆盖页面
document.getElementById('box').innerHTML = '内容'
```

### 注释

```javascript
// 单行注释
/* 多行注释 */
```

---

## 基础语法

### 标识符与变量

标识符由字母、数字、`_`、`$` 组成，**不能以数字开头**，区分大小写，不能用保留字。

```javascript
var age = 18          // 函数作用域，可重复声明，有变量提升
let score = 90        // 块级作用域，不可重复声明（推荐）
const PI = 3.14159    // 块级作用域，不可重新赋值
```

### 数据类型

| 类型 | 示例 |
|------|------|
| String | `'hello'` |
| Number | `42`、`3.14`、`NaN` |
| Boolean | `true`、`false` |
| Undefined | 声明未赋值 |
| Null | 有意为空 |
| Symbol | `Symbol('id')`（ES6） |
| BigInt | `100n`（ES2020） |
| Object | `{}`、`[]`、函数 |

```javascript
typeof 'hello'      // 'string'
typeof 42           // 'number'
typeof null         // 'object'（历史遗留 bug）
typeof []           // 'object'
typeof function(){} // 'function'
```

### 类型转换

```javascript
String(123)         // '123'     Number('123')     // 123
parseInt('123px')   // 123       parseFloat('3.14')// 3.14
Boolean(0)          // false     Boolean('')       // false
// 假值：false、0、''、null、undefined、NaN
```

---

## 运算符

```javascript
// 算术：+ - * / % ** ++ --
// 赋值：= += -= *= /= %=
// 逻辑：&& || !（短路求值）
// 比较
0 == false    // true（会类型转换）
0 === false   // false（类型和值都相同，推荐）
null == undefined  // true

// 三元运算符
let status = age >= 18 ? '成年' : '未成年'

// 逗号运算符：返回最后一个表达式的值
let a = (1, 2, 3)  // a = 3
```

---

## 流程控制

### if / else 与 switch

```javascript
if (score >= 90) { console.log('优秀') }
else if (score >= 60) { console.log('及格') }
else { console.log('不及格') }

switch (day) {
  case 1: name = '周一'; break
  case 2: name = '周二'; break
  default: name = '未知'
}
```

### 循环

```javascript
// while：先判断后执行
while (i < 5) { i++ }

// do-while：至少执行一次
do { j++ } while (j < 5)

// for
for (let i = 0; i < 5; i++) { console.log(i) }

// for...in 遍历对象属性；for...of 遍历可迭代对象
for (let key in obj) { console.log(key, obj[key]) }
for (let item of arr) { console.log(item) }
```

### break、continue 与 label

```javascript
if (i === 5) break       // 跳出循环
if (i === 2) continue    // 跳过本次

// label：跳出外层循环
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer
  }
}
```

---

## 对象基础

### 创建、访问与删除

```javascript
const person = {
  name: '张三', age: 25,
  sayHi() { console.log(`我是 ${this.name}`) }
}

person.name              // 点语法
person['age'] = 26       // 方括号（属性名是变量时用）
delete person.age
```

### 遍历

```javascript
for (let key in person) { console.log(key, person[key]) }
Object.keys(person)      // 键数组
Object.values(person)    // 值数组
Object.entries(person)   // [键, 值] 数组
```

### 栈与堆

| 区域 | 存储内容 | 特点 |
|------|----------|------|
| **栈** | 基本类型值、引用地址 | 自动分配，速度快 |
| **堆** | 对象、数组、函数 | 动态分配，需垃圾回收 |

```javascript
let a = 10, b = a; b = 20; console.log(a)  // 10（值复制）
let o1 = { x: 1 }, o2 = o1; o2.x = 2; console.log(o1.x)  // 2（引用共享）
```

---

## 函数

### 声明方式

```javascript
// 函数声明
function greet(name) { return `你好，${name}！` }

// 函数表达式
const add = function(a, b) { return a + b }

// 箭头函数（ES6）
const multiply = (a, b) => a * b

// IIFE 立即执行
(function() { console.log('避免污染全局') })()
```

### 参数与返回值

```javascript
function createUser(name, role = 'user') { return { name, role } }
function sum(...nums) { return nums.reduce((a, b) => a + b, 0) }
// 无 return 返回 undefined
```

### this 绑定规则

`this` 由**调用方式**决定：

```javascript
// 1. 默认绑定：独立调用 → window（严格模式 undefined）
// 2. 隐式绑定：obj.method() → obj
// 3. 显式绑定：call/apply/bind 指定
// 4. new 绑定：构造函数 → 新实例
// 5. 箭头函数：继承外层 this，无自己的 this
const obj = { name: '对象', getName() { return this.name } }
obj.getName()  // '对象'
```

---

## 对象进阶

### 工厂模式、构造函数与 Class

```javascript
// 工厂模式
function createPerson(name, age) {
  return { name, age, introduce() { console.log(`${this.name}，${this.age}岁`) } }
}

// 构造函数
function Person(name) { this.name = name }
Person.prototype.sayHi = function() { console.log(this.name) }
const p = new Person('赵六')

// ES6 Class
class Animal {
  constructor(name) { this.name = name }
  speak() { console.log(`${this.name} 发出声音`) }
}
class Dog extends Animal {
  constructor(name, breed) { super(name); this.breed = breed }
  speak() { console.log(`${this.name} 汪汪叫`) }
}
```

### 原型链与继承

```javascript
// 查找顺序：实例 → 构造函数.prototype → Object.prototype → null
console.log(s.study === Student.prototype.study)  // true

// ES6 继承（推荐）
class Circle extends Shape {
  constructor(color, radius) { super(color); this.radius = radius }
  area() { return Math.PI * this.radius ** 2 }
}
```

### 垃圾回收

引擎采用**标记-清除**算法自动回收内存。常见泄漏：未清除定时器、闭包持有大对象、DOM 引用未释放。

```javascript
let cache = { data: new Array(1000000) }
cache = null  // 手动解除引用
```

---

## 作用域与闭包

### 作用域与变量提升

```javascript
let globalVar = '全局'          // 全局作用域
function fn() {
  let funcVar = '函数内'        // 函数作用域
  if (true) { let blockVar = '块内' }  // 块级作用域（let/const）
}

console.log(a)  // undefined（var 提升但未赋值）
var a = 10
// let b 存在暂时性死区，提升前访问报错
```

### 闭包

函数访问词法作用域外的变量，即使外层函数已执行完毕。

```javascript
function createCounter() {
  let count = 0
  return function() { return ++count }
}
const counter = createCounter()
counter()  // 1 → 2 → 3

// 应用：数据私有化、防抖
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

---

## 数组

### 增删改查

```javascript
const arr = ['苹果', '香蕉']
arr.push('橙子')           // 末尾添加
arr.unshift('葡萄')        // 开头添加
arr.splice(1, 0, '梨')     // 索引处插入
arr.pop() / arr.shift()    // 删除末尾/开头
arr.splice(1, 1)           // 删除指定
arr[0] = '草莓'             // 修改
arr.indexOf('香蕉')         // 查找索引
arr.includes('苹果')        // 是否包含（ES7）
```

### 七种遍历方式

```javascript
for (let i = 0; i < arr.length; i++) { }          // 1. for
arr.forEach((item, i) => { })                      // 2. forEach
for (let item of arr) { }                          // 3. for...of
arr.map(n => n * 2)                                 // 4. map
arr.filter(n => n % 2 === 0)                      // 5. filter
arr.reduce((sum, n) => sum + n, 0)                  // 6. reduce
arr.some(n => n > 3) / arr.every(n => n > 0)       // 7. some/every
```

### 搜索、排序与去重

```javascript
users.find(u => u.id === 2)
users.filter(u => u.age === 25)
scores.sort((a, b) => a - b)   // 数字升序

// 去重
[...new Set(arr)]
arr.filter((item, i) => arr.indexOf(item) === i)
```

---

## call / apply / bind 与 arguments

| 方法 | 执行时机 | 参数形式 |
|------|----------|----------|
| `call` | 立即执行 | 逐个传递 |
| `apply` | 立即执行 | 数组传递 |
| `bind` | 返回新函数 | 逐个传递 |

```javascript
function introduce(city, country) {
  console.log(`${this.name} 来自 ${country} ${city}`)
}
introduce.call(person, '北京', '中国')
introduce.apply(person, ['上海', '中国'])
const boundFn = introduce.bind(person, '广州', '中国')

// 借用数组方法
Array.prototype.push.call(arrayLike, 'c')
Math.max.apply(null, [3, 7, 2, 9])
```

### arguments

```javascript
function sumAll() {
  let total = 0
  for (let i = 0; i < arguments.length; i++) total += arguments[i]
  return total
}
// 箭头函数无 arguments，用 rest 替代：(...args) => {}
```

---

## 常用对象

### Date

```javascript
const now = new Date()
now.getFullYear() / getMonth() / getDate() / getDay()
now.getTime()                    // 时间戳（毫秒）
now.toLocaleDateString()         // '2026/6/7'
const birthday = new Date('2000-01-15')
```

### Math

```javascript
Math.PI / Math.abs(-5) / Math.ceil(3.2) / Math.floor(3.8)
Math.round(3.5) / Math.max(1,5,3) / Math.min(1,5,3)
Math.random()   // [0, 1)    Math.pow(2, 10) / Math.sqrt(16)
```

### String

```javascript
const str = '  Hello JavaScript  '
str.length / str.trim() / str.toUpperCase() / str.toLowerCase()
str.indexOf('Java') / str.includes('Script')
str.slice(2, 7) / str.split(' ') / str.replace('Java', 'JS')
str.startsWith('  H') / str.endsWith('  ')
```

---

## DOM

### 概述与节点类型

DOM 将 HTML 表示为**树形结构**。主要节点类型：元素节点（1）、文本节点（3）、注释节点（8）、文档节点（9）。

### 获取、创建与删除

```javascript
document.getElementById('header')
document.querySelector('.nav-item')          // CSS 选择器（推荐）
document.querySelectorAll('.item')           // NodeList

const li = document.createElement('li')
li.textContent = '新列表项'
li.className = 'list-item'
ul.appendChild(li)                           // 末尾插入
ul.insertBefore(li, ul.firstChild)           // 指定位置
li.remove()                                  // 删除
```

### 事件与委托

```javascript
btn.addEventListener('click', function(e) {
  e.preventDefault()    // 阻止默认行为
  e.stopPropagation()   // 阻止冒泡
})

// 事件委托：利用冒泡，父元素统一处理子元素
document.querySelector('#list').addEventListener('click', function(e) {
  if (e.target.tagName === 'LI') console.log(e.target.textContent)
})
```

---

## BOM

BOM 提供与浏览器窗口交互的 API，核心是 `window`。

### window

```javascript
window.innerWidth / innerHeight
window.open(url) / close()
setTimeout(fn, 1000) / setInterval(fn, 1000)
clearTimeout(id) / clearInterval(id)
alert() / confirm() / prompt()
```

### location、history、navigator

```javascript
location.href / protocol / host / pathname / search / hash
location.assign(url) / replace(url) / reload()

history.back() / forward() / go(-2)
history.pushState({ page: 1 }, '标题', '/page1')

navigator.userAgent / language / onLine / platform
```

---

## 异常与 JSON

### 异常处理

```javascript
try {
  const result = riskyOperation()
} catch (error) {
  console.error('捕获错误：', error.message)
} finally {
  console.log('无论成败都执行')
}

function divide(a, b) {
  if (b === 0) throw new Error('除数不能为零')
  return a / b
}
```

### JSON

```javascript
const user = { name: '张三', age: 25, hobbies: ['读书'] }
const jsonStr = JSON.stringify(user)
const parsed = JSON.parse(jsonStr)
// JSON 不支持函数、undefined、注释
```

---

## Cookie 与 Web Storage

### Cookie

```javascript
document.cookie = 'username=张三; expires=...; path=/'
document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT'  // 删除
```

| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|-------------|----------------|
| 容量 | ~4KB | ~5MB | ~5MB |
| 生命周期 | 可设过期 | 永久 | 标签页关闭清除 |
| 请求携带 | 自动 | 否 | 否 |

### Web Storage

```javascript
localStorage.setItem('theme', 'dark')
localStorage.getItem('theme')
localStorage.removeItem('theme')

sessionStorage.setItem('token', 'abc123')  // 会话级

// 存储对象需序列化
localStorage.setItem('s', JSON.stringify({ lang: 'zh' }))
JSON.parse(localStorage.getItem('s'))
```

---

## ES6+

### let/const、解构、模板字符串

```javascript
let count = 0; const MAX = 100

const [a, b, ...rest] = [1, 2, 3, 4]
const { name, age, city = '北京' } = { name: '张三', age: 25 }

const msg = `你好，${name}！今天是 ${new Date().toLocaleDateString()}`
```

### 箭头函数、Rest/Spread

```javascript
const add = (a, b) => a + b
function log(first, ...others) { console.log(first, others) }
const arr2 = [...arr1, 3, 4]
const obj2 = { ...obj1, b: 2 }
```

### Symbol、Set/Map、Class、模块化

```javascript
const id = Symbol('unique'); const obj = { [id]: 123 }

const set = new Set([1, 2, 2, 3])   // 去重集合
const map = new Map(); map.set('name', '张三')

// 模块化
// math.js: export const PI = 3.14; export default class Calculator {}
// app.js:  import Calculator, { PI } from './math.js'
```

---

## ES7 ~ ES11

### ES7（ES2016）

```javascript
[1, 2, 3].includes(2)   // true
2 ** 10                  // 1024 幂运算符
```

### ES8（ES2017）— async/await 与 Object 扩展

```javascript
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`)
    return await res.json()
  } catch (error) { console.error(error) }
}

Object.values({ a: 1 }) / Object.entries({ a: 1 })
'5'.padStart(3, '0')   // '005'
```

### ES9（ES2018）

```javascript
for await (const chunk of asyncIterable) { }
const { a, ...rest } = { a: 1, b: 2, c: 3 }
promise.finally(() => console.log('结束'))
```

### ES10（ES2019）

```javascript
[1, [2, [3]]].flat(2)                        // [1, 2, 3]
[1, 2, 3].flatMap(n => [n, n * 2])
Object.fromEntries([['a', 1], ['b', 2]])     // { a: 1, b: 2 }
'  hello  '.trimStart()
```

### ES11（ES2020）

```javascript
const city = user?.address?.city       // 可选链
const value = input ?? '默认值'         // 空值合并（仅 null/undefined）
const big = 9007199254740991n          // BigInt
const module = await import('./utils.js')  // 动态 import
globalThis.setTimeout(() => {}, 1000)  // 统一全局对象
```

---

> **学习建议**：多写多练，结合浏览器开发者工具（F12 → Console）实时验证。掌握基础后可继续学习 [AJAX](./05-ajax.md) 与 [Promise](./06-promise.md)。
