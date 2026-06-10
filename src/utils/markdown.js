import { marked } from 'marked'

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
}

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens)
      const plain = text.replace(/<[^>]+>/g, '')
      const id = slugify(plain)
      return `<h${depth} id="${id}">${text}</h${depth}>`
    },
    code({ text, lang }) {
      const langClass = lang ? ` class="language-${lang}"` : ''
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<pre><code${langClass}>${escaped}</code></pre>`
    },
    table({ header, rows }) {
      const renderRow = (cells, tag) =>
        `<tr>${cells.map(c => `<${tag}>${this.parser.parseInline(c.tokens)}</${tag}>`).join('')}</tr>`
      const thead = renderRow(header, 'th')
      const tbody = rows.map(r => renderRow(r, 'td')).join('')
      return `<div class="table-wrap"><table><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`
    },
  },
})

export function renderMarkdown(md) {
  return marked.parse(md)
}

export function extractHeadings(md) {
  const headings = []
  const regex = /^(#{2,3})\s+(.+)$/gm
  let match
  while ((match = regex.exec(md)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/[*_`]/g, '').trim()
    headings.push({
      level,
      text,
      id: slugify(text),
    })
  }
  return headings
}
