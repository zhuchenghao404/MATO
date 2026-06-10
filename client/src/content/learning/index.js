import htmlMd from './01-html.md?raw'
import cssMd from './02-css.md?raw'
import flexGridMd from './03-flex-grid.md?raw'
import jsMd from './04-javascript.md?raw'
import ajaxMd from './05-ajax.md?raw'
import promiseMd from './06-promise.md?raw'

export const courses = [
  {
    id: 'html',
    title: 'HTML 基础',
    badge: '结构',
    icon: '📄',
    description: '超文本标记语言，Web 三大核心技术之一',
    content: htmlMd,
  },
  {
    id: 'css',
    title: 'CSS 基础',
    badge: '样式',
    icon: '🎨',
    description: '层叠样式表，控制网页外观与布局',
    content: cssMd,
  },
  {
    id: 'flex-grid',
    title: 'Flex & Grid',
    badge: '布局',
    icon: '📐',
    description: '一维与二维现代 CSS 布局方案',
    content: flexGridMd,
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    badge: '交互',
    icon: '⚡',
    description: '网页交互逻辑与 ES 新特性',
    content: jsMd,
  },
  {
    id: 'ajax',
    title: 'AJAX',
    badge: '通信',
    icon: '🌐',
    description: '异步 JavaScript 与 XML，前后端数据交互',
    content: ajaxMd,
  },
  {
    id: 'promise',
    title: 'Promise',
    badge: '异步',
    icon: '🔗',
    description: '现代异步编程与链式调用',
    content: promiseMd,
  },
]

export function getCourseById(id) {
  return courses.find((c) => c.id === id) ?? courses[0]
}
