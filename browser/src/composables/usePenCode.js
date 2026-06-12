import { reactive } from 'vue'

// 模块级别的响应式状态，只要 SPA 不退出就保留
const state = reactive({
  html: `<h1>Hello MATO!</h1>
<p>欢迎来到代码编辑器，开始创作吧～</p>`,
  css: `body {
  font-family: 'Comic Neue', cursive;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  text-shadow: 3px 3px 0 rgba(0,0,0,0.3);
  margin-bottom: 0.5rem;
}

p {
  font-size: 1.2rem;
  opacity: 0.9;
}`,
  js: `console.log('Hello MATO!')`,
  title: '',
  deps: '',
})

export function usePenCode() {
  return state
}

// 构建完整预览 HTML（含依赖）
export function buildPenPreview(html, css, js, deps) {
  const depLinks = (deps || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(url => {
      if (url.endsWith('.css')) return `<link rel="stylesheet" href="${url}">`
      return `<script src="${url}"><\/script>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${depLinks}
<style>*{box-sizing:border-box;margin:0;padding:0}${css}</style>
</head>
<body>${html}
<script>${js}<\/script>
</body>
</html>`
}
